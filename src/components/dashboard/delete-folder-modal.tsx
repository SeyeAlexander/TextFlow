"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeleteFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (deleteFiles: boolean) => void | Promise<void>;
  folderName: string;
}

export function DeleteFolderModal({
  isOpen,
  onClose,
  onConfirm,
  folderName,
}: DeleteFolderModalProps) {
  const [deleteFiles, setDeleteFiles] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(deleteFiles);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={loading ? undefined : onClose}
            className='fixed inset-0 z-50 bg-black/60 backdrop-blur-sm'
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className='fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#1a1a1a] dark:border dark:border-white/10'
          >
            <div className='flex items-start justify-between'>
              <div className='flex items-center gap-3'>
                <div className='flex size-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20'>
                  <AlertTriangle className='size-5 text-red-600 dark:text-red-500' />
                </div>
                <div>
                  <h2 className='text-lg font-semibold text-foreground'>Delete Folder</h2>
                  <p className='text-sm text-muted-foreground mr-4'>
                    Are you sure you want to delete{" "}
                    <span className='font-medium text-foreground'>"{folderName}"</span>?
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={loading}
                className='rounded-full p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50'
              >
                <X className='size-5 text-muted-foreground' />
              </button>
            </div>

            <div className='mt-6 flex flex-col gap-3'>
              <button
                onClick={() => setDeleteFiles(false)}
                disabled={loading}
                className={`relative flex items-center gap-4 rounded-xl border p-4 text-left transition-all ${
                  !deleteFiles
                    ? "border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 dark:border-blue-500"
                    : "border-border hover:bg-black/2 dark:hover:bg-white/2"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${!deleteFiles ? "bg-blue-100 dark:bg-blue-500/20" : "bg-black/5 dark:bg-white/5"}`}
                >
                  <FileText
                    className={`size-5 ${!deleteFiles ? "text-blue-600 dark:text-blue-500" : "text-muted-foreground"}`}
                  />
                </div>
                <div>
                  <h3
                    className={`font-medium ${!deleteFiles ? "text-blue-700 dark:text-blue-400" : "text-foreground"}`}
                  >
                    Remove folder only
                  </h3>
                  <p className='text-xs text-muted-foreground mt-0.5'>
                    Files will be kept and moved to "All Files".
                  </p>
                </div>
                <div
                  className={`absolute right-4 top-1/2 -translate-y-1/2 size-4 rounded-full border flex items-center justify-center ${!deleteFiles ? "border-blue-500 bg-blue-500" : "border-muted-foreground/30"}`}
                >
                  {!deleteFiles && <div className='size-1.5 rounded-full bg-white' />}
                </div>
              </button>

              <button
                onClick={() => setDeleteFiles(true)}
                disabled={loading}
                className={`relative flex items-center gap-4 rounded-xl border p-4 text-left transition-all ${
                  deleteFiles
                    ? "border-red-500 bg-red-50/50 dark:bg-red-500/10 dark:border-red-500"
                    : "border-border hover:bg-black/2 dark:hover:bg-white/2"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${deleteFiles ? "bg-red-100 dark:bg-red-500/20" : "bg-black/5 dark:bg-white/5"}`}
                >
                  <Trash2
                    className={`size-5 ${deleteFiles ? "text-red-600 dark:text-red-500" : "text-muted-foreground"}`}
                  />
                </div>
                <div>
                  <h3
                    className={`font-medium ${deleteFiles ? "text-red-700 dark:text-red-400" : "text-foreground"}`}
                  >
                    Delete folder and files
                  </h3>
                  <p className='text-xs text-muted-foreground mt-0.5'>
                    The folder and all its contents will be permanently deleted.
                  </p>
                </div>
                <div
                  className={`absolute right-4 top-1/2 -translate-y-1/2 size-4 rounded-full border flex items-center justify-center ${deleteFiles ? "border-red-500 bg-red-500" : "border-muted-foreground/30"}`}
                >
                  {deleteFiles && <div className='size-1.5 rounded-full bg-white' />}
                </div>
              </button>
            </div>

            <div className='mt-6 flex items-center justify-end gap-3'>
              <Button variant='outline' onClick={onClose} className='rounded-lg' disabled={loading}>
                Cancel
              </Button>
              <Button
                variant='destructive'
                onClick={handleConfirm}
                disabled={loading}
                className='rounded-lg bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 min-w-[120px]'
              >
                {loading ? (
                  <span className='animate-pulse'>...</span>
                ) : deleteFiles ? (
                  "Delete Everything"
                ) : (
                  "Delete Folder"
                )}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
