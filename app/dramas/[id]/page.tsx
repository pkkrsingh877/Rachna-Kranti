"use client";
import React, { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Drama, ChevronLeft, ChevronRight, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { useDrama, useDeleteDrama, usePublishDrama } from '@/hooks/use-dramas';
import { Avatar } from '@/components/Avatar';
import type { ActItem, SceneItem } from '@/lib/api-types';

export default function DramaDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const dramaId = params.id as string;

  const { data, isLoading } = useDrama(dramaId);
  const deleteDrama = useDeleteDrama();
  const publishDrama = usePublishDrama();

  const [selectedActId, setSelectedActId] = useState<string | null>(null);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);

  const sortedActs = useMemo(() =>
    [...(data?.acts || [])].sort((a: ActItem, b: ActItem) => a.order - b.order),
    [data?.acts]
  );

  const scenesByAct = useMemo(() => {
    const map: Record<string, SceneItem[]> = {};
    for (const s of data?.scenes || []) {
      if (!map[s.actId]) map[s.actId] = [];
      map[s.actId].push(s);
    }
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => a.order - b.order);
    }
    return map;
  }, [data?.scenes]);

  const currentAct = sortedActs.find((a) => a._id === selectedActId) || sortedActs[0];
  const currentScenes = scenesByAct[currentAct?._id || ''] || [];
  const currentScene = currentScenes.find((s) => s._id === selectedSceneId) || currentScenes[0];

  if (!selectedActId && sortedActs.length > 0) setSelectedActId(sortedActs[0]._id);
  if (!selectedSceneId && currentScenes.length > 0) setSelectedSceneId(currentScenes[0]._id);

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
        <p className="text-destructive">Drama not found</p>
        <Button variant="outline" onClick={() => router.push('/dramas')}>Back to dramas</Button>
      </div>
    );
  }

  const { drama } = data;
  const isAuthor = session?.user?.email === drama.authorId?.email;

  function handleDelete() {
    if (!confirm('Delete this drama and all its acts/scenes? This cannot be undone.')) return;
    deleteDrama.mutate(dramaId, {
      onSuccess: () => {
        toast.success('Drama deleted');
        router.push('/dramas');
      },
      onError: (error: unknown) => {
        toast.error((error as Error).message || 'Failed to delete drama');
      },
    });
  }

  function handlePublish() {
    publishDrama.mutate(dramaId, {
      onSuccess: () => {
        toast.success('Drama published!');
      },
      onError: (error: unknown) => {
        toast.error((error as Error).message || 'Failed to publish drama');
      },
    });
  }

  function navigateScene(direction: -1 | 1) {
    const flatScenes = sortedActs.flatMap((act) => scenesByAct[act._id] || []);
    const currentIdx = flatScenes.findIndex((s) => s._id === currentScene?._id);
    const nextIdx = currentIdx + direction;
    if (nextIdx < 0 || nextIdx >= flatScenes.length) return;
    const next = flatScenes[nextIdx];
    setSelectedActId(next.actId);
    setSelectedSceneId(next._id);
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <div className="w-72 border-r bg-sidebar flex flex-col shrink-0">
        <div className="p-3 border-b">
          <Button variant="ghost" size="sm" onClick={() => router.push('/dramas')} className="w-full justify-start text-sidebar-foreground">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dramas
          </Button>
        </div>

        <div className="p-3 border-b">
          <div className="flex items-center gap-2 mb-2">
            <Drama className="w-4 h-4 text-brand-600" />
            <h2 className="font-semibold text-sm truncate text-sidebar-foreground">{drama.title}</h2>
          </div>
          <span className="text-xs text-muted-foreground capitalize">{drama.type}</span>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {sortedActs.map((act) => (
            <div key={act._id} className="mb-3">
              <button
                onClick={() => { setSelectedActId(act._id); setSelectedSceneId(null); }}
                className={`w-full text-left px-2 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  currentAct?._id === act._id
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                }`}
              >
                {act.title}
              </button>
              <div className="ml-3 mt-1 space-y-0.5">
                {(scenesByAct[act._id] || []).map((scene) => (
                  <button
                    key={scene._id}
                    onClick={() => { setSelectedActId(act._id); setSelectedSceneId(scene._id); }}
                    className={`w-full text-left px-2 py-1 rounded-md text-xs transition-colors ${
                      currentScene?._id === scene._id
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50'
                    }`}
                  >
                    {scene.title}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg">{currentScene?.title || 'Select a scene'}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {currentScene && (
              <span>{currentScene.wordCount} words</span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {currentScene ? (
            <div className="max-w-3xl mx-auto">
              {currentScene.content.length === 0 ? (
                <p className="text-muted-foreground italic">Empty scene</p>
              ) : (
                <div className="space-y-4">
                  {currentScene.content.map((line, i) => (
                    <div key={i} className="flex gap-4">
                      <span className="font-semibold text-brand-600 min-w-[120px] text-right shrink-0">
                        {line.speaker}
                      </span>
                      <span className="flex-1 leading-relaxed">{line.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Select a scene from the sidebar</p>
            </div>
          )}
        </div>

        {currentScene && (
          <div className="flex items-center justify-between p-4 border-t">
            <Button variant="outline" size="sm" onClick={() => navigateScene(-1)}>
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous Scene
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateScene(1)}>
              Next Scene <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {isAuthor && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/30">
            <div className="flex gap-2">
              <Button size="sm" variant="default" onClick={() => router.push(`/dramas/${dramaId}/edit`)}>
                <Edit3 className="w-4 h-4 mr-1" /> Edit
              </Button>
              {drama.status !== 'published' && sortedActs.length > 0 && (
                <Button size="sm" variant="outline" onClick={handlePublish} disabled={publishDrama.isLoading}>
                  {publishDrama.isLoading ? 'Publishing…' : 'Publish'}
                </Button>
              )}
            </div>
            <Button size="sm" variant="destructive" onClick={handleDelete} disabled={deleteDrama.isLoading}>
              {deleteDrama.isLoading ? 'Deleting…' : 'Delete'}
            </Button>
          </div>
        )}
      </div>
      <Toaster />
    </div>
  );
}
