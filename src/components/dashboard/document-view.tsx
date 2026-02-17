"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Star,
  Share2,
  X,
  Check,
  Globe,
  Mail,
  MessageCircle,
  Loader2,
} from "lucide-react";
import { useTextFlowStore } from "@/store/store";
import { ChatPane } from "@/components/chat";
import { Editor } from "@/components/editor/editor";
import { useQuery } from "@tanstack/react-query";
import { fetchDocumentById } from "@/actions/data";
import { toggleStar, shareDocumentByEmail } from "@/actions/document";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/hooks/use-user";
import type { SyncStatus, AwarenessState } from "@/lib/sync/types";

// Crosshairs Component
function Crosshairs() {
  return (
    <>
      <div className='absolute left-4 top-4 h-6 w-px bg-blue-400 dark:bg-blue-500' />
      <div className='absolute left-4 top-4 h-px w-6 bg-blue-400 dark:bg-blue-500' />
      <div className='absolute right-4 top-4 h-6 w-px bg-blue-400 dark:bg-blue-500' />
      <div className='absolute right-4 top-4 h-px w-6 bg-blue-400 dark:bg-blue-500' />
      <div className='absolute bottom-4 left-4 h-6 w-px bg-blue-400 dark:bg-blue-500' />
      <div className='absolute bottom-4 left-4 h-px w-6 bg-blue-400 dark:bg-blue-500' />
      <div className='absolute bottom-4 right-4 h-6 w-px bg-blue-400 dark:bg-blue-500' />
      <div className='absolute bottom-4 right-4 h-px w-6 bg-blue-400 dark:bg-blue-500' />
    </>
  );
}

function DocumentLoading() {
  return (
    <main className='my-3 mr-3 flex flex-1 flex-col overflow-hidden rounded-2xl bg-[#FFF] dark:bg-[#0A0A0A] relative'>
      <Crosshairs />
      <header className='relative z-10 flex items-center justify-between px-6 py-4'>
        <div className='flex items-center gap-3'>
          <Skeleton className='h-8 w-8 rounded-lg bg-black/4 dark:bg-white/4' />
          <Skeleton className='h-4 w-16 rounded bg-black/4 dark:bg-white/4' />
          <div className='ml-2 space-y-1'>
            <Skeleton className='h-4 w-32 rounded bg-black/4 dark:bg-white/4' />
            <Skeleton className='h-3 w-20 rounded bg-black/4 dark:bg-white/4' />
          </div>
        </div>
        <div className='flex items-center gap-1'>
          <Skeleton className='h-8 w-8 rounded-lg bg-black/4 dark:bg-white/4' />
          <Skeleton className='h-8 w-8 rounded-lg bg-black/4 dark:bg-white/4' />
          <Skeleton className='h-8 w-8 rounded-lg bg-black/4 dark:bg-white/4' />
        </div>
      </header>
      <div className='flex-1 px-20 py-10 space-y-4'>
        <Skeleton className='h-10 w-3/4 bg-black/4 dark:bg-white/4' />
        <Skeleton className='h-4 w-full bg-black/4 dark:bg-white/4' />
        <Skeleton className='h-4 w-full bg-black/4 dark:bg-white/4' />
        <Skeleton className='h-4 w-2/3 bg-black/4 dark:bg-white/4' />
        <div className='pt-8 space-y-4'>
          <Skeleton className='h-4 w-full bg-black/4 dark:bg-white/4' />
          <Skeleton className='h-4 w-full bg-black/4 dark:bg-white/4' />
          <Skeleton className='h-4 w-3/4 bg-black/4 dark:bg-white/4' />
        </div>
      </div>
    </main>
  );
}

// Share Popover
function SharePopover({
  isOpen,
  onClose,
  file,
}: {
  isOpen: boolean;
  onClose: () => void;
  file: { id: string; shared: boolean };
}) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [isPublic, setIsPublic] = useState(file.shared);
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    if (email.trim() && !isSharing) {
      setIsSharing(true);
      try {
        await shareDocumentByEmail(file.id, email.trim());
        toast.success(`Shared with ${email}`);
        setEmail("");

        // Invalidate document query to show shared status and chat icon
        queryClient.invalidateQueries({ queryKey: ["document", file.id] });
        queryClient.invalidateQueries({ queryKey: ["sidebar"] });

        // Automatically open the chat pane
        const { setChatOpen, setActiveChatDocument } = useTextFlowStore.getState();
        setActiveChatDocument(file.id);
        setChatOpen(true);
        onClose();
      } catch (error: any) {
        toast.error(error.message || "Failed to share document");
      } finally {
        setIsSharing(false);
      }
    }
  };

  const handleTogglePublic = () => {
    // setIsPublic(!isPublic);
    // TODO: Implement togglePublic backend action if needed
    // For now, we only handle email sharing
  };

  if (!isOpen) return null;

  return (
    <>
      <div className='fixed inset-0 z-40' onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -5 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -5 }}
        className='absolute right-0 top-full z-50 mt-2 rounded-xl border border-black/10 bg-white p-4 shadow-xl dark:border-white/10 dark:bg-[#1a1a1a]'
      >
        <div className='mb-3 flex items-center justify-between'>
          <h3 className='text-sm font-medium'>Share document</h3>
          <button
            onClick={onClose}
            className='rounded-lg p-1 hover:bg-black/5 dark:hover:bg-white/5'
          >
            <X className='size-4 text-muted-foreground' />
          </button>
        </div>

        <div className='mb-3 flex gap-2'>
          <div className='flex flex-1 items-center gap-2 rounded-lg border border-black/10 bg-black/5 px-3 py-2 dark:border-white/10 dark:bg-white/5'>
            <Mail className='size-4 text-muted-foreground' />
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='Enter email address...'
              className='flex-1 w-64 bg-transparent text-sm outline-none placeholder:text-muted-foreground'
              onKeyDown={(e) => {
                if (e.key === "Enter") handleShare();
              }}
            />
          </div>
          <button
            onClick={handleShare}
            disabled={!email.trim() || isSharing}
            className='flex items-center gap-2 rounded-lg bg-blue-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:opacity-50'
          >
            {isSharing ? <Loader2 className='size-4 animate-spin' /> : "Share"}
          </button>
        </div>

        <div className='my-3 h-px bg-black/5 dark:bg-white/5' />

        <button
          onClick={handleTogglePublic}
          className='flex w-full items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-black/5 dark:hover:bg-white/5'
        >
          <div
            className={`flex size-8 items-center justify-center rounded-lg ${
              isPublic ? "bg-blue-500/10 text-blue-500" : "bg-black/5 dark:bg-white/5"
            }`}
          >
            <Globe className='size-4' />
          </div>
          <div className='flex-1 text-left'>
            <p className='text-sm font-medium'>Public access</p>
            <p className='text-[11px] text-muted-foreground'>
              {isPublic ? "Anyone with link can view" : "Only invited people can view"}
            </p>
          </div>
          <div
            className={`flex size-5 items-center justify-center rounded-full ${
              isPublic ? "bg-blue-500 text-white" : "border border-black/20 dark:border-white/20"
            }`}
          >
            {isPublic && <Check className='size-3' />}
          </div>
        </button>
      </motion.div>
    </>
  );
}

export function DocumentView({ fileId }: { fileId: string }) {
  const router = useRouter();

  const { data: file, isLoading } = useQuery({
    queryKey: ["document", fileId],
    queryFn: () => fetchDocumentById(fileId),
  });

  const sidebarCollapsed = useTextFlowStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useTextFlowStore((s) => s.toggleSidebar);
  const chatOpen = useTextFlowStore((s) => s.chatOpen);
  const activeChatDocumentId = useTextFlowStore((s) => s.activeChatDocumentId);
  const setChatOpen = useTextFlowStore((s) => s.setChatOpen);
  const setActiveChatDocument = useTextFlowStore((s) => s.setActiveChatDocument);
  const queryClient = useQueryClient();

  // Get current user for collaboration
  const { user, loading: userLoading } = useUser();

  // Collaboration state
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("disconnected");
  const [awarenessStates, setAwarenessStates] = useState<Map<number, AwarenessState>>(new Map());
  const [editorBootstrapped, setEditorBootstrapped] = useState(false);

  const starMutation = useMutation({
    mutationFn: () => toggleStar(fileId),
    onMutate: async () => {
      // Cancel queries but DO NOT invalidate document to prevent editor reload
      await queryClient.cancelQueries({ queryKey: ["sidebar"] });
      await queryClient.cancelQueries({ queryKey: ["dashboard"] });

      const previousDocument = queryClient.getQueryData(["document", fileId]);
      const previousSidebar = queryClient.getQueryData(["sidebar"]);
      const previousDashboard = queryClient.getQueryData(["dashboard"]);

      // Optimistically update document cache (direct update, no refetch)
      queryClient.setQueryData(["document", fileId], (old: any) => {
        if (!old) return old;
        return { ...old, starred: !old.starred };
      });

      // Update sidebar
      queryClient.setQueryData(["sidebar"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          files: old.files.map((f: any) => (f.id === fileId ? { ...f, starred: !f.starred } : f)),
        };
      });

      // Update dashboard
      queryClient.setQueryData(["dashboard"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          files: old.files.map((f: any) => (f.id === fileId ? { ...f, starred: !f.starred } : f)),
        };
      });

      return { previousDocument, previousSidebar, previousDashboard };
    },
    onError: (err, vars, context) => {
      // Rollback all caches
      if (context?.previousDocument) {
        queryClient.setQueryData(["document", fileId], context.previousDocument);
      }
      if (context?.previousSidebar) {
        queryClient.setQueryData(["sidebar"], context.previousSidebar);
      }
      if (context?.previousDashboard) {
        queryClient.setQueryData(["dashboard"], context.previousDashboard);
      }
    },
    onSettled: () => {
      // Only invalidate sidebar and dashboard, NOT document (to prevent editor reload)
      queryClient.invalidateQueries({ queryKey: ["sidebar"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const [shareOpen, setShareOpen] = useState(false);
  const [documentTitle, setDocumentTitle] = useState("");

  // Initialize title
  useEffect(() => {
    if (file) {
      setDocumentTitle(file.name);
    }
  }, [file]);

  useEffect(() => {
    if (file && !file.shared) {
      setChatOpen(false);
      setActiveChatDocument(null);
    }
  }, [file, setChatOpen, setActiveChatDocument]);

  useEffect(() => {
    setEditorBootstrapped(false);
  }, [fileId]);

  useEffect(() => {
    if (syncStatus === "connected") {
      setEditorBootstrapped(true);
      return;
    }
    const timer = setTimeout(() => {
      setEditorBootstrapped(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, [syncStatus]);


  // Redirect if document not found (deleted)
  useEffect(() => {
    if (!isLoading && !file) {
      router.push("/dashboard");
    }
  }, [file, isLoading, router]);

  if (isLoading || userLoading) {
    return <DocumentLoading />;
  }

  if (!file) {
    // Return null while redirecting to avoid flash of error state
    return null;
  }

  const isOwner = !file.ownerId || file.ownerId === user?.id;

  return (
    <>
      <div className='flex flex-1 my-3 mr-3 gap-1.5'>
        {/* Main Document Editor */}
        <motion.main
          layout
          className='relative flex flex-1 flex-col overflow-hidden rounded-2xl bg-[#FFF] dark:bg-[#0A0A0A]'
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Crosshairs */}
          <Crosshairs />

          {/* Header */}
          <header className='relative z-10 flex items-center justify-between px-6 py-4'>
            <div className='flex items-center gap-3'>
              <button
                onClick={() => router.back()}
                className='rounded-lg p-1.5 transition-colors hover:bg-black/5 dark:hover:bg-white/5'
                title='Go back'
              >
                <ChevronLeft className='size-4' />
              </button>
              <button
                onClick={toggleSidebar}
                className='rounded-lg px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-black/5 dark:hover:bg-white/5'
              >
                {sidebarCollapsed ? "Expand" : "Collapse"}
              </button>
              <div className='ml-2'>
                <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className='text-sm font-medium'
                >
                  {documentTitle}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className='text-[10px] text-muted-foreground flex items-center gap-1'
                >
                  {syncStatus === "connecting"
                    ? "Syncing..."
                    : syncStatus === "connected"
                      ? "Live sync active"
                      : "Live sync idle"}
                </motion.p>
              </div>
            </div>

            <div className='flex items-center gap-1'>
              {/* Presence Avatars for collaborators */}
              {file.shared && syncStatus === "connected" && (
                <div className='flex items-center -space-x-2 mr-2'>
                  {Array.from(awarenessStates.entries())
                    .filter(([clientId, state]) => state.id !== user?.id)
                    .slice(0, 3)
                    .map(([clientId, state]) => (
                      <div
                        key={clientId}
                        className={`size-7 rounded-full bg-linear-to-br ${state.gradient} ring-2 ring-white dark:ring-[#0A0A0A] flex items-center justify-center text-[10px] font-medium text-white`}
                        title={state.name}
                      >
                        {state.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                    ))}
                  {awarenessStates.size > 4 && (
                    <div className='size-7 rounded-full bg-gray-500 ring-2 ring-white dark:ring-[#0A0A0A] flex items-center justify-center text-[10px] font-medium text-white'>
                      +{awarenessStates.size - 4}
                    </div>
                  )}
                </div>
              )}

              {/* Sync status indicator */}
              {file.shared && (
                <div
                  className={`size-2 rounded-full mr-2 ${
                    syncStatus === "connected"
                      ? "bg-green-500"
                      : syncStatus === "connecting"
                        ? "bg-amber-500 animate-pulse"
                        : "bg-gray-400"
                  }`}
                  title={`Sync: ${syncStatus}`}
                />
              )}
              {isOwner && (
                <button
                  onClick={() => starMutation.mutate()}
                  className={`rounded-lg p-2 transition-colors ${
                    file.starred ? "text-amber-500" : "hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                  title={file.starred ? "Unstar" : "Star"}
                >
                  <Star className={`size-4 ${file.starred ? "fill-current" : ""}`} />
                </button>
              )}

              <div className='relative'>
                <button
                  onClick={() => setShareOpen(!shareOpen)}
                  className={`rounded-lg p-2 transition-colors ${
                    file.shared ? "text-blue-500" : "hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                  title='Share'
                >
                  <Share2 className='size-4' />
                </button>
                <AnimatePresence>
                  {shareOpen && (
                    <SharePopover
                      isOpen={shareOpen}
                      onClose={() => setShareOpen(false)}
                      file={{ id: fileId, shared: file.shared }}
                    />
                  )}
                </AnimatePresence>
              </div>

              <div id='editor-undo-redo-slot' className='mr-1' />

              {file.shared && (
                <button
                  onClick={() => {
                    const { setChatOpen, setActiveChatDocument } = useTextFlowStore.getState();
                    setActiveChatDocument(fileId);
                    setChatOpen(true);
                  }}
                  className={`rounded-lg p-2 transition-colors hover:bg-black/5 dark:hover:bg-white/5 ${
                    chatOpen
                      ? "text-orange-500 bg-linear-to-br from-orange-400/20 to-orange-200/20"
                      : "text-muted-foreground"
                  }`}
                  title='Open discussion'
                >
                  <MessageCircle className='size-4' />
                </button>
              )}

            </div>
          </header>

          <div className='flex flex-1 pb-10 overflow-hidden relative'>
            <motion.div
              className='flex-1 h-full'
              animate={{ marginRight: chatOpen ? 0 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {!editorBootstrapped && (
                <div className='absolute inset-0 z-20 bg-white/85 dark:bg-[#0A0A0A]/85 backdrop-blur-[1px]'>
                  <div className='h-full px-20 py-12 space-y-4'>
                    <Skeleton className='h-8 w-2/5 bg-black/6 dark:bg-white/8' />
                    <Skeleton className='h-4 w-full bg-black/6 dark:bg-white/8' />
                    <Skeleton className='h-4 w-5/6 bg-black/6 dark:bg-white/8' />
                    <Skeleton className='h-4 w-4/5 bg-black/6 dark:bg-white/8' />
                  </div>
                </div>
              )}
              {/* Lexical Editor */}
              <Editor
                key={fileId}
                initialContent={
                  typeof file.content === "string" ? file.content : JSON.stringify(file.content)
                }
                documentId={fileId}
                enableAutoName={false}
                // Use Yjs as the single persistence/sync path for all authenticated documents.
                collaborative={!!user}
                userId={user?.id}
                userName={
                  user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Anonymous"
                }
                userAvatarUrl={user?.user_metadata?.avatar_url}
                onSyncStatusChange={setSyncStatus}
                onAwarenessChange={(states) =>
                  setAwarenessStates(states as Map<number, AwarenessState>)
                }
              />
            </motion.div>
          </div>
        </motion.main>

        <AnimatePresence>
          {chatOpen && file.shared && activeChatDocumentId === fileId && (
            <ChatPane
              documentId={fileId}
              documentName={file.name}
              onClose={() => {
                const { setChatOpen } = useTextFlowStore.getState();
                setChatOpen(false);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
