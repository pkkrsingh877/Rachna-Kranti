"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toaster } from "@/components/ui/sonner";
import { useRouter } from 'next/navigation';
import { useContents } from '@/hooks/use-content';
import PageContainer from '@/components/layout/PageContainer';


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
        <PageContainer className="flex flex-col items-center">
            <h1 className="text-3xl font-bold">All Contents</h1>

            <div className="flex flex-wrap gap-3 mt-6 w-full max-w-2xl px-4">
              <Input
                placeholder="Search by title..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="flex-1 min-w-[200px]"
              />
              <select
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
              >
                <option value="">All types</option>
                <option value="poem">Poem</option>
                <option value="story">Story</option>
                <option value="prose">Prose</option>
                <option value="drama">Drama</option>
              </select>
            </div>

            <div className="flex flex-col space-y-4 mt-6 w-full max-w-2xl px-4">
                {contents.length === 0 && <p className="text-center text-muted-foreground">No content found.</p>}
                {contents.map((content) => (
                    <div key={content._id} className="content-card border p-4 rounded-lg bg-card">
                        <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h2 className="text-xl font-bold truncate">{content.title}</h2>
                              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                <span className="capitalize italic">{content.contentType}</span>
                                {content.authorId && (
                                  <>
                                    <span>&middot;</span>
                                    <span>{content.authorId.name}</span>
                                  </>
                                )}
                                {content.readingTime && (
                                  <>
                                    <span>&middot;</span>
                                    <span>{content.readingTime} min read</span>
                                  </>
                                )}
                              </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span>{content.likesCount} likes</span>
                          <span>{content.commentsCount ?? 0} comments</span>
                        </div>
                        {content.excerpt && (
                          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{content.excerpt}</p>
                        )}
                        <Button className="mt-3" size="sm" onClick={() => router.push(`/content/${content._id}`)}>
                            View Content
                        </Button>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center gap-4 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={!previous}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {Math.ceil(count / 12)}
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
    )
}
