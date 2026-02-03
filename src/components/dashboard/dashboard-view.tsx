"use client";

import AI_Prompt from "@/components/kokonutui/ai-prompt";
import { FileList, FolderCard } from "@/components/dashboard/file-components";
import { EmptyState } from "@/components/dashboard/empty-state";
import { motion } from "framer-motion";
import { FolderPlus } from "lucide-react";
import { CreateFolderModal } from "./create-folder-modal";
import { useState } from "react";
import { MetallicFolder } from "@/components/icons/metallic-folder";
import { DocumentIcon } from "@/components/icons/document-icon";
import { useQuery } from "@tanstack/react-query";
import { fetchFolderContent } from "@/actions/data";
import { TextFlowFolder } from "@/store/store";
import DashboardLoading from "@/app/dashboard/loading";

export function DashboardView() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", null], // null = root folder
    queryFn: () => fetchFolderContent(null),
  });
  const [createFolderOpen, setCreateFolderOpen] = useState(false);

  const folders = data?.folders || [];
  const files = data?.files || [];

  if (isLoading) {
    return <DashboardLoading />;
  }

  return (
    <main className='my-3 mr-3 flex-1 overflow-y-auto rounded-2xl bg-white dark:bg-[#0A0A0A]'>
      <div className='p-6'>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-2 flex items-center justify-between'
        >
          <div>
            <h1 className='text-xl font-semibold'>All Files</h1>
            <p className='text-xs text-muted-foreground'>Manage all your documents and folders</p>
          </div>
          {folders.length > 0 && (
            <button
              onClick={() => setCreateFolderOpen(true)}
              className='flex items-center gap-1.5 rounded-lg bg-black/5 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10'
            >
              <FolderPlus className='size-3.5' />
              New Folder
            </button>
          )}
        </motion.div>

        {/* AI Input - kokonutui component */}
        <div className='flex justify-center mt-40 mb-10'>
          <AI_Prompt />
        </div>

        {/* Folders Grid */}
        {folders.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className='mb-6'
          >
            <h2 className='mb-3 text-xs font-medium text-muted-foreground'>Folders</h2>
            <div className='grid grid-cols-2 gap-3 pb-4 md:grid-cols-4 lg:grid-cols-6'>
              {folders.map((folder: TextFlowFolder, index: number) => (
                <FolderCard
                  key={folder.id}
                  folder={folder}
                  fileCount={folder.fileCount || 0}
                  index={index}
                />
              ))}
            </div>
          </motion.div>
        ) : (
          <EmptyState
            customIcon={
              <MetallicFolder size={140} className='transition-transform hover:scale-105' />
            }
            title='No folders yet'
            description='Create your first folder to get started.'
            actionLabel='New Folder'
            onAction={() => setCreateFolderOpen(true)}
          />
        )}

        {/* Files List */}
        {files.length > 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <h2 className='mb-3 text-xs font-medium text-muted-foreground'>Files</h2>
            <FileList files={files} />
          </motion.div>
        ) : (
          <EmptyState
            customIcon={
              <DocumentIcon size={100} className='transition-transform hover:scale-105' />
            }
            title='No files yet'
            description='Create your first file to get started.'
            actionLabel='New File'
            onAction={() => {
              const btn = document.querySelector('button[aria-label="New Document"]');
              if (btn && btn instanceof HTMLElement) btn.click();
            }}
          />
        )}
      </div>
      <CreateFolderModal isOpen={createFolderOpen} onClose={() => setCreateFolderOpen(false)} />
    </main>
  );
}
