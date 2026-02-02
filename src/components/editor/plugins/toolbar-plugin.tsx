"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { Undo, Redo, Heading1, Heading2, Bold, Italic, Strikethrough } from "lucide-react"; // Added extra utilities
import {
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
  FORMAT_TEXT_COMMAND,
} from "lexical";
import { useEffect, useState } from "react";
import { mergeRegister } from "@lexical/utils";

import { ShareDialog } from "@/components/dashboard/share-dialog";

export function ToolbarPlugin({ documentId }: { documentId?: string }) {
  const [editor] = useLexicalComposerContext();
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

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

  return (
    <div className='absolute top-4 right-4 z-20 flex items-center gap-1.5'>
      {documentId && (
        <div className='flex items-center rounded-lg border border-black/5 bg-white shadow-sm dark:border-white/5 dark:bg-[#1a1a1a]'>
          <ShareDialog documentId={documentId} documentName='Document' />
        </div>
      )}
      <div className='flex items-center gap-1 rounded-lg border border-black/5 bg-white p-1 shadow-sm dark:border-white/5 dark:bg-[#1a1a1a]'>
        <button
          onClick={() => {
            editor.dispatchCommand(UNDO_COMMAND, undefined);
          }}
          disabled={!canUndo}
          className='rounded-md p-2 transition-colors hover:bg-black/5 disabled:opacity-30 dark:hover:bg-white/5'
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
          className='rounded-md p-2 transition-colors hover:bg-black/5 disabled:opacity-30 dark:hover:bg-white/5'
          title='Redo (Cmd+Shift+Z)'
          aria-label='Redo'
        >
          <Redo className='size-4 text-muted-foreground' />
        </button>
      </div>
    </div>
  );
}
