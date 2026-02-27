import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { skillsApi } from '../endpoints/skills';
import type { UserSkillOfferedCreateRequest, UserSkillWantedCreateRequest } from '@skillswap/types';

export function useSkillCategories() {
  return useQuery({
    queryKey: ['skills', 'categories'],
    queryFn: () => skillsApi.getCategories(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useSkills(categoryId?: string) {
  return useQuery({
    queryKey: ['skills', 'list', categoryId],
    queryFn: () => skillsApi.getSkills(categoryId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useBrowseSkills() {
  return useQuery({
    queryKey: ['skills', 'browse'],
    queryFn: () => skillsApi.browseSkills(),
    staleTime: 2 * 60 * 1000,
  });
}

export function useAddOfferedSkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UserSkillOfferedCreateRequest) => skillsApi.addOfferedSkill(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['matching'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useAddWantedSkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UserSkillWantedCreateRequest) => skillsApi.addWantedSkill(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['matching'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useRemoveOfferedSkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (offeredId: string) => skillsApi.removeOfferedSkill(offeredId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['matching'] });
    },
  });
}

export function useRemoveWantedSkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (wantedId: string) => skillsApi.removeWantedSkill(wantedId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['matching'] });
    },
  });
}
