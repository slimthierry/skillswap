import { apiClient } from '../client';
import type { User, UserProfile } from '@skillswap/types';

export const usersApi = {
  getProfile: async (userId: string) => {
    const response = await apiClient.get<UserProfile>(`/api/v1/users/profile/${userId}`);
    return response.data;
  },

  updateProfile: async (data: { username?: string; bio?: string; avatar_url?: string }) => {
    const response = await apiClient.put<User>('/api/v1/users/profile', data);
    return response.data;
  },

  search: async (q: string, limit = 20) => {
    const response = await apiClient.get<User[]>('/api/v1/users/search', {
      params: { q, limit },
    });
    return response.data;
  },
};
