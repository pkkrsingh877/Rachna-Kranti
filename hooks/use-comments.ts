import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import type { CommentItem } from '@/lib/api-types';

export function useComments(contentId: string) {
  return useQuery({
    queryKey: queryKeys.comments.list(contentId),
    queryFn: async () => {
      const res = await fetch(`/api/content/${contentId}/comments`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to fetch comments');
      }
      return res.json() as Promise<CommentItem[]>;
    },
    enabled: !!contentId,
  });
}

export function useCreateComment(contentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { text: string; parentId?: string }) => {
      const res = await fetch(`/api/content/${contentId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to post comment');
      }
      return res.json() as Promise<CommentItem>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.list(contentId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.content.detail(contentId) });
    },
  });
}

export function useDeleteComment(contentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: string) => {
      const res = await fetch(`/api/content/${contentId}/comments/${commentId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete comment');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.list(contentId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.content.detail(contentId) });
    },
  });
}
