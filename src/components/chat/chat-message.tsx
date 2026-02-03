"use client";

import { formatRelativeTime } from "@/lib/utils";
import { User } from "@/store/store";
import React from "react";

interface ChatMessageProps {
  content: string;
  createdAt: Date;
  user: User;
  isCurrentUser?: boolean;
}

function ChatMessageBase({ content, createdAt, user, isCurrentUser = false }: ChatMessageProps) {
  return (
    <div className={`flex gap-3 ${isCurrentUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div className='shrink-0'>
        {user.avatar ? (
          <div className={`size-8 rounded-full bg-linear-to-br ${user.avatar}`} />
        ) : (
          <div className='flex size-8 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-800 text-xs font-medium'>
            {user.name.charAt(0)}
          </div>
        )}
      </div>

      {/* Message Content */}
      <div className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"} max-w-[75%]`}>
        <div className='flex items-center gap-2 mb-1'>
          <span className='text-xs font-medium text-foreground/80'>
            {isCurrentUser ? "You" : user.name}
          </span>
          <span className='text-[10px] text-muted-foreground'>{formatRelativeTime(createdAt)}</span>
        </div>
        <div
          className={`rounded-2xl px-3 py-2 text-sm ${
            isCurrentUser
              ? "bg-blue-500 text-white rounded-tr-sm"
              : "bg-neutral-100 dark:bg-neutral-800 rounded-tl-sm"
          }`}
        >
          {content}
        </div>
      </div>
    </div>
  );
}

export const ChatMessage = React.memo(ChatMessageBase);
