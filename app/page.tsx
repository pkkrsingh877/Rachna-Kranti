'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Heart, MessageSquare } from 'lucide-react';
import { useContents } from '@/hooks/use-content';
import { Avatar } from '@/components/Avatar';
import PageContainer from '@/components/layout/PageContainer';

export default function Home() {
  const router = useRouter();
  const { data: poems } = useContents({ type: 'poem', limit: 6, sort: 'recent' });
  const { data: stories } = useContents({ type: 'story', limit: 6, sort: 'recent' });
  const { data: dramas } = useContents({ type: 'drama', limit: 6, sort: 'recent' });

  const Section = ({
    title,
    contents,
  }: {
    title: string;
    contents?: { _id: string; title: string; authorId?: { name: string; image?: string }; excerpt?: string; likesCount: number; commentsCount: number }[];
  }) => (
    <PageContainer>
      <h1 className="text-2xl font-bold mb-4">Featured {title}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {!contents || contents.length === 0 ? (
          <p className="text-muted-foreground col-span-full">No {title.toLowerCase()} yet.</p>
        ) : (
          contents.map((content) => (
            <button
              key={content._id}
              onClick={() => router.push(`/content/${content._id}`)}
              className="border p-4 rounded-xl shadow-sm bg-card text-left hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-lg font-semibold line-clamp-1">{content.title}</h2>
              </div>
              {content.authorId && (
                <div className="flex items-center gap-2 mb-2">
                  <Avatar src={content.authorId.image} name={content.authorId.name} size="sm" />
                  <span className="text-sm text-muted-foreground">{content.authorId.name}</span>
                </div>
              )}
              {content.excerpt && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{content.excerpt}</p>
              )}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Heart className="w-3 h-3" /> {content.likesCount}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" /> {content.commentsCount ?? 0}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </PageContainer>
  );

  return (
    <>
      <Section title="Poems" contents={poems?.results} />
      <Section title="Stories" contents={stories?.results} />
      <Section title="Dramas" contents={dramas?.results} />
    </>
  );
}
