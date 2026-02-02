import { create } from "zustand";
import { persist } from "zustand/middleware";

// Types
export interface TextFlowFile {
  id: string;
  name: string;
  type: "document" | "image" | "video" | "pdf" | "archive" | "other";
  size: string;
  content?: string;
  folderId: string | null;
  starred: boolean;
  shared: boolean;
  createdAt: string | Date; // Standardize for serialization
  updatedAt: string | Date;
}

export interface TextFlowFolder {
  id: string;
  name: string;
  parentId: string | null;
  isOpen: boolean;
  createdAt: Date;
  fileCount?: number;
}

// Chat/Collaboration Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface ChatMessage {
  id: string;
  documentId: string;
  userId: string;
  content: string;
  createdAt: Date;
}

export interface DocumentShare {
  documentId: string;
  userId: string;
  sharedAt: Date;
}

export type ViewType = "home" | "all-files" | "starred" | "recent" | "shared" | string;

interface TextFlowStore {
  // State
  currentView: ViewType;
  currentFileId: string | null;
  searchQuery: string;
  searchOpen: boolean;
  settingsOpen: boolean;
  sidebarCollapsed: boolean;

  // Chat state
  chatOpen: boolean;
  activeChatDocumentId: string | null;

  // Actions
  setView: (view: ViewType) => void;
  setCurrentFile: (fileId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSearchOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Chat actions
  setChatOpen: (open: boolean) => void;
  setActiveChatDocument: (documentId: string | null) => void;
}

export const useTextFlowStore = create<TextFlowStore>()(
  persist(
    (set) => ({
      // Initial State
      currentView: "home",
      currentFileId: null,
      searchQuery: "",
      searchOpen: false,
      settingsOpen: false,
      sidebarCollapsed: false,

      // Chat initial state
      chatOpen: false,
      activeChatDocumentId: null,

      // View actions
      setView: (view) => set({ currentView: view }),
      setCurrentFile: (fileId) => set({ currentFileId: fileId }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSearchOpen: (open) => set({ searchOpen: open }),
      setSettingsOpen: (open) => set({ settingsOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      // Chat actions
      setChatOpen: (open) => set({ chatOpen: open }),
      setActiveChatDocument: (documentId) => set({ activeChatDocumentId: documentId }),
    }),
    {
      name: "textflow-storage",
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    },
  ),
);
