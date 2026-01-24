"use client";

import { useEffect } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import type { EditorState } from "lexical";

const theme = {
  paragraph: "mb-2",
  text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
    strikethrough: "line-through",
  },
};

function onError(error: Error) {
  console.error("Lexical error:", error);
}

// Auto-focus plugin
function AutoFocusPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.focus();
  }, [editor]);

  return null;
}

// Placeholder component
function Placeholder({ text }: { text: string }) {
  return (
    <div className='absolute top-0 left-0 text-muted-foreground pointer-events-none text-lg'>
      {text}
    </div>
  );
}

interface EditorShellProps {
  placeholder?: string;
  onChange?: (editorState: EditorState) => void;
}

export function EditorShell({
  placeholder = "Start typing, or press / for commands...",
  onChange,
}: EditorShellProps) {
  const initialConfig = {
    namespace: "TextFlowEditor",
    theme,
    onError,
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className='relative'>
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className='min-h-[200px] outline-none text-lg leading-relaxed'
              aria-placeholder={placeholder}
              placeholder={<Placeholder text={placeholder} />}
            />
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <AutoFocusPlugin />
        {onChange && (
          <OnChangePlugin
            onChange={(editorState) => {
              onChange(editorState);
            }}
          />
        )}
      </div>
    </LexicalComposer>
  );
}
