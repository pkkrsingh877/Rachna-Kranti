import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import type { UserItem } from '@/lib/api-types';

export function useFollowCheck(targetUserId: string) {
  return useQuery({
    queryKey: queryKeys.follows.check(targetUserId),
    queryFn: async () => {
      const res = await fetch(`/api/users/${targetUserId}/follow`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to fetch follow status');
      }
      return res.json() as Promise<{ following: boolean }>;
    },
    enabled: !!targetUserId,
  });
}

export function useFollowers(userId: string) {
  return useQuery({
    queryKey: queryKeys.follows.followers(userId),
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}/followers`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to fetch followers');
      }
      return res.json() as Promise<UserItem[]>;
    },
    enabled: !!userId,
  });
}

export function useFollowing(userId: string) {
  return useQuery({
    queryKey: queryKeys.follows.following(userId),
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}/following`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to fetch following');
      }
      return res.json() as Promise<UserItem[]>;
    },
    enabled: !!userId,
  });
}

export function useToggleFollow(targetUserId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (following: boolean) => {
      const res = await fetch(`/api/users/${targetUserId}/follow`, {
        method: following ? 'DELETE' : 'POST',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to toggle follow');
      }
      return res.json() as Promise<{ following: boolean }>;
    },
    onMutate: async (following) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.follows.check(targetUserId) });
      const previous = queryClient.getQueryData<{ following: boolean }>(
        queryKeys.follows.check(targetUserId)
      );
      queryClient.setQueryData(queryKeys.follows.check(targetUserId), {
        following: !following,
      });
      return { previous };
    },
    onError: (_err, _following, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.follows.check(targetUserId), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.follows.check(targetUserId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.follows.followers(targetUserId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.follows.following(targetUserId) });
    },
  });
}
