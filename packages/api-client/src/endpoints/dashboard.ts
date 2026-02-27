import { apiClient } from '../client';
import type {
  UserDashboard,
  CommunityStats,
  SkillMapEntry,
  TopTeacher,
} from '@skillswap/types';

export const dashboardApi = {
  getMyDashboard: async () => {
    const response = await apiClient.get<UserDashboard>('/api/v1/dashboard/my-dashboard');
    return response.data;
  },

  getCommunityStats: async () => {
    const response = await apiClient.get<CommunityStats>('/api/v1/dashboard/community-stats');
    return response.data;
  },

  getSkillMap: async () => {
    const response = await apiClient.get<SkillMapEntry[]>('/api/v1/dashboard/skill-map');
    return response.data;
  },

  getTopTeachers: async (limit = 10) => {
    const response = await apiClient.get<TopTeacher[]>('/api/v1/dashboard/top-teachers', {
      params: { limit },
    });
    return response.data;
  },
};
