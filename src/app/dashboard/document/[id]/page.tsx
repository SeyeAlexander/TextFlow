"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Code,
  Heading1,
  Heading2,
  ChevronLeft,
  Star,
  Share2,
  Save,
  X,
  Check,
  Globe,
  Mail,
  MessageCircle,
} from "lucide-react";
import { useTextFlowStore } from "@/store/store";
import Link from "next/link";
import { ChatPane } from "@/components/chat";

// Crosshairs Component
function Crosshairs() {
  return (
    <>
      {/* Top-left */}
      <div className='absolute left-4 top-4 h-6 w-px bg-neutral-300 dark:bg-neutral-700' />
      <div className='absolute left-4 top-4 h-px w-6 bg-neutral-300 dark:bg-neutral-700' />
      {/* Top-right */}
      <div className='absolute right-4 top-4 h-6 w-px bg-neutral-300 dark:bg-neutral-700' />
      <div className='absolute right-4 top-4 h-px w-6 bg-neutral-300 dark:bg-neutral-700' />
      {/* Bottom-left */}
      <div className='absolute bottom-4 left-4 h-6 w-px bg-neutral-300 dark:bg-neutral-700' />
      <div className='absolute bottom-4 left-4 h-px w-6 bg-neutral-300 dark:bg-neutral-700' />
      {/* Bottom-right */}
      <div className='absolute bottom-4 right-4 h-6 w-px bg-neutral-300 dark:bg-neutral-700' />
      <div className='absolute bottom-4 right-4 h-px w-6 bg-neutral-300 dark:bg-neutral-700' />
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
  const { toggleShare } = useTextFlowStore();
  const [email, setEmail] = useState("");
  const [isPublic, setIsPublic] = useState(file.shared);

  const handleShare = () => {
    if (email.trim()) {
      // TODO: Implement email sharing
      console.log("Share with:", email);
      setEmail("");
    }
  };

  const handleTogglePublic = () => {
    setIsPublic(!isPublic);
    toggleShare(file.id);
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
        {/* Header */}
        <div className='mb-3 flex items-center justify-between'>
          <h3 className='text-sm font-medium'>Share document</h3>
          <button
            onClick={onClose}
            className='rounded-lg p-1 hover:bg-black/5 dark:hover:bg-white/5'
          >
            <X className='size-4 text-muted-foreground' />
          </button>
        </div>

        {/* Email input */}
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
            disabled={!email.trim()}
            className='rounded-lg bg-blue-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:opacity-50'
          >
            Share
          </button>
        </div>

        <div className='my-3 h-px bg-black/5 dark:bg-white/5' />

        {/* Public toggle */}
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

// Floating Toolbar Button
function ToolbarButton({
  icon: Icon,
  label,
  active = false,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      title={label}
      className={`relative rounded-lg p-2.5 transition-colors ${
        active ? "bg-white/20 text-white" : "text-white/60 hover:bg-white/10 hover:text-white"
      }`}
    >
      <Icon className='size-4' />
    </motion.button>
  );
}

// Floating Toolbar
function FloatingToolbar({
  onFormat,
  activeFormats,
}: {
  onFormat: (command: string, value?: string) => void;
  activeFormats: Set<string>;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className='absolute bottom-6 left-1/2 -translate-x-1/2'
    >
      <div className='flex items-center gap-0.5 rounded-full border border-white/10 bg-neutral-900 px-2 py-1.5 shadow-2xl backdrop-blur-md'>
        <ToolbarButton
          icon={Heading1}
          label='Heading 1'
          active={activeFormats.has("h1")}
          onClick={() => onFormat("heading", "h1")}
        />
        <ToolbarButton
          icon={Heading2}
          label='Heading 2'
          active={activeFormats.has("h2")}
          onClick={() => onFormat("heading", "h2")}
        />

        <div className='mx-1 h-5 w-px bg-white/20' />

        <ToolbarButton
          icon={Bold}
          label='Bold (⌘B)'
          active={activeFormats.has("bold")}
          onClick={() => onFormat("bold")}
        />
        <ToolbarButton
          icon={Italic}
          label='Italic (⌘I)'
          active={activeFormats.has("italic")}
          onClick={() => onFormat("italic")}
        />
        <ToolbarButton
          icon={Underline}
          label='Underline (⌘U)'
          active={activeFormats.has("underline")}
          onClick={() => onFormat("underline")}
        />

        <div className='mx-1 h-5 w-px bg-white/20' />

        <ToolbarButton
          icon={List}
          label='Bullet List'
          active={activeFormats.has("unorderedList")}
          onClick={() => onFormat("unorderedList")}
        />
        <ToolbarButton
          icon={ListOrdered}
          label='Numbered List'
          active={activeFormats.has("orderedList")}
          onClick={() => onFormat("orderedList")}
        />

        <div className='mx-1 h-5 w-px bg-white/20' />

        <ToolbarButton
          icon={Quote}
          label='Quote'
          active={activeFormats.has("quote")}
          onClick={() => onFormat("quote")}
        />
        <ToolbarButton
          icon={Code}
          label='Code'
          active={activeFormats.has("code")}
          onClick={() => onFormat("code")}
        />
      </div>
    </motion.div>
  );
}

export default function DocumentPage() {
  const params = useParams();
  const router = useRouter();
  const fileId = params.id as string;

  const { files, updateFile, toggleStar, toggleShare } = useTextFlowStore();
  const sidebarCollapsed = useTextFlowStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useTextFlowStore((s) => s.toggleSidebar);
  const chatOpen = useTextFlowStore((s) => s.chatOpen);
  const setChatOpen = useTextFlowStore((s) => s.setChatOpen);
  const activeChatDocumentId = useTextFlowStore((s) => s.activeChatDocumentId);

  const [isSaving, setIsSaving] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const [documentTitle, setDocumentTitle] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);

  const file = files.find((f) => f.id === fileId);

  // Initialize editor content and title
  useEffect(() => {
    if (file) {
      setDocumentTitle(file.name);
      if (editorRef.current && !editorRef.current.innerHTML && file.content) {
        editorRef.current.innerHTML = file.content;
      }
    }
  }, [file]);

  // Update title from first line/heading (Notion-like behavior)
  const updateTitleFromContent = useCallback(() => {
    if (!editorRef.current) return;

    const content = editorRef.current.innerText.trim();
    if (!content) return;

    const firstLine = content.split("\n")[0].trim();
    if (firstLine && firstLine !== documentTitle) {
      setDocumentTitle(firstLine.substring(0, 50));
      updateFile(fileId, { name: firstLine.substring(0, 50) });
    }
  }, [documentTitle, fileId, updateFile]);

  // Format command handler
  const handleFormat = useCallback((command: string, value?: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      editorRef.current?.focus();
      return;
    }

    switch (command) {
      case "bold":
        document.execCommand("bold", false);
        break;
      case "italic":
        document.execCommand("italic", false);
        break;
      case "underline":
        document.execCommand("underline", false);
        break;
      case "heading":
        if (value === "h1") {
          document.execCommand("formatBlock", false, "<h1>");
        } else if (value === "h2") {
          document.execCommand("formatBlock", false, "<h2>");
        }
        break;
      case "unorderedList":
        document.execCommand("insertUnorderedList", false);
        break;
      case "orderedList":
        document.execCommand("insertOrderedList", false);
        break;
      case "quote":
        document.execCommand("formatBlock", false, "<blockquote>");
        break;
      case "code":
        document.execCommand("formatBlock", false, "<pre>");
        break;
    }

    editorRef.current?.focus();
    updateActiveFormats();
  }, []);

  // Check active formats
  const updateActiveFormats = useCallback(() => {
    const formats = new Set<string>();

    try {
      if (document.queryCommandState("bold")) formats.add("bold");
      if (document.queryCommandState("italic")) formats.add("italic");
      if (document.queryCommandState("underline")) formats.add("underline");
      if (document.queryCommandState("insertUnorderedList")) formats.add("unorderedList");
      if (document.queryCommandState("insertOrderedList")) formats.add("orderedList");

      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        let node = selection.anchorNode;
        while (node && node !== editorRef.current) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const tagName = (node as Element).tagName.toLowerCase();
            if (tagName === "h1") formats.add("h1");
            if (tagName === "h2") formats.add("h2");
            if (tagName === "blockquote") formats.add("quote");
            if (tagName === "pre") formats.add("code");
          }
          node = node.parentNode;
        }
      }
    } catch {
      // Ignore errors
    }

    setActiveFormats(formats);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case "b":
            e.preventDefault();
            handleFormat("bold");
            break;
          case "i":
            e.preventDefault();
            handleFormat("italic");
            break;
          case "u":
            e.preventDefault();
            handleFormat("underline");
            break;
          case "s":
            e.preventDefault();
            handleSave();
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleFormat]);

  const handleSave = async () => {
    if (!editorRef.current) return;
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    updateFile(fileId, { content: editorRef.current.innerHTML });
    setIsSaving(false);
  };

  const handleInput = useCallback(() => {
    updateActiveFormats();
    updateTitleFromContent();
  }, [updateActiveFormats, updateTitleFromContent]);

  if (!file) {
    return (
      <main className='my-3 mr-3 flex flex-1 items-center justify-center rounded-2xl bg-[#FFF] dark:bg-[#0A0A0A]'>
        <div className='text-center'>
          <h1 className='text-lg font-medium'>Document not found</h1>
          <Link href='/dashboard' className='mt-2 block text-sm text-blue-500 hover:underline'>
            Go back to files
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
      {/* Wrapper for main + chat pane as siblings */}
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
              {/* Star */}
              <button
                onClick={() => toggleStar(fileId)}
                className={`rounded-lg p-2 transition-colors ${
                  file.starred ? "text-amber-500" : "hover:bg-black/5 dark:hover:bg-white/5"
                }`}
                title={file.starred ? "Unstar" : "Star"}
              >
                <Star className={`size-4 ${file.starred ? "fill-current" : ""}`} />
              </button>

              {/* Share with popover */}
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
                      file={file}
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* Chat - visible for shared documents */}
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

              {/* Save - icon only */}
              <button
                onClick={handleSave}
                className={`rounded-lg p-2 transition-colors hover:bg-black/5 dark:hover:bg-white/5 ${
                  isSaving ? "animate-pulse" : ""
                }`}
                title='Save (⌘S)'
              >
                <Save className='size-4 text-muted-foreground' />
              </button>
            </div>
          </header>

          <div className='flex flex-1 overflow-hidden'>
            {/* Editor Content - Resizable canvas */}
            <motion.div
              className='flex-1 overflow-y-auto px-19 pt-5 pb-4 [&::-webkit-scrollbar]:hidden'
              animate={{ marginRight: chatOpen ? 0 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className='mx-auto w-full'
              >
                <div
                  ref={editorRef}
                  contentEditable
                  onInput={handleInput}
                  onSelect={updateActiveFormats}
                  onBlur={handleSave}
                  className='min-h-[60vh] w-full outline-none text-base leading-relaxed
                [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-6
                [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h2]:mt-5
                [&_p]:mb-2
                [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-2
                [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-2
                [&_li]:mb-1
                [&_blockquote]:border-l-4 [&_blockquote]:border-neutral-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:my-4
                [&_pre]:bg-neutral-100 [&_pre]:dark:bg-neutral-900 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:font-mono [&_pre]:text-sm [&_pre]:my-4 [&_pre]:overflow-x-auto
                [&_code]:bg-neutral-100 [&_code]:dark:bg-neutral-800 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-sm'
                  style={{ whiteSpace: "pre-wrap" }}
                  suppressContentEditableWarning
                  data-placeholder='Start writing...'
                />
              </motion.div>
            </motion.div>
          </div>

          {/* Floating Toolbar */}
          <FloatingToolbar onFormat={handleFormat} activeFormats={activeFormats} />
        </motion.main>

        {/* Chat Pane - Sibling to main */}
        <AnimatePresence>
          {chatOpen && (
            <ChatPane
              documentId={fileId}
              documentName={file.name}
              onClose={() => setChatOpen(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
