import { useQuery } from '@tanstack/react-query';
import { matchingApi } from '../endpoints/matching';

export function useMatches() {
  return useQuery({
    queryKey: ['matching', 'matches'],
    queryFn: () => matchingApi.getMatches(),
    staleTime: 2 * 60 * 1000,
  });
}

export function useMutualMatches() {
  return useQuery({
    queryKey: ['matching', 'mutual'],
    queryFn: () => matchingApi.getMutualMatches(),
    staleTime: 2 * 60 * 1000,
  });
}
