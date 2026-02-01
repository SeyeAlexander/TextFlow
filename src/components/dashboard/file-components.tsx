"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  FileText,
  Star,
  MoreHorizontal,
  Image,
  Video,
  Archive,
  File,
  FolderOpen,
} from "lucide-react";
import { TextFlowFile, useTextFlowStore } from "@/store/store";
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

// File Card - neutral colors
export function FileCard({ file }: { file: TextFlowFile }) {
  const { toggleStar } = useTextFlowStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className='group relative overflow-hidden rounded-xl border border-black/5 bg-white p-4 transition-shadow hover:shadow-md dark:border-white/5 dark:bg-[#1a1a1a]'
    >
      {/* Star button */}
      <button
        onClick={() => toggleStar(file.id)}
        className={`absolute right-3 top-3 rounded-lg p-1.5 transition-colors ${
          file.starred
            ? "text-amber-500"
            : "text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-amber-500"
        }`}
      >
        <Star className={`size-3.5 ${file.starred ? "fill-current" : ""}`} />
      </button>

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
  );
}

// Folder Card - neutral with blue icon
export function FolderCard({
  folder,
  fileCount,
}: {
  folder: { id: string; name: string };
  fileCount: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
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

// File List - table format for All Files view
export function FileList({ files }: { files: TextFlowFile[] }) {
  const { toggleStar } = useTextFlowStore();

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
        {files.map((file, index) => (
          <motion.div
            key={file.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.02 }}
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
              <button className='rounded-lg p-1.5 text-muted-foreground opacity-0 transition-colors hover:text-foreground group-hover:opacity-100'>
                <MoreHorizontal className='size-3' />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
