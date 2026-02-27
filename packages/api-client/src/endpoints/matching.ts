import { apiClient } from '../client';
import type { SkillMatch } from '@skillswap/types';

export const matchingApi = {
  getMatches: async () => {
    const response = await apiClient.get<SkillMatch[]>('/api/v1/matching/matches');
    return response.data;
  },

  getMutualMatches: async () => {
    const response = await apiClient.get<SkillMatch[]>('/api/v1/matching/mutual-matches');
    return response.data;
  },
};
