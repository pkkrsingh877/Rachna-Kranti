'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useNotifications, useUnreadCount, useMarkAsRead } from '@/hooks/use-notifications';
import { Avatar } from '@/components/Avatar';
import { cn } from '@/lib/utils';

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function notificationLabel(type: string): string {
  switch (type) {
    case 'like': return 'liked your work';
    case 'comment': return 'commented on your work';
    case 'reply': return 'replied to your comment';
    case 'follow': return 'started following you';
    default: return 'interacted with you';
  }
}

export default function NotificationBell() {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data: notifications } = useNotifications();
  const { data: unreadCount } = useUnreadCount();
  const markAsRead = useMarkAsRead();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!session?.user) return null;

  const handleOpen = () => {
    setOpen(!open);
    if (!open && unreadCount && unreadCount > 0) {
      markAsRead.mutate(undefined);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount && unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-rose-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border bg-card shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b">
            <h3 className="text-sm font-semibold">Notifications</h3>
          </div>

          {!notifications || notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4 text-center">
              No notifications yet.
            </p>
          ) : (
            notifications.map((n) => (
              <button
                key={n._id}
                onClick={() => {
                  if (n.contentId) {
                    router.push(`/content/${n.contentId}`);
                  }
                  setOpen(false);
                }}
                className={cn(
                  'w-full flex items-start gap-3 p-3 text-left hover:bg-muted/50 transition-colors',
                  !n.read && 'bg-muted/30'
                )}
              >
                <Avatar
                  src={n.senderId?.image}
                  name={n.senderId?.name}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{n.senderId?.name ?? 'Someone'}</span>{' '}
                    {notificationLabel(n.type)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {timeAgo(n.createdAt)}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
