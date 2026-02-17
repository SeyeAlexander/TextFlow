/**
 * Y.js Sync Engine
 *
 * Provides real-time collaborative editing capabilities using Y.js CRDTs
 * with Supabase Realtime as the transport layer.
 */

export { SupabaseYjsProvider } from "./supabase-yjs-provider";
export { loadYjsDocument, saveYjsDocument, createInitialYjsState } from "./persistence";
export {
  type UserAwareness,
  type CursorPosition,
  type AwarenessState,
  type SyncStatus,
  type SyncProviderConfig,
  COLLABORATOR_COLORS,
  getCollaboratorColor,
} from "./types";
