'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Plus } from 'lucide-react';
import { useBooks } from '@/hooks/use-books';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/ui/button';
import PageContainer from '@/components/layout/PageContainer';

export default function BooksPage() {
  const router = useRouter();
  const { data, isLoading } = useBooks({ limit: 50, sort: 'recent' });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const books = data?.results || [];

  return (
    <PageContainer className="py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Books</h1>
        <Link href="/books/create">
          <Button variant="default" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Book
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {books.length === 0 ? (
          <p className="text-muted-foreground col-span-full">No books yet.</p>
        ) : (
          books.map((book) => (
            <button
              key={book._id}
              onClick={() => router.push(`/books/${book._id}`)}
              className="border p-4 rounded-xl shadow-sm bg-card text-left hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-brand-600/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-brand-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold line-clamp-1">{book.title}</h2>
                  {book.subtitle && (
                    <p className="text-xs text-muted-foreground line-clamp-1">{book.subtitle}</p>
                  )}
                </div>
              </div>
              {book.authorId && (
                <div className="flex items-center gap-2 mb-2">
                  <Avatar src={book.authorId.image} name={book.authorId.name} size="sm" />
                  <span className="text-sm text-muted-foreground">{book.authorId.name}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <BookOpen className="w-3 h-3" /> {book.chapterCount} chapters
                </span>
                <span className="capitalize px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs">
                  {book.type}
                </span>
                <span className={`capitalize text-xs ${
                  book.status === 'published' ? 'text-green-600' : 'text-amber-600'
                }`}>
                  {book.status}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </PageContainer>
  );
}
