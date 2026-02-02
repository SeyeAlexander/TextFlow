"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect, useRef } from "react";
import { $getRoot } from "lexical";
import { useTextFlowStore } from "@/store/store";

// Helper to debounce function calls
function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function AutoNamePlugin({ documentId }: { documentId: string }) {
  const [editor] = useLexicalComposerContext();
  const updateFile = useTextFlowStore((state) => state.updateFile);
  const getFile = useTextFlowStore((state) => state.files.find((f) => f.id === documentId));
  const fileRef = useRef(getFile);

  // Keep ref in sync
  useEffect(() => {
    // We re-fetch in case name changed from elsewhere
    // But typically we only care about the initial state or current name check
    fileRef.current = useTextFlowStore.getState().files.find((f) => f.id === documentId);
  }, [documentId, useTextFlowStore.getState().files]);

  useEffect(() => {
    const handleNameUpdate = debounce(() => {
      editor.getEditorState().read(() => {
        const root = $getRoot();
        const textContent = root.getTextContent();

        // Only proceed if we have text
        if (!textContent.trim()) return;

        // Get first line, truncated
        const firstLine = textContent.split("\n")[0].trim().substring(0, 50); // limit to 50 chars
        if (!firstLine) return;

        const currentFile = useTextFlowStore.getState().files.find((f) => f.id === documentId);
        if (!currentFile) return;

        // Check if current name is generic (New Document, New(1)...) OR empty
        // Regex for "New Document", "New", "New(1)", etc.
        const isGenericName = /^(New Document|New\(\d+\)|New)$/i.test(currentFile.name);

        // Only auto-rename if:
        // 1. The name is still generic
        // 2. The first line is DIFFERENT from the generic name (avoid loops if user typed "New Document")
        if (isGenericName && firstLine !== currentFile.name) {
          console.log("Auto-naming document to:", firstLine);
          updateFile(documentId, { name: firstLine });
        }
      });
    }, 1000); // Wait 1 second after typing stops

    // Register listener
    return editor.registerUpdateListener(() => {
      handleNameUpdate();
    });
  }, [editor, documentId, updateFile]);

  return null;
}
