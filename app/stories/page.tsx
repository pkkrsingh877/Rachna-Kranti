'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Heart, MessageSquare, ArrowRight } from 'lucide-react';
import { useContents } from '@/hooks/use-content';

export default function Stories() {
  const router = useRouter();
  const { data, isLoading } = useContents({ type: 'story', limit: 50, sort: 'recent' });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70dvh]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground/30 border-t-foreground" />
      </div>
    );
  }

  const stories = data?.results || [];

  return (
    <div className="max-w-4xl mx-auto px-6 md:px-10 py-12 md:py-16">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">Stories</h1>

      {stories.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-sm">No stories yet.</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {stories.map((story, i) => (
            <motion.button
              key={story._id}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
              onClick={() => router.push(`/content/${story._id}`)}
              className="group flex items-start gap-4 py-5 w-full text-left transition-colors hover:bg-muted/30 -mx-4 px-4 rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-medium line-clamp-1 group-hover:text-brand-600 transition-colors">
                  {story.title}
                </h2>
                {story.authorId && (
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>{story.authorId.name}</span>
                  </div>
                )}
                {story.excerpt && (
                  <p className="text-sm text-muted-foreground line-clamp-1 mt-1 leading-relaxed">
                    {story.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Heart className="w-3 h-3" /> {story.likesCount}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> {story.commentsCount ?? 0}
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all mt-2 shrink-0" />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
