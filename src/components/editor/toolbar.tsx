"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useCallback, useEffect, useState } from "react";
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
} from "lexical";
import { $setBlocksType } from "@lexical/selection";
import { $createHeadingNode, $createQuoteNode, HeadingTagType } from "@lexical/rich-text";
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from "@lexical/list";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Code,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  children: React.ReactNode;
  title: string;
}

function ToolbarButton({ onClick, isActive, children, title }: ToolbarButtonProps) {
  return (
    <Button
      variant='ghost'
      size='icon'
      onClick={onClick}
      title={title}
      className={`size-8 rounded-lg transition-colors ${
        isActive
          ? "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 hover:text-orange-500"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
    >
      {children}
    </Button>
  );
}

export function EditorToolbar() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);

  // Update toolbar state based on selection
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          setIsBold(selection.hasFormat("bold"));
          setIsItalic(selection.hasFormat("italic"));
          setIsUnderline(selection.hasFormat("underline"));
          setIsStrikethrough(selection.hasFormat("strikethrough"));
          setIsCode(selection.hasFormat("code"));
        }
      });
    });
  }, [editor]);

  const formatText = useCallback(
    (format: "bold" | "italic" | "underline" | "strikethrough" | "code") => {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
    },
    [editor],
  );

  const formatHeading = useCallback(
    (headingTag: HeadingTagType) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode(headingTag));
        }
      });
    },
    [editor],
  );

  const formatQuote = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode());
      }
    });
  }, [editor]);

  const formatBulletList = useCallback(() => {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
  }, [editor]);

  const formatNumberedList = useCallback(() => {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
  }, [editor]);

  const undo = useCallback(() => {
    editor.dispatchCommand(UNDO_COMMAND, undefined);
  }, [editor]);

  const redo = useCallback(() => {
    editor.dispatchCommand(REDO_COMMAND, undefined);
  }, [editor]);

  return (
    <div className='sticky top-0 z-10 flex items-center gap-1 px-4 py-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      {/* Undo/Redo */}
      <ToolbarButton onClick={undo} title='Undo (Ctrl+Z)'>
        <Undo className='size-4' />
      </ToolbarButton>
      <ToolbarButton onClick={redo} title='Redo (Ctrl+Shift+Z)'>
        <Redo className='size-4' />
      </ToolbarButton>

      <Separator orientation='vertical' className='mx-2 h-6' />

      {/* Headings */}
      <ToolbarButton onClick={() => formatHeading("h1")} title='Heading 1'>
        <Heading1 className='size-4' />
      </ToolbarButton>
      <ToolbarButton onClick={() => formatHeading("h2")} title='Heading 2'>
        <Heading2 className='size-4' />
      </ToolbarButton>
      <ToolbarButton onClick={() => formatHeading("h3")} title='Heading 3'>
        <Heading3 className='size-4' />
      </ToolbarButton>

      <Separator orientation='vertical' className='mx-2 h-6' />

      {/* Text formatting */}
      <ToolbarButton onClick={() => formatText("bold")} isActive={isBold} title='Bold (Ctrl+B)'>
        <Bold className='size-4' />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => formatText("italic")}
        isActive={isItalic}
        title='Italic (Ctrl+I)'
      >
        <Italic className='size-4' />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => formatText("underline")}
        isActive={isUnderline}
        title='Underline (Ctrl+U)'
      >
        <Underline className='size-4' />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => formatText("strikethrough")}
        isActive={isStrikethrough}
        title='Strikethrough'
      >
        <Strikethrough className='size-4' />
      </ToolbarButton>
      <ToolbarButton onClick={() => formatText("code")} isActive={isCode} title='Inline Code'>
        <Code className='size-4' />
      </ToolbarButton>

      <Separator orientation='vertical' className='mx-2 h-6' />

      {/* Lists */}
      <ToolbarButton onClick={formatBulletList} title='Bullet List'>
        <List className='size-4' />
      </ToolbarButton>
      <ToolbarButton onClick={formatNumberedList} title='Numbered List'>
        <ListOrdered className='size-4' />
      </ToolbarButton>
      <ToolbarButton onClick={formatQuote} title='Quote'>
        <Quote className='size-4' />
      </ToolbarButton>
    </div>
  );
}
