"use client";

import { FileList, FolderCard, FileCard } from "@/components/dashboard/file-components";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ErrorState } from "@/components/dashboard/error-state";
import { motion } from "framer-motion";
import { MetallicFolder } from "@/components/icons/metallic-folder";
import { DocumentIcon } from "@/components/icons/document-icon";
import { useQuery } from "@tanstack/react-query";
import { fetchFolderContent } from "@/actions/data";
import { ArrowLeft, FolderOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TextFlowFolder } from "@/store/store";
import DashboardLoading from "@/app/dashboard/loading";
import { FileGridSkeleton } from "@/components/dashboard/skeletons";

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
  const currentFolder = data?.currentFolder;

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
        {/* Header - Only show when data is loaded, or we could skeleton this too. But for now relying on isLoading block below might be cleaner, OR show minimal header. 
            Actually, if isLoading, we display skeleton grid, but we should try to show header if we can. 
            However, we don't have currentFolder name until data loads. So header must wait or show skeleton. */}
        {!isLoading && currentFolder && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className='mb-6'
          >
            <div className='flex items-center gap-2'>
              <div className='flex size-8 items-center justify-center rounded-lg bg-indigo-500/10'>
                <FolderOpen className='size-4 text-indigo-500' />
              </div>
              <div>
                <h1 className='text-xl font-semibold'>{currentFolder.name}</h1>
                <p className='text-xs text-muted-foreground'>Folder content</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <>
            {/* Header Skeleton */}
            <div className='mb-6 flex items-center gap-2'>
              <div className='h-8 w-8 rounded-lg bg-muted animate-pulse' />
              <div>
                <div className='h-5 w-32 bg-muted rounded animate-pulse mb-1' />
                <div className='h-3 w-24 bg-muted rounded animate-pulse' />
              </div>
            </div>
            <FileGridSkeleton />
          </>
        ) : folders.length === 0 && files.length === 0 ? (
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
                <div className='grid grid-cols-2 gap-3 pb-4 md:grid-cols-4 lg:grid-cols-6'>
                  {folders.map((folder: any, index: number) => (
                    <FolderCard
                      key={folder.id}
                      folder={folder}
                      fileCount={folder.fileCount || 0}
                      index={index}
                    />
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
                <div className='grid grid-cols-2 gap-3 pb-4 md:grid-cols-4 lg:grid-cols-6'>
                  {files.map((file: any, index: number) => (
                    <FileCard key={file.id} file={file} index={index} />
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
