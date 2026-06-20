'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Heart, MessageSquare } from 'lucide-react';
import { useContents } from '@/hooks/use-content';
import { Avatar } from '@/components/Avatar';
import PageContainer from '@/components/layout/PageContainer';

export default function Poems() {
  const router = useRouter();
  const { data, isLoading } = useContents({ type: 'poem', limit: 50, sort: 'recent' });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const poems = data?.results || [];

  return (
    <PageContainer>
      <h1 className="text-2xl font-bold mb-6">Poems</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {poems.length === 0 ? (
          <p className="text-muted-foreground col-span-full">No poems yet.</p>
        ) : (
          poems.map((poem) => (
            <button
              key={poem._id}
              onClick={() => router.push(`/content/${poem._id}`)}
              className="border p-4 rounded-xl shadow-sm bg-card text-left hover:shadow-md transition-shadow"
            >
              <h2 className="text-lg font-semibold line-clamp-1 mb-2">{poem.title}</h2>
              {poem.authorId && (
                <div className="flex items-center gap-2 mb-2">
                  <Avatar src={poem.authorId.image} name={poem.authorId.name} size="sm" />
                  <span className="text-sm text-muted-foreground">{poem.authorId.name}</span>
                </div>
              )}
              {poem.excerpt && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{poem.excerpt}</p>
              )}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Heart className="w-3 h-3" /> {poem.likesCount}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" /> {poem.commentsCount ?? 0}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </PageContainer>
  );
}
