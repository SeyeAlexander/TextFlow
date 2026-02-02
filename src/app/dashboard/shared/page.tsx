"use client";

import { useEffect } from "react";
import { FileCard } from "@/components/dashboard/file-components";
import { useTextFlowStore } from "@/store/store";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { DocumentIcon } from "@/components/icons/document-icon";

export default function SharedPage() {
  const { getSharedFiles, setView } = useTextFlowStore();

  useEffect(() => {
    setView("shared");
  }, [setView]);

  const sharedFiles = getSharedFiles();

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
          <EmptyState
            customIcon={
              <DocumentIcon size={100} className='transition-transform hover:scale-105' />
            }
            title='No shared files'
            description='Share documents to collaborate with others.'
            // No action button for shared as you don't "create" a shared file directly usually, but we could add "Invite" later
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className='grid grid-cols-3 gap-4 md:grid-cols-4 lg:grid-cols-6'
          >
            {sharedFiles.map((file) => (
              <FileCard key={file.id} file={file} />
            ))}
          </motion.div>
        )}
      </div>
    </main>
  );
}
