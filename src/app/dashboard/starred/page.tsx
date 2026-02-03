"use client";

import { useEffect } from "react";
import { FileCard } from "@/components/dashboard/file-components";
import { useTextFlowStore } from "@/store/store";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { DocumentIcon } from "@/components/icons/document-icon";

import { useQuery } from "@tanstack/react-query";
import { fetchStarredFiles } from "@/actions/data";

import { FileGridSkeleton } from "@/components/dashboard/skeletons";

export default function StarredPage() {
  const { setView } = useTextFlowStore();

  useEffect(() => {
    setView("starred");
  }, [setView]);

  const { data: starredFiles = [], isLoading } = useQuery({
    queryKey: ["starred-files"],
    queryFn: fetchStarredFiles,
  });

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
            <div className='flex size-8 items-center justify-center rounded-lg bg-amber-500/10'>
              <Star className='size-4 text-amber-500' />
            </div>
            <div>
              <h1 className='text-xl font-semibold'>Starred</h1>
              <p className='text-xs text-muted-foreground'>Your favorite documents</p>
            </div>
          </div>
        </motion.div>

        {/* Files Grid */}
        {isLoading ? (
          <FileGridSkeleton />
        ) : starredFiles.length === 0 ? (
          <EmptyState
            customIcon={
              <DocumentIcon size={100} className='transition-transform hover:scale-105' />
            }
            title='No starred files'
            description='Star important documents for quick access here.'
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className='grid grid-cols-3 gap-4 md:grid-cols-4 lg:grid-cols-6'
          >
            {starredFiles.map((file) => (
              <FileCard key={file.id} file={file} />
            ))}
          </motion.div>
        )}
      </div>
    </main>
  );
}
