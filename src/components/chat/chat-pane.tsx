"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { motion } from "framer-motion";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { useTextFlowStore } from "@/store/store";
import { Users, MessageCircle, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { createChat, getChats, getMessages, sendMessage } from "@/actions/chat";
import { toast } from "sonner";
import { useUser } from "@/hooks/use-user";

interface ChatPaneProps {
  documentId: string;
  documentName: string;
  onClose: () => void;
}

export function ChatPane({ documentId, documentName, onClose }: ChatPaneProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();
  const { user: currentUser } = useUser();

  // Initialize Chat
  useEffect(() => {
    if (!currentUser) return;

    const initChat = async () => {
      // For now, we try to find a chat with name 'doc:{id}' or create one with just self
      // Ideally, we'd add all collaborators.
      const chatName = `doc:${documentId}`;

      // Fetch user chats and look for one with this name
      const chats = await getChats();
      let targetChat = chats.find((c) => c.name === chatName);

      if (!targetChat) {
        // Create new
        const result = await createChat([currentUser.id]); // Just self for now as 'Notes'
        if (result.success && result.chatId) {
          setChatId(result.chatId);
          // Updating name is tricky as createChat sets generic name.
          // We should ideally pass name to createChat or update it immediately.
          // But for this prototype, we'll accept 'dm' or 'New Group'.
          // Actually, let's just use the ID we got.
        }
      } else {
        setChatId(targetChat.id);
      }
    };

    initChat();
  }, [currentUser, documentId]);

  // Load Messages & Realtime
  useEffect(() => {
    if (!chatId) return;

    // Load initial
    getMessages(chatId).then(setMessages);

    // Subscribe
    const supabase = createClient();
    const channel = supabase
      .channel(`chat:${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        async (payload) => {
          // Fetch the new message details (need sender info)
          // For optimization, we could just optimistically add if we knew the sender,
          // but payload only has IDs.
          const newMsg = payload.new;
          // In a real app, we'd fetch the single message or sender profile.
          // For now, re-fetch all is safe but inefficient.
          // Better: append payload and placeholder sender until revalidation.
          const fresh = await getMessages(chatId);
          setMessages(fresh);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSendMessage = async (content: string) => {
    if (!chatId || !currentUser) return;

    // Optimistic Update
    const tempId = Math.random().toString();
    const optimisticMsg = {
      id: tempId,
      content,
      createdAt: new Date(),
      senderId: currentUser.id,
      senderName: "You",
      senderAvatar: null,
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    startTransition(async () => {
      const result = await sendMessage(chatId, content);
      if (result?.error) {
        toast.error("Failed to send");
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      }
    });
  };

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 340, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className='flex flex-col h-full bg-white dark:bg-[#0A0A0A] rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800'
    >
      {/* Header */}
      <div className='flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800'>
        <div className='flex items-center gap-3'>
          <div className='flex size-8 items-center justify-center rounded-lg '>
            <MessageCircle className='size-4 text-orange-500' />
          </div>
          <div className='min-w-0'>
            <h3 className='text-sm font-medium truncate'>{documentName}</h3>
            {/* Simple status */}
            <div className='flex items-center gap-1 text-[10px] text-muted-foreground'>
              <span className='size-1.5 rounded-full bg-green-500' />
              <span>Online</span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className='rounded-lg p-1.5 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800'
        >
          <X className='size-4 text-muted-foreground' />
        </button>
      </div>

      {/* Messages */}
      <div className='flex-1 overflow-y-auto p-4 space-y-3'>
        {messages.length === 0 ? (
          <div className='flex flex-col items-center justify-center h-full text-center'>
            <div className='flex size-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 mb-3'>
              <MessageCircle className='size-4 text-muted-foreground' />
            </div>
            <p className='text-sm text-muted-foreground'>No messages yet</p>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isCurrentUser = message.senderId === currentUser?.id;
              // Map backend message to UI props
              const user = {
                id: message.senderId,
                name: message.senderName || "Unknown",
                avatar: message.senderAvatar,
                email: "",
                color: "blue", // Fallback
              };

              return (
                <ChatMessage
                  key={message.id}
                  content={message.content}
                  createdAt={new Date(message.createdAt)}
                  user={user as any}
                  isCurrentUser={isCurrentUser}
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
        onTypingChange={setIsTyping}
        placeholder='Type a message...'
        disabled={!chatId}
      />
    </motion.div>
  );
}
