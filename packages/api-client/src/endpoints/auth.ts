import { apiClient } from '../client';
import type { LoginRequest, RegisterRequest, TokenResponse, User } from '@skillswap/types';

export const authApi = {
  login: async (data: LoginRequest) => {
    const response = await apiClient.post<TokenResponse>('/api/v1/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest) => {
    const response = await apiClient.post<TokenResponse>('/api/v1/auth/register', data);
    return response.data;
  },

  me: async () => {
    const response = await apiClient.get<User>('/api/v1/auth/me');
    return response.data;
  },
};
