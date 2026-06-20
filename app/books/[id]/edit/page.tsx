"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Plus, Trash2, ChevronLeft, ChevronRight, BookOpen, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import type { Editor } from '@tiptap/react';
import SimpleEditor from '@/components/SimpleEditor';
import {
  useBook,
  useUpdateBook,
  useCreateChapter,
  useUpdateChapter,
  useDeleteChapter,
  useReorderChapters,
} from '@/hooks/use-books';
import type { ChapterItem } from '@/lib/api-types';

export default function BookEditorPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const bookId = params.id as string;

  const { data, isLoading } = useBook(bookId);
  const updateBook = useUpdateBook();
  const createChapter = useCreateChapter();
  const updateChapter = useUpdateChapter();
  const deleteChapter = useDeleteChapter();
  const reorderChapters = useReorderChapters();

  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [editorRef, setEditorRef] = useState<Editor | null>(null);
  const [chapterTitle, setChapterTitle] = useState('');
  const [bookTitle, setBookTitle] = useState('');
  const [bookSubtitle, setBookSubtitle] = useState('');
  const [bookDescription, setBookDescription] = useState('');
  const [bookType, setBookType] = useState('General');
  const [initialContent, setInitialContent] = useState<Record<string, unknown> | undefined>(undefined);
  const [showMetadata, setShowMetadata] = useState(false);

  useEffect(() => {
    if (data?.book) {
      setBookTitle(data.book.title);
      setBookSubtitle(data.book.subtitle || '');
      setBookDescription(data.book.description || '');
      setBookType(data.book.type);
    }
  }, [data?.book]);

  useEffect(() => {
    if (data?.chapters && data.chapters.length > 0 && !activeChapterId) {
      setActiveChapterId(data.chapters[0]._id);
    }
  }, [data?.chapters, activeChapterId]);

  useEffect(() => {
    if (activeChapterId && data?.chapters) {
      const ch = data.chapters.find((c: ChapterItem) => c._id === activeChapterId);
      if (ch) {
        setChapterTitle(ch.title);
        setInitialContent(ch.content as Record<string, unknown>);
      }
    }
  }, [activeChapterId, data?.chapters]);

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
  if (!isAuthor) {
    router.push(`/books/${bookId}`);
    return null;
  }

  const activeChapter = chapters.find((c: ChapterItem) => c._id === activeChapterId);
  const sortedChapters = [...chapters].sort((a: ChapterItem, b: ChapterItem) => a.order - b.order);

  async function handleAddChapter() {
    createChapter.mutate(
      { bookId, data: { title: `Chapter ${chapters.length + 1}` } },
      {
        onSuccess: (res) => {
          const newChapter = res.chapter;
          setActiveChapterId(newChapter._id);
          setChapterTitle(newChapter.title);
          setInitialContent(undefined);
          toast.success('Chapter added');
        },
        onError: (error: unknown) => {
          toast.error((error as Error).message || 'Failed to add chapter');
        },
      }
    );
  }

  async function handleSaveChapter() {
    if (!activeChapterId || !editorRef) return;

    const editorJSON = editorRef.getJSON();
    updateChapter.mutate(
      { bookId, chapterId: activeChapterId, data: { title: chapterTitle, content: editorJSON } },
      {
        onSuccess: () => {
          toast.success('Chapter saved');
        },
        onError: (error: unknown) => {
          toast.error((error as Error).message || 'Failed to save chapter');
        },
      }
    );
  }

  async function handleDeleteChapter(chapterId: string) {
    if (!confirm('Delete this chapter?')) return;
    deleteChapter.mutate(
      { bookId, chapterId },
      {
        onSuccess: () => {
          if (activeChapterId === chapterId) {
            const remaining = sortedChapters.filter((c: ChapterItem) => c._id !== chapterId);
            setActiveChapterId(remaining.length > 0 ? remaining[0]._id : null);
          }
          toast.success('Chapter deleted');
        },
        onError: (error: unknown) => {
          toast.error((error as Error).message || 'Failed to delete chapter');
        },
      }
    );
  }

  async function handleSaveMetadata() {
    updateBook.mutate(
      { id: bookId, data: { title: bookTitle, type: bookType, subtitle: bookSubtitle, description: bookDescription } },
      {
        onSuccess: () => {
          toast.success('Book metadata saved');
          setShowMetadata(false);
        },
        onError: (error: unknown) => {
          toast.error((error as Error).message || 'Failed to save metadata');
        },
      }
    );
  }

  const handleMoveChapter = async (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= sortedChapters.length) return;

    const updated = sortedChapters.map((c: ChapterItem, i: number) => ({
      id: c._id,
      order: i === index ? sortedChapters[newIndex].order : i === newIndex ? sortedChapters[index].order : c.order,
    }));

    reorderChapters.mutate({ bookId, orders: updated }, {
      onError: () => toast.error('Failed to reorder'),
    });
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <div className="w-72 border-r bg-sidebar flex flex-col">
        <div className="p-3 border-b">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/books/${bookId}`)}
            className="w-full justify-start text-sidebar-foreground"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to reader
          </Button>
        </div>

        <div className="p-3 border-b">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-brand-600" />
            <h2 className="font-semibold text-sm truncate text-sidebar-foreground">{book.title || 'Untitled'}</h2>
          </div>
          <span className="text-xs text-muted-foreground capitalize">{book.type} · {chapters.length} chapters</span>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          <div className="flex items-center justify-between mb-2 px-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Chapters</span>
            <Button variant="ghost" size="sm" onClick={handleAddChapter} className="h-6 w-6 p-0">
              <Plus className="w-3 h-3" />
            </Button>
          </div>

          {sortedChapters.length === 0 ? (
            <p className="text-xs text-muted-foreground px-2">No chapters yet. Click + to add one.</p>
          ) : (
            <div className="space-y-1">
              {sortedChapters.map((chapter: ChapterItem, i: number) => (
                <div
                  key={chapter._id}
                  className={`group flex items-center gap-1 px-2 py-1.5 rounded-lg cursor-pointer text-sm transition-colors ${
                    activeChapterId === chapter._id
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent'
                  }`}
                  onClick={() => {
                    setActiveChapterId(chapter._id);
                    setInitialContent(chapter.content as Record<string, unknown>);
                  }}
                >
                  <span className="w-5 h-5 rounded bg-sidebar-accent text-xs font-medium flex items-center justify-center shrink-0">
                    {chapter.order}
                  </span>
                  <span className="truncate flex-1">{chapter.title}</span>
                  <div className="hidden group-hover:flex items-center gap-0.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMoveChapter(i, -1); }}
                      className="p-0.5 hover:bg-sidebar-accent rounded"
                      disabled={i === 0}
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMoveChapter(i, 1); }}
                      className="p-0.5 hover:bg-sidebar-accent rounded"
                      disabled={i === sortedChapters.length - 1}
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteChapter(chapter._id); }}
                      className="p-0.5 hover:bg-destructive/10 rounded text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-3 border-t">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => setShowMetadata(!showMetadata)}
          >
            {showMetadata ? 'Hide' : 'Edit'} Metadata
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {showMetadata ? (
          <div className="flex-1 overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-6">Book Metadata</h2>
            <div className="space-y-4 max-w-xl">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input value={bookTitle} onChange={(e) => setBookTitle(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Subtitle</label>
                <Input value={bookSubtitle} onChange={(e) => setBookSubtitle(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={bookType}
                  onChange={(e) => setBookType(e.target.value)}
                >
                  {['Novel', 'Novella', 'Biography', 'Autobiography', 'Memoir', 'Anthology', 'Research', 'General'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px]"
                  value={bookDescription}
                  onChange={(e) => setBookDescription(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveMetadata} disabled={updateBook.isLoading}>
                  {updateBook.isLoading ? 'Saving…' : 'Save Metadata'}
                </Button>
                <Button variant="ghost" onClick={() => setShowMetadata(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        ) : activeChapter ? (
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-3 p-4 border-b">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <Input
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                className="h-8 text-sm font-medium border-0 bg-transparent px-0 focus-visible:ring-0"
                placeholder="Chapter title"
              />
              <span className="text-xs text-muted-foreground">
                {activeChapter.wordCount || 0} words
              </span>
              <Button size="sm" onClick={handleSaveChapter} disabled={updateChapter.isLoading}>
                {updateChapter.isLoading ? 'Saving…' : 'Save'}
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <SimpleEditor
                onEditorReady={setEditorRef}
                defaultContent={initialContent}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No chapter selected</p>
              <Button variant="outline" className="mt-4" onClick={handleAddChapter}>
                <Plus className="w-4 h-4 mr-1" /> Add First Chapter
              </Button>
            </div>
          </div>
        )}
      </div>
      <Toaster />
    </div>
  );
}


