"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_LOW,
  TextFormatType,
  $createParagraphNode,
} from "lexical";
import { $createHeadingNode, $isHeadingNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  $isListNode,
} from "@lexical/list";
import { mergeRegister } from "@lexical/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import * as ReactDOM from "react-dom";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Type,
  ChevronDown,
} from "lucide-react";

function ToolbarButton({
  icon: Icon,
  active,
  onClick,
  title,
}: {
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  onClick: () => void;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`rounded-md p-1.5 transition-colors ${
        active
          ? "bg-neutral-200 dark:bg-neutral-700 text-foreground"
          : "text-muted-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-foreground"
      }`}
    >
      <Icon className='size-4' />
    </button>
  );
}

const BLOCK_TYPES = [
  { id: "paragraph", label: "Normal", icon: Type },
  { id: "h1", label: "Heading 1", icon: Heading1 },
  { id: "h2", label: "Heading 2", icon: Heading2 },
  { id: "h3", label: "Heading 3", icon: Heading3 },
  { id: "bullet", label: "Bullet List", icon: List },
  { id: "number", label: "Numbered List", icon: ListOrdered },
];

export function FloatingToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isText, setIsText] = useState(false);
  const [isShow, setIsShow] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [blockType, setBlockType] = useState("paragraph");
  const [showBlockMenu, setShowBlockMenu] = useState(false);

  const toolbarRef = useRef<HTMLDivElement>(null);
  const blockMenuRef = useRef<HTMLDivElement>(null);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection) && !selection.isCollapsed()) {
      setIsText(true);
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
      setIsCode(selection.hasFormat("code"));

      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === "root" ? anchorNode : anchorNode.getTopLevelElementOrThrow();

      if ($isHeadingNode(element)) {
        setBlockType(element.getTag());
      } else if ($isListNode(element)) {
        const parentList = element.getParent();
        if ($isListNode(parentList)) {
          setBlockType(parentList.getListType() === "number" ? "number" : "bullet");
        } else {
          setBlockType(element.getListType() === "number" ? "number" : "bullet");
        }
      } else {
        setBlockType("paragraph");
      }

      const nativeSelection = window.getSelection();
      const rootElement = editor.getRootElement();
      if (
        nativeSelection !== null &&
        (!rootElement || rootElement.contains(nativeSelection.anchorNode))
      ) {
        const domRange = nativeSelection.getRangeAt(0);
        const rect = domRange.getBoundingClientRect();

        if (rect) {
          setPosition({
            top: rect.top - 50, // More space for menu
            left: rect.left + rect.width / 2,
          });
        }
      }
    } else {
      setIsText(false);
      setPosition(null);
      setShowBlockMenu(false);
    }
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload) => {
          updateToolbar();
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor, updateToolbar]);

  // Close block menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (blockMenuRef.current && !blockMenuRef.current.contains(event.target as Node)) {
        setShowBlockMenu(false);
      }
    }
    if (showBlockMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showBlockMenu]);

  useEffect(() => {
    if (isText) {
      const timer = setTimeout(() => {
        setIsShow(true);
      }, 200);
      return () => clearTimeout(timer);
    } else {
      setIsShow(false);
    }
  }, [isText]);

  const formatText = (format: TextFormatType) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  const formatBlock = (type: string) => {
    if (type === "paragraph") {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createParagraphNode());
        }
      });
    } else if (type === "h1") {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode("h1"));
        }
      });
    } else if (type === "h2") {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode("h2"));
        }
      });
    } else if (type === "h3") {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode("h3"));
        }
      });
    } else if (type === "bullet") {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else if (type === "number") {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    }
    setShowBlockMenu(false);
  };

  if (!isShow || !position) return null;

  const CurrentBlockIcon = BLOCK_TYPES.find((b) => b.id === blockType)?.icon || Type;

  return ReactDOM.createPortal(
    <div
      ref={toolbarRef}
      style={{
        top: position.top,
        left: position.left,
        transform: "translateX(-50%)",
      }}
      className='fixed z-50 flex items-center gap-1 rounded-lg border border-border bg-background p-1 shadow-md animate-in fade-in zoom-in-95'
      onMouseDown={(e) => e.preventDefault()}
    >
      {/* Block Type Selector */}
      <div className='relative' ref={blockMenuRef}>
        <button
          onClick={() => setShowBlockMenu(!showBlockMenu)}
          className='flex items-center gap-1 rounded-md p-1.5 text-muted-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-foreground'
        >
          <CurrentBlockIcon className='size-4' />
          <ChevronDown className='size-3 opacity-50' />
        </button>

        {showBlockMenu && (
          <div className='absolute left-0 top-full mt-2 w-40 flex flex-col gap-0.5 rounded-lg border border-border bg-popover p-1 shadow-md animate-in fade-in zoom-in-95 overflow-hidden'>
            {BLOCK_TYPES.map((block) => (
              <button
                key={block.id}
                onClick={() => formatBlock(block.id)}
                className={`flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-left ${
                  blockType === block.id
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                }`}
              >
                <block.icon className='size-4' />
                <span>{block.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className='h-4 w-px bg-border mx-1' />

      <ToolbarButton title='Bold' icon={Bold} active={isBold} onClick={() => formatText("bold")} />
      <ToolbarButton
        title='Italic'
        icon={Italic}
        active={isItalic}
        onClick={() => formatText("italic")}
      />
      <ToolbarButton
        title='Underline'
        icon={Underline}
        active={isUnderline}
        onClick={() => formatText("underline")}
      />
      <ToolbarButton
        title='Strikethrough'
        icon={Strikethrough}
        active={isStrikethrough}
        onClick={() => formatText("strikethrough")}
      />
      <div className='h-4 w-px bg-border mx-1' />
      <ToolbarButton title='Code' icon={Code} active={isCode} onClick={() => formatText("code")} />
    </div>,
    document.body,
  );
}
