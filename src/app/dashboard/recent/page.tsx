"use client";

import { useEffect } from "react";
import { FileCard } from "@/components/dashboard/file-components";
import { useTextFlowStore } from "@/store/store";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

export default function RecentPage() {
  const { getRecentFiles, setView } = useTextFlowStore();

  useEffect(() => {
    setView("recent");
  }, [setView]);

  const recentFiles = getRecentFiles();

  return (
    <main className='my-3 mr-3 flex-1 overflow-y-auto rounded-2xl bg-white dark:bg-[#0A0A0A]'>
      <div className='p-6'>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-6'
        >
          <div className='flex items-center gap-2'>
            <div className='flex size-8 items-center justify-center rounded-lg bg-blue-500/10'>
              <Clock className='size-4 text-blue-500' />
            </div>
            <div>
              <h1 className='text-xl font-semibold'>Recent</h1>
              <p className='text-xs text-muted-foreground'>Recently accessed documents</p>
            </div>
          </div>
        </motion.div>

        {/* Files Grid */}
        {recentFiles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='flex flex-col items-center justify-center py-16 text-center'
          >
            <div className='mb-4 flex size-14 items-center justify-center rounded-xl bg-black/5 dark:bg-white/5'>
              <Clock className='size-6 text-muted-foreground' />
            </div>
            <h3 className='mb-1 text-sm font-medium'>No recent files</h3>
            <p className='text-xs text-muted-foreground'>
              Start working on documents to see them here
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className='grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4'
          >
            {recentFiles.map((file) => (
              <FileCard key={file.id} file={file} />
            ))}
          </motion.div>
        )}
      </div>
    </main>
  );
}
