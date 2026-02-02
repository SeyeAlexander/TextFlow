"use client";

import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bell, Mail, FileText } from "lucide-react";
import { getNotifications, markAsRead, markAllAsRead } from "@/actions/notifications";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser } from "@/hooks/use-user";
import { useQuery } from "@tanstack/react-query";

interface InboxPopoverProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export function InboxPopover({ open, onOpenChange, children }: InboxPopoverProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  const isControlled = open !== undefined;
  const show = isControlled ? open : internalOpen;
  const setShow = isControlled ? onOpenChange : setInternalOpen;

  const { data: notifications = [], refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    enabled: !!user,
  });

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  // Realtime subscription
  useEffect(() => {
    if (!user) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `recipient_id=eq.${user.id}`,
        },
        () => {
          refetch();
          // Optional: Play sound
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refetch]);

  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
      refetch();
    }

    if (notification.type === "invite" && notification.data?.documentId) {
      router.push(`/dashboard/document/${notification.data.documentId}`);
      if (setShow) setShow(false);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    refetch();
  };

  return (
    <Popover open={show} onOpenChange={setShow}>
      <PopoverTrigger asChild>
        {children || (
          <Button variant='ghost' size='icon' className='relative'>
            <Bell className='size-4' />
            {unreadCount > 0 && (
              <span className='absolute top-2 right-2 size-2 rounded-full bg-red-500 animate-pulse' />
            )}
            <span className='sr-only'>Notifications</span>
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className='w-80 p-0' align='end' sideOffset={8}>
        <div className='flex items-center justify-between p-4 border-b'>
          <h4 className='font-semibold'>Inbox</h4>
          {unreadCount > 0 && (
            <Button
              variant='ghost'
              className='text-xs h-auto p-0 text-blue-500'
              onClick={handleMarkAllRead}
            >
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className='h-[300px]'>
          {notifications.length === 0 ? (
            <div className='flex flex-col items-center justify-center p-8 text-center text-muted-foreground'>
              <Mail className='size-8 mb-2 opacity-20' />
              <p className='text-sm'>No notifications yet</p>
            </div>
          ) : (
            <div className='grid'>
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`flex items-start gap-3 p-4 text-left border-b last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors ${
                    !notification.isRead ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                  }`}
                >
                  <div className='mt-1 size-8 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden shrink-0'>
                    {notification.senderAvatar ? (
                      <div className={`size-full bg-linear-to-br ${notification.senderAvatar}`} />
                    ) : (
                      <div className='flex h-full w-full items-center justify-center text-xs font-medium'>
                        {notification.senderName?.charAt(0) || "?"}
                      </div>
                    )}
                  </div>
                  <div className='grid gap-1'>
                    <p className='text-sm font-medium leading-none'>
                      {notification.senderName}
                      <span className='font-normal text-muted-foreground ml-1'>
                        invited you to edit
                      </span>
                    </p>
                    <div className='flex items-center gap-1 text-sm font-medium'>
                      <FileText className='size-3 text-blue-500' />
                      {(notification.data as any)?.documentName || "Untitled Document"}
                    </div>
                    <p className='text-xs text-muted-foreground mt-1'>
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <span className='mt-2 size-2 rounded-full bg-blue-500 shrink-0' />
                  )}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
