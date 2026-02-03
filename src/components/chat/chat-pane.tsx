"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { motion } from "framer-motion";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { useTextFlowStore } from "@/store/store";
import { Users, MessageCircle, X, Sparkles } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { createDocumentChat, getChatForDocument, getMessages, sendMessage } from "@/actions/chat";
import { updateUserAvatar } from "@/actions/user";
import { toast } from "sonner";
import { useUser } from "@/hooks/use-user";

// Gradient avatar options - 8 total
const AVATAR_OPTIONS = [
  { id: "gradient-1", gradient: "from-violet-500 to-purple-500" },
  { id: "gradient-2", gradient: "from-pink-500 to-rose-500" },
  { id: "gradient-3", gradient: "from-cyan-500 to-blue-500" },
  { id: "gradient-4", gradient: "from-emerald-500 to-teal-500" },
  { id: "gradient-5", gradient: "from-amber-500 to-orange-500" },
  { id: "gradient-6", gradient: "from-indigo-500 to-violet-500" },
  { id: "gradient-7", gradient: "from-rose-500 to-pink-500" },
  { id: "gradient-8", gradient: "from-teal-500 to-cyan-500" },
];

function AvatarSelectionScreen({ onSelect }: { onSelect: (gradient: string) => void }) {
  const [isPending, startTransition] = useTransition();

  const handleSelect = (gradient: string) => {
    startTransition(() => {
      onSelect(gradient);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='flex flex-col items-center justify-center h-full p-6 text-center'
    >
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className='flex size-14 items-center justify-center rounded-2xl mb-4'
      >
        <Sparkles className='size-10 text-blue-500' />
      </motion.div>

      <h3 className='text-lg font-semibold mb-2'>Start a Discussion</h3>
      <p className='text-sm text-muted-foreground mb-6 max-w-[240px]'>
        Collaborate with your team in real-time. Pick an avatar to join.
      </p>

      <p className='text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide'>
        Choose your avatar
      </p>
      <div className='flex flex-col gap-3 items-center'>
        <div className='flex gap-3'>
          {AVATAR_OPTIONS.slice(0, 5).map((avatar) => (
            <motion.button
              key={avatar.id}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelect(avatar.gradient)}
              className='relative group overflow-hidden rounded-full'
              disabled={isPending}
            >
              <div
                className={`size-11 rounded-full bg-linear-to-br ${avatar.gradient} animate-[spin_4s_linear_infinite] opacity-90 hover:opacity-100 transition-all`}
                style={{ filter: "blur(4px)" }}
              />
              <div
                className={`absolute inset-0 size-11 rounded-full bg-linear-to-br ${avatar.gradient} opacity-80`}
              />
            </motion.button>
          ))}
        </div>
        <div className='flex gap-3'>
          {AVATAR_OPTIONS.slice(5, 8).map((avatar) => (
            <motion.button
              key={avatar.id}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelect(avatar.gradient)}
              className='relative group overflow-hidden rounded-full'
              disabled={isPending}
            >
              <div
                className={`size-11 rounded-full bg-linear-to-br ${avatar.gradient} animate-[spin_4s_linear_infinite] opacity-90 hover:opacity-100 transition-all`}
                style={{ filter: "blur(4px)" }}
              />
              <div
                className={`absolute inset-0 size-11 rounded-full bg-linear-to-br ${avatar.gradient} opacity-80`}
              />
            </motion.button>
          ))}
        </div>
      </div>
      {isPending && (
        <p className='text-xs text-muted-foreground mt-4 animate-pulse'>
          Setting up your profile...
        </p>
      )}
    </motion.div>
  );
}

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
  const [hasAvatar, setHasAvatar] = useState(false);

  // Check if user already has avatar
  useEffect(() => {
    if (currentUser?.user_metadata?.avatar_url) {
      setHasAvatar(true);
    }
  }, [currentUser]);

  const handleAvatarSelect = async (gradient: string) => {
    if (!currentUser) return;

    // 1. Optimistic Update
    setHasAvatar(true);

    // 2. Server Update
    const result = await updateUserAvatar(gradient);
    if (result?.error) {
      toast.error("Failed to save avatar");
      setHasAvatar(false);
    }
  };

  // Initialize Chat
  useEffect(() => {
    if (!currentUser || !hasAvatar) return; // Only init chat if avatar is set

    const initChat = async () => {
      // Try to find existing document chat
      const existingChat = await getChatForDocument(documentId);

      if (existingChat) {
        setChatId(existingChat.id);
      } else {
        // Create if doesn't exist (and add current user)
        const result = await createDocumentChat(documentId, [currentUser.id]);
        if (result.success && result.chatId) {
          setChatId(result.chatId);
        }
      }
    };

    initChat();
  }, [currentUser, documentId, hasAvatar]);

  // Load Messages & Realtime
  useEffect(() => {
    if (!chatId) return;

    // Initial fetch
    getMessages(chatId).then(setMessages);

    // Poll for changes every 3 seconds (Robust fallback for Realtime)
    const intervalId = setInterval(async () => {
      const fresh = await getMessages(chatId);
      setMessages(fresh);
    }, 3000);

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
          const fresh = await getMessages(chatId);
          setMessages(fresh);
        },
      )
      .subscribe();

    return () => {
      clearInterval(intervalId);
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, hasAvatar]); // Scroll when avatar view changes too

  const handleSendMessage = async (content: string) => {
    if (!chatId || !currentUser) return;

    const tempId = Math.random().toString();
    const optimisticMsg = {
      id: tempId,
      content,
      createdAt: new Date(),
      senderId: currentUser.id,
      senderName: "You",
      senderAvatar: currentUser.user_metadata?.avatar_url,
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
            {hasAvatar && (
              <div className='flex items-center gap-1 text-[10px] text-muted-foreground'>
                <span className='size-1.5 rounded-full bg-green-500' />
                <span>Online</span>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className='rounded-lg p-1.5 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800'
        >
          <X className='size-4 text-muted-foreground' />
        </button>
      </div>

      {!hasAvatar ? (
        <AvatarSelectionScreen onSelect={handleAvatarSelect} />
      ) : (
        <>
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
                  const user = {
                    id: message.senderId,
                    name: message.senderName || "Unknown",
                    avatar: message.senderAvatar,
                    email: "",
                    color: "blue",
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
        </>
      )}
    </motion.div>
  );
}
