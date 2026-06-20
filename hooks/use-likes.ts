import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';

export function useLikeStatus(contentId: string) {
  return useQuery({
    queryKey: queryKeys.likes.status(contentId),
    queryFn: async () => {
      const res = await fetch(`/api/content/${contentId}/like`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to fetch like status');
      }
      return res.json() as Promise<{ liked: boolean; likesCount: number }>;
    },
    enabled: !!contentId,
  });
}

export function useToggleLike(contentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (liked: boolean) => {
      const res = await fetch(`/api/content/${contentId}/like`, {
        method: liked ? 'DELETE' : 'POST',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to toggle like');
      }
      return res.json() as Promise<{ liked: boolean; likesCount: number }>;
    },
    onMutate: async (liked) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.likes.status(contentId) });
      const previous = queryClient.getQueryData<{ liked: boolean; likesCount: number }>(
        queryKeys.likes.status(contentId)
      );
      queryClient.setQueryData(queryKeys.likes.status(contentId), {
        liked: !liked,
        likesCount: (previous?.likesCount ?? 0) + (liked ? -1 : 1),
      });
      return { previous };
    },
    onError: (_err, _liked, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.likes.status(contentId), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.likes.status(contentId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.content.detail(contentId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.content.list() });
    },
  });
}
