"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect, useRef } from "react";
import { $getRoot } from "lexical";
import { useTextFlowStore } from "@/store/store";
import { useQueryClient, useMutation } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();
  const didRenameRef = useRef(false);

  const renameMutation = useMutation({
    mutationFn: async (name: string) => {
      const { renameFile } = await import("@/actions/files");
      const formData = new FormData();
      formData.append("id", documentId);
      formData.append("name", name);
      return renameFile(formData);
    },
    onSuccess: (_, name) => {
      didRenameRef.current = true;
      queryClient.setQueryData(["document", documentId], (old: any) =>
        old ? { ...old, name } : old,
      );
      queryClient.invalidateQueries({ queryKey: ["sidebar"] });
    },
  });

  useEffect(() => {
    const handleNameUpdate = debounce(() => {
      editor.getEditorState().read(() => {
        const root = $getRoot();
        const textContent = root.getTextContent();

        if (!textContent.trim() || didRenameRef.current) return;

        const firstLine = textContent.split("\n")[0].trim().substring(0, 50);
        if (!firstLine) return;

        // Fetch current document name from query cache
        const currentFile: any = queryClient.getQueryData(["document", documentId]);
        if (!currentFile) return;

        const isGenericName = /^(New Document|New\(\d+\)|New|Untitled)$/i.test(currentFile.name);

        if (isGenericName && firstLine !== currentFile.name) {
          renameMutation.mutate(firstLine);
        }
      });
    }, 2000);

    return editor.registerUpdateListener(() => {
      handleNameUpdate();
    });
  }, [editor, documentId, queryClient, renameMutation]);

  return null;
}
