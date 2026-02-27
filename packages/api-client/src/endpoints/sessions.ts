import { apiClient } from '../client';
import type { Session, SessionCreateRequest } from '@skillswap/types';

export const sessionsApi = {
  book: async (data: SessionCreateRequest) => {
    const response = await apiClient.post<Session>('/api/v1/sessions/book', data);
    return response.data;
  },

  getMySessions: async () => {
    const response = await apiClient.get<Session[]>('/api/v1/sessions/my-sessions');
    return response.data;
  },

  getUpcoming: async () => {
    const response = await apiClient.get<Session[]>('/api/v1/sessions/upcoming');
    return response.data;
  },

  confirm: async (sessionId: string) => {
    const response = await apiClient.put<Session>(`/api/v1/sessions/${sessionId}/confirm`);
    return response.data;
  },

  complete: async (sessionId: string) => {
    const response = await apiClient.put<Session>(`/api/v1/sessions/${sessionId}/complete`);
    return response.data;
  },

  cancel: async (sessionId: string) => {
    const response = await apiClient.put<Session>(`/api/v1/sessions/${sessionId}/cancel`);
    return response.data;
  },
};
