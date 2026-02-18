"use client";

/**
 * CollaborationWrapper - Integrates Y.js collaboration with Lexical editor
 *
 * This plugin:
 * 1. Creates/manages the SupabaseYjsProvider
 * 2. Loads initial Y.js state from database
 * 3. Provides the provider factory for @lexical/yjs CollaborationPlugin
 * 4. Handles cleanup on unmount
 */

import { useCallback, useEffect, useState, useRef } from "react";
import { CollaborationPlugin } from "@lexical/react/LexicalCollaborationPlugin";
import * as Y from "yjs";
import type { Provider } from "@lexical/yjs";
import { SupabaseYjsProvider } from "@/lib/sync/supabase-yjs-provider";
import { loadYjsDocument, saveYjsDocument } from "@/lib/sync/persistence";
import { getCollaboratorColor, type SyncStatus } from "@/lib/sync/types";
import { createClient } from "@/utils/supabase/client";

interface CollaborationWrapperProps {
  documentId: string;
  initialContent?: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  onStatusChange?: (status: SyncStatus) => void;
  onAwarenessChange?: (states: Map<number, unknown>) => void;
}

// Pre-loaded Y.js state cache: documentId -> base64 state
const preloadedStates = new Map<string, Uint8Array | null>();

export function CollaborationWrapper({
  documentId,
  initialContent,
  userId,
  userName,
  userAvatarUrl,
  onStatusChange,
  onAwarenessChange,
}: CollaborationWrapperProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldBootstrapFromContent, setShouldBootstrapFromContent] = useState(false);
  const providerRef = useRef<SupabaseYjsProvider | null>(null);
  // Track the docMap so we can clean up old docs on unmount
  const docMapRef = useRef<Map<string, Y.Doc> | null>(null);
  // Stable refs so the provider factory doesn't re-create on every render
  const onStatusChangeRef = useRef(onStatusChange);
  const onAwarenessChangeRef = useRef(onAwarenessChange);
  onStatusChangeRef.current = onStatusChange;
  onAwarenessChangeRef.current = onAwarenessChange;

  // Get user color based on their ID
  const userColor = getCollaboratorColor(userId);

  // Provider factory for CollaborationPlugin
  // IMPORTANT: This must be stable (memoized with minimal deps) because
  // Lexical's CollaborationPlugin guards its effect with a ref flag —
  // if the factory reference changes after the first run, it won't re-run.
  const providerFactory = useCallback(
    (id: string, docMap: Map<string, Y.Doc>): Provider => {
      // Store docMap ref for cleanup
      docMapRef.current = docMap;

      // Always create a fresh Y.Doc to avoid stale state from previous mounts.
      // The old doc may linger in the singleton yjsDocMap; if we reuse it,
      // applying the same pre-loaded state is a no-op (Y.js deduplicates),
      // so observeDeep never fires and content stays invisible.
      const oldDoc = docMap.get(id);
      if (oldDoc) {
        oldDoc.destroy();
      }
      const doc = new Y.Doc();
      docMap.set(id, doc);

      // Grab pre-loaded state (will be passed to provider, NOT applied here).
      // The provider applies it inside connect() after Lexical's binding
      // sets up observeDeep — so the update flows through to rendering.
      const preloaded = preloadedStates.get(id) ?? null;
      preloadedStates.delete(id);

      // Create Supabase client
      const supabase = createClient();

      // Create the provider
      const provider = new SupabaseYjsProvider(
        supabase,
        {
          documentId: id,
          userId,
          userName,
          userColor: userColor.hex,
          userGradient: userColor.gradient,
          userAvatarUrl,
        },
        doc,
        {
          onSave: async (state) => {
            await saveYjsDocument(id, state);
          },
          preloadedState: preloaded,
        },
      );

      // Subscribe to status changes (use refs for stability)
      provider.on("status", (payload: SyncStatus | { status: SyncStatus }) => {
        const status = typeof payload === "string" ? payload : payload.status;
        onStatusChangeRef.current?.(status);
      });

      // Subscribe to awareness changes
      provider.on("awareness", (states: Map<number, unknown>) => {
        onAwarenessChangeRef.current?.(states);
      });

      // Store ref for cleanup
      providerRef.current = provider;

      return provider as unknown as Provider;
    },
    // Only depend on values that truly affect provider creation
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [documentId, userId, userName, userAvatarUrl, userColor.hex, userColor.gradient],
  );

  // Initial editor state - load from Y.js or create default
  const initialEditorState = useCallback(() => {
    if (!shouldBootstrapFromContent) return null;
    return initialContent || null;
  }, [initialContent, shouldBootstrapFromContent]);

  // Pre-load Y.js state from database BEFORE rendering CollaborationPlugin
  useEffect(() => {
    let cancelled = false;

    const preloadState = async () => {
      try {
        // Create a temporary doc to load state into
        const tempDoc = new Y.Doc();
        const hasExistingState = await loadYjsDocument(documentId, tempDoc);

        if (cancelled) {
          tempDoc.destroy();
          return;
        }

        if (hasExistingState) {
          // Cache the raw state for the provider factory to apply
          const state = Y.encodeStateAsUpdate(tempDoc);
          preloadedStates.set(documentId, state);
          setShouldBootstrapFromContent(false);
          console.log("[Collab] Pre-loaded Y.js state from database");
        } else {
          preloadedStates.delete(documentId);
          setShouldBootstrapFromContent(!!initialContent);
          console.log("[Collab] No existing Y.js state, will bootstrap from content");
        }

        tempDoc.destroy();
      } catch (error) {
        console.error("[Collab] Error pre-loading Y.js state:", error);
        preloadedStates.delete(documentId);
        setShouldBootstrapFromContent(!!initialContent);
      }

      if (!cancelled) {
        setIsLoaded(true);
      }
    };

    // Reset loaded state when documentId changes
    setIsLoaded(false);
    preloadState();

    return () => {
      cancelled = true;
      // Clean up provider on unmount
      if (providerRef.current) {
        providerRef.current.destroy();
        providerRef.current = null;
      }
      // Clean up old Y.Doc from the docMap to avoid stale references
      if (docMapRef.current) {
        const oldDoc = docMapRef.current.get(documentId);
        if (oldDoc) {
          oldDoc.destroy();
          docMapRef.current.delete(documentId);
        }
      }
      preloadedStates.delete(documentId);
    };
  }, [documentId, initialContent]);

  // One-time backfill: when legacy JSON docs bootstrap into Yjs, persist immediately
  useEffect(() => {
    if (!shouldBootstrapFromContent || !isLoaded) return;

    // After the CollaborationPlugin bootstraps content, save the initial Y.js state
    const saveTimer = setTimeout(async () => {
      // Find the doc from the provider
      if (providerRef.current) {
        try {
          const state = Y.encodeStateAsUpdate(providerRef.current.doc);
          await saveYjsDocument(documentId, state);
          console.log("[Collab] Backfilled Y.js state from legacy content");
        } catch (error) {
          console.error("[Collab] Backfill save failed:", error);
        }
      }
    }, 2000);

    return () => clearTimeout(saveTimer);
  }, [shouldBootstrapFromContent, isLoaded, documentId]);

  // Don't render until we've attempted to load
  if (!isLoaded) {
    return null;
  }

  return (
    <CollaborationPlugin
      key={documentId}
      id={documentId}
      providerFactory={providerFactory}
      initialEditorState={initialEditorState}
      shouldBootstrap={true}
      cursorColor={userColor.hex}
      username={userName}
    />
  );
}

/**
 * Hook to access collaboration provider from outside the plugin
 */
export function useCollaborationProvider() {
  return null;
}
