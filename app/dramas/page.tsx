'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Drama, Clock } from 'lucide-react';
import { useDramas } from '@/hooks/use-dramas';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/ui/button';
import PageContainer from '@/components/layout/PageContainer';

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
    <PageContainer className="py-8 md:py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dramas</h1>
          <p className="text-muted-foreground mt-1">
            {dramas.length} {dramas.length === 1 ? 'script' : 'scripts'}
          </p>
        </div>
        <Link href="/dramas/create">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Drama
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {dramas.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <div className="w-12 h-12 rounded-xl bg-secondary/30 flex items-center justify-center mx-auto mb-3">
              <Drama className="w-6 h-6 text-secondary-foreground/60" />
            </div>
            <p className="text-muted-foreground">No dramas yet.</p>
            <Link href="/dramas/create">
              <Button variant="outline" size="sm" className="mt-3">Create the first drama</Button>
            </Link>
          </div>
        ) : (
          dramas.map((drama) => (
            <button
              key={drama._id}
              onClick={() => router.push(`/dramas/${drama._id}`)}
              className="group flex flex-col border border-border rounded-xl bg-card p-5 text-left transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                  <Drama className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-semibold line-clamp-1 group-hover:text-brand-600 transition-colors">
                    {drama.title}
                  </h2>
                  <span className={`inline-block mt-1 text-xs font-medium capitalize ${
                    drama.status === 'published' ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    {drama.status}
                  </span>
                </div>
              </div>
              {drama.authorId && (
                <div className="flex items-center gap-2 mb-3">
                  <Avatar src={drama.authorId.image} name={drama.authorId.name} size="sm" />
                  <span className="text-sm text-muted-foreground">{drama.authorId.name}</span>
                </div>
              )}
              <div className="flex items-center gap-3 mt-auto text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {drama.scenesCount} scenes
                </span>
                <span className="px-2 py-0.5 rounded-full bg-secondary/30 text-secondary-foreground capitalize text-xs">
                  {drama.type}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </PageContainer>
  );
}
