"use client";

import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { motion } from "framer-motion";

interface ChatInputProps {
  onSend: (content: string) => void;
  onTypingChange?: (isTyping: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ChatInput({
  onSend,
  onTypingChange,
  placeholder = "Type a message...",
  disabled = false,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSend = () => {
    if (!message.trim() || disabled) return;
    onSend(message.trim());
    setMessage("");
    onTypingChange?.(false);
    inputRef.current?.focus();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);

    // Handle typing indicator
    if (e.target.value.trim()) {
      onTypingChange?.(true);

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop typing after 1.5s of no input
      typingTimeoutRef.current = setTimeout(() => {
        onTypingChange?.(false);
      }, 1500);
    } else {
      onTypingChange?.(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className='flex items-center gap-2 p-3 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0A0A0A]'>
      <input
        ref={inputRef}
        type='text'
        value={message}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className='flex-1 rounded-full border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 px-4 py-2 text-sm outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors placeholder:text-muted-foreground disabled:opacity-50'
      />
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleSend}
        disabled={!message.trim() || disabled}
        className='flex size-9 items-center justify-center rounded-full bg-blue-500 text-white transition-opacity hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed'
      >
        <Send className='size-4' />
      </motion.button>
    </div>
  );
}
