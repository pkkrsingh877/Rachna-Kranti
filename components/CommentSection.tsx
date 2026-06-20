'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { MessageSquare, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useComments, useCreateComment, useDeleteComment } from '@/hooks/use-comments';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CommentItem } from '@/lib/api-types';

function CommentCard({
  comment,
  contentId,
  onReply,
}: {
  comment: CommentItem;
  contentId: string;
  onReply: (id: string) => void;
}) {
  const { data: session } = useSession();
  const deleteComment = useDeleteComment(contentId);
  const isAuthor = session?.user?.email && comment.authorId?._id;

  return (
    <div className="flex gap-3 py-3">
      <Avatar
        src={comment.authorId?.image}
        name={comment.authorId?.name}
        size="sm"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium">
            {comment.authorId?.name ?? 'Unknown'}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(comment.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
        <p className="text-sm text-foreground">{comment.text}</p>
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={() => onReply(comment._id)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Reply
          </button>
          {isAuthor && (
            <button
              onClick={() => deleteComment.mutate(comment._id)}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CommentForm({
  contentId,
  parentId,
  onDone,
}: {
  contentId: string;
  parentId?: string;
  onDone?: () => void;
}) {
  const [text, setText] = useState('');
  const createComment = useCreateComment(contentId);
  const { data: session } = useSession();

  if (!session?.user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    createComment.mutate(
      { text: text.trim(), parentId },
      {
        onSuccess: () => {
          setText('');
          onDone?.();
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={parentId ? 'Write a reply...' : 'Write a comment...'}
        className="flex-1 h-9 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        maxLength={2000}
      />
      <Button
        type="submit"
        size="sm"
        disabled={!text.trim() || createComment.isLoading}
      >
        {parentId ? 'Reply' : 'Comment'}
      </Button>
    </form>
  );
}

export default function CommentSection({ contentId }: { contentId: string }) {
  const { data: comments, isLoading, isError } = useComments(contentId);
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  const rootComments = comments?.filter((c) => !c.parentId) ?? [];
  const replies = comments?.filter((c) => c.parentId) ?? [];

  const getReplies = (parentId: string) =>
    replies.filter((r) => r.parentId === parentId);

  return (
    <div className="mt-8 pt-6 border-t">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <MessageSquare className="w-4 h-4" />
        Comments ({comments?.length ?? 0})
        {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
      </button>

      {!collapsed && (
        <>
          <CommentForm contentId={contentId} />

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}

          {isError && (
            <p className="text-sm text-destructive py-4">
              Failed to load comments.
            </p>
          )}

          {!isLoading && !isError && comments?.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No comments yet. Be the first to share your thoughts!
            </p>
          )}

          {!isLoading && !isError && (
            <div className={cn('divide-y', rootComments.length > 0 && 'mt-4')}>
              {rootComments.map((comment) => (
                <div key={comment._id}>
                  <CommentCard
                    comment={comment}
                    contentId={contentId}
                    onReply={(id) => setReplyToId(replyToId === id ? null : id)}
                  />
                  {getReplies(comment._id).map((reply) => (
                    <div key={reply._id} className="ml-10 border-l-2 border-muted pl-4">
                      <CommentCard
                        comment={reply}
                        contentId={contentId}
                        onReply={() => {}}
                      />
                    </div>
                  ))}
                  {replyToId === comment._id && (
                    <div className="ml-10 mb-3">
                      <CommentForm
                        contentId={contentId}
                        parentId={comment._id}
                        onDone={() => setReplyToId(null)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
