"use client";

import { useEffect, useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { useTextFlowStore } from "@/store/store";
import { useUser } from "@/hooks/use-user";
import { Users, MessageCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchDocumentById } from "@/actions/data";

import { getMessages, sendMessage as sendMessageAction, getChatForDocument } from "@/actions/chat";
import { createClient } from "@/utils/supabase/client";
import { updateUserAvatar } from "@/actions/user";
import { toast } from "sonner";
import { AVATAR_GRADIENTS } from "@/lib/avatars";

export function DiscussionSheet() {
  const { user: currentUser } = useUser();
  const chatOpen = useTextFlowStore((s) => s.chatOpen);
  const setChatOpen = useTextFlowStore((s) => s.setChatOpen);
  const activeChatDocumentId = useTextFlowStore((s) => s.activeChatDocumentId);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Chat Info for the document
  const { data: chat } = useQuery({
    queryKey: ["chat", activeChatDocumentId],
    queryFn: () => (activeChatDocumentId ? getChatForDocument(activeChatDocumentId) : null),
    enabled: !!activeChatDocumentId,
  });

  // 2. Fetch Messages for the chat
  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ["messages", chat?.id],
    queryFn: () => (chat?.id ? getMessages(chat.id) : []),
    enabled: !!chat?.id,
  });

  const { data: currentDocument } = useQuery({
    queryKey: ["document", activeChatDocumentId],
    queryFn: () => (activeChatDocumentId ? fetchDocumentById(activeChatDocumentId) : null),
    enabled: !!activeChatDocumentId,
  });

  // 3. Realtime subscription for new messages
  useEffect(() => {
    if (!chat?.id) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`chat:${chat.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chat.id}`,
        },
        () => {
          refetchMessages();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chat?.id, refetchMessages]);

  const collaborators = (chat as any)?.participants || [];

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSendMessage = async (content: string) => {
    if (!chat?.id || !currentUser) return;
    await sendMessageAction(chat.id, content);
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
            <div className='flex-1 min-w-0 text-left'>
              <SheetTitle className='text-sm font-medium truncate'>
                {currentDocument?.name || "Discussion"}
              </SheetTitle>
              <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                <Users className='size-3' />
                <span>{collaborators.length > 0 ? collaborators.length : 1} participants</span>
              </div>
            </div>
          </div>

          {/* Collaborator Avatars */}
          {collaborators.length > 0 && (
            <div className='flex items-center gap-1 mt-3'>
              {collaborators.slice(0, 5).map((user: any) => (
                <div key={user.id} className='relative group' title={user.fullName}>
                  {user.avatarUrl ? (
                    <div
                      className={`size-7 rounded-full ring-2 ring-white dark:ring-[#0A0A0A] bg-linear-to-br ${user.avatarUrl}`}
                    />
                  ) : (
                    <div className='flex size-7 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700 text-xs font-medium ring-2 ring-white dark:ring-[#0A0A0A]'>
                      {user.fullName?.charAt(0) || user.email?.charAt(0)}
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
          {currentUser && !currentUser.user_metadata?.avatar_url && (
            <div className='mb-6 rounded-xl border border-orange-500/20 bg-orange-500/5 p-4'>
              <p className='mb-3 text-xs font-medium text-orange-600 dark:text-orange-400'>
                Choose your avatar to start chatting
              </p>
              <div className='grid grid-cols-4 gap-2'>
                {AVATAR_GRADIENTS.map((gradient) => (
                  <button
                    key={gradient}
                    onClick={async () => {
                      try {
                        await updateUserAvatar(gradient);
                        toast.success("Avatar updated!");
                      } catch (e) {
                        toast.error("Failed to update avatar");
                      }
                    }}
                    className={`size-8 rounded-full bg-linear-to-br transition-transform hover:scale-110 active:scale-95 ${gradient}`}
                  />
                ))}
              </div>
            </div>
          )}

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
              {messages.map((message: any) => {
                const user = {
                  id: message.senderId,
                  name: message.senderName || "Unknown",
                  avatar: message.senderAvatar,
                  email: "", // Added for type compliance
                };
                return (
                  <ChatMessage
                    key={message.id}
                    content={message.content}
                    createdAt={message.createdAt}
                    user={user}
                    isCurrentUser={message.senderId === currentUser?.id}
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
          disabled={!activeChatDocumentId || !chat}
        />
      </SheetContent>
    </Sheet>
  );
}
