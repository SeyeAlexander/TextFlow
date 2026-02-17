/**
 * Type definitions for Y.js sync engine
 */

// Gradient avatars from chat-pane.tsx - used for collaborator colors
export const COLLABORATOR_COLORS = [
  { id: "gradient-1", gradient: "from-violet-500 to-purple-500", hex: "#8b5cf6" },
  { id: "gradient-2", gradient: "from-pink-500 to-rose-500", hex: "#ec4899" },
  { id: "gradient-3", gradient: "from-cyan-500 to-blue-500", hex: "#06b6d4" },
  { id: "gradient-4", gradient: "from-emerald-500 to-teal-500", hex: "#10b981" },
  { id: "gradient-5", gradient: "from-amber-500 to-orange-500", hex: "#f59e0b" },
  { id: "gradient-6", gradient: "from-indigo-500 to-violet-500", hex: "#6366f1" },
  { id: "gradient-7", gradient: "from-rose-500 to-pink-500", hex: "#f43f5e" },
  { id: "gradient-8", gradient: "from-teal-500 to-cyan-500", hex: "#14b8a6" },
] as const;

export interface UserAwareness {
  id: string;
  name: string;
  color: string; // Hex color for cursor
  gradient: string; // Tailwind gradient class for avatar
  avatarUrl?: string;
}

export interface CursorPosition {
  anchor: number;
  head: number;
}

export interface AwarenessState extends UserAwareness {
  cursor: CursorPosition | null;
  isActive: boolean;
  lastUpdate: number;
}

export interface SyncProviderEvents {
  status: (status: SyncStatus) => void;
  sync: (synced: boolean) => void;
  awareness: (states: Map<number, AwarenessState>) => void;
  error: (error: Error) => void;
}

export type SyncStatus = "connecting" | "connected" | "disconnected" | "error";

export interface SyncProviderConfig {
  documentId: string;
  userId: string;
  userName: string;
  userColor: string;
  userGradient: string;
  userAvatarUrl?: string;
}

// Helper to get a color for a user based on their ID
export function getCollaboratorColor(userId: string) {
  const hash = userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return COLLABORATOR_COLORS[hash % COLLABORATOR_COLORS.length];
}
