export const queryKeys = {
  profile: {
    all: ['profile'] as const,
  },
  content: {
    all: ['content'] as const,
    list: (filters?: Record<string, unknown>) => ['content', 'list', filters] as const,
    detail: (id: string) => ['content', 'detail', id] as const,
  },
  comments: {
    all: ['comments'] as const,
    list: (contentId: string) => ['comments', 'list', contentId] as const,
  },
  likes: {
    all: ['likes'] as const,
    status: (contentId: string) => ['likes', 'status', contentId] as const,
  },
  follows: {
    all: ['follows'] as const,
    followers: (userId: string) => ['follows', 'followers', userId] as const,
    following: (userId: string) => ['follows', 'following', userId] as const,
    check: (targetUserId: string) => ['follows', 'check', targetUserId] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    list: ['notifications', 'list'] as const,
    unreadCount: ['notifications', 'unreadCount'] as const,
  },
};
