"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Plus, Trash2, ChevronLeft, ChevronRight, Drama, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import {
  useDrama,
  useUpdateDrama,
  useCreateAct,
  useDeleteAct,
  useReorderActs,
  useCreateScene,
  useUpdateScene,
  useDeleteScene,
  useReorderScenes,
} from '@/hooks/use-dramas';
import type { ActItem, SceneItem } from '@/lib/api-types';

export default function DramaEditorPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const dramaId = params.id as string;

  const { data, isLoading } = useDrama(dramaId);
  const updateDrama = useUpdateDrama();
  const createAct = useCreateAct();
  const deleteAct = useDeleteAct();
  const reorderActs = useReorderActs();
  const createScene = useCreateScene();
  const updateScene = useUpdateScene();
  const deleteScene = useDeleteScene();
  const reorderScenes = useReorderScenes();

  const [selectedActId, setSelectedActId] = useState<string | null>(null);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [dramaTitle, setDramaTitle] = useState('');
  const [dramaDescription, setDramaDescription] = useState('');
  const [dramaType, setDramaType] = useState('Drama');
  const [showMetadata, setShowMetadata] = useState(false);
  const [sceneTitle, setSceneTitle] = useState('');
  const [dialogueLines, setDialogueLines] = useState<{ speaker: string; text: string }[]>([]);

  const sortedActs = [...(data?.acts || [])].sort((a: ActItem, b: ActItem) => a.order - b.order);
  const currentAct = sortedActs.find((a) => a._id === selectedActId) || sortedActs[0];

  useEffect(() => {
    if (data?.drama) {
      setDramaTitle(data.drama.title);
      setDramaDescription(data.drama.description || '');
      setDramaType(data.drama.type);
    }
  }, [data?.drama]);

  useEffect(() => {
    if (sortedActs.length > 0 && !selectedActId) {
      setSelectedActId(sortedActs[0]._id);
    }
  }, [data?.acts]);

  useEffect(() => {
    if (selectedSceneId && data?.scenes) {
      const scene = data.scenes.find((s: SceneItem) => s._id === selectedSceneId);
      if (scene) {
        setSceneTitle(scene.title);
        setDialogueLines(scene.content.map((l) => ({ speaker: l.speaker, text: l.text })));
      }
    } else if (selectedSceneId === null) {
      setSceneTitle('');
      setDialogueLines([]);
    }
  }, [selectedSceneId, data?.scenes]);

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
  if (!isAuthor) {
    router.push(`/dramas/${dramaId}`);
    return null;
  }

  const currentScenes = (data?.scenes || [])
    .filter((s: SceneItem) => s.actId === currentAct?._id)
    .sort((a: SceneItem, b: SceneItem) => a.order - b.order);

  const currentScene = currentScenes.find((s: SceneItem) => s._id === selectedSceneId) || null;

  async function handleAddAct() {
    createAct.mutate(
      { dramaId, data: { title: `Act ${sortedActs.length + 1}` } },
      {
        onSuccess: (res) => {
          setSelectedActId(res.act._id);
          setSelectedSceneId(null);
          toast.success('Act added');
        },
        onError: (error: unknown) => {
          toast.error((error as Error).message || 'Failed to add act');
        },
      }
    );
  }

  async function handleAddScene() {
    if (!selectedActId) return;
    createScene.mutate(
      { dramaId, actId: selectedActId, data: { title: `Scene ${currentScenes.length + 1}` } },
      {
        onSuccess: (res) => {
          setSelectedSceneId(res.scene._id);
          setSceneTitle(res.scene.title);
          setDialogueLines([]);
          toast.success('Scene added');
        },
        onError: (error: unknown) => {
          toast.error((error as Error).message || 'Failed to add scene');
        },
      }
    );
  }

  async function handleSaveScene() {
    if (!selectedSceneId) return;
    updateScene.mutate(
      { dramaId, actId: selectedActId!, sceneId: selectedSceneId, data: { title: sceneTitle, content: dialogueLines } },
      {
        onSuccess: () => {
          toast.success('Scene saved');
        },
        onError: (error: unknown) => {
          toast.error((error as Error).message || 'Failed to save scene');
        },
      }
    );
  }

  async function handleDeleteScene(sceneId: string) {
    if (!confirm('Delete this scene?')) return;
    deleteScene.mutate(
      { dramaId, actId: selectedActId!, sceneId },
      {
        onSuccess: () => {
          if (selectedSceneId === sceneId) {
            const remaining = currentScenes.filter((s: SceneItem) => s._id !== sceneId);
            setSelectedSceneId(remaining.length > 0 ? remaining[0]._id : null);
          }
          toast.success('Scene deleted');
        },
        onError: (error: unknown) => {
          toast.error((error as Error).message || 'Failed to delete scene');
        },
      }
    );
  }

  async function handleDeleteAct(actId: string) {
    if (!confirm('Delete this act and all its scenes?')) return;
    deleteAct.mutate(
      { dramaId, actId },
      {
        onSuccess: () => {
          if (selectedActId === actId) {
            const remaining = sortedActs.filter((a: ActItem) => a._id !== actId);
            setSelectedActId(remaining.length > 0 ? remaining[0]._id : null);
            setSelectedSceneId(null);
          }
          toast.success('Act deleted');
        },
        onError: (error: unknown) => {
          toast.error((error as Error).message || 'Failed to delete act');
        },
      }
    );
  }

  async function handleSaveMetadata() {
    updateDrama.mutate(
      { id: dramaId, data: { title: dramaTitle, type: dramaType, description: dramaDescription } },
      {
        onSuccess: () => {
          toast.success('Metadata saved');
          setShowMetadata(false);
        },
        onError: (error: unknown) => {
          toast.error((error as Error).message || 'Failed to save metadata');
        },
      }
    );
  }

  function addDialogueLine() {
    setDialogueLines([...dialogueLines, { speaker: '', text: '' }]);
  }

  function updateDialogueLine(index: number, field: 'speaker' | 'text', value: string) {
    const updated = [...dialogueLines];
    updated[index] = { ...updated[index], [field]: value };
    setDialogueLines(updated);
  }

  function removeDialogueLine(index: number) {
    setDialogueLines(dialogueLines.filter((_, i) => i !== index));
  }

  const handleMoveAct = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= sortedActs.length) return;
    const updated = sortedActs.map((a: ActItem, i: number) => ({
      id: a._id,
      order: i === index ? sortedActs[newIndex].order : i === newIndex ? sortedActs[index].order : a.order,
    }));
    reorderActs.mutate({ dramaId, orders: updated }, { onError: () => toast.error('Failed to reorder') });
  };

  const handleMoveScene = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= currentScenes.length) return;
    const updated = currentScenes.map((s: SceneItem, i: number) => ({
      id: s._id,
      order: i === index ? currentScenes[newIndex].order : i === newIndex ? currentScenes[index].order : s.order,
    }));
    reorderScenes.mutate({ dramaId, actId: selectedActId!, orders: updated }, { onError: () => toast.error('Failed to reorder') });
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <div className="w-72 border-r bg-sidebar flex flex-col shrink-0">
        <div className="p-3 border-b">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/dramas/${dramaId}`)} className="w-full justify-start text-sidebar-foreground">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to reader
          </Button>
        </div>

        <div className="p-3 border-b">
          <div className="flex items-center gap-2 mb-2">
            <Drama className="w-4 h-4 text-brand-600" />
            <h2 className="font-semibold text-sm truncate text-sidebar-foreground">{drama.title || 'Untitled'}</h2>
          </div>
          <span className="text-xs text-muted-foreground capitalize">{drama.type}</span>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {sortedActs.map((act: ActItem, ai: number) => (
            <div key={act._id} className="mb-3">
              <div className="group flex items-center gap-1 px-2 py-1.5 rounded-lg cursor-pointer text-sm transition-colors"
                style={currentAct?._id === act._id ? { backgroundColor: 'var(--sidebar-primary)', color: 'var(--sidebar-primary-foreground)' } : {}}
                onClick={() => { setSelectedActId(act._id); setSelectedSceneId(null); }}
              >
                <span className="truncate flex-1 font-medium">{act.title}</span>
                <div className="hidden group-hover:flex items-center gap-0.5">
                  <button onClick={(e) => { e.stopPropagation(); handleMoveAct(ai, -1); }} className="p-0.5 hover:bg-sidebar-accent rounded" disabled={ai === 0}>
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleMoveAct(ai, 1); }} className="p-0.5 hover:bg-sidebar-accent rounded" disabled={ai === sortedActs.length - 1}>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteAct(act._id); }} className="p-0.5 hover:bg-destructive/10 rounded text-destructive">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="ml-3 mt-1 space-y-0.5">
                {currentAct?._id === act._id && (
                  <>
                    {currentScenes.map((scene: SceneItem, si: number) => (
                      <div key={scene._id}
                        className="group flex items-center gap-1 px-2 py-1 rounded-md text-xs cursor-pointer transition-colors"
                        style={selectedSceneId === scene._id ? { backgroundColor: 'var(--sidebar-accent)', fontWeight: 500 } : {}}
                        onClick={() => { setSelectedSceneId(scene._id); }}
                      >
                        <span className="truncate flex-1">{scene.title}</span>
                        <div className="hidden group-hover:flex items-center gap-0.5">
                          <button onClick={(e) => { e.stopPropagation(); handleMoveScene(si, -1); }} className="p-0.5 hover:bg-sidebar-accent rounded" disabled={si === 0}>
                            <ChevronLeft className="w-3 h-3" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleMoveScene(si, 1); }} className="p-0.5 hover:bg-sidebar-accent rounded" disabled={si === currentScenes.length - 1}>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteScene(scene._id); }} className="p-0.5 hover:bg-destructive/10 rounded text-destructive">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button onClick={handleAddScene}
                      className="w-full text-left px-2 py-1 rounded-md text-xs text-muted-foreground hover:bg-sidebar-accent/50 transition-colors flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Add Scene
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          <button onClick={handleAddAct}
            className="w-full text-left px-2 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-sidebar-accent transition-colors flex items-center gap-1 mt-2">
            <Plus className="w-3 h-3" /> Add Act
          </button>
        </div>

        <div className="p-3 border-t">
          <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setShowMetadata(!showMetadata)}>
            {showMetadata ? 'Hide' : 'Edit'} Metadata
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {showMetadata ? (
          <div className="flex-1 overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-6">Drama Metadata</h2>
            <div className="space-y-4 max-w-xl">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input value={dramaTitle} onChange={(e) => setDramaTitle(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={dramaType} onChange={(e) => setDramaType(e.target.value)}>
                  {['Drama', 'Play', 'Screenplay', 'Stage Script', 'TV Script'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px]"
                  value={dramaDescription} onChange={(e) => setDramaDescription(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveMetadata} disabled={updateDrama.isLoading}>
                  {updateDrama.isLoading ? 'Saving…' : 'Save Metadata'}
                </Button>
                <Button variant="ghost" onClick={() => setShowMetadata(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        ) : currentScene ? (
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-3 p-4 border-b">
              <Input value={sceneTitle} onChange={(e) => setSceneTitle(e.target.value)}
                className="h-8 text-sm font-medium border-0 bg-transparent px-0 focus-visible:ring-0" placeholder="Scene title" />
              <span className="text-xs text-muted-foreground">
                {dialogueLines.length} lines · {dialogueLines.reduce((s, l) => s + l.text.split(/\s+/).filter(Boolean).length, 0)} words
              </span>
              <Button size="sm" onClick={handleSaveScene} disabled={updateScene.isLoading}>
                <Save className="w-3 h-3 mr-1" />{updateScene.isLoading ? 'Saving…' : 'Save'}
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="max-w-3xl mx-auto space-y-2">
                {dialogueLines.map((line, i) => (
                  <div key={i} className="flex gap-2 items-start group">
                    <input
                      value={line.speaker}
                      onChange={(e) => updateDialogueLine(i, 'speaker', e.target.value)}
                      placeholder="Speaker"
                      className="w-28 shrink-0 h-9 px-2 rounded-md border border-input bg-background text-xs font-semibold text-brand-600 text-right"
                    />
                    <input
                      value={line.text}
                      onChange={(e) => updateDialogueLine(i, 'text', e.target.value)}
                      placeholder="Dialogue..."
                      className="flex-1 h-9 px-3 rounded-md border border-input bg-background text-sm"
                    />
                    <button onClick={() => removeDialogueLine(i)}
                      className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <button onClick={addDialogueLine}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mt-4">
                  <Plus className="w-4 h-4" /> Add Line
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Drama className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select an act and scene to edit, or add one</p>
              <div className="flex gap-2 justify-center mt-4">
                <Button variant="outline" size="sm" onClick={handleAddAct}>
                  <Plus className="w-4 h-4 mr-1" /> Add Act
                </Button>
                {selectedActId && (
                  <Button variant="outline" size="sm" onClick={handleAddScene}>
                    <Plus className="w-4 h-4 mr-1" /> Add Scene
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <Toaster />
    </div>
  );
}
