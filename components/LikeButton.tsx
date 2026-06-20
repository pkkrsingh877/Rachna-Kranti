'use client';

import React from 'react';
import { Heart } from 'lucide-react';
import { useLikeStatus, useToggleLike } from '@/hooks/use-likes';
import { cn } from '@/lib/utils';

export default function LikeButton({ contentId }: { contentId: string }) {
  const { data, isLoading } = useLikeStatus(contentId);
  const toggleLike = useToggleLike(contentId);

  const liked = data?.liked ?? false;
  const likesCount = data?.likesCount ?? 0;

  return (
    <button
      onClick={() => {
        if (!toggleLike.isLoading) {
          toggleLike.mutate(liked);
        }
      }}
      disabled={isLoading}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
        liked
          ? 'bg-rose-100 text-rose-600 hover:bg-rose-200'
          : 'bg-muted text-muted-foreground hover:bg-muted/80'
      )}
    >
      <Heart
        className={cn('w-4 h-4', liked && 'fill-current')}
      />
      {likesCount}
    </button>
  );
}
