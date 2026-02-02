"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { FileCard } from "@/components/dashboard/file-components";
import { useTextFlowStore } from "@/store/store";
import { motion } from "framer-motion";
import { FolderOpen, ChevronRight } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ErrorState } from "@/components/dashboard/error-state";
import { DocumentIcon } from "@/components/icons/document-icon";

export default function FolderPage() {
  const params = useParams();
  const folderId = params.id as string;

  const { folders, getFilesByFolder } = useTextFlowStore();

  useEffect(() => {
    // Data initialization handled by layout
  }, []);

  const folder = folders.find((f) => f.id === folderId);
  const files = getFilesByFolder(folderId);

  // Build breadcrumb path
  const breadcrumbs: { id: string; name: string }[] = [];
  let current = folder;
  while (current) {
    breadcrumbs.unshift({ id: current.id, name: current.name });
    current = folders.find((f) => f.id === current?.parentId);
  }

  if (!folder) {
    return (
      <main className='my-3 mr-3 flex flex-1 items-center justify-center rounded-2xl bg-white dark:bg-[#0A0A0A]'>
        <ErrorState
          title='Folder not found'
          description='The folder you are looking for does not exist or has been deleted.'
          className='border-none bg-transparent'
        />
      </main>
    );
  }

  return (
    <main className='my-3 mr-3 flex-1 overflow-y-auto rounded-2xl bg-white dark:bg-[#0A0A0A]'>
      <div className='p-6'>
        {/* Breadcrumbs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='mb-2 flex items-center gap-1 text-xs text-muted-foreground'
        >
          <Link href='/dashboard' className='hover:text-foreground'>
            All Files
          </Link>
          {breadcrumbs.map((crumb, i) => (
            <span key={crumb.id} className='flex items-center gap-1'>
              <ChevronRight className='size-3' />
              {i === breadcrumbs.length - 1 ? (
                <span className='text-foreground'>{crumb.name}</span>
              ) : (
                <Link href={`/dashboard/folder/${crumb.id}`} className='hover:text-foreground'>
                  {crumb.name}
                </Link>
              )}
            </span>
          ))}
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-6'
        >
          <div className='flex items-center gap-2'>
            <div className='flex size-8 items-center justify-center rounded-lg bg-blue-500/10'>
              <FolderOpen className='size-4 text-blue-500' />
            </div>
            <div>
              <h1 className='text-xl font-semibold'>{folder.name}</h1>
              <p className='text-xs text-muted-foreground'>{files.length} files</p>
            </div>
          </div>
        </motion.div>

        {/* Files Grid */}
        {files.length === 0 ? (
          <EmptyState
            customIcon={
              <DocumentIcon size={100} className='transition-transform hover:scale-105' />
            }
            title='Empty folder'
            description='Add files to this folder to organize your documents.'
            actionLabel='New Document'
            onAction={() => {
              const btn = document.querySelector('button[aria-label="New Document"]');
              if (btn && btn instanceof HTMLElement) btn.click();
            }}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className='grid grid-cols-3 gap-4 md:grid-cols-4 lg:grid-cols-6'
          >
            {files.map((file) => (
              <FileCard key={file.id} file={file} />
            ))}
          </motion.div>
        )}
      </div>
    </main>
  );
}
