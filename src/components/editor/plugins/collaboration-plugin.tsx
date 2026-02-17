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
import { LexicalCollaboration } from "@lexical/react/LexicalCollaborationContext";
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

// Store for Y.Docs to reuse across renders
const yjsDocMap = new Map<string, Y.Doc>();

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
  const backfillUnsubscribeRef = useRef<(() => void) | null>(null);

  // Get user color based on their ID
  const userColor = getCollaboratorColor(userId);

  // Provider factory for CollaborationPlugin
  const providerFactory = useCallback(
    (id: string, docMap: Map<string, Y.Doc>): Provider => {
      // Use a single doc instance across preload and Lexical collaboration map.
      let doc = yjsDocMap.get(id) || docMap.get(id);
      if (!doc) {
        doc = new Y.Doc();
      }
      yjsDocMap.set(id, doc);
      docMap.set(id, doc);

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
        },
      );

      // Subscribe to status changes
      provider.on("status", (payload: SyncStatus | { status: SyncStatus }) => {
        const status = typeof payload === "string" ? payload : payload.status;
        onStatusChange?.(status);
      });

      // Subscribe to awareness changes
      provider.on("awareness", (states: Map<number, unknown>) => {
        onAwarenessChange?.(states);
      });

      // Store ref for cleanup
      providerRef.current = provider;

      // Do not connect here. Lexical CollaborationPlugin owns connect/disconnect lifecycle.
      return provider as unknown as Provider;
    },
    [userId, userName, userAvatarUrl, userColor, onStatusChange, onAwarenessChange],
  );

  // Initial editor state - load from Y.js or create default
  const initialEditorState = useCallback(() => {
    if (!shouldBootstrapFromContent) return null;
    return initialContent || null;
  }, [initialContent, shouldBootstrapFromContent]);

  // Load existing Y.js state when component mounts
  useEffect(() => {
    const loadDocument = async () => {
      // Always start from a fresh Y.Doc to avoid stale in-memory state across route remounts.
      const previousDoc = yjsDocMap.get(documentId);
      if (previousDoc) {
        previousDoc.destroy();
      }
      const doc = new Y.Doc();
      yjsDocMap.set(documentId, doc);

      // Try to load existing state from database
      const hasExistingState = await loadYjsDocument(documentId, doc);
      const needsBackfill = !hasExistingState && !!initialContent;
      setShouldBootstrapFromContent(needsBackfill);

      // One-time lazy migration: when legacy JSON docs bootstrap into Yjs, persist state immediately.
      if (needsBackfill) {
        let timeoutId: ReturnType<typeof setTimeout> | null = null;
        const onFirstUpdate = () => {
          if (timeoutId) return;
          timeoutId = setTimeout(async () => {
            const state = Y.encodeStateAsUpdate(doc);
            await saveYjsDocument(documentId, state);
            doc.off("update", onFirstUpdate);
            backfillUnsubscribeRef.current = null;
          }, 300);
        };
        doc.on("update", onFirstUpdate);
        backfillUnsubscribeRef.current = () => {
          doc.off("update", onFirstUpdate);
          if (timeoutId) clearTimeout(timeoutId);
        };
      }

      if (hasExistingState) {
        console.log("[Collab] Loaded existing Y.js state from database");
      } else {
        console.log("[Collab] No existing Y.js state, starting fresh");
      }

      setIsLoaded(true);
    };

    loadDocument();

    // Cleanup on unmount
    return () => {
      if (providerRef.current) {
        providerRef.current.destroy();
        providerRef.current = null;
      }
      if (backfillUnsubscribeRef.current) {
        backfillUnsubscribeRef.current();
        backfillUnsubscribeRef.current = null;
      }
      const doc = yjsDocMap.get(documentId);
      if (doc) {
        doc.destroy();
        yjsDocMap.delete(documentId);
      }
    };
  }, [documentId, initialContent]);

  // Don't render until we've attempted to load
  if (!isLoaded) {
    return null;
  }

  return (
    <LexicalCollaboration>
      <CollaborationPlugin
        id={documentId}
        providerFactory={providerFactory}
        initialEditorState={initialEditorState}
        shouldBootstrap={true}
        cursorColor={userColor.hex}
        username={userName}
      />
    </LexicalCollaboration>
  );
}

/**
 * Hook to access collaboration provider from outside the plugin
 */
export function useCollaborationProvider() {
  // This could be enhanced with a context provider if needed
  return null;
}
