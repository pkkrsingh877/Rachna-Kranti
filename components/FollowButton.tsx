'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useFollowCheck, useToggleFollow } from '@/hooks/use-follows';
import { cn } from '@/lib/utils';

export default function FollowButton({ authorId }: { authorId: string }) {
  const { data: session } = useSession();
  const { data, isLoading } = useFollowCheck(authorId);
  const toggleFollow = useToggleFollow(authorId);

  if (!session?.user || authorId === 'self') return null;

  const following = data?.following ?? false;

  return (
    <button
      onClick={() => {
        if (!toggleFollow.isPending) {
          toggleFollow.mutate(following);
        }
      }}
      disabled={isLoading}
      className={cn(
        'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
        following
          ? 'bg-muted text-muted-foreground hover:bg-muted/80'
          : 'bg-brand-600 text-white hover:bg-brand-700'
      )}
    >
      {following ? 'Following' : 'Follow'}
    </button>
  );
}
