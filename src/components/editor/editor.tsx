"use client";

import { useEffect } from "react";
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

// Plugin to handle initial HTML content loading
function LoadHtmlPlugin({ html }: { html: string }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!html) return;

    editor.update(() => {
      const root = $getRoot();
      if (root.getTextContent() === "") {
        const parser = new DOMParser();
        const dom = parser.parseFromString(html, "text/html");
        const nodes = $generateNodesFromDOM(editor, dom);
        $insertNodes(nodes);
      }
    });
  }, [editor, html]);

  return null;
}

// Plugin to capture changes and export HTML
function OnChangePlugin({ onChange }: { onChange: (html: string) => void }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const html = $generateHtmlFromNodes(editor, null);
        onChange(html);
      });
    });
  }, [editor, onChange]);

  return null;
}

interface EditorProps {
  initialContent?: string;
  onChange?: (html: string) => void;
  readOnly?: boolean;
  documentId?: string;
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

export function Editor({ initialContent, onChange, readOnly = false, documentId }: EditorProps) {
  const initialConfig = {
    namespace: "TextFlowEditor",
    theme: editorTheme,
    onError: (error: Error) => {
      console.error(error);
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
          {documentId && <AutoNamePlugin documentId={documentId} />}
          {initialContent && <LoadHtmlPlugin html={initialContent} />}
          {onChange && <OnChangePlugin onChange={onChange} />}
        </div>
      </div>
    </LexicalComposer>
  );
}
