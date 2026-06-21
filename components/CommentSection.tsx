'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useComments, useCreateComment, useDeleteComment } from '@/hooks/use-comments';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/ui/button';
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
    <div className="flex gap-3 py-4">
      <Avatar
        src={comment.authorId?.image}
        name={comment.authorId?.name}
        size="sm"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
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
        <p className="text-sm text-foreground mt-0.5 leading-relaxed">{comment.text}</p>
        <div className="flex items-center gap-2 mt-1.5">
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
        className="flex-1 h-9 bg-transparent border-b border-border text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors"
        maxLength={2000}
      />
      <Button
        type="submit"
        size="sm"
        variant="ghost"
        className="text-xs"
        disabled={!text.trim() || createComment.isLoading}
      >
        {parentId ? 'Reply' : 'Send'}
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
    <div className="mt-10 pt-8 border-t border-border">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6"
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
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground/30 border-t-foreground" />
            </div>
          )}

          {isError && (
            <p className="text-sm text-destructive py-4">
              Failed to load comments.
            </p>
          )}

          {!isLoading && !isError && comments?.length === 0 && (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No comments yet. Be the first to share your thoughts!
            </p>
          )}

          {!isLoading && !isError && (
            <div className={rootComments.length > 0 ? 'mt-4 divide-y divide-border' : ''}>
              <AnimatePresence initial={false}>
                {rootComments.map((comment, i) => (
                  <motion.div
                    key={comment._id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.03 }}
                  >
                    <CommentCard
                      comment={comment}
                      contentId={contentId}
                      onReply={(id) => setReplyToId(replyToId === id ? null : id)}
                    />
                    <AnimatePresence>
                      {getReplies(comment._id).map((reply) => (
                        <motion.div
                          key={reply._id}
                          initial={{ opacity: 0, x: -4 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2 }}
                          className="ml-10 border-l-2 border-muted pl-4"
                        >
                          <CommentCard
                            comment={reply}
                            contentId={contentId}
                            onReply={() => {}}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {replyToId === comment._id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="ml-10 mb-3 overflow-hidden"
                      >
                        <CommentForm
                          contentId={contentId}
                          parentId={comment._id}
                          onDone={() => setReplyToId(null)}
                        />
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </>
      )}
    </div>
  );
}
