"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  FileText,
  Star,
  MoreVertical,
  Image,
  Video,
  Archive,
  File,
  FolderOpen,
  Edit3,
  Trash2,
  FolderPlus,
  Share2,
} from "lucide-react";
import { TextFlowFile, TextFlowFolder, useTextFlowStore } from "@/store/store";
import { formatRelativeTime } from "@/data/dummy-data";

// Get icon component based on file type
function FileIcon({ type, className }: { type: TextFlowFile["type"]; className?: string }) {
  switch (type) {
    case "document":
      return <FileText className={className} />;
    case "image":
      return <Image className={className} />;
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
      style={{ left: Math.min(position.x + 140, window.innerWidth - 180), top: position.y }}
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
  const { deleteFile, toggleStar, toggleShare, updateFile } = useTextFlowStore();
  const [isRenaming, setIsRenaming] = useState(false);
  const [showFolderMenu, setShowFolderMenu] = useState(false);
  const [newName, setNewName] = useState(file.name);

  if (!isOpen) return null;

  const handleRename = () => {
    updateFile(file.id, { name: newName });
    setIsRenaming(false);
    onClose();
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
              onClick={() => {
                toggleStar(file.id);
                onClose();
              }}
              className='flex w-full items-center gap-2 px-3 py-1.5 text-[13px] transition-colors hover:bg-black/5 dark:hover:bg-white/5'
            >
              <Star className='size-3.5' />
              {file.starred ? "Unstar" : "Star"}
            </button>
            <button
              onClick={() => {
                toggleShare(file.id);
                onClose();
              }}
              className='flex w-full items-center gap-2 px-3 py-1.5 text-[13px] transition-colors hover:bg-black/5 dark:hover:bg-white/5'
            >
              <Share2 className='size-3.5' />
              {file.shared ? "Unshare" : "Share"}
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
                deleteFile(file.id);
                onClose();
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
    </>
  );
}

// File Card - with menu icon
export function FileCard({ file, index = 0 }: { file: TextFlowFile; index?: number }) {
  const { toggleStar } = useTextFlowStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });

  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuPos({ x: e.clientX, y: e.clientY });
    setMenuOpen(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.03, duration: 0.2 }}
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
        className='group relative overflow-hidden rounded-xl border border-black/5 bg-white p-4 transition-shadow hover:shadow-md dark:border-white/5 dark:bg-[#1a1a1a]'
      >
        {/* Top right actions */}
        <div className='absolute right-3 top-3 flex items-center gap-0.5'>
          <button
            onClick={() => toggleStar(file.id)}
            className={`rounded-lg p-1.5 transition-colors ${
              file.starred
                ? "text-amber-500"
                : "text-muted-foreground  group-hover:opacity-100 hover:text-amber-500"
            }`}
          >
            <Star className={`size-3.5 ${file.starred ? "fill-current" : ""}`} />
          </button>
          <button
            onClick={handleMenuClick}
            className='rounded-lg p-1.5 text-muted-foreground  transition-colors hover:bg-black/5 group-hover:opacity-100 dark:hover:bg-white/5'
          >
            <MoreVertical className='size-3.5' />
          </button>
        </div>

        {/* File link */}
        <Link href={`/dashboard/document/${file.id}`} className='block'>
          {/* Icon - blue tint */}
          <div className='mb-3 flex size-10 items-center justify-center rounded-lg bg-blue-500/10'>
            <FileIcon type={file.type} className='size-5 text-blue-500' />
          </div>

          {/* Info */}
          <h3 className='mb-1 truncate text-sm font-medium'>{file.name}</h3>
          <p className='text-[11px] text-muted-foreground'>
            {file.size} · {formatRelativeTime(file.updatedAt)}
          </p>

          {/* Shared indicator */}
          {file.shared && (
            <div className='mt-2 flex items-center gap-1'>
              <div className='flex -space-x-1.5'>
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className='size-4 rounded-full border border-white bg-linear-to-br from-purple-400 to-blue-400 dark:border-[#1a1a1a]'
                  />
                ))}
              </div>
              <span className='text-[10px] text-muted-foreground'>Shared</span>
            </div>
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
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
    >
      <Link
        href={`/dashboard/folder/${folder.id}`}
        className='group block rounded-xl border border-black/5 bg-white p-4 transition-shadow hover:shadow-md dark:border-white/5 dark:bg-[#1a1a1a]'
      >
        {/* Folder icon - blue tint */}
        <div className='mb-3 flex size-10 items-center justify-center rounded-lg bg-blue-500/10'>
          <FolderOpen className='size-5 text-blue-500' />
        </div>

        {/* Info */}
        <h3 className='mb-1 truncate text-sm font-medium'>{folder.name}</h3>
        <p className='text-[11px] text-muted-foreground'>{fileCount} files</p>
      </Link>
    </motion.div>
  );
}

// File List - table format for All Files view with menu
export function FileList({ files }: { files: TextFlowFile[] }) {
  const { toggleStar } = useTextFlowStore();
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [activeFile, setActiveFile] = useState<TextFlowFile | null>(null);

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
                {formatRelativeTime(file.updatedAt)}
              </div>

              {/* Actions */}
              <div className='flex w-14 items-center justify-end gap-0.5'>
                <button
                  onClick={() => toggleStar(file.id)}
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
