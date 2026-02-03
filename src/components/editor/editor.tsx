"use client";

import { useEffect, useRef } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { editorTheme } from "./editor-theme";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { $getRoot, $insertNodes } from "lexical";
import { SlashCommandPlugin } from "./plugins/slash-command-plugin";
import { FloatingToolbarPlugin } from "./plugins/floating-toolbar-plugin";
import { CodeActionMenuPlugin } from "./plugins/code-action-menu-plugin";
import { CodeHighlightPlugin } from "./plugins/code-highlight-plugin";
import { AutoNamePlugin } from "./plugins/auto-name-plugin";
import { ToolbarPlugin } from "./plugins/toolbar-plugin";

// Plugin to capture changes and export JSON
function OnChangePlugin({ onChange }: { onChange: (json: string) => void }) {
  const [editor] = useLexicalComposerContext();
  const lastJsonRef = useRef<string | null>(null);
  const loggedFirstContentRef = useRef(false);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        // Serialize to JSON string for storage
        const json = editorState.toJSON();
        const jsonString = JSON.stringify(json);
        if (
          !loggedFirstContentRef.current &&
          Array.isArray((json as any)?.root?.children) &&
          (json as any).root.children.length > 0
        ) {
          loggedFirstContentRef.current = true;
          console.log("[editor] first content", {
            rootChildrenCount: (json as any).root.children.length,
          });
        }
        if (jsonString !== lastJsonRef.current) {
          lastJsonRef.current = jsonString;
          onChange(jsonString);
        }
      });
    });
  }, [editor, onChange]);

  return null;
}

interface EditorProps {
  initialContent?: string;
  onChange?: (json: string) => void;
  readOnly?: boolean;
  documentId?: string;
  enableAutoName?: boolean;
}

// Plugin to expose editor to window for debugging
function DebugExposePlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).editor = editor;
    }
  }, [editor]);
  return null;
}

function LoadInitialContentPlugin({ initialContent }: { initialContent?: string }) {
  const [editor] = useLexicalComposerContext();
  const appliedRef = useRef(false);

  useEffect(() => {
    if (!initialContent || appliedRef.current) return;

    let parsed: any;
    try {
      parsed = JSON.parse(initialContent);
    } catch {
      return;
    }

    if (!parsed?.root) return;

    editor.getEditorState().read(() => {
      const root = $getRoot();
      const isEmpty = root.getChildren().length === 0;

      if (isEmpty) {
        editor.update(() => {
          const nextState = editor.parseEditorState(initialContent);
          editor.setEditorState(nextState);
        });
        appliedRef.current = true;
      }
    });
  }, [editor, initialContent]);

  return null;
}

export function Editor({
  initialContent,
  onChange,
  readOnly = false,
  documentId,
  enableAutoName = true,
}: EditorProps) {
  const initialConfig = {
    namespace: "TextFlowEditor",
    theme: editorTheme,
    // Initialize with JSON content ONLY if it is valid JSON string
    editorState: (editor: any) => {
      if (initialContent) {
        try {
          const parsed = JSON.parse(initialContent);
          // console.log("Initializing Editor with:", parsed); // Debug

          if (parsed.root) {
            if (process.env.NODE_ENV !== "production") {
              const rootChildrenCount = Array.isArray(parsed?.root?.children)
                ? parsed.root.children.length
                : null;
              const firstText =
                parsed?.root?.children?.[0]?.children?.[0]?.text ||
                parsed?.root?.children?.[0]?.text ||
                null;
              console.log("[editor] init", { rootChildrenCount, firstText });
            }
            const state = editor.parseEditorState(initialContent);
            return state;
          } else {
            console.warn("Parsed content missing root:", parsed);
          }
        } catch (e) {
          console.error("Failed to parse initialContent:", e);
          // Not JSON, ignore and start empty
          return;
        }
      }
    },
    onError: (error: Error) => {
      console.error("Lexical Error:", error);
    },
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      CodeNode,
      CodeHighlightNode,
      TableNode,
      TableCellNode,
      TableRowNode,
      AutoLinkNode,
      LinkNode,
    ],
    editable: !readOnly,
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <DebugExposePlugin />
      <LoadInitialContentPlugin initialContent={initialContent} />
      <div className='relative w-full h-full flex flex-col dark:bg-[#0A0A0A] bg-white'>
        {/* Floating Toolbar and Slash Commands replace fixed toolbar */}
        {!readOnly && (
          <>
            <FloatingToolbarPlugin />
            <SlashCommandPlugin />
            <CodeActionMenuPlugin />
            <ToolbarPlugin documentId={documentId} />
          </>
        )}

        <div className='flex-1 relative overflow-y-auto'>
          <RichTextPlugin
            contentEditable={
              <ContentEditable className='min-h-[60vh] outline-none py-6 px-12 resize-none prose dark:prose-invert max-w-none focus:outline-none' />
            }
            placeholder={
              <div className='editor-placeholder px-12 py-6 pointer-events-none'>
                Type '/' for commands...
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <AutoFocusPlugin />
          <ListPlugin />
          <LinkPlugin />
          <CodeActionMenuPlugin />
          <CodeHighlightPlugin />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />

          {/* Custom Plugins */}
          {documentId && enableAutoName && <AutoNamePlugin documentId={documentId} />}
          {onChange && <OnChangePlugin onChange={onChange} />}
        </div>
      </div>
    </LexicalComposer>
  );
}
