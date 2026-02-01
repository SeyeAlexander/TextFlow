"use client";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { CodeNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";

import { EditorToolbar } from "./toolbar";
import { editorTheme } from "./theme";

const initialConfig = {
  namespace: "TextFlowEditor",
  theme: editorTheme,
  nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, CodeNode, LinkNode],
  onError: (error: Error) => {
    console.error("Lexical error:", error);
  },
};

export function Editor() {
  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className='relative flex flex-col h-full'>
        {/* Toolbar */}
        <EditorToolbar />

        {/* Editor area */}
        <div className='flex-1 overflow-auto'>
          <RichTextPlugin
            contentEditable={
              <ContentEditable className='min-h-[500px] outline-none px-8 py-6 prose prose-neutral dark:prose-invert max-w-none' />
            }
            placeholder={
              <div className='absolute top-[72px] left-8 text-muted-foreground pointer-events-none'>
                Start writing, or press &apos;/&apos; for commands...
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>

        {/* Plugins */}
        <HistoryPlugin />
        <ListPlugin />
        <LinkPlugin />
        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
      </div>
    </LexicalComposer>
  );
}
