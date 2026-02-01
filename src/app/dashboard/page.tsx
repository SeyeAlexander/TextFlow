"use client";

import { useEffect } from "react";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SearchModal } from "@/components/dashboard/search-modal";
import { SettingsModal } from "@/components/dashboard/settings-modal";
import { AIInputField } from "@/components/dashboard/ai-input";
import { FileList, FolderCard } from "@/components/dashboard/file-components";
import { useTextFlowStore } from "@/store/store";
import { initializeDummyData } from "@/data/dummy-data";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const { files, getFoldersByParent, getFilesByFolder, setView } = useTextFlowStore();

  // Initialize dummy data on mount
  useEffect(() => {
    initializeDummyData();
    setView("all-files");
  }, [setView]);

  const topLevelFolders = getFoldersByParent(null);

  return (
    <div className='flex h-screen bg-[#F5F5F5] dark:bg-[#111]'>
      <AppSidebar />

      {/* Main area - rounded with margin */}
      <main className='my-3 mr-3 flex-1 overflow-y-auto rounded-2xl bg-white dark:bg-black'>
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

          {/* AI Input - centered, taller */}
          <AIInputField />

          {/* Folders Grid */}
          {topLevelFolders.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className='mb-6'
            >
              <h2 className='mb-3 text-xs font-medium text-muted-foreground'>Folders</h2>
              <div className='grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5'>
                {topLevelFolders.map((folder) => (
                  <FolderCard
                    key={folder.id}
                    folder={folder}
                    fileCount={getFilesByFolder(folder.id).length}
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

      {/* Modals */}
      <SearchModal />
      <SettingsModal />
    </div>
  );
}
