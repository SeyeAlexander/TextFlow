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
} from "lucide-react";
import { useTextFlowStore, TextFlowFile, TextFlowFolder } from "@/store/store";
import { DotLogo } from "@/components/shared/dot-logo";
import { NotificationsPopover } from "./notifications-popover";
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
  const { addFolder } = useTextFlowStore();
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

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
      addFolder(name.trim());
      setName("");
      onClose();
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

// Add to Folder Submenu
function AddToFolderMenu({
  fileId,
  onClose,
  position,
}: {
  fileId: string;
  onClose: () => void;
  position: { x: number; y: number };
}) {
  const { updateFile, getFoldersByParent } = useTextFlowStore();
  const topLevelFolders = getFoldersByParent(null);

  const handleAddToFolder = (folderId: string) => {
    updateFile(fileId, { folderId });
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
      {topLevelFolders.length === 0 ? (
        <div className='px-3 py-2 text-[12px] text-muted-foreground'>No folders</div>
      ) : (
        topLevelFolders.map((folder) => (
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

// Context Menu for items
function ContextMenu({
  isOpen,
  onClose,
  position,
  item,
  type,
}: {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  item: TextFlowFile | TextFlowFolder;
  type: "file" | "folder";
}) {
  const { deleteFile, deleteFolder, toggleStar, renameFolder, updateFile } = useTextFlowStore();
  const [isRenaming, setIsRenaming] = useState(false);
  const [showFolderMenu, setShowFolderMenu] = useState(false);
  const [newName, setNewName] = useState(item.name);

  if (!isOpen) return null;

  const handleRename = () => {
    if (type === "folder") {
      renameFolder(item.id, newName);
    } else {
      updateFile(item.id, { name: newName });
    }
    setIsRenaming(false);
    onClose();
  };

  const handleDelete = () => {
    if (type === "folder") {
      deleteFolder(item.id);
    } else {
      deleteFile(item.id);
    }
    onClose();
  };

  const handleStar = () => {
    if (type === "file") {
      toggleStar(item.id);
    }
    onClose();
  };

  return (
    <>
      <div className='fixed inset-0 z-40' onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        style={{ left: position.x, top: position.y }}
        className='fixed z-50 w-40 rounded-lg border border-black/10 bg-white py-1 shadow-lg dark:border-white/10 dark:bg-[#1a1a1a]'
      >
        {isRenaming ? (
          <div className='p-2'>
            <input
              type='text'
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className='w-full rounded bg-black/5 px-2.5 py-1.5 text-[13px] outline-none dark:bg-white/5'
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename();
                if (e.key === "Escape") setIsRenaming(false);
              }}
            />
          </div>
        ) : (
          <>
            <button
              onClick={() => setIsRenaming(true)}
              className={`${BUTTON_STYLE} w-full ${BUTTON_HOVER}`}
            >
              <Edit3 className='size-3.5' />
              Rename
            </button>
            {type === "file" && (
              <>
                <button onClick={handleStar} className={`${BUTTON_STYLE} w-full ${BUTTON_HOVER}`}>
                  <Star className='size-3.5' />
                  {(item as TextFlowFile).starred ? "Unstar" : "Star"}
                </button>
                <button
                  onClick={() => setShowFolderMenu(true)}
                  className={`${BUTTON_STYLE} w-full ${BUTTON_HOVER}`}
                >
                  <FolderPlus className='size-3.5' />
                  Add to folder
                </button>
              </>
            )}
            <div className='my-1 h-px bg-black/5 dark:bg-white/5' />
            <button
              onClick={handleDelete}
              className={`${BUTTON_STYLE} w-full text-red-500 hover:bg-red-500/10`}
            >
              <Trash2 className='size-3.5' />
              Delete
            </button>
          </>
        )}
      </motion.div>

      <AnimatePresence>
        {showFolderMenu && (
          <AddToFolderMenu
            fileId={item.id}
            onClose={() => {
              setShowFolderMenu(false);
              onClose();
            }}
            position={position}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// File Item with animated icon using ref for group hover
function FileItem({ file }: { file: TextFlowFile }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const iconRef = useRef<BookTextIconHandle>(null);
  const isActive = pathname === `/dashboard/document/${file.id}`;

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuPos({ x: e.clientX, y: e.clientY });
    setMenuOpen(true);
  };

  return (
    <>
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
        <button
          onClick={handleContextMenu}
          className='shrink-0 rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10'
        >
          <MoreVertical className='size-3.5 text-muted-foreground' />
        </button>
      </div>
      <AnimatePresence>
        {menuOpen && (
          <ContextMenu
            isOpen={menuOpen}
            onClose={() => setMenuOpen(false)}
            position={menuPos}
            item={file}
            type='file'
          />
        )}
      </AnimatePresence>
    </>
  );
}

// Folder Item with animated icon using ref for group hover
function FolderItem({ folder }: { folder: TextFlowFolder }) {
  const pathname = usePathname();
  const { getFilesByFolder } = useTextFlowStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const iconRef = useRef<FolderKanbanIconHandle>(null);

  const files = getFilesByFolder(folder.id);
  const isActive = pathname === `/dashboard/folder/${folder.id}`;

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuPos({ x: e.clientX, y: e.clientY });
    setMenuOpen(true);
  };

  return (
    <>
      <div
        className='group'
        onMouseEnter={() => iconRef.current?.startAnimation()}
        onMouseLeave={() => iconRef.current?.stopAnimation()}
      >
        <Link
          href={`/dashboard/folder/${folder.id}`}
          className={`${BUTTON_STYLE} ${isActive ? BUTTON_ACTIVE : BUTTON_HOVER}`}
        >
          <FolderKanbanIcon ref={iconRef} size={14} className='shrink-0 text-muted-foreground' />
          <span className='truncate flex-1'>{folder.name}</span>
          <span className='text-[11px] text-muted-foreground'>{files.length}</span>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleContextMenu(e);
            }}
            className='shrink-0 rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10'
          >
            <MoreVertical className='size-3.5 text-muted-foreground' />
          </button>
        </Link>
      </div>
      <AnimatePresence>
        {menuOpen && (
          <ContextMenu
            isOpen={menuOpen}
            onClose={() => setMenuOpen(false)}
            position={menuPos}
            item={folder}
            type='folder'
          />
        )}
      </AnimatePresence>
    </>
  );
}

// Files Section - Shows 10 MOST RECENTLY UPDATED files (regardless of folder)
// Now collapsible like FoldersSection
function FilesSection() {
  const files = useTextFlowStore((state) => state.files);
  const [isOpen, setIsOpen] = useState(true);
  const [showAll, setShowAll] = useState(false);

  // Get 10 most recently updated files (regardless of folder)
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

// Folders Section - STAYS OPEN by default
// Optimized to filter locally and avoid store getter re-renders
function FoldersSection() {
  const folders = useTextFlowStore((state) => state.folders);
  const [isOpen, setIsOpen] = useState(true);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // Filter top-level folders locally
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

// Discussions Section - Shows documents with active chats
// Discussion Item with its own ref for animation
function DiscussionItem({
  doc,
  onClick,
  getUserById,
}: {
  doc: any;
  onClick: () => void;
  getUserById: (id: string) => any;
}) {
  const iconRef = useRef<MessageSquareMoreIconHandle>(null);
  const lastUser = doc.lastMessage ? getUserById(doc.lastMessage.userId) : null;

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
        {doc.lastMessage && lastUser && (
          <div className='truncate text-[10px] text-muted-foreground'>
            {lastUser.name.split(" ")[0]}: {doc.lastMessage.content.slice(0, 25)}...
          </div>
        )}
      </div>
    </button>
  );
}

// Discussions Section - Shows documents with active chats
function DiscussionsSection() {
  const getDocumentsWithChats = useTextFlowStore((s) => s.getDocumentsWithChats);
  const setChatOpen = useTextFlowStore((s) => s.setChatOpen);
  const setActiveChatDocument = useTextFlowStore((s) => s.setActiveChatDocument);
  const getUserById = useTextFlowStore((s) => s.getUserById);
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  // Hydration fix: only render content after mount
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const documentsWithChats = getDocumentsWithChats();
  const displayDocs = documentsWithChats.slice(0, 5);

  const handleOpenChat = (documentId: string) => {
    setActiveChatDocument(documentId);
    setChatOpen(true);
    router.push(`/dashboard/document/${documentId}`);
  };

  if (!isMounted) {
    return null; // Don't render anything on server/initial render to avoid hydration mismatch
  }

  if (documentsWithChats.length === 0) {
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
        <span className='text-[10px] text-muted-foreground'>{documentsWithChats.length}</span>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className='space-y-0.5 overflow-hidden'
          >
            {displayDocs.map((doc) => (
              <DiscussionItem
                key={doc.documentId}
                doc={doc}
                onClick={() => handleOpenChat(doc.documentId)}
                getUserById={getUserById}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Storage indicator with animated icon - group hover
function StorageCard() {
  const usedGB = 2.4;
  const totalGB = 15;
  const percentage = (usedGB / totalGB) * 100;
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
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className='h-full rounded-full bg-blue-500'
        />
      </div>
      <p className='text-[10px] text-muted-foreground'>
        {usedGB} GB of {totalGB} GB
      </p>
    </div>
  );
}

// User Pill Button with animated CogIcon on hover
function UserPillButton({ onSettingsClick }: { onSettingsClick: () => void }) {
  const cogRef = useRef<CogIconHandle>(null);

  return (
    <button
      onClick={onSettingsClick}
      onMouseEnter={() => cogRef.current?.startAnimation()}
      onMouseLeave={() => cogRef.current?.stopAnimation()}
      className={`${BUTTON_STYLE} w-full ${BUTTON_HOVER}`}
    >
      <div className='flex size-6 items-center justify-center rounded-full bg-linear-to-br from-purple-500 to-blue-500'>
        <User className='size-3 text-white' />
      </div>
      <div className='flex-1 min-w-0'>
        <p className='truncate text-[12px] font-medium'>Demo User</p>
      </div>
      <CogIcon ref={cogRef} size={16} className='text-muted-foreground' />
    </button>
  );
}

// Nav link component with animated icons - group hover
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
    if (animatedIconType === "book-text") {
      return <BookTextIcon ref={bookTextRef} size={14} className='text-muted-foreground' />;
    }
    if (animatedIconType === "sparkles") {
      return <SparklesIcon ref={sparklesRef} size={14} className='text-muted-foreground' />;
    }
    if (animatedIconType === "clock") {
      return <ClockIcon ref={clockRef} size={14} className='text-muted-foreground' />;
    }
    if (animatedIconType === "users") {
      return <UsersIcon ref={usersRef} size={14} className='text-muted-foreground' />;
    }
    if (animatedIconType === "folder") {
      return <FolderKanbanIcon ref={folderRef} size={14} className='text-muted-foreground' />;
    }
    return null;
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

// Main sidebar component (Expanded)
function ExpandedSidebar({
  currentView,
  folders,
  getFilesByFolder,
  showFolders,
  onToggleFolders,
  showFiles,
  onToggleFiles,
  showDiscussions,
  onToggleDiscussions,
  toggleFolderOpen,
  onNavigate,
  onSearch,
  onSettings,
  onAddFolder,
  onInbox,
  inboxOpen,
  onCloseInbox,
  discussions,
  onOpenDiscussion,
}: any) {
  const router = useRouter();
  const addFile = useTextFlowStore((s) => s.addFile);
  const files = useTextFlowStore((s) => s.files);

  // Compute counts locally from the files array selector
  const starredCount = files.filter((f) => f.starred).length;
  const recentCount = files.length > 0 ? Math.min(files.length, 10) : 0; // Approximate for badge
  const sharedCount = files.filter((f) => f.shared).length;

  // Generate unique new document name
  const generateNewDocName = () => {
    const existingNewDocs = files.filter((f) => f.name.startsWith("New"));
    if (existingNewDocs.length === 0) return "New";

    const numbers = existingNewDocs
      .map((f) => {
        const match = f.name.match(/^New(?:\((\d+)\))?$/);
        if (match) return match[1] ? parseInt(match[1]) : 0;
        return -1;
      })
      .filter((n) => n >= 0);

    const maxNum = Math.max(...numbers, -1);
    return maxNum === -1 ? "New" : `New(${maxNum + 1})`;
  };

  const handleNewDocument = () => {
    const name = generateNewDocName();
    addFile({
      name,
      type: "document",
      size: "0 KB",
      content: "",
      folderId: null,
      starred: false,
      shared: false,
    });
    const newFile = useTextFlowStore.getState().files.find((f) => f.name === name);
    if (newFile) {
      router.push(`/dashboard/document/${newFile.id}`);
    }
  };

  return (
    <aside className='flex h-screen w-56 flex-col bg-[#F5F5F5] dark:bg-[#111] [&::-webkit-scrollbar]:hidden'>
      {/* Header with Logo */}
      <div className='flex items-center justify-between px-3 py-5 pb-6'>
        <Link href='/dashboard' className='flex items-center gap-2'>
          <DotLogo size='sm' animated={false} />
        </Link>
        <span className='rounded bg-black/5 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground dark:bg-white/5'>
          v1.0
        </span>
      </div>

      {/* Search */}
      <div className='px-3 pb-2'>
        <button
          onClick={onSearch}
          className={`${BUTTON_STYLE} w-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10`}
        >
          <Search className='size-3.5' />
          <span className='flex-1 text-left text-muted-foreground'>Search...</span>
          <kbd className='rounded bg-black/10 px-1 py-0.5 text-[9px] font-mono dark:bg-white/10'>
            ⌘K
          </kbd>
        </button>
      </div>

      {/* New Document Button */}
      <div className='px-3 pb-3'>
        <button
          onClick={handleNewDocument}
          className={`${BUTTON_STYLE} w-full justify-center bg-black/10 font-medium dark:bg-white/10 hover:bg-black/15 dark:hover:bg-white/15`}
        >
          <Plus className='size-3.5' />
          <span>New Document</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className='flex-1 mt-2 space-y-0.5 overflow-y-auto px-3 [&::-webkit-scrollbar]:hidden'>
        <NavLink href='/dashboard' animatedIconType='book-text' label='All Files' />
        <NavLink
          href='/dashboard/starred'
          animatedIconType='sparkles'
          label='Starred'
          badge={starredCount}
        />
        <NavLink
          href='/dashboard/recent'
          animatedIconType='clock'
          label='Recent'
          badge={recentCount}
        />
        <NavLink
          href='/dashboard/shared'
          animatedIconType='users'
          label='Shared'
          badge={sharedCount}
        />
        <div className='relative'>
          <InboxSidebarItem label='Inbox' active={inboxOpen} onClick={onInbox} badge={3} />
          {/* Notifications Popover */}
          {/* Rendered via portal/fixed positioning in component, but kept here for React tree location */}
          <NotificationsPopover isOpen={inboxOpen} onClose={onCloseInbox} />
        </div>

        {/* Files Section - Collapsible */}
        <div className='pt-6 pb-2'>
          <FilesSection />
        </div>

        {/* Discussions Section */}
        <div className='pt-4 pb-2'>
          <DiscussionsSection />
        </div>

        {/* Folders Section */}
        <div className='pt-4 pb-24'>
          <FoldersSection />
        </div>
      </nav>

      {/* Bottom section */}
      <div className='p-3 space-y-2'>
        {/* Storage */}
        <StorageCard />

        {/* User Profile - with animated CogIcon on hover */}
        <UserPillButton onSettingsClick={onSettings} />
      </div>
    </aside>
  );
}

// SidebarItem helper (needed since I used it above)
function SidebarItem({ icon: Icon, label, active, onClick, badge }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[13px] transition-colors ${
        active ? "bg-black/10 dark:bg-white/10" : "hover:bg-black/5 dark:hover:bg-white/5"
      }`}
    >
      <Icon className='size-3.5 text-muted-foreground' />
      <span className='flex-1 text-left'>{label}</span>
      {badge && <span className='text-[11px] text-muted-foreground'>{badge}</span>}
    </button>
  );
}

// Separate component for Inbox to handle animation ref
function InboxSidebarItem({ label, active, onClick, badge }: any) {
  const iconRef = useRef<MailCheckIconHandle>(null);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => iconRef.current?.startAnimation()}
      onMouseLeave={() => iconRef.current?.stopAnimation()}
      className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[13px] transition-colors ${
        active ? "bg-black/10 dark:bg-white/10" : "hover:bg-black/5 dark:hover:bg-white/5"
      }`}
    >
      <MailCheckIcon ref={iconRef} size={14} className='shrink-0 text-muted-foreground' />
      <span className='flex-1 text-left'>{label}</span>
      {badge && <span className='text-[11px] text-muted-foreground'>{badge}</span>}
    </button>
  );
}

// Collapsed Sidebar - All icons visible with group hover
export function CollapsedSidebar({
  currentView,
  onNavigate,
  onSearch,
  onSettings,
  onAddFolder,
  onExpand,
  onInbox,
  inboxOpen,
  onCloseInbox,
}: any) {
  const router = useRouter();
  const addFile = useTextFlowStore((s) => s.addFile);
  const files = useTextFlowStore((s) => s.files);

  const bookTextRef = useRef<BookTextIconHandle>(null);
  const sparklesRef = useRef<SparklesIconHandle>(null);
  const clockRef = useRef<ClockIconHandle>(null);
  const usersRef = useRef<UsersIconHandle>(null);
  const folderRef = useRef<FolderKanbanIconHandle>(null);
  const archiveRef = useRef<ArchiveIconHandle>(null);
  const cogRef = useRef<CogIconHandle>(null);
  const inboxRef = useRef<InboxIconHandle>(null); // Added inbox ref

  const generateNewDocName = () => {
    const existingNewDocs = files.filter((f) => f.name.startsWith("New"));
    if (existingNewDocs.length === 0) return "New";
    const numbers = existingNewDocs
      .map((f) => {
        const match = f.name.match(/^New(?:\((\d+)\))?$/);
        if (match) return match[1] ? parseInt(match[1]) : 0;
        return -1;
      })
      .filter((n) => n >= 0);
    const maxNum = Math.max(...numbers, -1);
    return maxNum === -1 ? "New" : `New(${maxNum + 1})`;
  };

  const handleNewDocument = () => {
    const name = generateNewDocName();
    addFile({
      name,
      type: "document",
      size: "0 KB",
      content: "",
      folderId: null,
      starred: false,
      shared: false,
    });
    const newFile = useTextFlowStore.getState().files.find((f) => f.name === name);
    if (newFile) {
      router.push(`/dashboard/document/${newFile.id}`);
    }
  };

  const iconButtonClass =
    "rounded-lg p-2 transition-colors hover:bg-black/10 dark:hover:bg-white/10";

  return (
    <div className='flex h-screen w-12 flex-col items-center bg-[#F5F5F5] py-4 dark:bg-[#111]'>
      {/* Expand button */}
      <button onClick={onExpand} className={iconButtonClass} title='Expand sidebar'>
        <ChevronRight className='size-4 text-muted-foreground' />
      </button>

      <div className='h-4' />

      {/* Search */}
      <button onClick={onSearch} className={iconButtonClass} title='Search (⌘K)'>
        <Search className='size-4 text-muted-foreground' />
      </button>

      {/* New Document */}
      <button onClick={handleNewDocument} className={iconButtonClass} title='New Document'>
        <Plus className='size-4 text-muted-foreground' />
      </button>

      <div className='my-3 h-px w-6 bg-black/10 dark:bg-white/10' />

      {/* Nav Icons with group hover */}
      <Link
        href='/dashboard'
        className={iconButtonClass}
        title='All Files'
        onMouseEnter={() => bookTextRef.current?.startAnimation()}
        onMouseLeave={() => bookTextRef.current?.stopAnimation()}
      >
        <BookTextIcon ref={bookTextRef} size={16} className='text-muted-foreground' />
      </Link>
      <Link
        href='/dashboard/starred'
        className={iconButtonClass}
        title='Starred'
        onMouseEnter={() => sparklesRef.current?.startAnimation()}
        onMouseLeave={() => sparklesRef.current?.stopAnimation()}
      >
        <SparklesIcon ref={sparklesRef} size={16} className='text-muted-foreground' />
      </Link>
      <Link
        href='/dashboard/recent'
        className={iconButtonClass}
        title='Recent'
        onMouseEnter={() => clockRef.current?.startAnimation()}
        onMouseLeave={() => clockRef.current?.stopAnimation()}
      >
        <ClockIcon ref={clockRef} size={16} className='text-muted-foreground' />
      </Link>
      <Link
        href='/dashboard/shared'
        className={iconButtonClass}
        title='Shared'
        onMouseEnter={() => usersRef.current?.startAnimation()}
        onMouseLeave={() => usersRef.current?.stopAnimation()}
      >
        <UsersIcon ref={usersRef} size={16} className='text-muted-foreground' />
      </Link>

      <div className='my-3 h-px w-6 bg-black/10 dark:bg-white/10' />

      {/* Folders icon */}
      <button
        className={iconButtonClass}
        title='Folders'
        onMouseEnter={() => folderRef.current?.startAnimation()}
        onMouseLeave={() => folderRef.current?.stopAnimation()}
      >
        <FolderKanbanIcon ref={folderRef} size={16} className='text-muted-foreground' />
      </button>

      {/* Spacer */}
      <div className='flex-1' />

      {/* Storage icon */}
      <button
        className={iconButtonClass}
        title='Storage'
        onMouseEnter={() => archiveRef.current?.startAnimation()}
        onMouseLeave={() => archiveRef.current?.stopAnimation()}
      >
        <ArchiveIcon ref={archiveRef} size={16} className='text-muted-foreground' />
      </button>

      {/* Settings */}
      <button
        onClick={onSettings}
        className={iconButtonClass}
        title='Settings'
        onMouseEnter={() => cogRef.current?.startAnimation()}
        onMouseLeave={() => cogRef.current?.stopAnimation()}
      >
        <CogIcon ref={cogRef} size={16} className='text-muted-foreground' />
      </button>
    </div>
  );
}

export type InboxIconHandle = {
  startAnimation: () => void;
  stopAnimation: () => void;
};

// Wrapper component that handles collapse state and specific feature states
export function AppSidebar() {
  const collapsed = useTextFlowStore((s) => s.sidebarCollapsed);
  const currentView = useTextFlowStore((s) => s.currentView);
  const setView = useTextFlowStore((s) => s.setView);
  const folders = useTextFlowStore((s) => s.folders);
  const getFilesByFolder = useTextFlowStore((s) => s.getFilesByFolder);
  const toggleFolderOpen = useTextFlowStore((s) => s.toggleFolderOpen);
  const addFolder = useTextFlowStore((s) => s.addFolder);
  const setSearchOpen = useTextFlowStore((s) => s.setSearchOpen);
  const setSettingsOpen = useTextFlowStore((s) => s.setSettingsOpen);
  const getDocumentsWithChats = useTextFlowStore((s) => s.getDocumentsWithChats);
  const setActiveChatDocument = useTextFlowStore((s) => s.setActiveChatDocument);
  const setChatOpen = useTextFlowStore((s) => s.setChatOpen);
  const toggleSidebar = useTextFlowStore((s) => s.toggleSidebar);

  const [showFolders, setShowFolders] = useState(true);
  const [showFiles, setShowFiles] = useState(true);
  const [showDiscussions, setShowDiscussions] = useState(true);
  const [inboxOpen, setInboxOpen] = useState(false);
  const router = useRouter();

  const handleNavigation = (view: string) => {
    setView(view);
    if (view === "home") router.push("/dashboard");
    else if (view === "recent") router.push("/dashboard/recent");
    else if (view === "starred") router.push("/dashboard/starred");
    else if (view === "shared") router.push("/dashboard/shared");
  };

  if (collapsed) {
    return (
      <CollapsedSidebar
        currentView={currentView}
        onNavigate={handleNavigation}
        onSearch={() => setSearchOpen(true)}
        onSettings={() => setSettingsOpen(true)}
        onAddFolder={() => addFolder("New Folder")}
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
      getFilesByFolder={getFilesByFolder}
      showFolders={showFolders}
      onToggleFolders={() => setShowFolders(!showFolders)}
      showFiles={showFiles}
      onToggleFiles={() => setShowFiles(!showFiles)}
      showDiscussions={showDiscussions}
      onToggleDiscussions={() => setShowDiscussions(!showDiscussions)}
      toggleFolderOpen={toggleFolderOpen}
      onNavigate={handleNavigation}
      onSearch={() => setSearchOpen(true)}
      onSettings={() => setSettingsOpen(true)}
      onAddFolder={() => addFolder("New Folder")}
      onInbox={() => setInboxOpen(true)}
      inboxOpen={inboxOpen}
      onCloseInbox={() => setInboxOpen(false)}
      discussions={getDocumentsWithChats()}
      onOpenDiscussion={(docId: string) => {
        setActiveChatDocument(docId);
        setChatOpen(true);
        router.push(`/dashboard/document/${docId}`);
      }}
    />
  );
}
