"use client";

import { motion } from "framer-motion";
import { Bell, Check, Inbox, MessageSquare, FileText, X } from "lucide-react";
import { useState } from "react";
import { formatRelativeTime } from "@/data/dummy-data";

// Dummy notification data
const DUMMY_NOTIFICATIONS = [
  {
    id: "1",
    type: "mention",
    user: { name: "Sarah Chen", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" },
    content: "mentioned you in",
    target: "Project Roadmap",
    time: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
    read: false,
  },
  {
    id: "2",
    type: "comment",
    user: { name: "Mike Ross", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike" },
    content: "commented on",
    target: "Q4 Financials",
    time: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false,
  },
  {
    id: "3",
    type: "share",
    user: { name: "Alex Kim", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" },
    content: "shared a document",
    target: "Design System",
    time: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
  },
];

interface NotificationsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsPopover({ isOpen, onClose }: NotificationsPopoverProps) {
  const [notifications, setNotifications] = useState(DUMMY_NOTIFICATIONS);

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  if (!isOpen) return null;

  return (
    <>
      <div className='fixed inset-0 z-40' onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, x: -20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.95, x: -20 }}
        className='fixed left-60 top-72 z-50 w-80 rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-[#1a1a1a] overflow-hidden'
      >
        <div className='flex items-center justify-between p-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50'>
          <div className='flex items-center gap-2'>
            <Inbox className='size-4 text-blue-500' />
            <h3 className='text-sm font-medium'>Inbox</h3>
            <span className='flex size-5 items-center justify-center rounded-full bg-blue-500/10 text-[10px] font-medium text-blue-500'>
              {notifications.filter((n) => !n.read).length}
            </span>
          </div>
          <div className='flex items-center gap-1'>
            <button
              onClick={markAllRead}
              className='p-1 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
              title='Mark all as read'
            >
              <Check className='size-4' />
            </button>
            <button
              onClick={onClose}
              className='p-1 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
            >
              <X className='size-4' />
            </button>
          </div>
        </div>

        <div className='max-h-[400px] overflow-y-auto'>
          {notifications.length === 0 ? (
            <div className='flex flex-col items-center justify-center p-8 text-center text-neutral-500'>
              <Bell className='size-8 mb-2 opacity-50' />
              <p className='text-sm'>No notifications</p>
            </div>
          ) : (
            <div className='divide-y divide-neutral-100 dark:divide-neutral-800'>
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => markRead(notification.id)}
                  className={`w-full text-left p-3 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50 flex gap-3 ${
                    !notification.read ? "bg-blue-50/50 dark:bg-blue-500/5" : ""
                  }`}
                >
                  <div className='relative shrink-0'>
                    <img
                      src={notification.user.avatar}
                      alt={notification.user.name}
                      className='size-8 rounded-full bg-neutral-200 dark:bg-neutral-700'
                    />
                    {!notification.read && (
                      <div className='absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-blue-500 ring-2 ring-white dark:ring-[#1a1a1a]' />
                    )}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-xs leading-relaxed'>
                      <span className='font-medium text-neutral-900 dark:text-neutral-100'>
                        {notification.user.name}
                      </span>{" "}
                      <span className='text-neutral-500 dark:text-neutral-400'>
                        {notification.content}
                      </span>{" "}
                      <span className='font-medium text-blue-500'>{notification.target}</span>
                    </p>
                    <div className='flex items-center gap-1 mt-1'>
                      {notification.type === "mention" && (
                        <MessageSquare className='size-3 text-neutral-400' />
                      )}
                      {notification.type === "share" && (
                        <FileText className='size-3 text-neutral-400' />
                      )}
                      <span className='text-[10px] text-neutral-400'>
                        {formatRelativeTime(notification.time)}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
