"use client";

import { useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FileText, X, FolderOpen } from "lucide-react";
import { useTextFlowStore } from "@/store/store";
import { formatRelativeTime } from "@/lib/utils";
import { useRouter } from "next/navigation";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { searchDocuments } from "@/actions/data";

// Skeleton for loading state
function SearchSkeleton() {
  return (
    <div className='space-y-2 p-2'>
      {[1, 2, 3].map((i) => (
        <div key={i} className='flex items-center gap-3 rounded-lg px-3 py-2 animate-pulse'>
          <div className='size-8 rounded-lg bg-black/5 dark:bg-white/5' />
          <div className='flex-1 space-y-1.5'>
            <div className='h-3.5 w-32 rounded-full bg-black/5 dark:bg-white/5' />
            <div className='h-2.5 w-20 rounded-full bg-black/5 dark:bg-white/5' />
          </div>
        </div>
      ))}
      <p className='text-center text-[10px] text-muted-foreground pt-2'>Searching documents...</p>
    </div>
  );
}

export function SearchModal() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { searchOpen, setSearchOpen, searchQuery, setSearchQuery } = useTextFlowStore();

  // Get cached sidebar data for instant search
  const sidebarData = queryClient.getQueryData<{
    folders: { id: string; name: string }[];
    files: {
      id: string;
      name: string;
      type: string;
      starred: boolean;
      updatedAt: string;
      size?: string;
    }[];
  }>(["sidebar"]);

  // Instant cache-based results (no network, instant)
  const cacheResults = useMemo(() => {
    if (!searchQuery || searchQuery.length === 0) return { files: [], folders: [] };
    const q = searchQuery.toLowerCase();

    const files = (sidebarData?.files || [])
      .filter((f) => f.name.toLowerCase().includes(q))
      .slice(0, 10);

    const folders = (sidebarData?.folders || [])
      .filter((f) => f.name.toLowerCase().includes(q))
      .slice(0, 5);

    return { files, folders };
  }, [searchQuery, sidebarData]);

  // Server search (debounced, for deeper/content search)
  const {
    data: serverResults = [],
    isLoading: isSearching,
    isFetching,
  } = useQuery({
    queryKey: ["search", searchQuery],
    queryFn: () => searchDocuments(searchQuery),
    enabled: searchQuery.length >= 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  // Merge cache + server results (dedupe by id)
  const mergedFiles = useMemo(() => {
    const seen = new Set<string>();
    const merged: typeof cacheResults.files = [];

    // Cache results first (instant)
    cacheResults.files.forEach((f) => {
      if (!seen.has(f.id)) {
        seen.add(f.id);
        merged.push(f);
      }
    });

    // Server results (may have more/fresh data)
    serverResults.forEach((f) => {
      if (!seen.has(f.id)) {
        seen.add(f.id);
        merged.push({
          id: f.id,
          name: f.name,
          type: f.type,
          starred: f.starred,
          updatedAt: typeof f.updatedAt === "string" ? f.updatedAt : f.updatedAt.toISOString(),
          size: f.size,
        });
      }
    });

    return merged.slice(0, 15);
  }, [cacheResults.files, serverResults]);

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

  const handleFolderClick = (folderId: string) => {
    setSearchOpen(false);
    setSearchQuery("");
    router.push(`/dashboard/folder/${folderId}`);
  };

  const hasResults = mergedFiles.length > 0 || cacheResults.folders.length > 0;
  const showSkeleton = searchQuery.length >= 2 && isFetching && !hasResults;
  const totalResults = mergedFiles.length + cacheResults.folders.length;

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
                  placeholder='Search documents and folders...'
                  className='h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground'
                />
                {isFetching && searchQuery.length >= 2 && (
                  <div className='size-3 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin' />
                )}
                <button
                  onClick={() => setSearchOpen(false)}
                  className='rounded-lg p-1.5 transition-colors hover:bg-black/5 dark:hover:bg-white/10'
                >
                  <X className='size-4 text-muted-foreground' />
                </button>
              </div>

              {/* Results */}
              <div className='max-h-80 overflow-y-auto'>
                {searchQuery.length === 0 ? (
                  <div className='px-3 py-8 text-center text-xs text-muted-foreground'>
                    Start typing to search documents...
                  </div>
                ) : showSkeleton ? (
                  <SearchSkeleton />
                ) : !hasResults && !isFetching ? (
                  <div className='px-3 py-8 text-center text-xs text-muted-foreground'>
                    No results found for &quot;{searchQuery}&quot;
                  </div>
                ) : (
                  <div className='p-2 space-y-1'>
                    {/* Folders */}
                    {cacheResults.folders.length > 0 && (
                      <>
                        <p className='px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground'>
                          Folders
                        </p>
                        {cacheResults.folders.map((folder) => (
                          <motion.button
                            key={folder.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => handleFolderClick(folder.id)}
                            className='flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-black/5 dark:hover:bg-white/5'
                          >
                            <div className='flex size-8 items-center justify-center rounded-lg bg-amber-500/10'>
                              <FolderOpen className='size-4 text-amber-500' />
                            </div>
                            <p className='truncate text-sm font-medium'>{folder.name}</p>
                          </motion.button>
                        ))}
                      </>
                    )}

                    {/* Files */}
                    {mergedFiles.length > 0 && (
                      <>
                        <p className='px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground'>
                          Documents
                        </p>
                        {mergedFiles.map((file) => (
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
                                {file.size || "0 KB"} · {formatRelativeTime(file.updatedAt)}
                              </p>
                            </div>
                            {file.starred && <span className='text-xs text-amber-500'>★</span>}
                          </motion.button>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Footer hint */}
              <div className='flex items-center justify-between border-t border-black/5 px-4 py-2.5 dark:border-white/5'>
                <span className='text-[10px] text-muted-foreground'>
                  {totalResults} result{totalResults !== 1 ? "s" : ""}
                  {isFetching && searchQuery.length >= 2 && " · searching..."}
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
