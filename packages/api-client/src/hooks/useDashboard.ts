import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../endpoints/dashboard';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard', 'my'],
    queryFn: () => dashboardApi.getMyDashboard(),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useCommunityStats() {
  return useQuery({
    queryKey: ['dashboard', 'community-stats'],
    queryFn: () => dashboardApi.getCommunityStats(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSkillMap() {
  return useQuery({
    queryKey: ['dashboard', 'skill-map'],
    queryFn: () => dashboardApi.getSkillMap(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTopTeachers(limit = 10) {
  return useQuery({
    queryKey: ['dashboard', 'top-teachers', limit],
    queryFn: () => dashboardApi.getTopTeachers(limit),
    staleTime: 5 * 60 * 1000,
  });
}
