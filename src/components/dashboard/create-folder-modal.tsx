"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FolderPlus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFolder } from "@/actions/folders";
import { toast } from "sonner";

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateFolderModal({ isOpen, onClose }: CreateFolderModalProps) {
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (folderName: string) => {
      const formData = new FormData();
      formData.append("name", folderName);
      await createFolder(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["sidebar"] });
      toast.success("Folder created");
      setName("");
      onClose();
    },
    onError: () => {
      toast.error("Failed to create folder");
    },
  });

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      mutate(name.trim());
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
            onClick={onClose}
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
                <div className='flex size-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-500/20'>
                  <FolderPlus className='size-5 text-blue-600 dark:text-blue-500' />
                </div>
                <div>
                  <h2 className='text-lg font-semibold text-foreground'>Create Folder</h2>
                </div>
              </div>
              <button
                onClick={onClose}
                className='rounded-full p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/5'
              >
                <X className='size-5 text-muted-foreground' />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className='mb-6'>
                <label className='text-sm font-medium text-muted-foreground mb-1.5 block'>
                  Folder Name
                </label>
                <input
                  ref={inputRef}
                  type='text'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder='e.g. Project Assets'
                  className='w-full rounded-xl border border-black/10 bg-black/5 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-white/10 dark:bg-white/5'
                />
              </div>

              <div className='flex items-center justify-end gap-3'>
                <Button type='button' variant='outline' onClick={onClose} className='rounded-lg'>
                  Cancel
                </Button>
                <Button
                  type='submit'
                  disabled={!name.trim() || isPending}
                  className='rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 gap-2 min-w-[100px]'
                >
                  {isPending ? <Loader2 className='size-4 animate-spin' /> : "Create"}
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
