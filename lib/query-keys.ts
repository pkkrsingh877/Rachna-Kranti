export const queryKeys = {
  profile: {
    all: ['profile'] as const,
  },
  content: {
    all: ['content'] as const,
    list: (filters?: Record<string, unknown>) => ['content', 'list', filters] as const,
    detail: (id: string) => ['content', 'detail', id] as const,
  },
};
