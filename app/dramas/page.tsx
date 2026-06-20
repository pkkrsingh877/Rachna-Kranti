'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Drama } from 'lucide-react';
import { useDramas } from '@/hooks/use-dramas';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/ui/button';

export default function DramasPage() {
  const router = useRouter();
  const { data, isLoading } = useDramas({ limit: 50, sort: 'recent' });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const dramas = data?.results || [];

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dramas</h1>
        <Link href="/dramas/create">
          <Button variant="default" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Drama
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dramas.length === 0 ? (
          <p className="text-muted-foreground col-span-full">No dramas yet.</p>
        ) : (
          dramas.map((drama) => (
            <button
              key={drama._id}
              onClick={() => router.push(`/dramas/${drama._id}`)}
              className="border p-4 rounded-xl shadow-sm bg-card text-left hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-brand-600/10 flex items-center justify-center">
                  <Drama className="w-5 h-5 text-brand-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold line-clamp-1">{drama.title}</h2>
                </div>
              </div>
              {drama.authorId && (
                <div className="flex items-center gap-2 mb-2">
                  <Avatar src={drama.authorId.image} name={drama.authorId.name} size="sm" />
                  <span className="text-sm text-muted-foreground">{drama.authorId.name}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{drama.scenesCount} scenes</span>
                <span className="capitalize px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs">
                  {drama.type}
                </span>
                <span className={`capitalize text-xs ${
                  drama.status === 'published' ? 'text-green-600' : 'text-amber-600'
                }`}>
                  {drama.status}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
