import { apiClient } from '../client';
import type {
  SkillCategory,
  Skill,
  UserSkillOffered,
  UserSkillWanted,
  UserSkillOfferedCreateRequest,
  UserSkillWantedCreateRequest,
  SkillBrowseEntry,
} from '@skillswap/types';

export const skillsApi = {
  getCategories: async () => {
    const response = await apiClient.get<SkillCategory[]>('/api/v1/skills/categories');
    return response.data;
  },

  getSkills: async (categoryId?: string) => {
    const response = await apiClient.get<Skill[]>('/api/v1/skills/skills', {
      params: categoryId ? { category_id: categoryId } : undefined,
    });
    return response.data;
  },

  browseSkills: async () => {
    const response = await apiClient.get<SkillBrowseEntry[]>('/api/v1/skills/browse');
    return response.data;
  },

  addOfferedSkill: async (data: UserSkillOfferedCreateRequest) => {
    const response = await apiClient.post<UserSkillOffered>('/api/v1/skills/offer', data);
    return response.data;
  },

  addWantedSkill: async (data: UserSkillWantedCreateRequest) => {
    const response = await apiClient.post<UserSkillWanted>('/api/v1/skills/want', data);
    return response.data;
  },

  removeOfferedSkill: async (offeredId: string) => {
    await apiClient.delete(`/api/v1/skills/offer/${offeredId}`);
  },

  removeWantedSkill: async (wantedId: string) => {
    await apiClient.delete(`/api/v1/skills/want/${wantedId}`);
  },
};
