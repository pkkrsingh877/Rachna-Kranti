"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toaster } from "@/components/ui/sonner";
import { useRouter } from 'next/navigation';
import { useContents } from '@/hooks/use-content';
import PageContainer from '@/components/layout/PageContainer';
import { Heart, MessageSquare, Search, PenLine, BookOpen, Drama } from 'lucide-react';

const typeIcons = {
  poem: PenLine,
  story: BookOpen,
  prose: BookOpen,
  drama: Drama,
} as const;

const typeColors = {
  poem: 'bg-brand-600/10 text-brand-600',
  story: 'bg-secondary/30 text-secondary-foreground',
  prose: 'bg-muted text-muted-foreground',
  drama: 'bg-amber-500/10 text-amber-600',
} as const;

export default function Page() {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [typeFilter, setTypeFilter] = useState('');
    const [search, setSearch] = useState('');

    const filters: Record<string, unknown> = { page, limit: 12 };
    if (typeFilter) filters.type = typeFilter;
    if (search) filters.search = search;

    const query = useContents(filters);

    if (query.isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      );
    }

    if (query.isError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <p className="text-destructive">Error: {(query.error as Error)?.message || 'Something went wrong'}</p>
          <Button variant="outline" onClick={() => query.refetch()}>Try again</Button>
        </div>
      );
    }

    const { results: contents, count, previous, next } = query.data!;

    return (
      <PageContainer className="py-8 md:py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Contents</h1>
            <p className="text-muted-foreground mt-1">
              {count} {count === 1 ? 'piece' : 'pieces'} of writing
            </p>
          </div>
          <Button onClick={() => router.push('/content/write')}>
            <PenLine className="w-4 h-4" />
            Write
          </Button>
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by title..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {['', 'poem', 'story', 'prose', 'drama'].map((type) => (
              <button
                key={type}
                onClick={() => { setTypeFilter(type); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  typeFilter === type
                    ? 'bg-foreground text-background'
                    : 'bg-secondary/30 text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                {type === '' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contents.length === 0 && (
            <div className="col-span-full text-center py-16">
              <div className="w-12 h-12 rounded-xl bg-secondary/30 flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6 text-secondary-foreground/60" />
              </div>
              <p className="text-muted-foreground">No content found.</p>
            </div>
          )}
          {contents.map((content) => {
            const Icon = typeIcons[content.contentType as keyof typeof typeIcons] || PenLine;
            const colorClass = typeColors[content.contentType as keyof typeof typeColors] || 'bg-muted text-muted-foreground';
            return (
              <button
                key={content._id}
                onClick={() => router.push(`/content/${content._id}`)}
                className="group flex items-start gap-4 border border-border rounded-xl bg-card p-5 text-left transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-base font-semibold line-clamp-1 group-hover:text-brand-600 transition-colors">{content.title}</h2>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span className="capitalize">{content.contentType}</span>
                    {content.authorId && (
                      <>
                        <span className="text-muted-foreground/40">&middot;</span>
                        <span>{content.authorId.name}</span>
                      </>
                    )}
                    {content.readingTime && (
                      <>
                        <span className="text-muted-foreground/40">&middot;</span>
                        <span>{content.readingTime} min read</span>
                      </>
                    )}
                  </div>
                  {content.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-2 leading-relaxed">{content.excerpt}</p>
                  )}
                  <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Heart className="w-3 h-3" /> {content.likesCount}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" /> {content.commentsCount ?? 0}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-4 mt-10">
          <Button
            variant="outline"
            size="sm"
            disabled={!previous}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground tabular-nums">
            Page {page} of {Math.max(1, Math.ceil(count / 12))}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!next}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>

        <Toaster />
      </PageContainer>
    );
}
