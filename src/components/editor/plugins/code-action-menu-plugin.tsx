"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  $isNodeSelection,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_LOW,
  $getNodeByKey,
} from "lexical";
import { $isCodeNode, CodeNode } from "@lexical/code";
import { mergeRegister } from "@lexical/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import * as ReactDOM from "react-dom";
import { ChevronDown, Check } from "lucide-react";

export function CodeActionMenuPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isCode, setIsCode] = useState(false);
  const [codeNodeKey, setCodeNodeKey] = useState<string | null>(null);
  const [currentLang, setCurrentLang] = useState<string>("");
  const [position, setPosition] = useState<{ top: number; right: number } | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  const updateMenu = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === "root" ? anchorNode : anchorNode.getTopLevelElementOrThrow();
      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);

      if (elementDOM && $isCodeNode(element)) {
        setIsCode(true);
        setCodeNodeKey(elementKey);
        setCurrentLang(element.getLanguage() || "javascript");

        const rect = elementDOM.getBoundingClientRect();
        const rootElement = editor.getRootElement();

        if (rootElement) {
          const rootRect = rootElement.getBoundingClientRect();
          // Calculate absolute position within the scrollable container
          setPosition({
            top: rect.top - rootRect.top + 8, // Align to top of block with offset
            right: rootRect.width - (rect.right - rootRect.left) + 16, // Align to right edge
          });
        }
      } else {
        setIsCode(false);
        setCodeNodeKey(null);
        setShowMenu(false); // Close menu if we click away
      }
    }
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateMenu();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload) => {
          updateMenu();
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor, updateMenu]);

  const handleLanguageChange = (lang: string) => {
    editor.update(() => {
      if (codeNodeKey) {
        const node = $getNodeByKey(codeNodeKey);
        if ($isCodeNode(node)) {
          node.setLanguage(lang);
          setCurrentLang(lang);
          setShowMenu(false);
        }
      }
    });
  };

  // Custom limited list for cleaner UI as per user request
  const COMMON_LANGUAGES = [
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "python", label: "Python" },
    { value: "html", label: "HTML" },
    { value: "css", label: "CSS" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" },
    { value: "rust", label: "Rust" },
    { value: "go", label: "Go" },
    { value: "sql", label: "SQL" },
    { value: "markdown", label: "Markdown" },
    { value: "json", label: "JSON" },
    { value: "plain", label: "Plain Text" },
  ];

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  if (!isCode || !position) return null;

  return (
    <div
      ref={menuRef}
      style={{
        position: "absolute",
        top: position.top,
        right: position.right,
      }}
      className='z-50'
    >
      <div className='relative'>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className='flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-background text-muted-foreground hover:text-foreground border border-border rounded-md shadow-sm transition-colors'
        >
          {COMMON_LANGUAGES.find((l) => l.value === currentLang)?.label ||
            currentLang ||
            "Plain Text"}
          <ChevronDown className='size-3 opacity-50' />
        </button>

        {showMenu && (
          <div className='absolute right-0 top-full mt-1 w-40 max-h-60 overflow-y-auto rounded-lg border border-border bg-popover shadow-md animate-in fade-in zoom-in-95 p-1 flex flex-col gap-0.5'>
            {COMMON_LANGUAGES.map((lang) => (
              <button
                key={lang.value}
                onClick={() => handleLanguageChange(lang.value)}
                className={`flex items-center justify-between px-2 py-1.5 text-xs rounded-sm text-left ${currentLang === lang.value ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"}`}
              >
                {lang.label}
                {currentLang === lang.value && <Check className='size-3' />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
