'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Heart, MessageSquare } from 'lucide-react';
import { useContents } from '@/hooks/use-content';
import { Avatar } from '@/components/Avatar';
import PageContainer from '@/components/layout/PageContainer';

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
    <PageContainer className="py-8 md:py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Stories</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {stories.length === 0 ? (
          <p className="text-muted-foreground col-span-full text-center py-16">No stories yet.</p>
        ) : (
          stories.map((story) => (
            <button
              key={story._id}
              onClick={() => router.push(`/content/${story._id}`)}
              className="group flex flex-col border border-border rounded-xl bg-card p-5 text-left transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            >
              <h2 className="text-base font-semibold line-clamp-2 group-hover:text-brand-600 transition-colors mb-3">
                {story.title}
              </h2>
              {(story.authorId || story.excerpt) && (
                <div className="space-y-2 mb-3">
                  {story.authorId && (
                    <div className="flex items-center gap-2">
                      <Avatar src={story.authorId.image} name={story.authorId.name} size="sm" />
                      <span className="text-sm text-muted-foreground">{story.authorId.name}</span>
                    </div>
                  )}
                  {story.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{story.excerpt}</p>
                  )}
                </div>
              )}
              <div className="flex items-center gap-3 mt-auto text-xs text-muted-foreground pt-2">
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
    </PageContainer>
  );
}
