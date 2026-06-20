import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import type { NotificationItem } from '@/lib/api-types';

export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications.list,
    queryFn: async () => {
      const res = await fetch('/api/notifications');
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to fetch notifications');
      }
      return res.json() as Promise<NotificationItem[]>;
    },
    refetchInterval: 30000,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount,
    queryFn: async () => {
      const res = await fetch('/api/notifications?unread=true');
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to fetch unread count');
      }
      const data = await res.json() as { count: number };
      return data.count;
    },
    refetchInterval: 30000,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId?: string) => {
      const body = notificationId ? { id: notificationId } : {};
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to mark as read');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}
