"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import {
  TextNode,
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  FORMAT_ELEMENT_COMMAND,
} from "lexical";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from "@lexical/list";
import { $createCodeNode } from "@lexical/code";
import { useCallback, useState, useMemo } from "react";
import * as ReactDOM from "react-dom";
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Type,
  CheckSquare,
} from "lucide-react";

class TypeaheadOption extends MenuOption {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords: string[];
  keyboardShortcut?: string;
  onSelect: (editor: any) => void;

  constructor(
    title: string,
    icon: React.ComponentType<{ className?: string }>,
    keywords: string[] = [],
    keyboardShortcut: string | undefined,
    onSelect: (editor: any) => void,
  ) {
    super(title);
    this.title = title;
    this.icon = icon;
    this.keywords = keywords || [];
    this.keyboardShortcut = keyboardShortcut;
    this.onSelect = onSelect;
  }
}

function TypeaheadMenuItem({
  index,
  isSelected,
  onClick,
  onMouseEnter,
  option,
}: {
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  option: TypeaheadOption;
}) {
  const Icon = option.icon;

  return (
    <li
      key={option.key}
      tabIndex={-1}
      className={`relative flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none transition-colors ${
        isSelected
          ? "bg-blue-500 text-accent-foreground"
          : "text-muted-foreground hover:bg-blue-500/50"
      }`}
      ref={option.setRefElement}
      role='option'
      aria-selected={isSelected}
      id={"typeahead-item-" + index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
    >
      <div className='flex size-8 items-center justify-center rounded-md border border-border bg-background'>
        <Icon className='size-4 text-foreground' />
      </div>
      <div className='flex flex-1 flex-col'>
        <span className='font-medium text-foreground'>{option.title}</span>
      </div>
      {option.keyboardShortcut && (
        <span className='ml-auto text-xs text-muted-foreground'>{option.keyboardShortcut}</span>
      )}
    </li>
  );
}

export function SlashCommandPlugin() {
  const [editor] = useLexicalComposerContext();
  const [queryString, setQueryString] = useState<string | null>(null);

  const checkForSlashTrigger = useBasicTypeaheadTriggerMatch("/", {
    minLength: 0,
  });

  const options = useMemo(() => {
    return [
      new TypeaheadOption("Text", Type, ["paragraph", "normal", "text"], undefined, (editor) => {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createParagraphNode());
          }
        });
      }),
      new TypeaheadOption("Heading 1", Heading1, ["h1", "large", "heading"], "#", (editor) => {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createHeadingNode("h1"));
          }
        });
      }),
      new TypeaheadOption("Heading 2", Heading2, ["h2", "medium", "heading"], "##", (editor) => {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createHeadingNode("h2"));
          }
        });
      }),
      new TypeaheadOption("Heading 3", Heading3, ["h3", "small", "heading"], "###", (editor) => {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createHeadingNode("h3"));
          }
        });
      }),
      new TypeaheadOption("Bullet List", List, ["bullet", "list", "unordered"], "-", (editor) => {
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
      }),
      new TypeaheadOption(
        "Numbered List",
        ListOrdered,
        ["numbered", "list", "ordered"],
        "1.",
        (editor) => {
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
        },
      ),
      new TypeaheadOption("Quote", Quote, ["quote", "citation", "blockquote"], ">", (editor) => {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createQuoteNode());
          }
        });
      }),
      new TypeaheadOption("Code Block", Code, ["code", "block", "snippet"], "```", (editor) => {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createCodeNode());
          }
        });
      }),
    ];
  }, []);

  const onSelectOption = useCallback(
    (
      selectedOption: TypeaheadOption,
      nodeToRemove: TextNode | null,
      closeMenu: () => void,
      matchingString: string,
    ) => {
      editor.update(() => {
        if (nodeToRemove) {
          nodeToRemove.remove();
        }
        selectedOption.onSelect(editor);
        closeMenu();
      });
    },
    [editor],
  );

  return (
    <LexicalTypeaheadMenuPlugin<TypeaheadOption>
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={checkForSlashTrigger}
      options={options}
      menuRenderFn={(
        anchorElementRef,
        { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex },
      ) => {
        if (anchorElementRef.current && options.length) {
          return ReactDOM.createPortal(
            <div className='fixed w-64 rounded-xl border border-border bg-popover p-1 shadow-md animate-in fade-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95 z-50 overflow-hidden'>
              <div className='text-xs font-medium text-muted-foreground px-2 py-1.5 mb-1'>
                Basic Blocks
              </div>
              <ul className='flex flex-col gap-0.5 max-h-[300px] overflow-y-auto'>
                {options.map((option, i) => (
                  <TypeaheadMenuItem
                    key={option.key}
                    index={i}
                    isSelected={selectedIndex === i}
                    onClick={() => {
                      setHighlightedIndex(i);
                      selectOptionAndCleanUp(option);
                    }}
                    onMouseEnter={() => {
                      setHighlightedIndex(i);
                    }}
                    option={option}
                  />
                ))}
              </ul>
            </div>,
            anchorElementRef.current,
          );
        }
        return null;
      }}
    />
  );
}
