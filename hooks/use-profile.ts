import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import type { ProfileData } from '@/lib/api-types';

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile.all,
    queryFn: async () => {
      const res = await fetch('/api/profile');
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to fetch profile');
      }
      return res.json() as Promise<ProfileData>;
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; username: string; bio: string }) => {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update profile');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
    },
  });
}
