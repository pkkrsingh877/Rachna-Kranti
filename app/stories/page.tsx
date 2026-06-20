'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Heart, MessageSquare } from 'lucide-react';
import { useContents } from '@/hooks/use-content';
import { Avatar } from '@/components/Avatar';

export default function Stories() {
  const router = useRouter();
  const { data, isLoading } = useContents({ type: 'story', limit: 50, sort: 'recent' });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const stories = data?.results || [];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Stories</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stories.length === 0 ? (
          <p className="text-muted-foreground col-span-full">No stories yet.</p>
        ) : (
          stories.map((story) => (
            <button
              key={story._id}
              onClick={() => router.push(`/content/${story._id}`)}
              className="border p-4 rounded-xl shadow-sm bg-card text-left hover:shadow-md transition-shadow"
            >
              <h2 className="text-lg font-semibold line-clamp-1 mb-2">{story.title}</h2>
              {story.authorId && (
                <div className="flex items-center gap-2 mb-2">
                  <Avatar src={story.authorId.image} name={story.authorId.name} size="sm" />
                  <span className="text-sm text-muted-foreground">{story.authorId.name}</span>
                </div>
              )}
              {story.excerpt && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{story.excerpt}</p>
              )}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Heart className="w-3 h-3" /> {story.likesCount}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" /> {story.commentsCount ?? 0}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
