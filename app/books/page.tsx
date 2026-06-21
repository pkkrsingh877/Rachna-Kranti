'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { BookOpen, Plus, Layers, ArrowRight } from 'lucide-react';
import { useBooks } from '@/hooks/use-books';
import { Button } from '@/components/ui/button';

export default function BooksPage() {
  const router = useRouter();
  const { data, isLoading } = useBooks({ limit: 50, sort: 'recent' });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70dvh]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground/30 border-t-foreground" />
      </div>
    );
  }

  const books = data?.results || [];

  return (
    <div className="max-w-4xl mx-auto px-6 md:px-10 py-12 md:py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Books</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {books.length} {books.length === 1 ? 'book' : 'books'}
          </p>
        </div>
        <Link href="/books/create">
          <Button size="sm">
            <Plus className="w-3.5 h-3.5" />
            New
          </Button>
        </Link>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-5 h-5 text-muted-foreground/60" />
          </div>
          <p className="text-muted-foreground text-sm">No books yet.</p>
          <Link href="/books/create">
            <Button variant="outline" size="sm" className="mt-3">Create the first book</Button>
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {books.map((book, i) => (
            <motion.button
              key={book._id}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
              onClick={() => router.push(`/books/${book._id}`)}
              className="group flex items-start gap-4 py-5 w-full text-left transition-colors hover:bg-muted/30 -mx-4 px-4 rounded-lg"
            >
              <div className="w-9 h-9 rounded-xl bg-secondary/20 flex items-center justify-center shrink-0 mt-0.5">
                <BookOpen className="w-4 h-4 text-secondary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-medium line-clamp-1 group-hover:text-brand-600 transition-colors">
                  {book.title}
                </h2>
                {book.subtitle && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{book.subtitle}</p>
                )}
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span className="capitalize">{book.type}</span>
                  {book.authorId && (
                    <>
                      <span className="text-muted-foreground/30">&middot;</span>
                      <span>{book.authorId.name}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Layers className="w-3 h-3" /> {book.chapterCount} chapters
                  </span>
                  <span className={`capitalize ${
                    book.status === 'published' ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    {book.status}
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
