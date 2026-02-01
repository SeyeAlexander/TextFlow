"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FileText, X } from "lucide-react";
import { useTextFlowStore } from "@/store/store";
import { formatRelativeTime } from "@/data/dummy-data";
import { useRouter } from "next/navigation";

export function SearchModal() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { searchOpen, setSearchOpen, searchQuery, setSearchQuery, searchFiles } =
    useTextFlowStore();
  const results = searchQuery.length > 0 ? searchFiles(searchQuery) : [];

  // Focus input when modal opens
  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchOpen]);

  // Keyboard shortcut to open (⌘K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(!searchOpen);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen, setSearchOpen]);

  const handleFileClick = (fileId: string) => {
    setSearchOpen(false);
    setSearchQuery("");
    router.push(`/dashboard/document/${fileId}`);
  };

  return (
    <AnimatePresence>
      {searchOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className='fixed inset-0 z-50 bg-black/50 backdrop-blur-sm'
            onClick={() => setSearchOpen(false)}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className='fixed left-1/2 top-[15%] z-50 w-full max-w-lg -translate-x-1/2'
          >
            <div className='overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl dark:border-white/10 dark:bg-[#1a1a1a]'>
              {/* Search Input */}
              <div className='flex items-center gap-3 border-b border-black/5 px-4 dark:border-white/5'>
                <Search className='size-4 text-muted-foreground' />
                <input
                  ref={inputRef}
                  type='text'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder='Search documents...'
                  className='h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground'
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  className='rounded-lg p-1.5 transition-colors hover:bg-black/5 dark:hover:bg-white/10'
                >
                  <X className='size-4 text-muted-foreground' />
                </button>
              </div>

              {/* Results */}
              <div className='max-h-72 overflow-y-auto p-2'>
                {searchQuery.length === 0 ? (
                  <div className='px-3 py-8 text-center text-xs text-muted-foreground'>
                    Start typing to search documents...
                  </div>
                ) : results.length === 0 ? (
                  <div className='px-3 py-8 text-center text-xs text-muted-foreground'>
                    No documents found for &quot;{searchQuery}&quot;
                  </div>
                ) : (
                  <div className='space-y-0.5'>
                    {results.map((file) => (
                      <motion.button
                        key={file.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => handleFileClick(file.id)}
                        className='flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-black/5 dark:hover:bg-white/5'
                      >
                        <div className='flex size-8 items-center justify-center rounded-lg bg-blue-500/10'>
                          <FileText className='size-4 text-blue-500' />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <p className='truncate text-sm font-medium'>{file.name}</p>
                          <p className='text-[10px] text-muted-foreground'>
                            {file.size} · {formatRelativeTime(file.updatedAt)}
                          </p>
                        </div>
                        {file.starred && <span className='text-xs text-amber-500'>★</span>}
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer hint */}
              <div className='flex items-center justify-between border-t border-black/5 px-4 py-2.5 dark:border-white/5'>
                <span className='text-[10px] text-muted-foreground'>
                  {results.length} result{results.length !== 1 ? "s" : ""}
                </span>
                <div className='flex items-center gap-1 text-[10px] text-muted-foreground'>
                  <kbd className='rounded bg-black/5 px-1 py-0.5 font-mono dark:bg-white/10'>
                    esc
                  </kbd>
                  <span>to close</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
