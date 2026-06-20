import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import type { PaginatedResponse, DramaItem, ActItem, SceneItem } from '@/lib/api-types';

export function useDramas(filters?: Record<string, unknown>) {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value));
      }
    });
  }
  const qs = params.toString();

  return useQuery({
    queryKey: queryKeys.dramas.list(filters),
    queryFn: async () => {
      const res = await fetch(`/api/dramas${qs ? `?${qs}` : ''}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to fetch dramas');
      }
      return res.json() as Promise<PaginatedResponse<DramaItem>>;
    },
  });
}

export function useDrama(id: string) {
  return useQuery({
    queryKey: queryKeys.dramas.detail(id),
    queryFn: async () => {
      const res = await fetch(`/api/dramas/${id}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to fetch drama');
      }
      return res.json() as Promise<{ drama: DramaItem; acts: ActItem[]; scenes: SceneItem[] }>;
    },
    enabled: !!id,
  });
}

export function useCreateDrama() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      type?: string;
      description?: string;
      coverImage?: string;
      status?: string;
    }) => {
      const res = await fetch('/api/dramas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create drama');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dramas.all });
    },
  });
}

export function useUpdateDrama() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<{ title: string; type: string; description: string; coverImage: string; status: string }> }) => {
      const res = await fetch(`/api/dramas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update drama');
      }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dramas.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dramas.all });
    },
  });
}

export function useDeleteDrama() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/dramas/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete drama');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dramas.all });
    },
  });
}

export function usePublishDrama() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/dramas/${id}/publish`, { method: 'POST' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to publish drama');
      }
      return res.json();
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dramas.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dramas.all });
    },
  });
}

export function useCreateAct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ dramaId, data }: { dramaId: string; data: { title: string; order?: number } }) => {
      const res = await fetch(`/api/dramas/${dramaId}/acts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create act');
      }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dramas.detail(variables.dramaId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dramas.acts(variables.dramaId) });
    },
  });
}

export function useUpdateAct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ dramaId, actId, data }: { dramaId: string; actId: string; data: Partial<{ title: string; order: number }> }) => {
      const res = await fetch(`/api/dramas/${dramaId}/acts/${actId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update act');
      }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dramas.detail(variables.dramaId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dramas.acts(variables.dramaId) });
    },
  });
}

export function useDeleteAct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ dramaId, actId }: { dramaId: string; actId: string }) => {
      const res = await fetch(`/api/dramas/${dramaId}/acts/${actId}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete act');
      }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dramas.detail(variables.dramaId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dramas.acts(variables.dramaId) });
    },
  });
}

export function useReorderActs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ dramaId, orders }: { dramaId: string; orders: { id: string; order: number }[] }) => {
      const res = await fetch(`/api/dramas/${dramaId}/acts/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to reorder acts');
      }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dramas.detail(variables.dramaId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dramas.acts(variables.dramaId) });
    },
  });
}

export function useActDetail(dramaId: string, actId: string) {
  return useQuery({
    queryKey: [...queryKeys.dramas.acts(dramaId), actId],
    queryFn: async () => {
      const res = await fetch(`/api/dramas/${dramaId}/acts/${actId}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to fetch act');
      }
      return res.json() as Promise<{ act: ActItem; scenes: SceneItem[] }>;
    },
    enabled: !!dramaId && !!actId,
  });
}

export function useCreateScene() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ dramaId, actId, data }: { dramaId: string; actId: string; data: { title: string; content?: { speaker: string; text: string }[]; order?: number } }) => {
      const res = await fetch(`/api/dramas/${dramaId}/acts/${actId}/scenes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create scene');
      }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dramas.detail(variables.dramaId) });
      queryClient.invalidateQueries({ queryKey: [...queryKeys.dramas.acts(variables.dramaId), variables.actId] });
    },
  });
}

export function useUpdateScene() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ dramaId, actId, sceneId, data }: { dramaId: string; actId: string; sceneId: string; data: Partial<{ title: string; content: { speaker: string; text: string }[]; order: number }> }) => {
      const res = await fetch(`/api/dramas/${dramaId}/acts/${actId}/scenes/${sceneId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update scene');
      }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dramas.detail(variables.dramaId) });
      queryClient.invalidateQueries({ queryKey: [...queryKeys.dramas.acts(variables.dramaId), variables.actId] });
    },
  });
}

export function useDeleteScene() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ dramaId, actId, sceneId }: { dramaId: string; actId: string; sceneId: string }) => {
      const res = await fetch(`/api/dramas/${dramaId}/acts/${actId}/scenes/${sceneId}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete scene');
      }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dramas.detail(variables.dramaId) });
      queryClient.invalidateQueries({ queryKey: [...queryKeys.dramas.acts(variables.dramaId), variables.actId] });
    },
  });
}

export function useReorderScenes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ dramaId, actId, orders }: { dramaId: string; actId: string; orders: { id: string; order: number }[] }) => {
      const res = await fetch(`/api/dramas/${dramaId}/acts/${actId}/scenes/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to reorder scenes');
      }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dramas.detail(variables.dramaId) });
      queryClient.invalidateQueries({ queryKey: [...queryKeys.dramas.acts(variables.dramaId), variables.actId] });
    },
  });
}
