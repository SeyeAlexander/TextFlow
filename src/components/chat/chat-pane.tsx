"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { useTextFlowStore } from "@/store/store";
import { CURRENT_USER_ID } from "@/data/dummy-data";
import { Users, MessageCircle, X, Sparkles } from "lucide-react";

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

// Typing indicator component
interface TypingIndicatorProps {
  isCurrentUser?: boolean;
}

function TypingIndicator({ isCurrentUser = false }: TypingIndicatorProps) {
  return (
    <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex items-center gap-1 px-3 py-2 rounded-2xl ${
          isCurrentUser
            ? "bg-blue-500/10 rounded-tr-sm"
            : "bg-neutral-100 dark:bg-neutral-800 rounded-tl-sm"
        }`}
      >
        <div className='flex gap-1'>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className='size-1.5 rounded-full bg-blue-500'
              animate={{ y: [0, -4, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
        <span className='ml-1 text-xs text-muted-foreground'>typing...</span>
      </div>
    </div>
  );
}

// Avatar Selection Intro Screen
function AvatarSelectionScreen({ onSelect }: { onSelect: (avatarUrl: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='flex flex-col items-center justify-center h-full p-6 text-center'
    >
      {/* Icon */}
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

      {/* Welcome Text */}
      <h3 className='text-lg font-semibold mb-2'>Start a Discussion</h3>
      <p className='text-sm text-muted-foreground mb-6 max-w-[240px]'>
        Collaborate with your team in real-time. Discuss ideas, share feedback, and make decisions
        together.
      </p>

      {/* Avatar Selection */}
      <p className='text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide'>
        Choose your avatar
      </p>
      <div className='flex flex-col gap-3 items-center'>
        {/* Top row - 5 avatars */}
        <div className='flex gap-3'>
          {AVATAR_OPTIONS.slice(0, 5).map((avatar) => (
            <motion.button
              key={avatar.id}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(avatar.gradient)}
              className='relative group'
            >
              <div
                className={`size-11 rounded-full bg-gradient-to-br ${avatar.gradient} ring-2 ring-transparent hover:ring-blue-400 transition-all`}
              />
            </motion.button>
          ))}
        </div>
        {/* Bottom row - 3 avatars */}
        <div className='flex gap-3'>
          {AVATAR_OPTIONS.slice(5, 8).map((avatar) => (
            <motion.button
              key={avatar.id}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(avatar.gradient)}
              className='relative group'
            >
              <div
                className={`size-11 rounded-full bg-gradient-to-br ${avatar.gradient} ring-2 ring-transparent hover:ring-blue-400 transition-all`}
              />
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

interface ChatPaneProps {
  documentId: string;
  documentName: string;
  onClose: () => void;
}

export function ChatPane({ documentId, documentName, onClose }: ChatPaneProps) {
  const getMessagesByDocument = useTextFlowStore((s) => s.getMessagesByDocument);
  const getDocumentCollaborators = useTextFlowStore((s) => s.getDocumentCollaborators);
  const getUserById = useTextFlowStore((s) => s.getUserById);
  const sendMessage = useTextFlowStore((s) => s.sendMessage);

  const [hasSelectedAvatar, setHasSelectedAvatar] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = getMessagesByDocument(documentId);
  const collaborators = getDocumentCollaborators(documentId);

  // Get last message to determine typing indicator position
  const lastMessage = messages[messages.length - 1];
  const lastMessageIsCurrentUser = lastMessage?.userId === CURRENT_USER_ID;

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleAvatarSelect = (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);
    setHasSelectedAvatar(true);
  };

  const handleSendMessage = (content: string) => {
    sendMessage(documentId, CURRENT_USER_ID, content);
  };

  const handleTyping = (typing: boolean) => {
    setIsTyping(typing);
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
            <div className='flex items-center gap-1 text-[10px] text-muted-foreground'>
              <Users className='size-3' />
              <span>{collaborators.length + 1} participants</span>
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

      {/* Collaborator Avatars */}
      {hasSelectedAvatar && collaborators.length > 0 && (
        <div className='flex items-center gap-1 px-4 py-2 '>
          {selectedAvatar && (
            <div className='relative -mr-1' title='You'>
              <div
                className={`size-6 rounded-full bg-gradient-to-br ${selectedAvatar} ring-2 ring-white dark:ring-[#0A0A0A]`}
              />
              <div className='absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-green-500 ring-1 ring-white dark:ring-[#0A0A0A]' />
            </div>
          )}
          {collaborators.slice(0, 4).map((user) => (
            <div key={user.id} className='relative -ml-1' title={user.name}>
              {user.avatar ? (
                <div
                  className={`size-6 rounded-full bg-gradient-to-br ${user.avatar} ring-2 ring-white dark:ring-[#0A0A0A]`}
                />
              ) : (
                <div className='flex size-6 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700 text-[10px] font-medium ring-2 ring-white dark:ring-[#0A0A0A]'>
                  {user.name.charAt(0)}
                </div>
              )}
            </div>
          ))}
          {collaborators.length > 4 && (
            <div className='flex size-6 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-[10px] font-medium'>
              +{collaborators.length - 4}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      {!hasSelectedAvatar ? (
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
                <p className='text-xs text-muted-foreground/60'>Start the conversation!</p>
              </div>
            ) : (
              <>
                {messages.map((message) => {
                  const user = getUserById(message.userId);
                  if (!user) return null;
                  const isCurrentUser = message.userId === CURRENT_USER_ID;
                  return (
                    <ChatMessage
                      key={message.id}
                      content={message.content}
                      createdAt={message.createdAt}
                      user={
                        isCurrentUser && selectedAvatar ? { ...user, avatar: selectedAvatar } : user
                      }
                      isCurrentUser={isCurrentUser}
                    />
                  );
                })}
                {/* Typing indicator - positioned based on who's typing */}
                {isTyping && <TypingIndicator isCurrentUser={true} />}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <ChatInput
            onSend={handleSendMessage}
            onTypingChange={handleTyping}
            placeholder='Type a message...'
          />
        </>
      )}
    </motion.div>
  );
}
