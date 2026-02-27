import { useQuery } from '@tanstack/react-query';
import { transactionsApi } from '../endpoints/transactions';

export function useBalance() {
  return useQuery({
    queryKey: ['transactions', 'balance'],
    queryFn: () => transactionsApi.getBalance(),
    staleTime: 2 * 60 * 1000,
  });
}

export function useTransactionHistory(limit = 50) {
  return useQuery({
    queryKey: ['transactions', 'history', limit],
    queryFn: () => transactionsApi.getHistory(limit),
    staleTime: 2 * 60 * 1000,
  });
}
