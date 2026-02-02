"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Plus,
  FileText,
  Star,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  HardDrive,
  User,
  MoreVertical,
  Trash2,
  Edit3,
  FolderPlus,
  MessageCircle,
  Inbox,
  Bell,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSidebarData, fetchDocumentById, searchDocuments } from "@/actions/data";
import { createFolder, renameFolder, deleteFolder } from "@/actions/folders";
import { createFile, renameFile, deleteFile } from "@/actions/files";
import { useTextFlowStore, TextFlowFile, TextFlowFolder } from "@/store/store";
import { DotLogo } from "@/components/shared/dot-logo";
import { InboxPopover } from "./inbox-popover";
import { useUser } from "@/hooks/use-user";
import { getNotifications } from "@/actions/notifications";
import { getChats } from "@/actions/chat";
// Animated icons
import {
  FolderKanbanIcon,
  type FolderKanbanIconHandle,
} from "@/components/animatedicons/folder-kanban";
import { BookTextIcon, type BookTextIconHandle } from "@/components/animatedicons/book-text";
import { BookmarkIcon, type BookmarkIconHandle } from "@/components/animatedicons/bookmark";
import { ArchiveIcon, type ArchiveIconHandle } from "@/components/animatedicons/archive";
import { CogIcon, type CogIconHandle } from "@/components/animatedicons/cog";
import { ClockIcon, type ClockIconHandle } from "@/components/animatedicons/clock";
import { SparklesIcon, type SparklesIconHandle } from "@/components/animatedicons/sparkles";
import { UsersIcon, type UsersIconHandle } from "@/components/animatedicons/users";
import {
  MessageSquareMoreIcon,
  type MessageSquareMoreIconHandle,
} from "@/components/animatedicons/message-square-more";
import { MailCheckIcon, type MailCheckIconHandle } from "@/components/animatedicons/mail-check";

// Unified button styling constants
const BUTTON_STYLE = "flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] transition-colors";
const BUTTON_HOVER = "hover:bg-black/5 dark:hover:bg-white/5";
const BUTTON_ACTIVE = "bg-black/10 dark:bg-white/10";

// Add Folder Popover
function AddFolderPopover({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (name: string) => {
      const formData = new FormData();
      formData.append("name", name);
      await createFolder(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sidebar"] });
      setName("");
      onClose();
    },
  });

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      mutate(name.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      ref={popoverRef}
      initial={{ opacity: 0, scale: 0.95, y: -5 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -5 }}
      className='absolute left-0 top-full z-50 mt-1 w-48 rounded-lg border border-black/10 bg-white p-2 shadow-lg dark:border-white/10 dark:bg-[#1a1a1a]'
    >
      <form onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type='text'
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder='Folder name...'
          className='w-full rounded-md bg-black/5 px-2.5 py-1.5 text-[13px] outline-none dark:bg-white/5'
        />
        <div className='mt-2 flex gap-1.5'>
          <button
            type='button'
            onClick={onClose}
            className='flex-1 rounded-md px-2 py-1.5 text-[11px] text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5'
          >
            Cancel
          </button>
          <button
            type='submit'
            className='flex-1 rounded-md bg-black/10 px-2 py-1.5 text-[11px] font-medium dark:bg-white/10'
          >
            Create
          </button>
        </div>
      </form>
    </motion.div>
  );
}

// Add to Folder Submenu - Simplified to avoid legacy store
function AddToFolderMenu({
  fileId,
  onClose,
  position,
  folders,
}: {
  fileId: string;
  onClose: () => void;
  position: { x: number; y: number };
  folders: TextFlowFolder[];
}) {
  const queryClient = useQueryClient();

  const handleAddToFolder = async (folderId: string) => {
    const formData = new FormData();
    formData.append("id", fileId);
    formData.append("folderId", folderId);
    // You'll need a move function in files.ts if not already there,
    // assuming renameFile or similar can handle folderId updates.
    await renameFile(formData);
    queryClient.invalidateQueries({ queryKey: ["sidebar"] });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -5 }}
      style={{ left: position.x + 140, top: position.y }}
      className='fixed z-60 w-40 rounded-lg border border-black/10 bg-white py-1 shadow-lg dark:border-white/10 dark:bg-[#1a1a1a]'
    >
      <div className='px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground'>
        Move to folder
      </div>
      {folders.length === 0 ? (
        <div className='px-3 py-2 text-[12px] text-muted-foreground'>No folders</div>
      ) : (
        folders.map((folder) => (
          <button
            key={folder.id}
            onClick={() => handleAddToFolder(folder.id)}
            className={`${BUTTON_STYLE} w-full ${BUTTON_HOVER}`}
          >
            <FolderOpen className='size-3.5' />
            <span className='truncate'>{folder.name}</span>
          </button>
        ))
      )}
    </motion.div>
  );
}

// File Item with animated icon using ref for group hover
function FileItem({ file }: { file: TextFlowFile }) {
  const pathname = usePathname();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(file.name);
  const inputRef = useRef<HTMLInputElement>(null);
  const iconRef = useRef<BookTextIconHandle>(null);
  const queryClient = useQueryClient();
  const isActive = pathname === `/dashboard/document/${file.id}`;

  const renameMutation = useMutation({
    mutationFn: async (newName: string) => {
      const formData = new FormData();
      formData.append("id", file.id);
      formData.append("name", newName);
      await renameFile(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sidebar"] });
      setIsEditing(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("id", file.id);
      await deleteFile(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sidebar"] });
    },
  });

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (editedName.trim() && editedName !== file.name) {
      renameMutation.mutate(editedName.trim());
    } else {
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <form onSubmit={handleRename} className='px-2 py-0.5'>
        <input
          ref={inputRef}
          type='text'
          value={editedName}
          onChange={(e) => setEditedName(e.target.value)}
          onBlur={() => setIsEditing(false)}
          className='w-full rounded border border-blue-500 bg-white px-1.5 py-0.5 text-[13px] outline-none dark:bg-[#1a1a1a]'
        />
      </form>
    );
  }

  return (
    <div
      className={`group ${BUTTON_STYLE} ${isActive ? BUTTON_ACTIVE : BUTTON_HOVER}`}
      onMouseEnter={() => iconRef.current?.startAnimation()}
      onMouseLeave={() => iconRef.current?.stopAnimation()}
    >
      <Link
        href={`/dashboard/document/${file.id}`}
        className='flex flex-1 items-center gap-2 min-w-0'
      >
        <BookTextIcon ref={iconRef} size={14} className='shrink-0 text-muted-foreground' />
        <span className='truncate'>{file.name}</span>
        {file.starred && <Star className='size-2.5 shrink-0 fill-amber-500 text-amber-500' />}
      </Link>

      <div className='flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-1'>
        <button
          onClick={() => setIsEditing(true)}
          className='shrink-0 rounded p-0.5 hover:bg-black/10 dark:hover:bg-white/10'
          title='Rename'
        >
          <Edit3 className='size-3 text-muted-foreground' />
        </button>
        <button
          onClick={() => {
            if (confirm("Delete file?")) deleteMutation.mutate();
          }}
          className='shrink-0 rounded p-0.5 hover:bg-black/10 dark:hover:bg-white/10'
          title='Delete'
        >
          <Trash2 className='size-3 text-muted-foreground' />
        </button>
      </div>
    </div>
  );
}

// Folder Item
function FolderItem({ folder }: { folder: any }) {
  const pathname = usePathname();
  const [isOpenLocal, setIsOpenLocal] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(folder.name);
  const inputRef = useRef<HTMLInputElement>(null);
  const iconRef = useRef<FolderKanbanIconHandle>(null);
  const queryClient = useQueryClient();

  const files = folder.files || [];
  const isActive = pathname === `/dashboard/folder/${folder.id}`;

  const renameMutation = useMutation({
    mutationFn: async (newName: string) => {
      const formData = new FormData();
      formData.append("id", folder.id);
      formData.append("name", newName);
      await renameFolder(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sidebar"] });
      setIsEditing(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("id", folder.id);
      await deleteFolder(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sidebar"] });
    },
  });

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (editedName.trim() && editedName !== folder.name) {
      renameMutation.mutate(editedName.trim());
    } else {
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <form onSubmit={handleRename} className='ml-6 px-2 py-1'>
        <input
          ref={inputRef}
          type='text'
          value={editedName}
          onChange={(e) => setEditedName(e.target.value)}
          onBlur={() => setIsEditing(false)}
          className='w-full rounded border border-blue-500 bg-white px-1.5 py-0.5 text-[13px] outline-none dark:bg-[#1a1a1a]'
        />
      </form>
    );
  }

  return (
    <div
      className='group relative flex flex-col rounded-md transition-colors hover:bg-black/5 dark:hover:bg-white/5'
      onMouseEnter={() => iconRef.current?.startAnimation()}
      onMouseLeave={() => iconRef.current?.stopAnimation()}
    >
      <div className='flex items-center gap-1 py-1 px-2'>
        <button
          onClick={() => setIsOpenLocal(!isOpenLocal)}
          className='p-0.5 text-muted-foreground hover:text-foreground shrink-0'
        >
          {isOpenLocal ? <ChevronDown className='size-3' /> : <ChevronRight className='size-3' />}
        </button>

        <Link
          href={`/dashboard/folder/${folder.id}`}
          className='flex flex-1 items-center gap-2 min-w-0'
        >
          <FolderKanbanIcon ref={iconRef} size={14} className='shrink-0 text-muted-foreground' />
          <span className='truncate flex-1 text-[13px]'>{folder.name}</span>
          {files.length > 0 && (
            <span className='text-[10px] text-muted-foreground shrink-0'>{files.length}</span>
          )}
        </Link>
        <div className='opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1'>
          <button
            onClick={() => setIsEditing(true)}
            className='rounded p-1 hover:bg-black/10 dark:hover:bg-white/10'
          >
            <Edit3 className='size-3 text-muted-foreground' />
          </button>
          <button
            onClick={() => {
              if (confirm("Delete folder?")) deleteMutation.mutate();
            }}
            className='rounded p-1 hover:bg-black/10 dark:hover:bg-white/10'
          >
            <Trash2 className='size-3 text-muted-foreground' />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpenLocal && files.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className='ml-6 space-y-0.5 overflow-hidden'
          >
            {files.map((file: any) => (
              <FileItem key={file.id} file={file} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Files Section
function FilesSection({ files }: { files: TextFlowFile[] }) {
  const [isOpen, setIsOpen] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const sortedFiles = [...files].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
  const recentFiles = sortedFiles.slice(0, 10);
  const visibleCount = 5;
  const hasMore = recentFiles.length > visibleCount;
  const displayFiles = showAll ? recentFiles : recentFiles.slice(0, visibleCount);

  if (files.length === 0) {
    return (
      <div className='px-2 py-3 text-center text-[12px] text-muted-foreground'>No files yet</div>
    );
  }

  return (
    <div className='relative'>
      <div className='mb-1 flex items-center justify-between px-2'>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className='flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground'
        >
          {isOpen ? <ChevronDown className='size-3' /> : <ChevronRight className='size-3' />}
          Files
        </button>
        <span className='text-[10px] text-muted-foreground'>{files.length}</span>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className='space-y-0.5 overflow-hidden'
          >
            {displayFiles.map((file) => (
              <FileItem key={file.id} file={file} />
            ))}
            {hasMore && !showAll && (
              <button
                onClick={() => setShowAll(true)}
                className='flex w-full items-center justify-center py-1.5'
              >
                <motion.div
                  animate={{ y: [0, 3, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                >
                  <ChevronDown className='size-4 text-muted-foreground' />
                </motion.div>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Folders Section
function FoldersSection({ folders }: { folders: TextFlowFolder[] }) {
  const [isOpen, setIsOpen] = useState(true);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const topLevelFolders = folders.filter((f) => f.parentId === null);
  const visibleCount = 5;
  const hasMore = topLevelFolders.length > visibleCount;
  const displayFolders = showAll ? topLevelFolders : topLevelFolders.slice(0, visibleCount);

  return (
    <div className='relative'>
      <div className='mb-1 flex items-center justify-between px-2'>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className='flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground'
        >
          {isOpen ? <ChevronDown className='size-3' /> : <ChevronRight className='size-3' />}
          Folders
        </button>
        <button
          onClick={() => setPopoverOpen(true)}
          className='rounded p-0.5 transition-colors hover:bg-black/10 dark:hover:bg-white/10'
        >
          <Plus className='size-3.5 text-muted-foreground' />
        </button>
      </div>

      <AnimatePresence>
        {popoverOpen && (
          <AddFolderPopover isOpen={popoverOpen} onClose={() => setPopoverOpen(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className='space-y-0.5 overflow-hidden'
          >
            {displayFolders.map((folder) => (
              <FolderItem key={folder.id} folder={folder} />
            ))}
            {hasMore && !showAll && (
              <button
                onClick={() => setShowAll(true)}
                className='flex w-full items-center justify-center py-1.5'
              >
                <motion.div
                  animate={{ y: [0, 3, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                >
                  <ChevronDown className='size-4 text-muted-foreground' />
                </motion.div>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Discussion Item
function DiscussionItem({ doc, onClick }: { doc: any; onClick: () => void }) {
  const iconRef = useRef<MessageSquareMoreIconHandle>(null);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => iconRef.current?.startAnimation()}
      onMouseLeave={() => iconRef.current?.stopAnimation()}
      className={`${BUTTON_STYLE} ${BUTTON_HOVER} w-full group`}
    >
      <MessageSquareMoreIcon ref={iconRef} size={16} className='shrink-0 text-orange-500' />
      <div className='flex-1 min-w-0 text-left'>
        <div className='truncate text-[13px]'>{doc.documentName}</div>
        {doc.lastMessage && (
          <div className='truncate text-[10px] text-muted-foreground'>
            {doc.lastMessage.content?.slice(0, 35)}
          </div>
        )}
      </div>
    </button>
  );
}

// Discussions Section
function DiscussionsSection() {
  const setChatOpen = useTextFlowStore((s) => s.setChatOpen);
  const setActiveChatDocument = useTextFlowStore((s) => s.setActiveChatDocument);
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const { user } = useUser();

  const { data: chats = [] } = useQuery({
    queryKey: ["chats"],
    queryFn: getChats,
    enabled: !!user,
  });

  const displayDocs = chats.slice(0, 5);

  const handleOpenChat = (documentId: string) => {
    setActiveChatDocument(documentId);
    setChatOpen(true);
    router.push(`/dashboard/document/${documentId}`);
  };

  if (chats.length === 0) {
    return null;
  }

  return (
    <div className='relative'>
      <div className='mb-1 flex items-center justify-between px-2'>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className='flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground'
        >
          {isOpen ? <ChevronDown className='size-3' /> : <ChevronRight className='size-3' />}
          Discussions
        </button>
        <span className='text-[10px] text-muted-foreground'>{chats.length}</span>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className='space-y-0.5 overflow-hidden'
          >
            {displayDocs.map((chat: any) => (
              <DiscussionItem
                key={chat.id}
                doc={{
                  documentId: chat.documentId,
                  documentName: chat.documentName,
                  lastMessage: chat.lastMessage,
                }}
                onClick={() => handleOpenChat(chat.documentId)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Storage indicator
function StorageCard() {
  const iconRef = useRef<ArchiveIconHandle>(null);

  return (
    <div
      className='rounded-lg bg-black/5 p-2.5 dark:bg-white/5'
      onMouseEnter={() => iconRef.current?.startAnimation()}
      onMouseLeave={() => iconRef.current?.stopAnimation()}
    >
      <div className='mb-1.5 flex items-center gap-1.5 text-[11px] font-medium'>
        <ArchiveIcon ref={iconRef} size={14} className='text-muted-foreground' />
        <span>Storage</span>
      </div>
      <div className='mb-1 h-1 overflow-hidden rounded-full bg-black/10 dark:bg-white/10'>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "16%" }}
          transition={{ duration: 0.8 }}
          className='h-full rounded-full bg-blue-500'
        />
      </div>
      <p className='text-[10px] text-muted-foreground'>2.4 GB of 15 GB</p>
    </div>
  );
}

// User Pill Button
function UserPillButton({ onSettingsClick }: { onSettingsClick: () => void }) {
  const cogRef = useRef<CogIconHandle>(null);
  const { user } = useUser();

  const fullName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const avatarUrl = user?.user_metadata?.avatar_url || "";

  return (
    <button
      onClick={onSettingsClick}
      onMouseEnter={() => cogRef.current?.startAnimation()}
      onMouseLeave={() => cogRef.current?.stopAnimation()}
      className={`${BUTTON_STYLE} w-full ${BUTTON_HOVER}`}
    >
      <div
        className={`flex size-6 items-center justify-center rounded-full bg-linear-to-br ${avatarUrl || "from-purple-500 to-blue-500"}`}
      >
        {!avatarUrl && <User className='size-3 text-white' />}
      </div>
      <div className='flex-1 min-w-0 text-left'>
        <p className='truncate text-[12px] font-medium'>{fullName}</p>
      </div>
      <CogIcon ref={cogRef} size={16} className='text-muted-foreground' />
    </button>
  );
}

// Nav Link
function NavLink({
  href,
  animatedIconType,
  label,
  badge,
}: {
  href: string;
  animatedIconType: "book-text" | "sparkles" | "clock" | "users" | "folder";
  label: string;
  badge?: number;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  const bookTextRef = useRef<BookTextIconHandle>(null);
  const sparklesRef = useRef<SparklesIconHandle>(null);
  const clockRef = useRef<ClockIconHandle>(null);
  const usersRef = useRef<UsersIconHandle>(null);
  const folderRef = useRef<FolderKanbanIconHandle>(null);

  const handleMouseEnter = () => {
    if (animatedIconType === "book-text") bookTextRef.current?.startAnimation();
    if (animatedIconType === "sparkles") sparklesRef.current?.startAnimation();
    if (animatedIconType === "clock") clockRef.current?.startAnimation();
    if (animatedIconType === "users") usersRef.current?.startAnimation();
    if (animatedIconType === "folder") folderRef.current?.startAnimation();
  };

  const handleMouseLeave = () => {
    if (animatedIconType === "book-text") bookTextRef.current?.stopAnimation();
    if (animatedIconType === "sparkles") sparklesRef.current?.stopAnimation();
    if (animatedIconType === "clock") clockRef.current?.stopAnimation();
    if (animatedIconType === "users") usersRef.current?.stopAnimation();
    if (animatedIconType === "folder") folderRef.current?.stopAnimation();
  };

  const renderIcon = () => {
    switch (animatedIconType) {
      case "book-text":
        return <BookTextIcon ref={bookTextRef} size={14} className='text-muted-foreground' />;
      case "sparkles":
        return <SparklesIcon ref={sparklesRef} size={14} className='text-muted-foreground' />;
      case "clock":
        return <ClockIcon ref={clockRef} size={14} className='text-muted-foreground' />;
      case "users":
        return <UsersIcon ref={usersRef} size={14} className='text-muted-foreground' />;
      case "folder":
        return <FolderKanbanIcon ref={folderRef} size={14} className='text-muted-foreground' />;
      default:
        return null;
    }
  };

  return (
    <Link
      href={href}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`${BUTTON_STYLE} ${isActive ? BUTTON_ACTIVE : BUTTON_HOVER}`}
    >
      {renderIcon()}
      <span className='flex-1'>{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className='text-[11px] text-muted-foreground'>{badge}</span>
      )}
    </Link>
  );
}

// Collapsed Sidebar
function CollapsedSidebar({
  currentView,
  onNavigate,
  onSearch,
  onSettings,
  onExpand,
  onInbox,
  inboxOpen,
  onCloseInbox,
}: any) {
  const iconButtonClass = (isActive: boolean) =>
    `flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${isActive ? "bg-black/10 dark:bg-white/10" : "hover:bg-black/5 dark:hover:bg-white/5"}`;

  const bookTextRef = useRef<BookTextIconHandle>(null);
  const sparklesRef = useRef<SparklesIconHandle>(null);
  const clockRef = useRef<ClockIconHandle>(null);
  const usersRef = useRef<UsersIconHandle>(null);
  const folderRef = useRef<FolderKanbanIconHandle>(null);
  const archiveRef = useRef<ArchiveIconHandle>(null);
  const cogRef = useRef<CogIconHandle>(null);
  const mailRef = useRef<MailCheckIconHandle>(null);

  const { user } = useUser();
  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    enabled: !!user,
  });

  const unreadCount = notifications.filter((n: any) => !n.read).length;

  return (
    <div className='flex h-full w-14 flex-col items-center border-r border-black/5 bg-white py-4 dark:border-white/5 dark:bg-[#0A0A0A]'>
      <button onClick={onExpand} className='mb-6'>
        <DotLogo size='sm' />
      </button>

      <div className='flex flex-col gap-2'>
        <button onClick={onSearch} className={iconButtonClass(false)}>
          <Search className='size-4 text-muted-foreground' />
        </button>

        <div className='relative'>
          <button
            onClick={onInbox}
            onMouseEnter={() => mailRef.current?.startAnimation()}
            onMouseLeave={() => mailRef.current?.stopAnimation()}
            className={iconButtonClass(inboxOpen)}
          >
            <MailCheckIcon ref={mailRef} size={18} className='text-muted-foreground' />
            {unreadCount > 0 && (
              <span className='absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500' />
            )}
          </button>
          <InboxPopover open={inboxOpen} onOpenChange={onCloseInbox} />
        </div>

        <button
          onClick={() => onNavigate("home")}
          onMouseEnter={() => bookTextRef.current?.startAnimation()}
          onMouseLeave={() => bookTextRef.current?.stopAnimation()}
          className={iconButtonClass(currentView === "home")}
        >
          <BookTextIcon ref={bookTextRef} size={18} className='text-muted-foreground' />
        </button>

        <button
          onClick={() => onNavigate("starred")}
          onMouseEnter={() => sparklesRef.current?.startAnimation()}
          onMouseLeave={() => sparklesRef.current?.stopAnimation()}
          className={iconButtonClass(currentView === "starred")}
        >
          <SparklesIcon ref={sparklesRef} size={18} className='text-muted-foreground' />
        </button>

        <button
          onClick={() => onNavigate("recent")}
          onMouseEnter={() => clockRef.current?.startAnimation()}
          onMouseLeave={() => clockRef.current?.stopAnimation()}
          className={iconButtonClass(currentView === "recent")}
        >
          <ClockIcon ref={clockRef} size={18} className='text-muted-foreground' />
        </button>

        <button
          onClick={() => onNavigate("shared")}
          onMouseEnter={() => usersRef.current?.startAnimation()}
          onMouseLeave={() => usersRef.current?.stopAnimation()}
          className={iconButtonClass(currentView === "shared")}
        >
          <UsersIcon ref={usersRef} size={18} className='text-muted-foreground' />
        </button>

        <button
          onClick={() => onNavigate("all-files")}
          onMouseEnter={() => folderRef.current?.startAnimation()}
          onMouseLeave={() => folderRef.current?.stopAnimation()}
          className={iconButtonClass(currentView === "all-files")}
        >
          <FolderKanbanIcon ref={folderRef} size={18} className='text-muted-foreground' />
        </button>

        <button
          onMouseEnter={() => archiveRef.current?.startAnimation()}
          onMouseLeave={() => archiveRef.current?.stopAnimation()}
          className={iconButtonClass(false)}
        >
          <ArchiveIcon ref={archiveRef} size={18} className='text-muted-foreground' />
        </button>

        <button
          onClick={onSettings}
          onMouseEnter={() => cogRef.current?.startAnimation()}
          onMouseLeave={() => cogRef.current?.stopAnimation()}
          className={iconButtonClass(false)}
        >
          <CogIcon ref={cogRef} size={18} className='text-muted-foreground' />
        </button>
      </div>
    </div>
  );
}

// Expanded Sidebar
function ExpandedSidebar({
  currentView,
  folders,
  showFolders,
  onToggleFolders,
  showFiles,
  onToggleFiles,
  onNavigate,
  onSearch,
  onSettings,
  onInbox,
  inboxOpen,
  onCloseInbox,
  files,
}: any) {
  const { user } = useUser();
  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    enabled: !!user,
  });

  const unreadCount = notifications.filter((n: any) => !n.read).length;

  return (
    <div className='flex h-full w-64 flex-col border-r border-black/5 bg-white dark:border-white/5 dark:bg-[#0A0A0A]'>
      <div className='flex items-center gap-3 p-4'>
        <DotLogo size='sm' />
        <span className='text-[15px] font-semibold tracking-tight'>TextFlow</span>
      </div>

      <div className='flex-1 overflow-y-auto px-3 py-2 scrollbar-none'>
        <div className='mb-4 space-y-0.5'>
          <button
            onClick={onSearch}
            className={`${BUTTON_STYLE} ${BUTTON_HOVER} w-full text-muted-foreground`}
          >
            <Search className='size-3.5' />
            Search...
          </button>

          <div className='relative'>
            <button onClick={onInbox} className={`${BUTTON_STYLE} ${BUTTON_HOVER} w-full`}>
              <Inbox className='size-3.5 text-muted-foreground' />
              <span className='flex-1 text-left'>Inbox</span>
              {unreadCount > 0 && (
                <span className='rounded bg-orange-500/10 px-1.5 py-0.5 text-[10px] font-medium text-orange-600'>
                  {unreadCount}
                </span>
              )}
            </button>
            <InboxPopover open={inboxOpen} onOpenChange={onCloseInbox} />
          </div>
        </div>

        <div className='mb-6'>
          <div className='px-2 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground'>
            Main
          </div>
          <div className='space-y-0.5'>
            <NavLink href='/dashboard' animatedIconType='book-text' label='Home' />
            <NavLink href='/dashboard/starred' animatedIconType='sparkles' label='Starred' />
            <NavLink href='/dashboard/recent' animatedIconType='clock' label='Recent' />
            <NavLink href='/dashboard/shared' animatedIconType='users' label='Shared with me' />
            <NavLink href='/dashboard' animatedIconType='folder' label='All Files' />
          </div>
        </div>

        <div className='mb-6'>
          <FoldersSection folders={folders} />
        </div>

        <div className='mb-6'>
          <FilesSection files={files} />
        </div>

        <div className='mb-6'>
          <DiscussionsSection />
        </div>
      </div>

      <div className='border-t border-black/5 p-3 dark:border-white/5'>
        <div className='mb-3'>
          <StorageCard />
        </div>
        <UserPillButton onSettingsClick={onSettings} />
      </div>
    </div>
  );
}

// Main Sidebar Export
export function AppSidebar({ collapsed }: { collapsed: boolean }) {
  const { currentView, setView, setSearchOpen, setSettingsOpen, toggleSidebar } =
    useTextFlowStore();

  const { data: sidebarData } = useQuery({
    queryKey: ["sidebar"],
    queryFn: fetchSidebarData,
  });

  const folders = sidebarData?.folders || [];
  const files = sidebarData?.files || [];

  const [showFolders, setShowFolders] = useState(true);
  const [showFiles, setShowFiles] = useState(true);
  const [inboxOpen, setInboxOpen] = useState(false);
  const router = useRouter();

  const handleNavigation = (view: string) => {
    setView(view);
    if (view === "home") router.push("/dashboard");
    else if (view === "recent") router.push("/dashboard/recent");
    else if (view === "starred") router.push("/dashboard/starred");
    else if (view === "shared") router.push("/dashboard/shared");
    else if (view === "all-files") router.push("/dashboard");
  };

  if (collapsed) {
    return (
      <CollapsedSidebar
        currentView={currentView}
        onNavigate={handleNavigation}
        onSearch={() => setSearchOpen(true)}
        onSettings={() => setSettingsOpen(true)}
        onExpand={toggleSidebar}
        onInbox={() => setInboxOpen(true)}
        inboxOpen={inboxOpen}
        onCloseInbox={() => setInboxOpen(false)}
      />
    );
  }

  return (
    <ExpandedSidebar
      currentView={currentView}
      folders={folders}
      showFolders={showFolders}
      onToggleFolders={() => setShowFolders(!showFolders)}
      files={files}
      showFiles={showFiles}
      onToggleFiles={() => setShowFiles(!showFiles)}
      onNavigate={handleNavigation}
      onSearch={() => setSearchOpen(true)}
      onSettings={() => setSettingsOpen(true)}
      onInbox={() => setInboxOpen(true)}
      inboxOpen={inboxOpen}
      onCloseInbox={() => setInboxOpen(false)}
    />
  );
}
