"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  FileText,
  Star,
  MoreVertical,
  Image as ImageIcon,
  Video,
  Archive,
  File,
  FolderOpen,
  Edit3,
  Trash2,
  FolderPlus,
  Share2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFolder, renameFolder, deleteFolder } from "@/actions/folders";
import { createFile, renameFile, deleteFile } from "@/actions/files";
import { TextFlowFile, TextFlowFolder, useTextFlowStore } from "@/store/store";
import { formatRelativeTime } from "@/lib/utils";
import { MetallicFolder } from "@/components/icons/metallic-folder";
import { DocumentIcon } from "@/components/icons/document-icon";
import { DeleteFolderModal } from "./delete-folder-modal";
import { DeleteFileModal } from "./delete-file-modal";

// Get icon component based on file type
function FileIcon({ type, className }: { type: TextFlowFile["type"]; className?: string }) {
  switch (type) {
    case "document":
      return <FileText className={className} />;
    case "image":
      return <ImageIcon className={className} />;
    case "video":
      return <Video className={className} />;
    case "pdf":
      return <FileText className={className} />;
    case "archive":
      return <Archive className={className} />;
    default:
      return <File className={className} />;
  }
}

function RelativeTime({ iso }: { iso: string }) {
  const [text, setText] = useState("");

  useEffect(() => {
    setText(formatRelativeTime(iso));
  }, [iso]);

  return <span suppressHydrationWarning>{text}</span>;
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
  const queryClient = useQueryClient();

  // Fetch folders for the move-to menu
  const { data: sidebarData } = useQuery({
    queryKey: ["sidebar"],
    queryFn: async () => {
      const { fetchSidebarData } = await import("@/actions/data");
      return fetchSidebarData();
    },
  });

  const folders = sidebarData?.folders || [];

  const handleAddToFolder = async (folderId: string) => {
    const formData = new FormData();
    formData.append("id", fileId);
    formData.append("folderId", folderId);
    await renameFile(formData);
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["sidebar"] });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -5 }}
      style={{ left: Math.min(position.x + 140, window.innerWidth - 180), top: position.y }}
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
            className='flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[13px] transition-colors hover:bg-black/5 dark:hover:bg-white/5'
          >
            <FolderOpen className='size-3.5' />
            <span className='truncate'>{folder.name}</span>
          </button>
        ))
      )}
    </motion.div>
  );
}

// Context Menu for file cards
function FileContextMenu({
  isOpen,
  onClose,
  position,
  file,
}: {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  file: TextFlowFile;
}) {
  const queryClient = useQueryClient();
  const [isRenaming, setIsRenaming] = useState(false);
  const [showFolderMenu, setShowFolderMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newName, setNewName] = useState(file.name);

  const starMutation = useMutation({
    mutationFn: async () => {
      const { toggleStar } = await import("@/actions/document");
      await toggleStar(file.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["sidebar"] });
      onClose();
    },
  });

  const renameMutation = useMutation({
    mutationFn: async (name: string) => {
      const formData = new FormData();
      formData.append("id", file.id);
      formData.append("name", name);
      await renameFile(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["sidebar"] });
      setIsRenaming(false);
      onClose();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("id", file.id);
      await deleteFile(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["sidebar"] });
      onClose();
    },
  });

  if (!isOpen) return null;

  const handleRename = () => {
    if (newName.trim() && newName !== file.name) {
      renameMutation.mutate(newName.trim());
    } else {
      setIsRenaming(false);
      onClose();
    }
  };

  return (
    <>
      <div className='fixed inset-0 z-40' onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        style={{
          left: Math.min(position.x, window.innerWidth - 180),
          top: Math.min(position.y, window.innerHeight - 250),
        }}
        className='fixed z-50 w-44 rounded-lg border border-black/10 bg-white py-1 shadow-lg dark:border-white/10 dark:bg-[#1a1a1a]'
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
              className='flex w-full items-center gap-2 px-3 py-1.5 text-[13px] transition-colors hover:bg-black/5 dark:hover:bg-white/5'
            >
              <Edit3 className='size-3.5' />
              Rename
            </button>
            <button
              onClick={() => starMutation.mutate()}
              className='flex w-full items-center gap-2 px-3 py-1.5 text-[13px] transition-colors hover:bg-black/5 dark:hover:bg-white/5'
            >
              <Star className='size-3.5' />
              {file.starred ? "Unstar" : "Star"}
            </button>
            <button
              onClick={() => {
                // For unsharing, we'd need another action, but we'll focus on renaming/starring/moving
                onClose();
              }}
              className='flex w-full items-center gap-2 px-3 py-1.5 text-[13px] transition-colors hover:bg-black/5 dark:hover:bg-white/5'
            >
              <Share2 className='size-3.5' />
              {file.shared ? "Manage sharing" : "Share"}
            </button>
            <button
              onClick={() => setShowFolderMenu(true)}
              className='flex w-full items-center gap-2 px-3 py-1.5 text-[13px] transition-colors hover:bg-black/5 dark:hover:bg-white/5'
            >
              <FolderPlus className='size-3.5' />
              Add to folder
            </button>
            <div className='my-1 h-px bg-black/5 dark:bg-white/5' />
            <button
              onClick={() => {
                // Close menu implies we shouldn't interact with it anymore,
                // BUT we need to keep the modal open.
                // We'll handle this by rendering the modal OUTSIDE this motion.div or just overlaying.
                setShowDeleteModal(true);
              }}
              className='flex w-full items-center gap-2 px-3 py-1.5 text-[13px] text-red-500 transition-colors hover:bg-red-500/10'
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
            fileId={file.id}
            onClose={() => {
              setShowFolderMenu(false);
              onClose();
            }}
            position={position}
          />
        )}
      </AnimatePresence>

      <DeleteFileModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          onClose(); // Close the menu too when modal closes
        }}
        onConfirm={() => deleteMutation.mutate()}
        fileName={file.name}
      />
    </>
  );
}

// File Card - with document icon
export function FileCard({ file, index = 0 }: { file: TextFlowFile; index?: number }) {
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });

  const starMutation = useMutation({
    mutationFn: async () => {
      const { toggleStar } = await import("@/actions/document");
      await toggleStar(file.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["sidebar"] });
    },
  });

  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuPos({ x: e.clientX, y: e.clientY });
    setMenuOpen(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03, duration: 0.2 }}
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        className='group flex flex-col items-center'
      >
        {/* Document icon + actions row */}
        <div className='relative'>
          <Link href={`/dashboard/document/${file.id}`} className='block'>
            <DocumentIcon size={100} className='transition-transform group-hover:scale-105' />
          </Link>

          {/* Vertical actions beside icon */}
          <div className='absolute -right-6 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity'>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                starMutation.mutate();
              }}
              className={`rounded-lg p-1.5 transition-colors ${
                file.starred
                  ? "text-amber-500 opacity-100"
                  : "text-muted-foreground hover:text-amber-500 hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <Star className={`size-3.5 ${file.starred ? "fill-current" : ""}`} />
            </button>
            <button
              onClick={handleMenuClick}
              className='rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-black/5 dark:hover:bg-white/5'
            >
              <MoreVertical className='size-3.5' />
            </button>
          </div>
        </div>

        {/* Text below icon */}
        <Link
          href={`/dashboard/document/${file.id}`}
          className='mt-1 text-center w-full max-w-[120px]'
        >
          <h3 className='text-[13px] font-medium leading-tight line-clamp-2'>{file.name}</h3>
          <p className='text-[10px] text-muted-foreground mt-0.5'>
            {file.size} · {formatRelativeTime(file.updatedAt)}
          </p>
          {file.shared && (
            <span className='mt-1 inline-block rounded-full bg-purple-500/10 px-1.5 py-0.5 text-[9px] text-purple-500'>
              Shared
            </span>
          )}
        </Link>
      </motion.div>

      <AnimatePresence>
        {menuOpen && (
          <FileContextMenu
            isOpen={menuOpen}
            onClose={() => setMenuOpen(false)}
            position={menuPos}
            file={file}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// Context Menu for folders
function FolderContextMenu({
  isOpen,
  onClose,
  position,
  folder,
  onDeleteStart,
}: {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  folder: { id: string; name: string };
  onDeleteStart: () => void;
}) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(folder.name);
  const queryClient = useQueryClient();

  const renameMutation = useMutation({
    mutationFn: async (name: string) => {
      const formData = new FormData();
      formData.append("id", folder.id);
      formData.append("name", name);
      await renameFolder(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["sidebar"] });
      setIsRenaming(false);
      onClose();
    },
  });

  if (!isOpen) return null;

  const handleRename = () => {
    if (newName.trim() && newName !== folder.name) {
      renameMutation.mutate(newName.trim());
    } else {
      setIsRenaming(false);
      onClose();
    }
  };

  return (
    <>
      <div className='fixed inset-0 z-50' onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        style={{
          left: Math.min(position.x, window.innerWidth - 180),
          top: Math.min(position.y, window.innerHeight - 250),
        }}
        className='fixed z-50 w-44 rounded-lg border border-black/10 bg-white py-1 shadow-lg dark:border-white/10 dark:bg-[#1a1a1a]'
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
              className='flex w-full items-center gap-2 px-3 py-1.5 text-[13px] transition-colors hover:bg-black/5 dark:hover:bg-white/5'
            >
              <Edit3 className='size-3.5' />
              Rename
            </button>
            <div className='my-1 h-px bg-black/5 dark:bg-white/5' />
            <button
              onClick={onDeleteStart}
              className='flex w-full items-center gap-2 px-3 py-1.5 text-[13px] text-red-500 transition-colors hover:bg-red-500/10'
            >
              <Trash2 className='size-3.5' />
              Delete
            </button>
          </>
        )}
      </motion.div>
    </>
  );
}

// Folder Card - with menu
// Folder Card - with menu
export function FolderCard({
  folder,
  fileCount,
  index = 0,
}: {
  folder: { id: string; name: string };
  fileCount: number;
  index?: number;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const queryClient = useQueryClient();

  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuPos({ x: e.clientX, y: e.clientY });
    setMenuOpen(true);
  };

  const deleteMutation = useMutation({
    mutationFn: async (deleteFiles: boolean) => {
      const formData = new FormData();
      formData.append("id", folder.id);
      formData.append("deleteFiles", String(deleteFiles));
      await deleteFolder(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["sidebar"] });
      setShowDeleteModal(false);
    },
  });

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.03, duration: 0.2 }}
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
        className='relative group'
      >
        <Link href={`/dashboard/folder/${folder.id}`} className='block'>
          <MetallicFolder size={140} className='transition-transform group-hover:scale-105' />

          <div className='flex flex-col mx-3 -mt-2'>
            <h3 className='mb-1 truncate text-sm font-medium'>{folder.name}</h3>
            <p className='text-[11px] text-muted-foreground'>{fileCount} files</p>
          </div>
        </Link>

        {/* Menu Trigger */}
        <button
          onClick={handleMenuClick}
          className='absolute top-2 right-2 rounded-lg p-1.5 text-muted-foreground opacity-0 transition-all hover:bg-black/5 group-hover:opacity-100 dark:hover:bg-white/5 bg-white/50 dark:bg-black/50 backdrop-blur-sm'
        >
          <MoreVertical className='size-3.5' />
        </button>
      </motion.div>

      <AnimatePresence>
        {menuOpen && (
          <FolderContextMenu
            isOpen={menuOpen}
            onClose={() => setMenuOpen(false)}
            position={menuPos}
            folder={folder}
            onDeleteStart={() => {
              setMenuOpen(false);
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

// File List - table format for All Files view with menu
export function FileList({ files }: { files: TextFlowFile[] }) {
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [activeFile, setActiveFile] = useState<TextFlowFile | null>(null);

  const starMutation = useMutation({
    mutationFn: async (fileId: string) => {
      const { toggleStar } = await import("@/actions/document");
      await toggleStar(fileId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["sidebar"] });
    },
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(files.length / itemsPerPage);

  const paginatedFiles = files.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleMenuClick = (e: React.MouseEvent, file: TextFlowFile) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuPos({ x: e.clientX, y: e.clientY });
    setActiveFile(file);
    setMenuOpen(file.id);
  };

  if (files.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 text-center'>
        <div className='mb-4 flex size-14 items-center justify-center rounded-xl bg-black/5 dark:bg-white/5'>
          <FileText className='size-6 text-muted-foreground' />
        </div>
        <h3 className='mb-1 text-sm font-medium'>No files yet</h3>
        <p className='text-xs text-muted-foreground'>Create a new document to get started</p>
      </div>
    );
  }

  return (
    <>
      <div className='overflow-hidden rounded-xl border border-black/5 bg-white dark:border-white/5 dark:bg-[#0a0a0a]'>
        {/* Header */}
        <div className='flex items-center border-b border-black/5 bg-black/2 px-4 py-2.5 text-[11px] font-medium text-muted-foreground dark:border-white/5 dark:bg-white/2'>
          <div className='flex-1'>Name</div>
          <div className='w-20 text-right'>Size</div>
          <div className='w-28 text-right'>Modified</div>
          <div className='w-14' />
        </div>

        {/* Rows */}
        <div className='divide-y divide-black/5 dark:divide-white/5'>
          {paginatedFiles.map((file, index) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.02, duration: 0.15 }}
              className='group flex items-center px-4 py-2.5 transition-colors hover:bg-black/2 dark:hover:bg-white/2'
            >
              {/* Name */}
              <Link
                href={`/dashboard/document/${file.id}`}
                className='flex flex-1 items-center gap-3'
              >
                <div className='flex size-8 items-center justify-center rounded-lg bg-blue-500/10'>
                  <FileIcon type={file.type} className='size-4 text-blue-500' />
                </div>
                <span className='truncate text-sm'>{file.name}</span>
                {file.shared && (
                  <span className='rounded-full bg-purple-500/10 px-1.5 py-0.5 text-[9px] text-purple-500'>
                    Shared
                  </span>
                )}
              </Link>

              {/* Size */}
              <div className='w-20 text-right text-[11px] text-muted-foreground'>{file.size}</div>

              {/* Modified */}
              <div className='w-28 text-right text-[11px] text-muted-foreground'>
                <RelativeTime iso={file.updatedAt} />
              </div>

              {/* Actions */}
              <div className='flex w-14 items-center justify-end gap-0.5'>
                <button
                  onClick={() => starMutation.mutate(file.id)}
                  className={`rounded-lg p-1.5 transition-colors ${
                    file.starred
                      ? "text-amber-500"
                      : "text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-amber-500"
                  }`}
                >
                  <Star className={`size-3 ${file.starred ? "fill-current" : ""}`} />
                </button>
                <button
                  onClick={(e) => handleMenuClick(e, file)}
                  className='rounded-lg p-1.5 text-muted-foreground opacity-0 transition-colors hover:text-foreground group-hover:opacity-100'
                >
                  <MoreVertical className='size-3' />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Pagination Controls */}
      {files.length > itemsPerPage && (
        <div className='flex items-center justify-between border-t border-black/5 bg-white px-4 py-2.5 dark:border-white/5 dark:bg-[#0a0a0a]'>
          <p className='text-xs text-muted-foreground'>
            Showing {paginatedFiles.length} of {files.length} files
          </p>
          <div className='flex items-center gap-2'>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className='rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-black/5 disabled:opacity-50 dark:hover:bg-white/5 transition-colors'
            >
              Previous
            </button>
            <span className='text-xs font-medium'>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className='rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-black/5 disabled:opacity-50 dark:hover:bg-white/5 transition-colors'
            >
              Next
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {menuOpen && activeFile && (
          <FileContextMenu
            isOpen={!!menuOpen}
            onClose={() => {
              setMenuOpen(null);
              setActiveFile(null);
            }}
            position={menuPos}
            file={activeFile}
          />
        )}
      </AnimatePresence>
    </>
  );
}
