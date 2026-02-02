"use client";

import { FileList, FolderCard } from "@/components/dashboard/file-components";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ErrorState } from "@/components/dashboard/error-state";
import { motion } from "framer-motion";
import { MetallicFolder } from "@/components/icons/metallic-folder";
import { DocumentIcon } from "@/components/icons/document-icon";
import { useQuery } from "@tanstack/react-query";
import { fetchFolderContent } from "@/actions/data";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TextFlowFolder } from "@/store/store";

interface FolderViewProps {
  folderId: string;
}

export function FolderView({ folderId }: FolderViewProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard", folderId],
    queryFn: () => fetchFolderContent(folderId),
  });

  const folders = data?.folders || [];
  const files = data?.files || [];

  if (isLoading) {
    return (
      <div className='flex h-full items-center justify-center'>
        <div className='h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-6'>
        <ErrorState
          title='Failed to load folder'
          description='Could not load folder contents. Please try again.'
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <main className='my-3 mr-3 flex-1 overflow-y-auto rounded-2xl bg-white dark:bg-[#0A0A0A]'>
      <div className='p-6'>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-6'
        >
          <div className='flex items-center gap-2 mb-2'>
            <Link href='/dashboard'>
              <Button variant='ghost' size='icon' className='h-8 w-8 -ml-2'>
                <ArrowLeft className='h-4 w-4' />
              </Button>
            </Link>
            <h1 className='text-xl font-semibold'>Folder Content</h1>
          </div>
        </motion.div>

        {/* Empty State if absolutely nothing */}
        {folders.length === 0 && files.length === 0 ? (
          <EmptyState
            customIcon={
              <MetallicFolder size={140} className='transition-transform hover:scale-105' />
            }
            title='Empty Folder'
            description='This folder is empty. Create a new document or folder to get started.'
            actionLabel='New Document'
            onAction={() => {
              const btn = document.querySelector('button[aria-label="New Document"]');
              if (btn && btn instanceof HTMLElement) btn.click();
            }}
          />
        ) : (
          <>
            {/* Folders Grid */}
            {folders.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className='mb-6'
              >
                <h2 className='mb-3 text-xs font-medium text-muted-foreground'>Folders</h2>
                <div className='grid grid-cols-2 gap-3 pb-4 md:grid-cols-4 lg:grid-cols-6'>
                  {folders.map((folder: TextFlowFolder, index: number) => (
                    <FolderCard key={folder.id} folder={folder} fileCount={0} index={index} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Files List */}
            {files.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className='mb-3 text-xs font-medium text-muted-foreground'>Files</h2>
                <FileList files={files} />
              </motion.div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
