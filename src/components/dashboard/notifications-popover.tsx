"use client";

import { motion } from "framer-motion";
import { Bell, Check, Inbox, MessageSquare, FileText, X, User } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotifications, markAsRead, markAllAsRead } from "@/actions/notifications";
import { toast } from "sonner";
import { useTextFlowStore } from "@/store/store";
import { useRouter } from "next/navigation";

interface NotificationsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsPopover({ isOpen, onClose }: NotificationsPopoverProps) {
  const queryClient = useQueryClient();
  const router = useRouter();

  // Fetch notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const data = await getNotifications();
      // Map server data to UI format
      return data.map((n: any) => ({
        id: n.id,
        type: n.type,
        user: {
          name: n.senderName || "Unknown User",
          avatarUrl: n.senderAvatar || null,
        },
        // content text based on type
        content:
          n.type === "message"
            ? "sent a message in"
            : n.type === "mention"
              ? "mentioned you in"
              : n.type === "comment"
                ? "commented on"
                : "shared a document",
        target: n.data?.documentName || "Document",
        documentId: n.data?.documentId || null,
        time: n.createdAt,
        read: n.isRead,
      }));
    },
  });

  const markReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      // Also invalidate sidebar to update badge if we were passing it there
      queryClient.invalidateQueries({ queryKey: ["sidebar"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["sidebar"] });
    },
  });

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markReadMutation.mutate(notification.id);
    }
    if (notification.documentId) {
      router.push(`/dashboard/document/${notification.documentId}`);
      if (notification.type === "message") {
        // Auto-open chat pane when clicking a message notification
        const { setChatOpen, setActiveChatDocument } = useTextFlowStore.getState();
        setActiveChatDocument(notification.documentId);
        setChatOpen(true);
      }
      onClose();
    }
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
              {notifications.filter((n: any) => !n.read).length}
            </span>
          </div>
          <div className='flex items-center gap-1'>
            <button
              onClick={() => markAllReadMutation.mutate()}
              className='p-1 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
              title='Mark all as read'
              disabled={markAllReadMutation.isPending}
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
              {notifications.map((notification: any) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full text-left p-3 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50 flex gap-3 ${
                    !notification.read ? "bg-blue-50/50 dark:bg-blue-500/5" : ""
                  }`}
                >
                  <div className='relative shrink-0'>
                    <div className='size-8 rounded-full overflow-hidden'>
                      {notification.user.avatarUrl &&
                      notification.user.avatarUrl.startsWith("http") ? (
                        <img
                          src={notification.user.avatarUrl}
                          alt={notification.user.name}
                          className='size-full object-cover'
                        />
                      ) : notification.user.avatarUrl ? (
                        <div
                          className={`size-full rounded-full bg-linear-to-br ${notification.user.avatarUrl}`}
                        />
                      ) : (
                        <div className='flex size-full items-center justify-center rounded-full bg-linear-to-br from-purple-500 to-blue-500'>
                          <User className='size-3.5 text-white' />
                        </div>
                      )}
                    </div>
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
                      {notification.type === "message" && (
                        <MessageSquare className='size-3 text-neutral-400' />
                      )}
                      {notification.type === "mention" && (
                        <MessageSquare className='size-3 text-neutral-400' />
                      )}
                      {(notification.type === "share" || notification.type === "invite") && (
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
