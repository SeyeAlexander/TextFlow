"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Star,
  Share2,
  Save,
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
import { ErrorState } from "@/components/dashboard/error-state";
import { useQuery } from "@tanstack/react-query";
import { fetchDocumentById } from "@/actions/data";
import { saveDocument, toggleStar, shareDocumentByEmail } from "@/actions/document";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
  const sidebarCollapsed = useTextFlowStore((s) => s.sidebarCollapsed);
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
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => saveDocument(id, content),
    onSuccess: () => {
      // No need to invalidate for every save to avoid flicker
    },
  });

  const starMutation = useMutation({
    mutationFn: () => toggleStar(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document", fileId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["sidebar"] });
    },
  });

  const [isSaving, setIsSaving] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [documentTitle, setDocumentTitle] = useState("");

  // Initialize title
  useEffect(() => {
    if (file) {
      setDocumentTitle(file.name);
    }
  }, [file]);

  const handleContentChange = useCallback(
    (content: string) => {
      setIsSaving(true);
      const timeoutId = setTimeout(async () => {
        try {
          await saveMutation.mutateAsync({ id: fileId, content });
        } finally {
          setIsSaving(false);
        }
      }, 2000);

      return () => {
        clearTimeout(timeoutId);
        // We don't force save on every stroke's cleanup,
        // but the 2s debounce is generally safe for web.
        // For a more robust solution, we'd need to track if content is dirty.
      };
    },
    [fileId, saveMutation],
  );

  if (isLoading) {
    return (
      <main className='my-3 mr-3 flex flex-1 items-center justify-center rounded-2xl bg-[#FFF] dark:bg-[#0A0A0A]'>
        <div className='h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent' />
      </main>
    );
  }

  if (!file) {
    return (
      <main className='my-3 mr-3 flex flex-1 items-center justify-center rounded-2xl bg-[#FFF] dark:bg-[#0A0A0A]'>
        <ErrorState
          title='Document not found'
          description='The document you are looking for does not exist or has been deleted.'
          className='border-none bg-transparent'
        />
      </main>
    );
  }

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
                  className='text-[10px] text-muted-foreground'
                >
                  {isSaving ? "Saving..." : "All changes saved"}
                </motion.p>
              </div>
            </div>

            <div className='flex items-center gap-1'>
              <button
                onClick={() => starMutation.mutate()}
                className={`rounded-lg p-2 transition-colors ${
                  file.starred ? "text-amber-500" : "hover:bg-black/5 dark:hover:bg-white/5"
                }`}
                title={file.starred ? "Unstar" : "Star"}
              >
                <Star className={`size-4 ${file.starred ? "fill-current" : ""}`} />
              </button>

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

              <button
                className={`rounded-lg p-2 transition-colors hover:bg-black/5 dark:hover:bg-white/5 ${
                  isSaving ? "animate-pulse" : ""
                }`}
                title='Saved automatically'
              >
                <Save className='size-4 text-muted-foreground' />
              </button>
            </div>
          </header>

          <div className='flex flex-1 pb-10 overflow-hidden relative'>
            <motion.div
              className='flex-1 h-full'
              animate={{ marginRight: chatOpen ? 0 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Lexical Editor */}
              <Editor
                initialContent={file.content}
                onChange={handleContentChange}
                documentId={fileId}
              />
            </motion.div>
          </div>
        </motion.main>

        <AnimatePresence>
          {chatOpen && (
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
