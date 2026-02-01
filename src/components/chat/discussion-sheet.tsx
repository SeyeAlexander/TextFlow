"use client";

import { useEffect, useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { useTextFlowStore } from "@/store/store";
import { CURRENT_USER_ID } from "@/data/dummy-data";
import { Users, MessageCircle } from "lucide-react";

export function DiscussionSheet() {
  const chatOpen = useTextFlowStore((s) => s.chatOpen);
  const setChatOpen = useTextFlowStore((s) => s.setChatOpen);
  const activeChatDocumentId = useTextFlowStore((s) => s.activeChatDocumentId);
  const getMessagesByDocument = useTextFlowStore((s) => s.getMessagesByDocument);
  const getDocumentCollaborators = useTextFlowStore((s) => s.getDocumentCollaborators);
  const getUserById = useTextFlowStore((s) => s.getUserById);
  const sendMessage = useTextFlowStore((s) => s.sendMessage);
  const files = useTextFlowStore((s) => s.files);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get current document
  const currentDocument = files.find((f) => f.id === activeChatDocumentId);
  const messages = activeChatDocumentId ? getMessagesByDocument(activeChatDocumentId) : [];
  const collaborators = activeChatDocumentId ? getDocumentCollaborators(activeChatDocumentId) : [];

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSendMessage = (content: string) => {
    if (!activeChatDocumentId) return;
    sendMessage(activeChatDocumentId, CURRENT_USER_ID, content);
  };

  return (
    <Sheet open={chatOpen} onOpenChange={setChatOpen}>
      <SheetContent
        side='right'
        className='w-[380px] p-0 flex flex-col bg-white dark:bg-[#0A0A0A] border-l border-neutral-200 dark:border-neutral-800'
      >
        {/* Header */}
        <SheetHeader className='p-4 border-b border-neutral-200 dark:border-neutral-800'>
          <div className='flex items-center gap-3'>
            <div className='flex size-9 items-center justify-center rounded-lg bg-orange-500/10'>
              <MessageCircle className='size-4 text-orange-500' />
            </div>
            <div className='flex-1 min-w-0'>
              <SheetTitle className='text-sm font-medium truncate'>
                {currentDocument?.name || "Discussion"}
              </SheetTitle>
              <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                <Users className='size-3' />
                <span>{collaborators.length + 1} participants</span>
              </div>
            </div>
          </div>

          {/* Collaborator Avatars */}
          {collaborators.length > 0 && (
            <div className='flex items-center gap-1 mt-3'>
              {collaborators.slice(0, 5).map((user) => (
                <div key={user.id} className='relative group' title={user.name}>
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className='size-7 rounded-full ring-2 ring-white dark:ring-[#0A0A0A]'
                    />
                  ) : (
                    <div className='flex size-7 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700 text-xs font-medium ring-2 ring-white dark:ring-[#0A0A0A]'>
                      {user.name.charAt(0)}
                    </div>
                  )}
                </div>
              ))}
              {collaborators.length > 5 && (
                <div className='flex size-7 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-medium'>
                  +{collaborators.length - 5}
                </div>
              )}
            </div>
          )}
        </SheetHeader>

        {/* Messages */}
        <div className='flex-1 overflow-y-auto p-4 space-y-4'>
          {messages.length === 0 ? (
            <div className='flex flex-col items-center justify-center h-full text-center'>
              <div className='flex size-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 mb-3'>
                <MessageCircle className='size-5 text-muted-foreground' />
              </div>
              <p className='text-sm font-medium'>No messages yet</p>
              <p className='text-xs text-muted-foreground mt-1'>Start the conversation!</p>
            </div>
          ) : (
            <>
              {messages.map((message) => {
                const user = getUserById(message.userId);
                if (!user) return null;
                return (
                  <ChatMessage
                    key={message.id}
                    content={message.content}
                    createdAt={message.createdAt}
                    user={user}
                    isCurrentUser={message.userId === CURRENT_USER_ID}
                  />
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <ChatInput
          onSend={handleSendMessage}
          placeholder='Type a message...'
          disabled={!activeChatDocumentId}
        />
      </SheetContent>
    </Sheet>
  );
}
