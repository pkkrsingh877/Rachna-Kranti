'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Plus, Layers } from 'lucide-react';
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
    <PageContainer className="py-8 md:py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Books</h1>
          <p className="text-muted-foreground mt-1">
            {books.length} {books.length === 1 ? 'book' : 'books'}
          </p>
        </div>
        <Link href="/books/create">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Book
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {books.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <div className="w-12 h-12 rounded-xl bg-secondary/30 flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-6 h-6 text-secondary-foreground/60" />
            </div>
            <p className="text-muted-foreground">No books yet.</p>
            <Link href="/books/create">
              <Button variant="outline" size="sm" className="mt-3">Create the first book</Button>
            </Link>
          </div>
        ) : (
          books.map((book) => (
            <button
              key={book._id}
              onClick={() => router.push(`/books/${book._id}`)}
              className="group flex flex-col border border-border rounded-xl bg-card p-5 text-left transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-secondary/30 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-secondary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-semibold line-clamp-1 group-hover:text-brand-600 transition-colors">
                    {book.title}
                  </h2>
                  {book.subtitle && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{book.subtitle}</p>
                  )}
                </div>
              </div>
              {book.authorId && (
                <div className="flex items-center gap-2 mb-3">
                  <Avatar src={book.authorId.image} name={book.authorId.name} size="sm" />
                  <span className="text-sm text-muted-foreground">{book.authorId.name}</span>
                </div>
              )}
              <div className="flex items-center gap-3 mt-auto text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Layers className="w-3 h-3" /> {book.chapterCount} chapters
                </span>
                <span className="px-2 py-0.5 rounded-full bg-secondary/30 text-secondary-foreground capitalize text-xs">
                  {book.type}
                </span>
                <span className={`capitalize ml-auto ${
                  book.status === 'published' ? 'text-emerald-600' : 'text-amber-600'
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
