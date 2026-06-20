import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import type { PaginatedResponse, BookItem, ChapterItem } from '@/lib/api-types';

export function useBooks(filters?: Record<string, unknown>) {
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
    queryKey: queryKeys.books.list(filters),
    queryFn: async () => {
      const res = await fetch(`/api/books${qs ? `?${qs}` : ''}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to fetch books');
      }
      return res.json() as Promise<PaginatedResponse<BookItem>>;
    },
  });
}

export function useBook(id: string) {
  return useQuery({
    queryKey: queryKeys.books.detail(id),
    queryFn: async () => {
      const res = await fetch(`/api/books/${id}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to fetch book');
      }
      return res.json() as Promise<{ book: BookItem; chapters: ChapterItem[] }>;
    },
    enabled: !!id,
  });
}

export function useCreateBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      type?: string;
      subtitle?: string;
      description?: string;
      coverImage?: string;
      tags?: string[];
      status?: string;
    }) => {
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create book');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.books.all });
    },
  });
}

export function useUpdateBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<{ title: string; type: string; subtitle: string; description: string; coverImage: string; tags: string[]; status: string }> }) => {
      const res = await fetch(`/api/books/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update book');
      }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.books.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.books.all });
    },
  });
}

export function useDeleteBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/books/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete book');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.books.all });
    },
  });
}

export function usePublishBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/books/${id}/publish`, { method: 'POST' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to publish book');
      }
      return res.json();
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.books.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.books.all });
    },
  });
}

export function useCreateChapter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookId, data }: { bookId: string; data: { title: string; content?: any; order?: number } }) => {
      const res = await fetch(`/api/books/${bookId}/chapters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create chapter');
      }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.books.detail(variables.bookId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.books.chapters(variables.bookId) });
    },
  });
}

export function useUpdateChapter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookId, chapterId, data }: { bookId: string; chapterId: string; data: Partial<{ title: string; content: any; order: number }> }) => {
      const res = await fetch(`/api/books/${bookId}/chapters/${chapterId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update chapter');
      }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.books.detail(variables.bookId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.books.chapters(variables.bookId) });
    },
  });
}

export function useDeleteChapter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookId, chapterId }: { bookId: string; chapterId: string }) => {
      const res = await fetch(`/api/books/${bookId}/chapters/${chapterId}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete chapter');
      }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.books.detail(variables.bookId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.books.chapters(variables.bookId) });
    },
  });
}

export function useReorderChapters() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookId, orders }: { bookId: string; orders: { id: string; order: number }[] }) => {
      const res = await fetch(`/api/books/${bookId}/chapters/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to reorder chapters');
      }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.books.detail(variables.bookId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.books.chapters(variables.bookId) });
    },
  });
}
