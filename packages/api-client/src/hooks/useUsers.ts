import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../endpoints/users';

export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: ['users', 'profile', userId],
    queryFn: () => usersApi.getProfile(userId),
    staleTime: 2 * 60 * 1000,
    enabled: !!userId,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { username?: string; bio?: string; avatar_url?: string }) =>
      usersApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useSearchUsers(q: string, limit = 20) {
  return useQuery({
    queryKey: ['users', 'search', q, limit],
    queryFn: () => usersApi.search(q, limit),
    staleTime: 1 * 60 * 1000,
    enabled: q.length > 0,
  });
}
