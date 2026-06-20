"use client";
import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { BookOpen, ChevronLeft, ChevronRight, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { useBook, useDeleteBook, usePublishBook } from '@/hooks/use-books';
import { Avatar } from '@/components/Avatar';
import RenderTiptap from '@/components/RenderTiptap';
import type { ChapterItem } from '@/lib/api-types';

export default function BookDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const bookId = params.id as string;

  const { data, isLoading } = useBook(bookId);
  const deleteBook = useDeleteBook();
  const publishBook = usePublishBook();

  const [currentChapterIdx, setCurrentChapterIdx] = useState(0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-destructive">Book not found</p>
        <Button variant="outline" onClick={() => router.push('/books')}>Back to books</Button>
      </div>
    );
  }

  const { book, chapters } = data;
  const isAuthor = session?.user?.email === book.authorId?.email;
  const chapter = chapters[currentChapterIdx] as ChapterItem | undefined;
  const totalChapters = chapters.length;

  function handleDelete() {
    if (!confirm('Delete this book and all its chapters? This cannot be undone.')) return;
    deleteBook.mutate(bookId, {
      onSuccess: () => {
        toast.success('Book deleted');
        router.push('/books');
      },
      onError: (error: unknown) => {
        toast.error((error as Error).message || 'Failed to delete book');
      },
    });
  }

  function handlePublish() {
    publishBook.mutate(bookId, {
      onSuccess: () => {
        toast.success('Book published!');
      },
      onError: (error: unknown) => {
        toast.error((error as Error).message || 'Failed to publish book');
      },
    });
  }

  return (
    <div className="py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => router.push('/books')} className="mb-4">
          ← Back to Books
        </Button>

        <div className="bg-card rounded-xl shadow-sm border p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-brand-600/10 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-brand-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{book.title}</h1>
              {book.subtitle && (
                <p className="text-muted-foreground">{book.subtitle}</p>
              )}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="capitalize px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm">
                {book.type}
              </span>
              <span className={`capitalize px-3 py-1 rounded-full text-sm ${
                book.status === 'published' ? 'bg-green-100 text-green-800' :
                book.status === 'draft' ? 'bg-amber-100 text-amber-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {book.status}
              </span>
            </div>
          </div>

          {book.authorId && (
            <div className="flex items-center gap-2 mb-6 pb-4 border-b">
              <Avatar src={book.authorId.image} name={book.authorId.name} size="sm" />
              <span className="text-sm text-muted-foreground">{book.authorId.name}</span>
              {book.publishedAt && (
                <span className="text-xs text-muted-foreground ml-2">
                  Published {new Date(book.publishedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          )}

          {book.description && (
            <p className="text-muted-foreground mb-6">{book.description}</p>
          )}

          {totalChapters === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No chapters yet.</p>
              {isAuthor && (
                <Button variant="outline" className="mt-4" onClick={() => router.push(`/books/${bookId}/edit`)}>
                  Start Writing
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  {chapter?.title || 'Table of Contents'}
                </h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{currentChapterIdx + 1} / {totalChapters}</span>
                </div>
              </div>

              <div className="border rounded-lg mb-6 max-h-[70vh] overflow-y-auto p-6">
                {chapter ? (
                  <div className="prose-content">
                    {chapter.content ? (
                      <RenderTiptap doc={chapter.content as Record<string, unknown>} />
                    ) : (
                      <p className="text-muted-foreground italic">Empty chapter</p>
                    )}
                    {chapter.wordCount > 0 && (
                      <p className="text-xs text-muted-foreground mt-4">
                        {chapter.wordCount} words
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {chapters.map((ch: ChapterItem, i: number) => (
                      <button
                        key={ch._id}
                        onClick={() => setCurrentChapterIdx(i)}
                        className="w-full text-left px-4 py-3 rounded-lg hover:bg-secondary transition-colors flex items-center gap-3"
                      >
                        <span className="w-6 h-6 rounded-full bg-brand-600/10 text-brand-600 text-xs font-medium flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span className="font-medium">{ch.title}</span>
                        <span className="ml-auto text-xs text-muted-foreground">{ch.wordCount} words</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-4">
                <Button
                  variant="outline"
                  disabled={currentChapterIdx === 0}
                  onClick={() => setCurrentChapterIdx(i => Math.max(0, i - 1))}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    if (currentChapterIdx === 0 && chapters.length > 0) {
                      setCurrentChapterIdx(-1);
                    } else {
                      setCurrentChapterIdx(i => Math.min(totalChapters - 1, i + 1));
                    }
                  }}
                >
                  {currentChapterIdx === totalChapters - 1 ? 'Table of Contents' : 'Next'}
                  {currentChapterIdx < totalChapters - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
                </Button>
              </div>
            </>
          )}

          {isAuthor && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <div className="flex gap-2">
                <Button variant="default" onClick={() => router.push(`/books/${bookId}/edit`)}>
                  <Edit3 className="w-4 h-4 mr-1" /> Edit
                </Button>
                {book.status !== 'published' && totalChapters > 0 && (
                  <Button variant="outline" onClick={handlePublish} disabled={publishBook.isLoading}>
                    {publishBook.isLoading ? 'Publishing…' : 'Publish'}
                  </Button>
                )}
              </div>
              <Button variant="destructive" onClick={handleDelete} disabled={deleteBook.isLoading}>
                {deleteBook.isLoading ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
          )}
        </div>
      </div>
      <Toaster />
    </div>
  );
}
