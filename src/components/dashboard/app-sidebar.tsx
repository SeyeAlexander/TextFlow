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
  Clock,
  Users,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  HardDrive,
  User,
  MoreVertical,
  Trash2,
  Edit3,
  Settings,
  FolderPlus,
} from "lucide-react";
import { useTextFlowStore, TextFlowFile, TextFlowFolder } from "@/store/store";
import { DotLogo } from "@/components/shared/dot-logo";

// Add Folder Popover
function AddFolderPopover({
  isOpen,
  onClose,
  anchorRef,
}: {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const { addFolder } = useTextFlowStore();
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

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
    <>
      <div className='fixed inset-0 z-40' onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className='absolute left-0 top-full z-50 mt-1 w-48 rounded-lg border border-black/10 bg-white p-2 shadow-lg dark:border-white/10 dark:bg-[#1a1a1a]'
      >
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='Folder name...'
            className='w-full rounded-md bg-black/5 px-2 py-1.5 text-xs outline-none dark:bg-white/5'
          />
          <div className='mt-2 flex gap-1'>
            <button
              type='button'
              onClick={onClose}
              className='flex-1 rounded-md px-2 py-1 text-[10px] text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='flex-1 rounded-md bg-black/10 px-2 py-1 text-[10px] font-medium dark:bg-white/10'
            >
              Create
            </button>
          </div>
        </form>
      </motion.div>
    </>
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
        className='fixed z-50 w-36 rounded-lg border border-black/10 bg-white py-1 shadow-lg dark:border-white/10 dark:bg-[#1a1a1a]'
      >
        {isRenaming ? (
          <div className='p-2'>
            <input
              type='text'
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className='w-full rounded bg-black/5 px-2 py-1 text-xs outline-none dark:bg-white/5'
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
              className='flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:bg-black/5 dark:hover:bg-white/5'
            >
              <Edit3 className='size-3' />
              Rename
            </button>
            {type === "file" && (
              <button
                onClick={handleStar}
                className='flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:bg-black/5 dark:hover:bg-white/5'
              >
                <Star className='size-3' />
                {(item as TextFlowFile).starred ? "Unstar" : "Star"}
              </button>
            )}
            <button
              onClick={handleDelete}
              className='flex w-full items-center gap-2 px-3 py-1.5 text-xs text-red-500 hover:bg-red-500/10'
            >
              <Trash2 className='size-3' />
              Delete
            </button>
          </>
        )}
      </motion.div>
    </>
  );
}

// Document Item
function DocumentItem({ file }: { file: TextFlowFile }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const isActive = pathname === `/dashboard/document/${file.id}`;

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuPos({ x: e.clientX, y: e.clientY });
    setMenuOpen(true);
  };

  return (
    <>
      <div
        className={`group flex items-center gap-2 rounded-md px-2 py-1 text-xs transition-colors ${
          isActive ? "bg-black/10 dark:bg-white/10" : "hover:bg-black/5 dark:hover:bg-white/5"
        }`}
      >
        <Link
          href={`/dashboard/document/${file.id}`}
          className='flex flex-1 items-center gap-2 min-w-0'
        >
          <FileText className='size-3.5 shrink-0 text-muted-foreground' />
          <span className='truncate'>{file.name}</span>
          {file.starred && <Star className='size-2.5 shrink-0 fill-amber-500 text-amber-500' />}
        </Link>
        <button
          onClick={handleContextMenu}
          className='shrink-0 rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10'
        >
          <MoreVertical className='size-3 text-muted-foreground' />
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

// Folder Item
function FolderItem({ folder }: { folder: TextFlowFolder }) {
  const pathname = usePathname();
  const { getFilesByFolder, toggleFolderOpen } = useTextFlowStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });

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
      <div className='group'>
        <div
          className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors ${
            isActive ? "bg-black/10 dark:bg-white/10" : "hover:bg-black/5 dark:hover:bg-white/5"
          }`}
        >
          <button
            onClick={() => toggleFolderOpen(folder.id)}
            className='shrink-0 rounded p-0.5 hover:bg-black/10 dark:hover:bg-white/10'
          >
            {folder.isOpen ? (
              <ChevronDown className='size-3 text-muted-foreground' />
            ) : (
              <ChevronRight className='size-3 text-muted-foreground' />
            )}
          </button>
          <Link
            href={`/dashboard/folder/${folder.id}`}
            className='flex flex-1 items-center gap-2 min-w-0'
          >
            <FolderOpen className='size-3.5 shrink-0 text-muted-foreground' />
            <span className='truncate'>{folder.name}</span>
            <span className='ml-auto text-[10px] text-muted-foreground'>{files.length}</span>
          </Link>
          <button
            onClick={handleContextMenu}
            className='shrink-0 rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10'
          >
            <MoreVertical className='size-3 text-muted-foreground' />
          </button>
        </div>

        {/* Folder contents */}
        <AnimatePresence>
          {folder.isOpen && files.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className='ml-4 mt-0.5 space-y-0.5 overflow-hidden'
            >
              {files.map((file) => (
                <DocumentItem key={file.id} file={file} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
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

// Documents Section with pulsating arrow
function DocumentsSection() {
  const { files, getFilesByFolder } = useTextFlowStore();
  const [showAll, setShowAll] = useState(false);

  const rootFiles = getFilesByFolder(null);
  const visibleCount = 6;
  const hasMore = rootFiles.length > visibleCount;
  const displayFiles = showAll ? rootFiles : rootFiles.slice(0, visibleCount);

  return (
    <div className='space-y-0.5'>
      {displayFiles.map((file) => (
        <DocumentItem key={file.id} file={file} />
      ))}
      {hasMore && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className='flex w-full items-center justify-center py-1'
        >
          <motion.div animate={{ y: [0, 3, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            <ChevronDown className='size-4 text-muted-foreground' />
          </motion.div>
        </button>
      )}
    </div>
  );
}

// Folders Section
function FoldersSection() {
  const { folders, getFoldersByParent } = useTextFlowStore();
  const [isOpen, setIsOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const addBtnRef = useRef<HTMLButtonElement>(null);

  const topLevelFolders = getFoldersByParent(null);

  return (
    <div className='relative'>
      <div className='mb-1 flex items-center justify-between px-2'>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className='flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground'
        >
          {isOpen ? <ChevronDown className='size-3' /> : <ChevronRight className='size-3' />}
          Folders
        </button>
        <button
          ref={addBtnRef}
          onClick={() => setPopoverOpen(true)}
          className='rounded p-0.5 transition-colors hover:bg-black/10 dark:hover:bg-white/10'
        >
          <Plus className='size-3 text-muted-foreground' />
        </button>
      </div>

      <AnimatePresence>
        {popoverOpen && (
          <AddFolderPopover
            isOpen={popoverOpen}
            onClose={() => setPopoverOpen(false)}
            anchorRef={addBtnRef}
          />
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
            {topLevelFolders.map((folder) => (
              <FolderItem key={folder.id} folder={folder} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Storage indicator
function StorageCard() {
  const usedGB = 2.4;
  const totalGB = 15;
  const percentage = (usedGB / totalGB) * 100;

  return (
    <div className='rounded-lg bg-black/5 p-2.5 dark:bg-white/5'>
      <div className='mb-1.5 flex items-center gap-1.5 text-[10px] font-medium'>
        <HardDrive className='size-3 text-muted-foreground' />
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
      <p className='text-[9px] text-muted-foreground'>
        {usedGB} GB of {totalGB} GB
      </p>
    </div>
  );
}

// Nav link component
function NavLink({
  href,
  icon: Icon,
  label,
  view,
  badge,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  view: string;
  badge?: number;
}) {
  const pathname = usePathname();
  const { setView } = useTextFlowStore();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={() => setView(view)}
      className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors ${
        isActive ? "bg-black/10 dark:bg-white/10" : "hover:bg-black/5 dark:hover:bg-white/5"
      }`}
    >
      <Icon className='size-3.5 text-muted-foreground' />
      <span className='flex-1'>{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className='text-[10px] text-muted-foreground'>{badge}</span>
      )}
    </Link>
  );
}

// Main sidebar component
export function AppSidebar() {
  const router = useRouter();
  const {
    setSearchOpen,
    setSettingsOpen,
    getStarredFiles,
    getRecentFiles,
    getSharedFiles,
    files,
    addFile,
  } = useTextFlowStore();

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
    // Get the new file and navigate to it
    const newFile = useTextFlowStore.getState().files.find((f) => f.name === name);
    if (newFile) {
      router.push(`/dashboard/document/${newFile.id}`);
    }
  };

  return (
    <aside className='flex h-screen w-56 flex-col bg-[#F5F5F5] dark:bg-[#111] [&::-webkit-scrollbar]:hidden'>
      {/* Header with Logo */}
      <div className='flex items-center justify-between px-3 py-5 pb-6'>
        <Link href='/' className='flex items-center gap-2'>
          <DotLogo size='sm' animated={false} />
        </Link>
        <span className='rounded bg-black/5 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground dark:bg-white/5'>
          v1.0
        </span>
      </div>

      {/* Search */}
      <div className='px-3 pb-2'>
        <button
          onClick={() => setSearchOpen(true)}
          className='flex w-full items-center gap-2 rounded-lg bg-black/5 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10'
        >
          <Search className='size-3.5' />
          <span className='flex-1 text-left text-xs'>Search...</span>
          <kbd className='rounded bg-black/10 px-1 py-0.5 text-[9px] font-mono dark:bg-white/10'>
            ⌘K
          </kbd>
        </button>
      </div>

      {/* New Document Button */}
      <div className='px-3 pb-3'>
        <button
          onClick={handleNewDocument}
          className='flex w-full items-center justify-center gap-2 rounded-lg bg-black/10 px-3 py-2 text-xs font-medium transition-colors hover:bg-black/15 dark:bg-white/10 dark:hover:bg-white/15'
        >
          <Plus className='size-3.5' />
          <span>New Document</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className='flex-1 mt-2 space-y-0.5 overflow-y-auto px-3 [&::-webkit-scrollbar]:hidden'>
        <NavLink href='/dashboard' icon={FileText} label='All Files' view='all-files' />
        <NavLink
          href='/dashboard/starred'
          icon={Star}
          label='Starred'
          view='starred'
          badge={getStarredFiles().length}
        />
        <NavLink
          href='/dashboard/recent'
          icon={Clock}
          label='Recent'
          view='recent'
          badge={getRecentFiles().length}
        />
        <NavLink
          href='/dashboard/shared'
          icon={Users}
          label='Shared'
          view='shared'
          badge={getSharedFiles().length}
        />

        {/* Documents Section */}
        <div className='pt-6'>
          <div className='mb-1 px-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground'>
            Documents
          </div>
          <DocumentsSection />
        </div>

        {/* Folders Section */}
        <div className='pt-6'>
          <FoldersSection />
        </div>
      </nav>

      {/* Bottom section */}
      <div className='p-3 space-y-2'>
        {/* Storage */}
        <StorageCard />

        {/* User Profile */}
        <button
          onClick={() => setSettingsOpen(true)}
          className='flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-black/5 dark:hover:bg-white/5'
        >
          <div className='flex size-6 items-center justify-center rounded-full bg-linear-to-br from-purple-500 to-blue-500'>
            <User className='size-3 text-white' />
          </div>
          <div className='flex-1 min-w-0'>
            <p className='truncate text-[11px] font-medium'>Demo User</p>
          </div>
          <Settings className='size-3.5 text-muted-foreground' />
        </button>
      </div>
    </aside>
  );
}

// Collapsed Sidebar
export function CollapsedSidebar({ onExpand }: { onExpand: () => void }) {
  const router = useRouter();
  const { setSearchOpen, setSettingsOpen, addFile, files } = useTextFlowStore();

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
    <div className='flex h-screen w-12 flex-col items-center bg-[#F5F5F5] py-4 dark:bg-[#111]'>
      {/* Expand button */}
      <button
        onClick={onExpand}
        className='mb-4 rounded-lg p-2 transition-colors hover:bg-black/10 dark:hover:bg-white/10'
        title='Expand sidebar'
      >
        <ChevronRight className='size-4 text-muted-foreground' />
      </button>

      {/* Search */}
      <button
        onClick={() => setSearchOpen(true)}
        className='mb-2 rounded-lg p-2 transition-colors hover:bg-black/10 dark:hover:bg-white/10'
        title='Search (⌘K)'
      >
        <Search className='size-4 text-muted-foreground' />
      </button>

      {/* New Document */}
      <button
        onClick={handleNewDocument}
        className='mb-4 rounded-lg p-2 transition-colors hover:bg-black/10 dark:hover:bg-white/10'
        title='New Document'
      >
        <Plus className='size-4 text-muted-foreground' />
      </button>

      <div className='h-px w-6 bg-black/10 dark:bg-white/10 mb-4' />

      {/* Nav Icons */}
      <Link
        href='/dashboard'
        className='mb-2 rounded-lg p-2 transition-colors hover:bg-black/10 dark:hover:bg-white/10'
        title='All Files'
      >
        <FileText className='size-4 text-muted-foreground' />
      </Link>
      <Link
        href='/dashboard/starred'
        className='mb-2 rounded-lg p-2 transition-colors hover:bg-black/10 dark:hover:bg-white/10'
        title='Starred'
      >
        <Star className='size-4 text-muted-foreground' />
      </Link>
      <Link
        href='/dashboard/recent'
        className='mb-2 rounded-lg p-2 transition-colors hover:bg-black/10 dark:hover:bg-white/10'
        title='Recent'
      >
        <Clock className='size-4 text-muted-foreground' />
      </Link>
      <Link
        href='/dashboard/shared'
        className='mb-2 rounded-lg p-2 transition-colors hover:bg-black/10 dark:hover:bg-white/10'
        title='Shared'
      >
        <Users className='size-4 text-muted-foreground' />
      </Link>

      <div className='h-px w-6 bg-black/10 dark:bg-white/10 my-2' />

      {/* Folders icon */}
      <button
        className='mb-2 rounded-lg p-2 transition-colors hover:bg-black/10 dark:hover:bg-white/10'
        title='Folders'
      >
        <FolderOpen className='size-4 text-muted-foreground' />
      </button>

      {/* Spacer */}
      <div className='flex-1' />

      {/* Storage icon */}
      <button
        className='mb-2 rounded-lg p-2 transition-colors hover:bg-black/10 dark:hover:bg-white/10'
        title='Storage'
      >
        <HardDrive className='size-4 text-muted-foreground' />
      </button>

      {/* Settings */}
      <button
        onClick={() => setSettingsOpen(true)}
        className='rounded-lg p-2 transition-colors hover:bg-black/10 dark:hover:bg-white/10'
        title='Settings'
      >
        <Settings className='size-4 text-muted-foreground' />
      </button>
    </div>
  );
}
