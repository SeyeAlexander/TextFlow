"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Star,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  User,
  MoreVertical,
  Trash2,
  Edit3,
  FolderPlus,
  Mail,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSidebarData } from "@/actions/data";
import { toggleStar } from "@/actions/document";
import { createFolder, renameFolder, deleteFolder } from "@/actions/folders";
import { createFile, renameFile, deleteFile } from "@/actions/files";
import { useTextFlowStore, TextFlowFile, TextFlowFolder } from "@/store/store";
import { DotLogo } from "@/components/shared/dot-logo";
import { NotificationsPopover } from "./notifications-popover";
import { DeleteFolderModal } from "./delete-folder-modal";
import { DeleteFileModal } from "./delete-file-modal";
import { toast } from "sonner";
import { getNotifications } from "@/actions/notifications";
import { getChats } from "@/actions/chat";
// Animated icons
import {
  FolderKanbanIcon,
  type FolderKanbanIconHandle,
} from "@/components/animatedicons/folder-kanban";
import { BookTextIcon, type BookTextIconHandle } from "@/components/animatedicons/book-text";
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
import { useUser } from "@/hooks/use-user";
import { InboxPopover } from "./inbox-popover";

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
    onMutate: async (name) => {
      await queryClient.cancelQueries({ queryKey: ["sidebar"] });
      const previousSidebar = queryClient.getQueryData(["sidebar"]);

      // Optimistically add folder
      const tempId = `temp-${Date.now()}`;
      queryClient.setQueryData(["sidebar"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          folders: [
            {
              id: tempId,
              name,
              parentId: null,
              isOpen: false,
              createdAt: new Date().toISOString(),
              fileCount: 0,
            },
            ...(old.folders || []),
          ],
        };
      });

      return { previousSidebar, tempId };
    },
    onError: (err, vars, context) => {
      if (context?.previousSidebar) {
        queryClient.setQueryData(["sidebar"], context.previousSidebar);
      }
      toast.error("Failed to create folder");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["sidebar"] });
    },
    onSuccess: () => {
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
          disabled={isPending}
        />
        <div className='mt-2 flex gap-1.5'>
          <button
            type='button'
            onClick={onClose}
            className='flex-1 rounded-md px-2 py-1.5 text-[11px] text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5'
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            type='submit'
            className='flex-1 rounded-md bg-black/10 px-2 py-1.5 text-[11px] font-medium dark:bg-white/10 disabled:opacity-50'
            disabled={isPending}
          >
            {isPending ? <span className='animate-pulse'>...</span> : "Create"}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

// Add to Folder Submenu
function AddToFolderMenu({
  onClose,
  position,
  folders,
  onSelectFolder,
}: {
  onClose: () => void;
  position: { x: number; y: number };
  folders: TextFlowFolder[];
  onSelectFolder: (folderId: string) => void;
}) {
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
            onClick={() => onSelectFolder(folder.id)}
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
// Adapted to take callbacks instead of using store directly
function ContextMenu({
  isOpen,
  onClose,
  position,
  item,
  type,
  onRename,
  onDelete,
  onStar,
  folders, // passed down ONLY if it matches the current level of abstraction? No, passed from FileItem
  onAddToFolder,
}: {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  item: TextFlowFile | TextFlowFolder;
  type: "file" | "folder";
  onRename: (newName: string) => void;
  onDelete: () => void;
  onStar?: () => void;
  folders?: TextFlowFolder[];
  onAddToFolder?: (folderId: string) => void;
}) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [showFolderMenu, setShowFolderMenu] = useState(false);
  const [newName, setNewName] = useState(item.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isRenaming]);

  if (!isOpen) return null;

  const handleRenameSubmit = () => {
    if (newName.trim() && newName !== item.name) {
      onRename(newName.trim());
    }
    setIsRenaming(false);
    onClose();
  };

  const handleDelete = () => {
    onDelete();
    onClose();
  };

  const handleStar = () => {
    if (onStar) onStar();
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
              ref={inputRef}
              type='text'
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className='w-full rounded bg-black/5 px-2.5 py-1.5 text-[13px] outline-none dark:bg-white/5'
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRenameSubmit();
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

            {type === "file" && onStar && (
              <>
                <button onClick={handleStar} className={`${BUTTON_STYLE} w-full ${BUTTON_HOVER}`}>
                  <Star
                    className={`size-3.5 ${(item as TextFlowFile).starred ? "fill-amber-500 text-amber-500" : ""}`}
                  />
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
            {/* REMOVED SEPARATOR AS REQUESTED */}
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
        {showFolderMenu && folders && onAddToFolder && (
          <AddToFolderMenu
            onClose={() => {
              setShowFolderMenu(false);
              onClose();
            }}
            position={position}
            folders={folders}
            onSelectFolder={(fid) => {
              onAddToFolder(fid);
              onClose();
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// File Item
function FileItem({
  file,
  folders, // Need folders for "Add to folder"
}: {
  file: TextFlowFile;
  folders: TextFlowFolder[];
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const iconRef = useRef<BookTextIconHandle>(null);
  const queryClient = useQueryClient();
  const router = useRouter(); // Added router for redirect on delete
  const isActive = pathname === `/dashboard/document/${file.id}`;

  const renameMutation = useMutation({
    mutationFn: async (newName: string) => {
      const formData = new FormData();
      formData.append("id", file.id);
      formData.append("name", newName);
      await renameFile(formData);
    },
    onMutate: async (newName) => {
      await queryClient.cancelQueries({ queryKey: ["sidebar"] });
      const previousSidebar = queryClient.getQueryData(["sidebar"]);

      queryClient.setQueryData(["sidebar"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          files: old.files.map((f: any) => (f.id === file.id ? { ...f, name: newName } : f)),
        };
      });

      return { previousSidebar };
    },
    onError: (err, vars, context) => {
      if (context?.previousSidebar) {
        queryClient.setQueryData(["sidebar"], context.previousSidebar);
      }
      toast.error("Failed to rename file");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["sidebar"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("id", file.id);
      await deleteFile(formData);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["sidebar"] });
      const previousSidebar = queryClient.getQueryData(["sidebar"]);

      // Optimistically remove the file from the list
      queryClient.setQueryData(["sidebar"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          files: old.files.filter((f: any) => f.id !== file.id),
        };
      });

      return { previousSidebar };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(["sidebar"], context?.previousSidebar);
      toast.error("Failed to delete file");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["sidebar"] });
    },
    onSuccess: () => {
      if (isActive) {
        router.push("/dashboard");
      }
    },
  });

  const addToFolderMutation = useMutation({
    mutationFn: async (folderId: string) => {
      const formData = new FormData();
      formData.append("id", file.id);
      formData.append("folderId", folderId);
      await renameFile(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sidebar"] });
      toast.success("Moved to folder");
    },
  });

  const starMutation = useMutation({
    mutationFn: async () => {
      return toggleStar(file.id);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["sidebar"] });
      const previousSidebar = queryClient.getQueryData(["sidebar"]);

      queryClient.setQueryData(["sidebar"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          files: old.files.map((f: any) => (f.id === file.id ? { ...f, starred: !f.starred } : f)),
        };
      });
      return { previousSidebar };
    },
    onError: (err, vars, context) => {
      queryClient.setQueryData(["sidebar"], context?.previousSidebar);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["sidebar"] });
    },
  });

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuPos({ x: e.clientX, y: e.clientY });
    setMenuOpen(true);
  };

  return (
    <>
      <div
        className={`group ${BUTTON_STYLE} ${isActive ? BUTTON_ACTIVE : BUTTON_HOVER} justify-between`}
        onMouseEnter={() => iconRef.current?.startAnimation()}
        onMouseLeave={() => iconRef.current?.stopAnimation()}
        onContextMenu={handleContextMenu}
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
          className='opacity-0 group-hover:opacity-100 p-0.5 rounded-sm hover:bg-black/10 dark:hover:bg-white/10 transition-opacity focus:opacity-100 outline-none'
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
            onRename={(newName) => renameMutation.mutate(newName)}
            onDelete={() => {
              // Open modal instead of confirm
              setShowDeleteModal(true);
              // Note: ContextMenu onClose is called inside ContextMenu's handleDelete,
              // but we are passing this function to it.
              // Actually ContextMenu calls onDelete then onClose.
              // So we just set showDeleteModal(true) here.
            }}
            onStar={() => starMutation.mutate()}
            folders={folders}
            onAddToFolder={(fid) => addToFolderMutation.mutate(fid)}
          />
        )}
      </AnimatePresence>

      <DeleteFileModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => deleteMutation.mutate()}
        fileName={file.name}
      />
    </>
  );
}

// Folder Item
function FolderItem({ folder }: { folder: any }) {
  const pathname = usePathname();
  const [isOpenLocal, setIsOpenLocal] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const iconRef = useRef<FolderKanbanIconHandle>(null);
  const router = useRouter(); // Added router for redirect on delete
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
    onMutate: async (newName) => {
      await queryClient.cancelQueries({ queryKey: ["sidebar"] });
      const previousSidebar = queryClient.getQueryData(["sidebar"]);

      queryClient.setQueryData(["sidebar"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          folders: old.folders.map((f: any) => (f.id === folder.id ? { ...f, name: newName } : f)),
        };
      });

      return { previousSidebar };
    },
    onError: (err, vars, context) => {
      if (context?.previousSidebar) {
        queryClient.setQueryData(["sidebar"], context.previousSidebar);
      }
      toast.error("Failed to rename folder");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["sidebar"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (deleteFiles: boolean) => {
      const formData = new FormData();
      formData.append("id", folder.id);
      formData.append("deleteFiles", String(deleteFiles));
      await deleteFolder(formData);
    },
    onMutate: async (deleteFiles) => {
      await queryClient.cancelQueries({ queryKey: ["sidebar"] });
      const previousSidebar = queryClient.getQueryData(["sidebar"]);

      queryClient.setQueryData(["sidebar"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          folders: old.folders.filter((f: any) => f.id !== folder.id),
          // Optionally handle files if deleteFiles is true
          files: deleteFiles ? old.files.filter((f: any) => f.folderId !== folder.id) : old.files,
        };
      });

      // Redirect immediately if viewing this folder
      if (isActive) {
        router.push("/dashboard");
      }

      return { previousSidebar };
    },
    onError: (err, vars, context) => {
      if (context?.previousSidebar) {
        queryClient.setQueryData(["sidebar"], context.previousSidebar);
      }
      toast.error("Failed to delete folder");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["sidebar"] });
    },
  });

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuPos({ x: e.clientX, y: e.clientY });
    setMenuOpen(true);
  };

  return (
    <>
      <div
        className='group relative flex flex-col rounded-md transition-colors hover:bg-black/5 dark:hover:bg-white/5'
        onMouseEnter={() => iconRef.current?.startAnimation()}
        onMouseLeave={() => iconRef.current?.stopAnimation()}
        onContextMenu={handleContextMenu}
      >
        <div className='flex items-center gap-1 py-1.5 px-2'>
          <Link
            href={`/dashboard/folder/${folder.id}`}
            className='flex flex-1 items-center gap-2 min-w-0'
          >
            <FolderKanbanIcon ref={iconRef} size={14} className='shrink-0 text-muted-foreground' />
            <span className='truncate flex-1 text-[13px]'>{folder.name}</span>
            {(folder.fileCount > 0 || files.length > 0) && (
              <span className='text-[10px] text-muted-foreground shrink-0'>
                {folder.fileCount ?? files.length}
              </span>
            )}
          </Link>

          <button
            onClick={handleContextMenu}
            className='opacity-0 group-hover:opacity-100 p-0.5 rounded-sm hover:bg-black/10 dark:hover:bg-white/10 transition-opacity focus:opacity-100 outline-none'
          >
            <MoreVertical className='size-3.5 text-muted-foreground' />
          </button>
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
                <FileItem key={file.id} file={file} folders={[]} />
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
            onRename={(newName) => renameMutation.mutate(newName)}
            onDelete={() => {
              setShowDeleteModal(true);
            }}
          />
        )}
      </AnimatePresence>

      <DeleteFolderModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={(deleteFiles) => deleteMutation.mutate(deleteFiles)}
        folderName={folder.name}
      />
    </>
  );
}

// Files Section
function FilesSection({
  files,
  folders, // New prop
  isOpen,
}: {
  files: TextFlowFile[];
  folders: TextFlowFolder[]; // New prop type
  isOpen: boolean;
}) {
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
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className='space-y-0.5 overflow-hidden'
          >
            {displayFiles.map((file) => (
              <FileItem key={file.id} file={file} folders={folders} />
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
function FoldersSection({ folders, isOpen }: { folders: TextFlowFolder[]; isOpen: boolean }) {
  const [showAll, setShowAll] = useState(false);

  const topLevelFolders = folders.filter((f) => f.parentId === null);
  const visibleCount = 5;
  const hasMore = topLevelFolders.length > visibleCount;
  const displayFolders = showAll ? topLevelFolders : topLevelFolders.slice(0, visibleCount);

  return (
    <div className='relative'>
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
function DiscussionsSection({ isOpen }: { isOpen: boolean }) {
  const setChatOpen = useTextFlowStore((s) => s.setChatOpen);
  const setActiveChatDocument = useTextFlowStore((s) => s.setActiveChatDocument);
  const router = useRouter();
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

// Inbox Sidebar Item
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
  animatedIconType: "book-text" | "sparkles" | "clock" | "users" | "folder" | "mail";
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
      case "mail":
        return <Mail className='size-3.5 text-muted-foreground' />;
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
  onNewDocument,
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
    <div className='flex h-full w-14 flex-col items-center py-4 bg-[#F5F5F5] dark:bg-[#111]'>
      {/* Expand button replacing DotLogo */}
      <button
        onClick={onExpand}
        className={`${iconButtonClass(false)} mb-2`}
        title='Expand Sidebar'
      >
        <ChevronRight className='size-4 text-muted-foreground' />
      </button>

      <div className='flex flex-1 flex-col gap-2 w-full px-2'>
        <button onClick={onSearch} className={iconButtonClass(false)} title='Search (⌘K)'>
          <Search className='size-4 text-muted-foreground' />
        </button>

        <button
          type='button'
          onClick={(e) => onNewDocument(e)}
          className={iconButtonClass(false)}
          title='New Document'
          aria-label='New Document'
        >
          <Plus className='size-4 text-muted-foreground' />
        </button>

        <div className='my-2 h-px w-full bg-black/5 dark:bg-white/5' />

        <button
          onClick={() => onNavigate("home")}
          onMouseEnter={() => bookTextRef.current?.startAnimation()}
          onMouseLeave={() => bookTextRef.current?.stopAnimation()}
          className={iconButtonClass(currentView === "home")}
          title='All Files'
        >
          <BookTextIcon ref={bookTextRef} size={18} className='text-muted-foreground' />
        </button>

        <button
          onClick={() => onNavigate("starred")}
          onMouseEnter={() => sparklesRef.current?.startAnimation()}
          onMouseLeave={() => sparklesRef.current?.stopAnimation()}
          className={iconButtonClass(currentView === "starred")}
          title='Starred'
        >
          <SparklesIcon ref={sparklesRef} size={18} className='text-muted-foreground' />
        </button>

        <button
          onClick={() => onNavigate("recent")}
          onMouseEnter={() => clockRef.current?.startAnimation()}
          onMouseLeave={() => clockRef.current?.stopAnimation()}
          className={iconButtonClass(currentView === "recent")}
          title='Recent'
        >
          <ClockIcon ref={clockRef} size={18} className='text-muted-foreground' />
        </button>

        <button
          onClick={() => onNavigate("shared")}
          onMouseEnter={() => usersRef.current?.startAnimation()}
          onMouseLeave={() => usersRef.current?.stopAnimation()}
          className={iconButtonClass(currentView === "shared")}
          title='Shared'
        >
          <UsersIcon ref={usersRef} size={18} className='text-muted-foreground' />
        </button>

        <div className='relative w-full flex justify-center'>
          <button
            onClick={onInbox}
            onMouseEnter={() => mailRef.current?.startAnimation()}
            onMouseLeave={() => mailRef.current?.stopAnimation()}
            className={iconButtonClass(inboxOpen)}
            title='Inbox'
          >
            <MailCheckIcon ref={mailRef} size={18} className='text-muted-foreground' />
            {unreadCount > 0 && (
              <span className='absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500' />
            )}
          </button>
          <NotificationsPopover isOpen={inboxOpen} onClose={onCloseInbox} />
        </div>

        <div className='my-2 h-px w-full bg-black/5 dark:bg-white/5' />

        <button
          onClick={() => onNavigate("all-files")}
          onMouseEnter={() => folderRef.current?.startAnimation()}
          onMouseLeave={() => folderRef.current?.stopAnimation()}
          className={iconButtonClass(currentView === "all-files")}
          title='Folders'
        >
          <FolderKanbanIcon ref={folderRef} size={18} className='text-muted-foreground' />
        </button>

        <div className='flex-1' />

        <button
          onMouseEnter={() => archiveRef.current?.startAnimation()}
          onMouseLeave={() => archiveRef.current?.stopAnimation()}
          className={iconButtonClass(false)}
          title='Storage'
        >
          <ArchiveIcon ref={archiveRef} size={18} className='text-muted-foreground' />
        </button>

        <button
          onClick={onSettings}
          onMouseEnter={() => cogRef.current?.startAnimation()}
          onMouseLeave={() => cogRef.current?.stopAnimation()}
          className={iconButtonClass(false)}
          title='Settings'
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
  onNavigate,
  onSearch,
  onSettings,
  onInbox,
  inboxOpen,
  onCloseInbox,
  files,
  onNewDocument,
  isCreating,
  sidebarData,
  showFolders,
  onToggleFolders,
  showFiles,
  onToggleFiles,
  showDiscussions,
  onToggleDiscussions,
  onOpenNewFolderPopover,
  popoverOpen,
  onCloseNewFolderPopover,
  folders,
}: any) {
  const { user } = useUser();
  const unreadCount = sidebarData?.unreadCount || 0;

  return (
    <aside className='flex h-full w-56 flex-col transition-all duration-300 bg-[#F5F5F5] dark:bg-[#111]'>
      <div className='flex items-center justify-between p-4 pb-6'>
        <DotLogo size='sm' color='blue' />
        <span className='rounded bg-black/5 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground dark:bg-white/5'>
          v1.0
        </span>
      </div>

      <div className='flex-1 overflow-y-auto px-3 py-2 scrollbar-slim'>
        <div className='mb-4 space-y-2'>
          <button
            onClick={onSearch}
            className={`${BUTTON_STYLE} w-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10`}
          >
            <Search className='size-3.5 text-muted-foreground' />
            <span className='flex-1 text-left text-muted-foreground'>Search...</span>
            <kbd className='rounded bg-black/10 px-1 py-0.5 text-[9px] font-mono dark:bg-white/10'>
              ⌘K
            </kbd>
          </button>

          <button
            type='button'
            onClick={(e) => onNewDocument(e)}
            disabled={isCreating}
            className={`${BUTTON_STYLE} w-full justify-center bg-black/10 font-medium dark:bg-white/10 hover:bg-black/15 dark:hover:bg-white/15 active:scale-95 disabled:opacity-50`}
            aria-label='New Document'
          >
            {isCreating ? (
              <span className='animate-pulse'>...</span>
            ) : (
              <>
                <Plus className='size-3.5' />
                <span>New Document</span>
              </>
            )}
          </button>
        </div>

        <div className='mb-6 space-y-0.5'>
          <NavLink href='/dashboard' animatedIconType='book-text' label='All Files' />
          <NavLink
            href='/dashboard/starred'
            animatedIconType='sparkles'
            label='Starred'
            badge={files.filter((f: any) => f.starred).length}
          />
          <NavLink
            href='/dashboard/recent'
            animatedIconType='clock'
            label='Recent'
            badge={files.length > 10 ? 10 : files.length}
          />
          <NavLink
            href='/dashboard/shared'
            animatedIconType='users'
            label='Shared'
            badge={files.filter((f: any) => f.shared).length}
          />

          <div className='relative'>
            <InboxSidebarItem
              label='Inbox'
              active={inboxOpen}
              onClick={onInbox}
              badge={unreadCount > 0 ? unreadCount : undefined}
            />
            <NotificationsPopover isOpen={inboxOpen} onClose={onCloseInbox} />
          </div>
        </div>

        <div className='mb-6'>
          <div className='mb-1 flex items-center justify-between px-2'>
            <button
              onClick={onToggleFiles}
              className='text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1'
            >
              {showFiles ? <ChevronDown className='size-3' /> : <ChevronRight className='size-3' />}
              FILES
            </button>
            <span className='text-[10px] text-muted-foreground/40'>{files.length}</span>
          </div>
          <FilesSection files={files} folders={folders} isOpen={showFiles} />
        </div>

        <div className='mb-6'>
          <div className='mb-1 flex items-center justify-between px-2'>
            <button
              onClick={onToggleDiscussions}
              className='text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1'
            >
              {showDiscussions ? (
                <ChevronDown className='size-3' />
              ) : (
                <ChevronRight className='size-3' />
              )}
              DISCUSSIONS
            </button>
          </div>
          <DiscussionsSection isOpen={showDiscussions} />
        </div>

        <div className='relative mb-6'>
          <div className='mb-1 flex items-center justify-between px-2'>
            <button
              onClick={onToggleFolders}
              className='text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1'
            >
              {showFolders ? (
                <ChevronDown className='size-3' />
              ) : (
                <ChevronRight className='size-3' />
              )}
              FOLDERS
            </button>

            <button
              onClick={onOpenNewFolderPopover}
              className='rounded p-0.5 transition-colors hover:bg-black/10 dark:hover:bg-white/10'
            >
              <Plus className='size-3.5 text-muted-foreground/40' />
            </button>
          </div>

          <AnimatePresence>
            {popoverOpen && (
              <div className='absolute left-0 top-6 z-50'>
                <AddFolderPopover isOpen={popoverOpen} onClose={onCloseNewFolderPopover} />
              </div>
            )}
          </AnimatePresence>

          <FoldersSection folders={sidebarData?.folders || []} isOpen={showFolders} />
        </div>
      </div>

      <div className='p-3 space-y-2'>
        <StorageCard />
        <UserPillButton onSettingsClick={onSettings} />
      </div>
    </aside>
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
  const [showDiscussions, setShowDiscussions] = useState(true);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [inboxOpen, setInboxOpen] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  const createFileMutation = useMutation({
    mutationFn: async ({ name, id }: { name: string; id: string }) => {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("id", id);
      return await createFile(formData);
    },
    onSuccess: (data) => {
      if (!data.success) {
        toast.error(data.error || "Failed to create document");
      }
      // Revalidation happens automatically via server action revalidatePath
    },
    onError: () => {
      toast.error("Failed to create document");
    },
  });

  const handleNewDocument = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Generate ID and navigate immediately
    const tempId = crypto.randomUUID();
    const sidebarData: any = queryClient.getQueryData(["sidebar"]);
    const existingNames = new Set<string>(
      (sidebarData?.files || []).map((f: any) => String(f.name || "")),
    );
    const baseName = "New Document";
    let nextName = baseName;
    if (existingNames.has(baseName)) {
      let i = 1;
      while (existingNames.has(`${baseName} (${i})`)) i += 1;
      nextName = `${baseName} (${i})`;
    }
    const emptyLexicalState = {
      root: {
        children: [
          {
            children: [],
            direction: null,
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1,
          },
        ],
        direction: null,
        format: "",
        indent: 0,
        type: "root",
        version: 1,
      },
    };

    // Optimistically update sidebar
    queryClient.setQueryData(["sidebar"], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        files: [
          {
            id: tempId,
            name: nextName,
            updatedAt: new Date().toISOString(),
            ownerId: "user", // placeholder
            content: emptyLexicalState,
            starred: false,
            shared: false,
          },
          ...(old.files || []),
        ],
      };
    });

    // Optimistically initiate document cache to prevent 404
    queryClient.setQueryData(["document", tempId], {
      id: tempId,
      name: nextName,
      content: emptyLexicalState,
      updatedAt: new Date().toISOString(),
      ownerId: "user",
      starred: false,
      shared: false,
    });

    // Navigate immediately
    router.push(`/dashboard/document/${tempId}`);

    // Fire mutation in background
    createFileMutation.mutate({ name: nextName, id: tempId });
    toast.success("Document created");
  };

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
        onNewDocument={(e: any) => handleNewDocument(e)}
      />
    );
  }

  return (
    <ExpandedSidebar
      currentView={currentView}
      onNavigate={handleNavigation}
      onSearch={() => setSearchOpen(true)}
      onSettings={() => setSettingsOpen(true)}
      onInbox={() => setInboxOpen(true)}
      inboxOpen={inboxOpen}
      onCloseInbox={() => setInboxOpen(false)}
      onNewDocument={(e: any) => handleNewDocument(e)}
      isCreating={createFileMutation.isPending}
      sidebarData={sidebarData}
      files={files}
      folders={folders}
      showFolders={showFolders}
      onToggleFolders={() => setShowFolders(!showFolders)}
      showFiles={showFiles}
      onToggleFiles={() => setShowFiles(!showFiles)}
      showDiscussions={showDiscussions}
      onToggleDiscussions={() => setShowDiscussions(!showDiscussions)}
      onOpenNewFolderPopover={() => setPopoverOpen(true)}
      popoverOpen={popoverOpen}
      onCloseNewFolderPopover={() => setPopoverOpen(false)}
    />
  );
}
