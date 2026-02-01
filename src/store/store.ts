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
  createdAt: Date;
  updatedAt: Date;
}

export interface TextFlowFolder {
  id: string;
  name: string;
  parentId: string | null;
  isOpen: boolean;
  createdAt: Date;
}

export type ViewType = "home" | "all-files" | "starred" | "recent" | "shared" | string;

interface TextFlowStore {
  // State
  files: TextFlowFile[];
  folders: TextFlowFolder[];
  currentView: ViewType;
  currentFileId: string | null;
  searchQuery: string;
  searchOpen: boolean;
  settingsOpen: boolean;

  // Actions
  setView: (view: ViewType) => void;
  setCurrentFile: (fileId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSearchOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;

  // File actions
  addFile: (file: Omit<TextFlowFile, "id" | "createdAt" | "updatedAt">) => void;
  updateFile: (id: string, updates: Partial<TextFlowFile>) => void;
  deleteFile: (id: string) => void;
  toggleStar: (id: string) => void;
  toggleShare: (id: string) => void;

  // Folder actions
  addFolder: (name: string, parentId?: string | null) => void;
  deleteFolder: (id: string) => void;
  toggleFolderOpen: (id: string) => void;
  renameFolder: (id: string, name: string) => void;

  // Computed
  getFilesByFolder: (folderId: string | null) => TextFlowFile[];
  getStarredFiles: () => TextFlowFile[];
  getRecentFiles: () => TextFlowFile[];
  getSharedFiles: () => TextFlowFile[];
  searchFiles: (query: string) => TextFlowFile[];
  getFoldersByParent: (parentId: string | null) => TextFlowFolder[];
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useTextFlowStore = create<TextFlowStore>()(
  persist(
    (set, get) => ({
      // Initial State
      files: [],
      folders: [],
      currentView: "home",
      currentFileId: null,
      searchQuery: "",
      searchOpen: false,
      settingsOpen: false,

      // View actions
      setView: (view) => set({ currentView: view }),
      setCurrentFile: (fileId) => set({ currentFileId: fileId }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSearchOpen: (open) => set({ searchOpen: open }),
      setSettingsOpen: (open) => set({ settingsOpen: open }),

      // File actions
      addFile: (file) =>
        set((state) => ({
          files: [
            ...state.files,
            {
              ...file,
              id: generateId(),
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        })),

      updateFile: (id, updates) =>
        set((state) => ({
          files: state.files.map((f) =>
            f.id === id ? { ...f, ...updates, updatedAt: new Date() } : f,
          ),
        })),

      deleteFile: (id) =>
        set((state) => ({
          files: state.files.filter((f) => f.id !== id),
        })),

      toggleStar: (id) =>
        set((state) => ({
          files: state.files.map((f) =>
            f.id === id ? { ...f, starred: !f.starred, updatedAt: new Date() } : f,
          ),
        })),

      toggleShare: (id) =>
        set((state) => ({
          files: state.files.map((f) =>
            f.id === id ? { ...f, shared: !f.shared, updatedAt: new Date() } : f,
          ),
        })),

      // Folder actions
      addFolder: (name, parentId = null) =>
        set((state) => ({
          folders: [
            ...state.folders,
            {
              id: generateId(),
              name,
              parentId,
              isOpen: true,
              createdAt: new Date(),
            },
          ],
        })),

      deleteFolder: (id) =>
        set((state) => ({
          folders: state.folders.filter((f) => f.id !== id),
          files: state.files.filter((f) => f.folderId !== id),
        })),

      toggleFolderOpen: (id) =>
        set((state) => ({
          folders: state.folders.map((f) => (f.id === id ? { ...f, isOpen: !f.isOpen } : f)),
        })),

      renameFolder: (id, name) =>
        set((state) => ({
          folders: state.folders.map((f) => (f.id === id ? { ...f, name } : f)),
        })),

      // Computed getters
      getFilesByFolder: (folderId) => {
        return get().files.filter((f) => f.folderId === folderId);
      },

      getStarredFiles: () => {
        return get().files.filter((f) => f.starred);
      },

      getRecentFiles: () => {
        const files = [...get().files];
        return files
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 10);
      },

      getSharedFiles: () => {
        return get().files.filter((f) => f.shared);
      },

      searchFiles: (query) => {
        const q = query.toLowerCase();
        return get().files.filter((f) => f.name.toLowerCase().includes(q));
      },

      getFoldersByParent: (parentId) => {
        return get().folders.filter((f) => f.parentId === parentId);
      },
    }),
    {
      name: "textflow-storage",
      partialize: (state) => ({
        files: state.files,
        folders: state.folders,
      }),
    },
  ),
);
