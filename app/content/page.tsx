"use client";
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toaster } from "@/components/ui/sonner";
import { useRouter } from 'next/navigation';
import { useContents } from '@/hooks/use-content';
import { Heart, MessageSquare, Search, PenLine, ArrowRight } from 'lucide-react';

const typeFilters = ['', 'poem', 'story', 'prose', 'drama'] as const;

export default function Page() {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [typeFilter, setTypeFilter] = useState('');
    const [search, setSearch] = useState('');

    const filters: Record<string, unknown> = { page, limit: 15 };
    if (typeFilter) filters.type = typeFilter;
    if (search) filters.search = search;

    const query = useContents(filters);

    if (query.isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[70dvh]">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground/30 border-t-foreground" />
        </div>
      );
    }

    if (query.isError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[70dvh] gap-4">
          <p className="text-destructive text-sm">Failed to load contents</p>
          <Button variant="outline" size="sm" onClick={() => query.refetch()}>Try again</Button>
        </div>
      );
    }

    const { results: contents, count, previous, next } = query.data!;

    return (
      <div className="max-w-4xl mx-auto px-6 md:px-10 py-12 md:py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Writing</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {count} {count === 1 ? 'piece' : 'pieces'}
            </p>
          </div>
          <Button onClick={() => router.push('/content/write')} size="sm">
            <PenLine className="w-3.5 h-3.5" />
            Write
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-8 pb-6 border-b border-border">
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
            {typeFilters.map((type) => (
              <button
                key={type}
                onClick={() => { setTypeFilter(type); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  typeFilter === type
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {type === '' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {contents.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
              <Search className="w-5 h-5 text-muted-foreground/60" />
            </div>
            <p className="text-muted-foreground text-sm">No content found.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {contents.map((content, i) => (
              <motion.button
                key={content._id}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                onClick={() => router.push(`/content/${content._id}`)}
                className="group flex items-start gap-4 py-5 w-full text-left transition-colors hover:bg-muted/30 -mx-4 px-4 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-medium line-clamp-1 group-hover:text-brand-600 transition-colors">
                    {content.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span className="capitalize">{content.contentType}</span>
                    {content.authorId && (
                      <>
                        <span className="text-muted-foreground/30">&middot;</span>
                        <span>{content.authorId.name}</span>
                      </>
                    )}
                    {content.readingTime && (
                      <>
                        <span className="text-muted-foreground/30">&middot;</span>
                        <span>{content.readingTime} min read</span>
                      </>
                    )}
                  </div>
                  {content.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-1 leading-relaxed">
                      {content.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Heart className="w-3 h-3" /> {content.likesCount}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" /> {content.commentsCount ?? 0}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all mt-1 shrink-0" />
              </motion.button>
            ))}
          </div>
        )}

        {(previous || next) && (
          <div className="flex items-center justify-center gap-4 mt-10 pt-6 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              disabled={!previous}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground tabular-nums">
              Page {page} of {Math.max(1, Math.ceil(count / 15))}
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
        )}

        <Toaster />
      </div>
    );
}
