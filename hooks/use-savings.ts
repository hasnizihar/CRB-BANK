import { createClient } from '@/lib/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SavingsService } from '@/services/SavingsService';
import { SavingsRepository } from '@/database/repositories/SavingsRepository';

const getSavingsService = () => {
  const supabase = createClient();
  const repository = new SavingsRepository(supabase);
  return new SavingsService(repository);
};

export function useSavings() {
  return useQuery({
    queryKey: ['savings'],
    queryFn: async () => {
      const service = getSavingsService();
      return service.getAllWithMember();
    },
  });
}

export function useSaving(id: string) {
  return useQuery({
    queryKey: ['savings', id],
    queryFn: async () => {
      if (!id) return null;
      const service = getSavingsService();
      return service.getSavingsDetailById(id);
    },
    enabled: !!id,
  });
}

export function useSavingsByMember(memberId: string) {
  return useQuery({
    queryKey: ['savings', 'member', memberId],
    queryFn: async () => {
      if (!memberId) return [];
      const service = getSavingsService();
      return service.getByMemberId(memberId);
    },
    enabled: !!memberId,
  });
}

export function useSearchAccount(accountNo: string) {
  return useQuery({
    queryKey: ['savings', 'search', accountNo],
    queryFn: async () => {
      if (!accountNo) return null;
      const service = getSavingsService();
      return service.findByAccountNo(accountNo);
    },
    enabled: !!accountNo,
    retry: false, // Don't retry if account not found
  });
}

export function useCreateSaving() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const service = getSavingsService();
      return service.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings'] });
    },
  });
}

export function useUpdateSaving() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const service = getSavingsService();
      return service.update(id, data);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['savings'] });
      queryClient.invalidateQueries({ queryKey: ['savings', variables.id] });
    },
  });
}

export function useDeleteSaving() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const service = getSavingsService();
      return service.softDelete(id);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['savings'] });
      queryClient.invalidateQueries({ queryKey: ['savings', id] });
    },
  });
}
