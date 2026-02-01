"use client";

import { useEffect } from "react";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SearchModal } from "@/components/dashboard/search-modal";
import { SettingsModal } from "@/components/dashboard/settings-modal";
import { FileCard } from "@/components/dashboard/file-components";
import { useTextFlowStore } from "@/store/store";
import { initializeDummyData } from "@/data/dummy-data";
import { motion } from "framer-motion";
import { Users } from "lucide-react";

export default function SharedPage() {
  const { getSharedFiles, setView } = useTextFlowStore();

  useEffect(() => {
    initializeDummyData();
    setView("shared");
  }, [setView]);

  const sharedFiles = getSharedFiles();

  return (
    <div className='flex h-screen bg-[#F5F5F5] dark:bg-[#111]'>
      <AppSidebar />

      <main className='my-3 mr-3 flex-1 overflow-y-auto rounded-2xl bg-white dark:bg-black'>
        <div className='p-6'>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className='mb-6'
          >
            <div className='flex items-center gap-2'>
              <div className='flex size-8 items-center justify-center rounded-lg bg-purple-500/10'>
                <Users className='size-4 text-purple-500' />
              </div>
              <div>
                <h1 className='text-xl font-semibold'>Shared</h1>
                <p className='text-xs text-muted-foreground'>Collaborative documents</p>
              </div>
            </div>
          </motion.div>

          {/* Files Grid */}
          {sharedFiles.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='flex flex-col items-center justify-center py-16 text-center'
            >
              <div className='mb-4 flex size-14 items-center justify-center rounded-xl bg-black/5 dark:bg-white/5'>
                <Users className='size-6 text-muted-foreground' />
              </div>
              <h3 className='mb-1 text-sm font-medium'>No shared files</h3>
              <p className='text-xs text-muted-foreground'>
                Share documents to collaborate with others
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className='grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4'
            >
              {sharedFiles.map((file) => (
                <FileCard key={file.id} file={file} />
              ))}
            </motion.div>
          )}
        </div>
      </main>

      <SearchModal />
      <SettingsModal />
    </div>
  );
}
