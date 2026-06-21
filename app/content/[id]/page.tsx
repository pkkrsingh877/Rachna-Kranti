"use client";
import React from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { useContent, useDeleteContent } from '@/hooks/use-content';
import { Avatar } from '@/components/Avatar';
import LikeButton from '@/components/LikeButton';
import FollowButton from '@/components/FollowButton';
import CommentSection from '@/components/CommentSection';
import RenderTiptap from '@/components/RenderTiptap';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';

export default function Page() {
    const router = useRouter();
    const params = useParams();
    const { data: session } = useSession();
    const contentId = params.id as string;

    const query = useContent(contentId);
    const deleteContent = useDeleteContent();

    const isAuthor = session?.user?.email === query.data?.authorId?.email;

    function handleDelete() {
        if (!confirm('Are you sure you want to delete this content? This action cannot be undone.')) return;
        deleteContent.mutate(contentId, {
            onSuccess: () => {
                toast.success('Content deleted');
                router.push('/content');
            },
            onError: (error: unknown) => {
                toast.error((error as Error).message || 'Failed to delete content');
            },
        });
    }

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
          <p className="text-destructive text-sm">Failed to load content</p>
          <Button variant="outline" size="sm" onClick={() => router.push('/content')}>Back</Button>
        </div>
      );
    }

    const content = query.data!;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto px-6 md:px-10 py-12 md:py-16"
      >
        <button
          onClick={() => router.push('/content')}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>

        <div className="flex items-start gap-4 mb-6">
          {content.authorId && (
            <Avatar src={content.authorId.image} name={content.authorId.name} size="md" />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">{content.authorId?.name ?? 'Unknown'}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(content.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </span>
              {content.readingTime && (
                <>
                  <span className="text-muted-foreground/30">&middot;</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {content.readingTime} min read
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="shrink-0">
            {session?.user?.email !== content.authorId?.email && content.authorId && (
              <FollowButton authorId={content.authorId._id} />
            )}
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-[1.1] mb-3">
          {content.title}
        </h1>

        <div className="flex items-center gap-2 mb-8">
          <span className="text-xs text-muted-foreground capitalize px-2.5 py-0.5 rounded-full bg-secondary/20">
            {content.contentType}
          </span>
        </div>

        {content.description && (
          <p className="text-base text-muted-foreground mb-10 leading-relaxed border-l-2 border-brand-600/20 pl-4">
            {content.description}
          </p>
        )}

        <div className="prose-content font-serif text-base leading-relaxed" style={{ fontFamily: 'var(--font-lora)' }}>
          <RenderTiptap doc={content.content as Record<string, unknown>} />
        </div>

        <div className="flex items-center gap-3 mt-12 pt-6 border-t border-border">
          <LikeButton contentId={contentId} />
          <span className="text-sm text-muted-foreground">
            {content.commentsCount ?? 0} comments
          </span>
        </div>

        <CommentSection contentId={contentId} />

        {isAuthor && (
          <div className="flex items-center gap-2 mt-10 pt-6 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => router.push(`/content/write?id=${contentId}`)}>
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleteContent.isLoading}>
              {deleteContent.isLoading ? 'Deleting…' : 'Delete'}
            </Button>
          </div>
        )}

        <Toaster />
      </motion.div>
    );
}
