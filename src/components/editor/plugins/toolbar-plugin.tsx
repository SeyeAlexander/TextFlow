"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { Undo, Redo } from "lucide-react";
import {
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import { useEffect, useState } from "react";
import { mergeRegister } from "@lexical/utils";
import { createPortal } from "react-dom";

export function ToolbarPlugin({ documentId }: { documentId?: string }) {
  const [editor] = useLexicalComposerContext();
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        1,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        1,
      ),
    );
  }, [editor]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const controls = (
    <div className='flex items-center gap-0.5'>
      <button
        onClick={() => {
          editor.dispatchCommand(UNDO_COMMAND, undefined);
        }}
        disabled={!canUndo}
        className='rounded-lg p-2 transition-colors hover:bg-black/5 disabled:opacity-30 dark:hover:bg-white/5'
        title='Undo (Cmd+Z)'
        aria-label='Undo'
      >
        <Undo className='size-4 text-muted-foreground' />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(REDO_COMMAND, undefined);
        }}
        disabled={!canRedo}
        className='rounded-lg p-2 transition-colors hover:bg-black/5 disabled:opacity-30 dark:hover:bg-white/5'
        title='Redo (Cmd+Shift+Z)'
        aria-label='Redo'
      >
        <Redo className='size-4 text-muted-foreground' />
      </button>
    </div>
  );

  if (!mounted) return null;
  const slot = document.getElementById("editor-undo-redo-slot");
  if (slot) {
    return createPortal(controls, slot);
  }
  return <div className='absolute top-4 right-4 z-20 flex items-center gap-1.5'>{controls}</div>;
}
