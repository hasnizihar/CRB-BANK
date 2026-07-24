import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { TransactionService } from '@/services/TransactionService';
import { TransactionRepository } from '@/database/repositories/TransactionRepository';

const getTransactionService = () => {
  const supabase = createClient();
  const repository = new TransactionRepository(supabase);
  return new TransactionService(repository);
};

export function useTransactionsByType(type: 'deposit' | 'withdrawal', limit = 50) {
  return useQuery({
    queryKey: ['transactions', type, limit],
    queryFn: async () => {
      const service = getTransactionService();
      return service.getTransactionsByType(type, limit);
    },
  });
}

export function useProcessTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: { accountId: string, type: 'deposit' | 'withdrawal', amount: number, description?: string }) => {
      const service = getTransactionService();
      return service.processTransaction(payload);
    },
    onSuccess: (_, variables) => {
      // Invalidate both transactions list and the specific savings account
      queryClient.invalidateQueries({ queryKey: ['transactions', variables.type] });
      queryClient.invalidateQueries({ queryKey: ['savings', 'search'] });
      queryClient.invalidateQueries({ queryKey: ['savings', variables.accountId] });
      queryClient.invalidateQueries({ queryKey: ['savings'] });
    },
  });
}
