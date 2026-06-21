'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Heart, MessageSquare, PenLine, BookOpen, Drama, Sparkles, ArrowRight } from 'lucide-react';
import { useContents } from '@/hooks/use-content';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/Avatar';
import PageContainer from '@/components/layout/PageContainer';

const contentTypeMeta = {
  poem: { icon: PenLine, gradient: 'from-brand-600/20 to-transparent', badge: 'Poem' },
  story: { icon: BookOpen, gradient: 'from-secondary/20 to-transparent', badge: 'Story' },
  drama: { icon: Drama, gradient: 'from-amber-500/20 to-transparent', badge: 'Drama' },
} as const;

function ContentCard({
  content,
  type,
}: {
  content: { _id: string; title: string; authorId?: { name: string; image?: string }; excerpt?: string; likesCount: number; commentsCount: number };
  type: keyof typeof contentTypeMeta;
}) {
  const router = useRouter();
  const meta = contentTypeMeta[type];

  return (
    <button
      onClick={() => router.push(`/content/${content._id}`)}
      className="group relative flex flex-col rounded-xl border border-border bg-card text-left overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
    >
      <div className={`h-1.5 w-full bg-gradient-to-r ${meta.gradient}`} />
      <div className="flex flex-col p-5 gap-3 flex-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-secondary/30 flex items-center justify-center shrink-0">
            <meta.icon className="w-4 h-4 text-secondary-foreground" />
          </div>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {meta.badge}
          </span>
        </div>
        <h2 className="text-base font-semibold leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors">
          {content.title}
        </h2>
        {content.excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {content.excerpt}
          </p>
        )}
        <div className="mt-auto flex items-center gap-3 pt-2">
          {content.authorId && (
            <div className="flex items-center gap-1.5 shrink-0">
              <Avatar src={content.authorId.image} name={content.authorId.name} size="sm" />
              <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                {content.authorId.name}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 ml-auto text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Heart className="w-3 h-3" /> {content.likesCount}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageSquare className="w-3 h-3" /> {content.commentsCount ?? 0}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

function ContentSection({
  title,
  description,
  contents,
  type,
  viewAllHref,
}: {
  title: string;
  description: string;
  contents?: { _id: string; title: string; authorId?: { name: string; image?: string }; excerpt?: string; likesCount: number; commentsCount: number }[];
  type: keyof typeof contentTypeMeta;
  viewAllHref: string;
}) {
  const router = useRouter();

  return (
    <section className="py-16 md:py-20">
      <PageContainer>
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h2>
            <p className="text-muted-foreground mt-1">{description}</p>
          </div>
          <Button
            variant="ghost"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm"
            onClick={() => router.push(viewAllHref)}
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
        {!contents || contents.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-xl bg-secondary/30 flex items-center justify-center mx-auto mb-3">
              <PenLine className="w-6 h-6 text-secondary-foreground/60" />
            </div>
            <p className="text-muted-foreground">No {title.toLowerCase()} yet.</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => router.push('/content/write')}>
              Write the first one
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {contents.slice(0, 3).map((content) => (
              <ContentCard key={content._id} content={content} type={type} />
            ))}
          </div>
        )}
        <div className="mt-6 text-center sm:hidden">
          <Button variant="ghost" size="sm" onClick={() => router.push(viewAllHref)}>
            View all {title.toLowerCase()} <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </PageContainer>
    </section>
  );
}

export default function Home() {
  const router = useRouter();
  const { data: poems } = useContents({ type: 'poem', limit: 3, sort: 'recent' });
  const { data: stories } = useContents({ type: 'story', limit: 3, sort: 'recent' });
  const { data: dramas } = useContents({ type: 'drama', limit: 3, sort: 'recent' });

  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-600/5 via-transparent to-transparent pointer-events-none" />
        <PageContainer className="py-20 md:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/30 text-secondary-foreground text-xs font-medium mb-6">
              <Sparkles className="w-3 h-3" />
              AI-powered creative writing platform
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08]">
              Where your stories
              <br />
              <span className="text-brand-600">come to life</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-lg leading-relaxed">
              Write poems, stories, dramas, and prose with AI-powered assistance. Share your work with a community of creators.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Button size="lg" onClick={() => router.push('/content/write')}>
                <PenLine className="w-4 h-4" />
                Start Writing
              </Button>
              <Button variant="outline" size="lg" onClick={() => router.push('/content')}>
                Browse Contents
              </Button>
            </div>
          </div>
        </PageContainer>
      </section>

      <ContentSection
        title="Poems"
        description="Recent verses from our community"
        contents={poems?.results}
        type="poem"
        viewAllHref="/content?type=poem"
      />

      <ContentSection
        title="Stories"
        description="Tales waiting to be read"
        contents={stories?.results}
        type="story"
        viewAllHref="/content?type=story"
      />

      <ContentSection
        title="Dramas"
        description="Scripts and scenes from emerging playwrights"
        contents={dramas?.results}
        type="drama"
        viewAllHref="/dramas"
      />

      <section className="py-20 md:py-24 bg-muted/30 border-t border-border">
        <PageContainer className="text-center">
          <div className="max-w-lg mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Ready to share your voice?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Join Rachna Kranti and start writing today. No gatekeepers, just creativity.
            </p>
            <Button size="lg" className="mt-6" onClick={() => router.push('/content/write')}>
              <PenLine className="w-4 h-4" />
              Start Writing
            </Button>
          </div>
        </PageContainer>
      </section>
    </>
  );
}
