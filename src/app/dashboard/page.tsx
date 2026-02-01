"use client";

import { useEffect } from "react";
import AI_Prompt from "@/components/kokonutui/ai-prompt";
import { FileList, FolderCard } from "@/components/dashboard/file-components";
import { useTextFlowStore } from "@/store/store";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const { files, getFoldersByParent, getFilesByFolder, setView } = useTextFlowStore();

  // Set view on mount
  useEffect(() => {
    setView("all-files");
  }, [setView]);

  const topLevelFolders = getFoldersByParent(null);

  return (
    <main className='my-3 mr-3 flex-1 overflow-y-auto rounded-2xl bg-white dark:bg-[#0A0A0A]'>
      <div className='p-6'>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-2'
        >
          <h1 className='text-xl font-semibold'>All Files</h1>
          <p className='text-xs text-muted-foreground'>Manage all your documents and folders</p>
        </motion.div>

        {/* AI Input - kokonutui component */}
        <div className='flex justify-center mt-40 mb-10'>
          <AI_Prompt />
        </div>

        {/* Folders Grid */}
        {topLevelFolders.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className='mb-6'
          >
            <h2 className='mb-3 text-xs font-medium text-muted-foreground'>Folders</h2>
            <div className='grid grid-cols-2 gap-3 pb-4 md:grid-cols-4 lg:grid-cols-6'>
              {topLevelFolders.map((folder, index) => (
                <FolderCard
                  key={folder.id}
                  folder={folder}
                  fileCount={getFilesByFolder(folder.id).length}
                  index={index}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Files List */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <h2 className='mb-3 text-xs font-medium text-muted-foreground'>Files</h2>
          <FileList files={files} />
        </motion.div>
      </div>
    </main>
  );
}
