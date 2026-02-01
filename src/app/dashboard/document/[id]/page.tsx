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
  MoreHorizontal,
  Save,
} from "lucide-react";
import { useTextFlowStore } from "@/store/store";
import { initializeDummyData } from "@/data/dummy-data";
import Link from "next/link";
import { AppSidebar, CollapsedSidebar } from "@/components/dashboard/app-sidebar";
import { SearchModal } from "@/components/dashboard/search-modal";
import { SettingsModal } from "@/components/dashboard/settings-modal";

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
  editorRef,
}: {
  onFormat: (command: string, value?: string) => void;
  activeFormats: Set<string>;
  editorRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.3 }}
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
  const [isSaving, setIsSaving] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const [documentTitle, setDocumentTitle] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeDummyData();
  }, []);

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
    if (!content) {
      // Keep default "New" title if empty
      return;
    }

    // Get first line or heading
    const firstLine = content.split("\n")[0].trim();
    if (firstLine && firstLine !== documentTitle) {
      setDocumentTitle(firstLine.substring(0, 50)); // Limit to 50 chars
      updateFile(fileId, { name: firstLine.substring(0, 50) });
    }
  }, [documentTitle, fileId, updateFile]);

  // Format command handler with proper implementation
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

      // Check for block formats
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
      // Ignore errors from queryCommandState
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

  // Handle input - update title and check formats
  const handleInput = useCallback(() => {
    updateActiveFormats();
    updateTitleFromContent();
  }, [updateActiveFormats, updateTitleFromContent]);

  if (!file) {
    return (
      <div className='flex h-screen bg-[#F5F5F5] dark:bg-[#111]'>
        <AppSidebar />
        <main className='my-3 mr-3 flex flex-1 items-center justify-center rounded-2xl bg-white dark:bg-black'>
          <div className='text-center'>
            <h1 className='text-lg font-medium'>Document not found</h1>
            <Link href='/dashboard' className='mt-2 block text-sm text-blue-500 hover:underline'>
              Go back to files
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className='flex h-screen bg-[#F5F5F5] dark:bg-[#111]'>
      {/* Collapsible Sidebar */}
      <AnimatePresence mode='wait'>
        {!sidebarCollapsed ? (
          <motion.div
            key='sidebar'
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <AppSidebar />
          </motion.div>
        ) : (
          <motion.div
            key='collapsed'
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CollapsedSidebar onExpand={() => setSidebarCollapsed(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Editor Area - Full width with margins */}
      <main
        ref={canvasRef}
        className='relative my-3 mr-3 flex flex-1 flex-col overflow-hidden rounded-2xl bg-white dark:bg-black'
      >
        {/* Crosshairs */}
        <Crosshairs />

        {/* Header */}
        <header className='relative z-10 flex items-center justify-between px-6 py-4'>
          <div className='flex items-center gap-3'>
            <button
              onClick={() => router.back()}
              className='rounded-lg p-1.5 transition-colors hover:bg-black/5 dark:hover:bg-white/5'
            >
              <ChevronLeft className='size-4' />
            </button>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className='rounded-lg p-1.5 text-xs text-muted-foreground transition-colors hover:bg-black/5 dark:hover:bg-white/5'
            >
              {sidebarCollapsed ? "Expand" : "Collapse"}
            </button>
            <div>
              <h1 className='text-sm font-medium'>{documentTitle}</h1>
              <p className='text-[10px] text-muted-foreground'>
                {isSaving ? "Saving..." : "All changes saved"}
              </p>
            </div>
          </div>

          <div className='flex items-center gap-1'>
            <button
              onClick={() => toggleStar(fileId)}
              className={`rounded-lg p-1.5 transition-colors ${
                file.starred ? "text-amber-500" : "hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <Star className={`size-4 ${file.starred ? "fill-current" : ""}`} />
            </button>
            <button
              onClick={() => toggleShare(fileId)}
              className={`rounded-lg p-1.5 transition-colors ${
                file.shared ? "text-purple-500" : "hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <Share2 className='size-4' />
            </button>
            <button
              onClick={handleSave}
              className='flex items-center gap-1.5 rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-neutral-200 dark:bg-white/10 dark:hover:bg-white/15'
            >
              <Save className='size-3.5' />
              <span>Save</span>
            </button>
            <button className='rounded-lg p-1.5 transition-colors hover:bg-black/5 dark:hover:bg-white/5'>
              <MoreHorizontal className='size-4' />
            </button>
          </div>
        </header>

        {/* Editor Content - Full width */}
        <div className='flex-1 overflow-y-auto px-8 py-4 [&::-webkit-scrollbar]:hidden'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='mx-auto w-full max-w-4xl'
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
        </div>

        {/* Floating Toolbar - Centered to canvas */}
        <FloatingToolbar
          onFormat={handleFormat}
          activeFormats={activeFormats}
          editorRef={editorRef}
        />
      </main>

      <SearchModal />
      <SettingsModal />
    </div>
  );
}
