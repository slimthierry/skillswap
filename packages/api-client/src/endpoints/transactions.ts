import { apiClient } from '../client';
import type { Transaction, TimeBalance } from '@skillswap/types';

export const transactionsApi = {
  getBalance: async () => {
    const response = await apiClient.get<TimeBalance>('/api/v1/transactions/balance');
    return response.data;
  },

  getHistory: async (limit = 50) => {
    const response = await apiClient.get<Transaction[]>('/api/v1/transactions/history', {
      params: { limit },
    });
    return response.data;
  },
};
