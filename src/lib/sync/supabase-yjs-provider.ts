"use client";

/**
 * SupabaseYjsProvider - Custom Y.js provider using Supabase Realtime Broadcast
 *
 * This provider enables real-time collaborative editing by:
 * 1. Broadcasting Y.js document updates via Supabase Realtime channels
 * 2. Maintaining awareness state (user presence, cursor positions)
 * 3. Handling debounced persistence to the database
 */

import * as Y from "yjs";
import { Observable } from "lib0/observable";
import {
  Awareness,
  applyAwarenessUpdate,
  encodeAwarenessUpdate,
  removeAwarenessStates,
} from "y-protocols/awareness";
import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import type { SyncProviderConfig, SyncStatus, AwarenessState } from "./types";

// Message types for Supabase Broadcast
type BroadcastMessage =
  | { type: "sync-step-1"; stateVector: string; requesterClientId: number }
  | { type: "sync-step-2"; update: string; stateVector: string; targetClientId: number }
  | { type: "update"; update: string }
  | { type: "awareness"; update: string };

export class SupabaseYjsProvider extends Observable<string> {
  doc: Y.Doc;
  awareness: Awareness;
  private supabase: SupabaseClient;
  private channel: RealtimeChannel | null = null;
  private config: SyncProviderConfig;
  private status: SyncStatus = "disconnected";
  private synced = false;
  private syncFallbackTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private saveTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private onSave?: (state: Uint8Array) => void;
  private preloadedState: Uint8Array | null = null;

  constructor(
    supabase: SupabaseClient,
    config: SyncProviderConfig,
    doc: Y.Doc,
    options?: { onSave?: (state: Uint8Array) => void; preloadedState?: Uint8Array | null },
  ) {
    super();
    this.supabase = supabase;
    this.config = config;
    this.doc = doc;
    this.onSave = options?.onSave;
    // Store pre-loaded state but do NOT apply yet.
    // It will be applied in connect() after Lexical's binding is ready.
    this.preloadedState = options?.preloadedState ?? null;

    // Initialize awareness with user info
    this.awareness = new Awareness(doc);
    this.setLocalAwarenessState();

    // Set up document update listener
    this.doc.on("update", this.handleDocumentUpdate);

    // Set up awareness update listener
    this.awareness.on("update", this.handleAwarenessUpdate);
  }

  private setLocalAwarenessState() {
    const localState: AwarenessState = {
      id: this.config.userId,
      name: this.config.userName,
      color: this.config.userColor,
      gradient: this.config.userGradient,
      avatarUrl: this.config.userAvatarUrl,
      cursor: null,
      isActive: true,
      lastUpdate: Date.now(),
    };
    this.awareness.setLocalState(localState);
  }

  private setStatus(status: SyncStatus) {
    this.status = status;
    this.emit("status", [{ status }]);
  }

  private markSynced() {
    if (this.synced) return;
    this.synced = true;
    if (this.syncFallbackTimeoutId) {
      clearTimeout(this.syncFallbackTimeoutId);
      this.syncFallbackTimeoutId = null;
    }
    this.emit("sync", [true]);
  }

  connect() {
    if (this.channel) return;

    this.setStatus("connecting");

    // Apply pre-loaded state NOW — at this point Lexical's binding has set up
    // its observeDeep handler, so the update will flow through to rendering.
    if (this.preloadedState) {
      Y.applyUpdate(this.doc, this.preloadedState);
      this.preloadedState = null;
    }

    const channelName = `doc:${this.config.documentId}`;
    this.channel = this.supabase.channel(channelName, {
      config: { broadcast: { self: false } },
    });

    // Listen for broadcast messages
    this.channel.on("broadcast", { event: "yjs" }, ({ payload }) => {
      this.handleBroadcastMessage(payload as BroadcastMessage);
    });

    // Global fallback: even if the channel never reaches SUBSCRIBED
    // (e.g. on production where WebSocket may be slow/blocked),
    // ensure the editor becomes usable.
    this.syncFallbackTimeoutId = setTimeout(() => {
      if (!this.synced) {
        console.warn("[SupabaseYjs] Sync fallback fired - channel may not be fully connected");
        this.markSynced();
        // If status is still connecting, mark as connected so saves work
        if (this.status === "connecting") {
          this.setStatus("connected");
        }
      }
    }, 2000);

    // Subscribe to channel
    this.channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        this.setStatus("connected");
        // Request sync from other clients.
        this.requestSync();
        // Fast-track sync if nobody answers within 600ms
        if (!this.synced) {
          if (this.syncFallbackTimeoutId) {
            clearTimeout(this.syncFallbackTimeoutId);
          }
          this.syncFallbackTimeoutId = setTimeout(() => {
            this.markSynced();
          }, 600);
        }
      } else if (status === "CHANNEL_ERROR") {
        console.error("[SupabaseYjs] Channel error, falling back to local-only mode");
        this.setStatus("connected"); // Allow saves to work even without Realtime
        this.markSynced();
      } else if (status === "CLOSED") {
        this.setStatus("disconnected");
      }
    });
  }

  private requestSync() {
    // Send sync step 1: our state vector
    const stateVector = Y.encodeStateVector(this.doc);
    this.broadcast({
      type: "sync-step-1",
      stateVector: this.encodeToBase64(stateVector),
      requesterClientId: this.doc.clientID,
    });
  }

  private handleBroadcastMessage(message: BroadcastMessage) {
    try {
      switch (message.type) {
        case "sync-step-1": {
          // Someone is requesting sync, send them our full state as diff
          const theirStateVector = this.decodeFromBase64(message.stateVector);
          const update = Y.encodeStateAsUpdate(this.doc, theirStateVector);
          const ourStateVector = Y.encodeStateVector(this.doc);
          this.broadcast({
            type: "sync-step-2",
            update: this.encodeToBase64(update),
            stateVector: this.encodeToBase64(ourStateVector),
            targetClientId: message.requesterClientId,
          });
          break;
        }

        case "sync-step-2": {
          // Ignore sync responses intended for a different client.
          if (message.targetClientId !== this.doc.clientID) {
            break;
          }
          // Received sync response, apply the update
          const update = this.decodeFromBase64(message.update);
          Y.applyUpdate(this.doc, update, "remote");

          // Send any updates we have that they don't
          const theirStateVector = this.decodeFromBase64(message.stateVector);
          const ourUpdate = Y.encodeStateAsUpdate(this.doc, theirStateVector);
          if (ourUpdate.length > 2) {
            // More than just header
            this.broadcast({ type: "update", update: this.encodeToBase64(ourUpdate) });
          }

          this.markSynced();
          break;
        }

        case "update": {
          // Regular incremental update
          const update = this.decodeFromBase64(message.update);
          Y.applyUpdate(this.doc, update, "remote");
          this.markSynced();
          break;
        }

        case "awareness": {
          // Awareness update (cursor positions, presence)
          const update = this.decodeFromBase64(message.update);
          applyAwarenessUpdate(this.awareness, update, "remote");
          break;
        }
      }
    } catch (error) {
      console.error("Error handling broadcast message:", error);
      this.emit("error", [error instanceof Error ? error : new Error(String(error))]);
    }
  }

  private handleDocumentUpdate = (update: Uint8Array, origin: unknown) => {
    // Don't broadcast updates that came from remote
    if (origin === "remote") return;

    // Broadcast the update to other clients
    this.broadcast({ type: "update", update: this.encodeToBase64(update) });

    // Schedule debounced save
    this.scheduleSave();
  };

  private handleAwarenessUpdate = ({
    added,
    updated,
    removed,
  }: {
    added: number[];
    updated: number[];
    removed: number[];
  }) => {
    const changedClients = added.concat(updated, removed);
    const awarenessUpdate = encodeAwarenessUpdate(this.awareness, changedClients);
    this.broadcast({ type: "awareness", update: this.encodeToBase64(awarenessUpdate) });
    this.emit("awareness", [this.awareness.getStates()]);
  };

  private broadcast(message: BroadcastMessage) {
    if (!this.channel || this.status !== "connected") return;
    this.channel.send({ type: "broadcast", event: "yjs", payload: message });
  }

  private scheduleSave() {
    if (this.saveTimeoutId) {
      clearTimeout(this.saveTimeoutId);
    }

    // Debounce: save 3 seconds after last change
    // Always save regardless of connection status - persistence doesn't require Realtime
    this.saveTimeoutId = setTimeout(() => {
      if (this.onSave) {
        try {
          const state = Y.encodeStateAsUpdate(this.doc);
          this.onSave(state);
        } catch (error) {
          console.error("[SupabaseYjs] Save failed:", error);
        }
      }
    }, 3000);
  }

  // Encode Uint8Array to base64 for JSON transport
  private encodeToBase64(data: Uint8Array): string {
    let binary = "";
    const chunkSize = 0x8000;
    for (let i = 0; i < data.length; i += chunkSize) {
      binary += String.fromCharCode(...data.subarray(i, i + chunkSize));
    }
    return btoa(binary);
  }

  // Decode base64 to Uint8Array
  private decodeFromBase64(data: string): Uint8Array {
    const binaryString = atob(data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  disconnect() {
    // Force save before disconnect
    if (this.saveTimeoutId) {
      clearTimeout(this.saveTimeoutId);
      if (this.onSave) {
        const state = Y.encodeStateAsUpdate(this.doc);
        this.onSave(state);
      }
    }

    // Remove local awareness state
    removeAwarenessStates(this.awareness, [this.doc.clientID], "disconnect");

    // Unsubscribe from channel
    if (this.channel) {
      this.supabase.removeChannel(this.channel);
      this.channel = null;
    }

    this.setStatus("disconnected");
    this.synced = false;
    if (this.syncFallbackTimeoutId) {
      clearTimeout(this.syncFallbackTimeoutId);
      this.syncFallbackTimeoutId = null;
    }
  }

  destroy() {
    this.disconnect();
    this.doc.off("update", this.handleDocumentUpdate);
    this.awareness.off("update", this.handleAwarenessUpdate);
    this.awareness.destroy();
    super.destroy();
  }

  // Update cursor position in awareness
  updateCursor(cursor: { anchor: number; head: number } | null) {
    const localState = this.awareness.getLocalState() as AwarenessState | null;
    if (localState) {
      this.awareness.setLocalState({
        ...localState,
        cursor,
        lastUpdate: Date.now(),
      });
    }
  }

  // Get current status
  getStatus(): SyncStatus {
    return this.status;
  }

  // Check if synced with peers
  isSynced(): boolean {
    return this.synced;
  }
}
