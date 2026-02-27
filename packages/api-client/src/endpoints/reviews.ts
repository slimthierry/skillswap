import { apiClient } from '../client';
import type { SessionReview, SessionReviewCreateRequest } from '@skillswap/types';

export const reviewsApi = {
  create: async (sessionId: string, data: SessionReviewCreateRequest) => {
    const response = await apiClient.post<SessionReview>('/api/v1/reviews/create', data, {
      params: { session_id: sessionId },
    });
    return response.data;
  },

  getUserReviews: async (userId: string) => {
    const response = await apiClient.get<SessionReview[]>(`/api/v1/reviews/user/${userId}`);
    return response.data;
  },
};
