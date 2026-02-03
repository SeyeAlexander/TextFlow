"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeleteFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  fileName: string;
}

export function DeleteFileModal({ isOpen, onClose, onConfirm, fileName }: DeleteFileModalProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
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
            <div className='flex items-start justify-between mb-4'>
              <div className='flex items-center gap-3'>
                <div className='flex size-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20'>
                  <AlertTriangle className='size-5 text-red-600 dark:text-red-500' />
                </div>
                <div>
                  <h2 className='text-lg font-semibold text-foreground'>Delete File</h2>
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

            <p className='text-sm text-muted-foreground mb-6'>
              Are you sure you want to delete{" "}
              <span className='font-medium text-foreground'>"{fileName}"</span>? This action cannot
              be undone.
            </p>

            <div className='flex items-center justify-end gap-3'>
              <Button variant='outline' onClick={onClose} className='rounded-lg' disabled={loading}>
                Cancel
              </Button>
              <Button
                variant='destructive'
                onClick={handleConfirm}
                disabled={loading}
                className='rounded-lg bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 gap-2 min-w-[120px]'
              >
                {loading ? (
                  <span className='animate-pulse'>...</span>
                ) : (
                  <>
                    <Trash2 className='size-4' />
                    <span>Delete File</span>
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
