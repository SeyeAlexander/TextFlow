"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Send, Paperclip, Mic } from "lucide-react";

export function AIInputField() {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    // TODO: Handle AI query
    console.log("AI Query:", query);
    setQuery("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='mx-auto mb-8 mt-16 w-full max-w-2xl'
    >
      {/* Header */}
      <div className='mb-4 flex items-center justify-center gap-2'>
        <Sparkles className='size-5 text-muted-foreground' />
        <span className='text-sm font-medium text-muted-foreground'>Ask AI anything</span>
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit}>
        <div
          className={`relative rounded-2xl border bg-white transition-all dark:bg-[#0a0a0a] ${
            isFocused
              ? "border-neutral-300 shadow-lg dark:border-neutral-600"
              : "border-black/10 dark:border-white/10"
          }`}
        >
          {/* Main input */}
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder='Ask a question, get suggestions, or create something new...'
            className='h-32 w-full resize-none bg-transparent px-5 py-4 text-sm outline-none placeholder:text-muted-foreground'
            rows={4}
          />

          {/* Bottom bar */}
          <div className='flex items-center justify-between border-t border-black/5 px-4 py-3 dark:border-white/5'>
            <div className='flex items-center gap-2'>
              <button
                type='button'
                className='rounded-lg p-2 text-muted-foreground transition-colors hover:bg-black/5 dark:hover:bg-white/5'
                title='Attach file'
              >
                <Paperclip className='size-4' />
              </button>
              <button
                type='button'
                className='rounded-lg p-2 text-muted-foreground transition-colors hover:bg-black/5 dark:hover:bg-white/5'
                title='Voice input'
              >
                <Mic className='size-4' />
              </button>
            </div>

            <button
              type='submit'
              disabled={!query.trim()}
              className='flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-xs font-medium text-white transition-all hover:bg-neutral-800 disabled:opacity-40 disabled:hover:bg-neutral-900 dark:bg-white dark:text-black dark:hover:bg-neutral-200'
            >
              <Send className='size-3.5' />
              <span>Ask</span>
            </button>
          </div>
        </div>
      </form>

      {/* Suggestions */}
      <div className='mt-4 flex flex-wrap justify-center gap-2'>
        {["Summarize my notes", "Draft an email", "Create an outline"].map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => setQuery(suggestion)}
            className='rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-black/20 hover:text-foreground dark:border-white/10 dark:bg-[#0a0a0a] dark:hover:border-white/20'
          >
            {suggestion}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
