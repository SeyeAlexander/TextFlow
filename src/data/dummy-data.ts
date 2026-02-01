import { TextFlowFile, TextFlowFolder, useTextFlowStore } from "@/store/store";

// Helper to create dates relative to now
const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

const hoursAgo = (hours: number) => {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date;
};

// Dummy Folders
export const DUMMY_FOLDERS: Omit<TextFlowFolder, "createdAt">[] = [
  { id: "folder-1", name: "Work Documents", parentId: null, isOpen: false },
  { id: "folder-2", name: "Personal", parentId: null, isOpen: false },
  { id: "folder-3", name: "Projects", parentId: null, isOpen: false },
  { id: "folder-4", name: "Shared with Me", parentId: null, isOpen: false },
  { id: "folder-5", name: "Archives", parentId: null, isOpen: false },
  // Nested folders
  { id: "folder-1-1", name: "Reports", parentId: "folder-1", isOpen: false },
  { id: "folder-1-2", name: "Presentations", parentId: "folder-1", isOpen: false },
  { id: "folder-3-1", name: "TextFlow App", parentId: "folder-3", isOpen: false },
  { id: "folder-3-2", name: "Client Projects", parentId: "folder-3", isOpen: false },
];

// Dummy Files
export const DUMMY_FILES: Omit<TextFlowFile, "createdAt" | "updatedAt">[] = [
  // Root files
  {
    id: "file-1",
    name: "Getting Started Guide",
    type: "document",
    size: "12 KB",
    content: "# Welcome to TextFlow\n\nThis is your collaborative document editor.",
    folderId: null,
    starred: true,
    shared: false,
  },
  {
    id: "file-2",
    name: "Project Roadmap",
    type: "document",
    size: "8 KB",
    content: "# Q1 2026 Roadmap\n\n## Goals\n- Launch beta\n- 1000 users",
    folderId: null,
    starred: true,
    shared: true,
  },
  // Work Documents
  {
    id: "file-3",
    name: "Q4 Financial Report",
    type: "pdf",
    size: "2.4 MB",
    folderId: "folder-1",
    starred: false,
    shared: true,
  },
  {
    id: "file-4",
    name: "Team Meeting Notes",
    type: "document",
    size: "5 KB",
    content: "# Meeting Notes - Jan 28\n\n## Attendees\n- John\n- Sarah\n- Mike",
    folderId: "folder-1",
    starred: false,
    shared: true,
  },
  // Reports (nested in Work)
  {
    id: "file-5",
    name: "Monthly Analytics",
    type: "document",
    size: "18 KB",
    content: "# Analytics Report\n\n## Key Metrics\n- Users: 5,432\n- Sessions: 12,000",
    folderId: "folder-1-1",
    starred: false,
    shared: false,
  },
  // Personal
  {
    id: "file-6",
    name: "Journal Entry",
    type: "document",
    size: "3 KB",
    content: "# January 2026\n\nToday was productive...",
    folderId: "folder-2",
    starred: false,
    shared: false,
  },
  {
    id: "file-7",
    name: "Travel Plans",
    type: "document",
    size: "6 KB",
    content: "# Summer Trip 2026\n\n## Destinations\n1. Paris\n2. Tokyo",
    folderId: "folder-2",
    starred: true,
    shared: false,
  },
  // Projects
  {
    id: "file-8",
    name: "App Design Specs",
    type: "document",
    size: "24 KB",
    content: "# TextFlow Design System\n\n## Colors\n- Primary: #d84315",
    folderId: "folder-3",
    starred: true,
    shared: true,
  },
  // TextFlow App (nested in Projects)
  {
    id: "file-9",
    name: "Feature Requirements",
    type: "document",
    size: "15 KB",
    content: "# Feature List\n\n- [ ] Real-time collaboration\n- [ ] Offline mode",
    folderId: "folder-3-1",
    starred: false,
    shared: true,
  },
  {
    id: "file-10",
    name: "API Documentation",
    type: "document",
    size: "32 KB",
    content: "# TextFlow API\n\n## Endpoints\n\n### GET /documents",
    folderId: "folder-3-1",
    starred: false,
    shared: false,
  },
  // Shared with Me
  {
    id: "file-11",
    name: "Brand Guidelines",
    type: "pdf",
    size: "8 MB",
    folderId: "folder-4",
    starred: false,
    shared: true,
  },
  {
    id: "file-12",
    name: "Client Feedback",
    type: "document",
    size: "7 KB",
    content: "# Feedback Summary\n\n## Highlights\n- Great UX\n- Fast performance",
    folderId: "folder-4",
    starred: false,
    shared: true,
  },
  // Archives
  {
    id: "file-13",
    name: "Old Project Files",
    type: "archive",
    size: "156 MB",
    folderId: "folder-5",
    starred: false,
    shared: false,
  },
  {
    id: "file-14",
    name: "2024 Backup",
    type: "archive",
    size: "2.1 GB",
    folderId: "folder-5",
    starred: false,
    shared: false,
  },
  {
    id: "file-15",
    name: "Quick Note",
    type: "document",
    size: "1 KB",
    content: "Remember to update the landing page!",
    folderId: null,
    starred: false,
    shared: false,
  },
];

// Initialize store with dummy data
export function initializeDummyData() {
  const store = useTextFlowStore.getState();

  // Only initialize if empty
  if (store.files.length === 0 && store.folders.length === 0) {
    // Add folders
    DUMMY_FOLDERS.forEach((folder, i) => {
      useTextFlowStore.setState((state) => ({
        folders: [...state.folders, { ...folder, createdAt: daysAgo(30 - i) }],
      }));
    });

    // Add files with varied dates
    const dateOffsets = [0, 1, 2, 3, 5, 7, 10, 14, 21, 28, 30, 35, 40, 45, 50];
    DUMMY_FILES.forEach((file, i) => {
      const offset = dateOffsets[i % dateOffsets.length];
      const date = i < 5 ? hoursAgo(i * 2 + 1) : daysAgo(offset);
      useTextFlowStore.setState((state) => ({
        files: [...state.files, { ...file, createdAt: date, updatedAt: date }],
      }));
    });
  }
}

// Get file icon based on type
export function getFileIcon(type: TextFlowFile["type"]): string {
  switch (type) {
    case "document":
      return "file-text";
    case "image":
      return "image";
    case "video":
      return "video";
    case "pdf":
      return "file-text";
    case "archive":
      return "archive";
    default:
      return "file";
  }
}

// Format file size
export function formatFileSize(size: string): string {
  return size;
}

// Format relative time
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return new Date(date).toLocaleDateString();
}
