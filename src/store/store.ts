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
  files: TextFlowFile[];
  folders: TextFlowFolder[];
  currentView: ViewType;
  currentFileId: string | null;
  searchQuery: string;
  searchOpen: boolean;
  settingsOpen: boolean;
  sidebarCollapsed: boolean;

  // Chat state
  users: User[];
  messages: ChatMessage[];
  documentShares: DocumentShare[];
  chatOpen: boolean;
  activeChatDocumentId: string | null;

  // Actions
  setView: (view: ViewType) => void;
  setCurrentFile: (fileId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSearchOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  toggleSidebar: () => void;

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

  // Chat actions
  sendMessage: (documentId: string, userId: string, content: string) => void;
  shareDocument: (documentId: string, userId: string) => void;
  unshareDocument: (documentId: string, userId: string) => void;
  setChatOpen: (open: boolean) => void;
  setActiveChatDocument: (documentId: string | null) => void;

  // Chat getters
  getMessagesByDocument: (documentId: string) => ChatMessage[];
  getDocumentCollaborators: (documentId: string) => User[];
  getDocumentsWithChats: () => {
    documentId: string;
    documentName: string;
    lastMessage?: ChatMessage;
  }[];
  getUserById: (userId: string) => User | undefined;
  migrateLegacyAvatars: () => void;
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
      sidebarCollapsed: false,

      // Chat initial state
      users: [],
      messages: [],
      documentShares: [],
      chatOpen: false,
      activeChatDocumentId: null,

      // View actions
      setView: (view) => set({ currentView: view }),
      setCurrentFile: (fileId) => set({ currentFileId: fileId }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSearchOpen: (open) => set({ searchOpen: open }),
      setSettingsOpen: (open) => set({ settingsOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

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

      // Chat actions
      sendMessage: (documentId, userId, content) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              id: generateId(),
              documentId,
              userId,
              content,
              createdAt: new Date(),
            },
          ],
        })),

      shareDocument: (documentId, userId) =>
        set((state) => {
          // Check if already shared
          const exists = state.documentShares.some(
            (s) => s.documentId === documentId && s.userId === userId,
          );
          if (exists) return state;
          return {
            documentShares: [...state.documentShares, { documentId, userId, sharedAt: new Date() }],
            // Also mark file as shared
            files: state.files.map((f) => (f.id === documentId ? { ...f, shared: true } : f)),
          };
        }),

      unshareDocument: (documentId, userId) =>
        set((state) => {
          const newShares = state.documentShares.filter(
            (s) => !(s.documentId === documentId && s.userId === userId),
          );
          // Check if document still has any shares
          const stillShared = newShares.some((s) => s.documentId === documentId);
          return {
            documentShares: newShares,
            files: state.files.map((f) =>
              f.id === documentId ? { ...f, shared: stillShared } : f,
            ),
          };
        }),

      setChatOpen: (open) => set({ chatOpen: open }),
      setActiveChatDocument: (documentId) => set({ activeChatDocumentId: documentId }),

      // Chat getters
      getMessagesByDocument: (documentId) => {
        return get()
          .messages.filter((m) => m.documentId === documentId)
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      },

      getDocumentCollaborators: (documentId) => {
        const shares = get().documentShares.filter((s) => s.documentId === documentId);
        const userIds = shares.map((s) => s.userId);
        return get().users.filter((u) => userIds.includes(u.id));
      },

      getDocumentsWithChats: () => {
        const { files, messages, documentShares } = get();
        // Get documents that have shares or messages
        const docIdsWithActivity = new Set([
          ...messages.map((m) => m.documentId),
          ...documentShares.map((s) => s.documentId),
        ]);
        return Array.from(docIdsWithActivity)
          .map((docId) => {
            const file = files.find((f) => f.id === docId);
            const docMessages = messages.filter((m) => m.documentId === docId);
            const lastMessage = docMessages.sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
            )[0];
            return file ? { documentId: docId, documentName: file.name, lastMessage } : null;
          })
          .filter(Boolean) as {
          documentId: string;
          documentName: string;
          lastMessage?: ChatMessage;
        }[];
      },

      getUserById: (userId) => {
        return get().users.find((u) => u.id === userId);
      },

      migrateLegacyAvatars: () =>
        set((state) => {
          // Check if migration is needed (any user has http avatar)
          const needsMigration = state.users.some(
            (u) => u.avatar && (u.avatar.startsWith("http") || u.avatar.startsWith("/")),
          );

          if (!needsMigration) return state;

          const gradientOptions = [
            "from-violet-500 to-purple-500",
            "from-pink-500 to-rose-500",
            "from-cyan-500 to-blue-500",
            "from-emerald-500 to-teal-500",
            "from-amber-500 to-orange-500",
            "from-indigo-500 to-violet-500",
            "from-rose-500 to-pink-500",
            "from-teal-500 to-cyan-500",
          ];

          return {
            users: state.users.map((u, index) => {
              if (u.avatar && (u.avatar.startsWith("http") || u.avatar.startsWith("/"))) {
                // Assign a deterministic gradient based on index
                const gradient = gradientOptions[index % gradientOptions.length];
                return { ...u, avatar: gradient };
              }
              return u;
            }),
          };
        }),
    }),
    {
      name: "textflow-storage",
      partialize: (state) => ({
        files: state.files,
        folders: state.folders,
        sidebarCollapsed: state.sidebarCollapsed,
        users: state.users,
        messages: state.messages,
        documentShares: state.documentShares,
      }),
    },
  ),
);
