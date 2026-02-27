import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../endpoints/auth';
import type { LoginRequest, RegisterRequest } from '@skillswap/types';

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const tokens = await authApi.login(data);
      localStorage.setItem('access_token', tokens.access_token);
      return tokens;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const tokens = await authApi.register(data);
      localStorage.setItem('access_token', tokens.access_token);
      return tokens;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authApi.me(),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
