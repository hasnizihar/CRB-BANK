import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { MemberService } from '@/services/MemberService';
import { MemberRepository } from '@/database/repositories/MemberRepository';

// Helper to get service instance
const getMemberService = () => {
  const supabase = createClient();
  const repository = new MemberRepository(supabase);
  return new MemberService(repository);
};

export function useMembers(options: {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
} = { page: 1, limit: 25 }) {
  return useQuery({
    queryKey: ['members', options],
    queryFn: async () => {
      const service = getMemberService();
      return service.getPaginated(options);
    },
  });
}

export function useMember(id: string) {
  return useQuery({
    queryKey: ['members', id],
    queryFn: async () => {
      if (!id) return null;
      const service = getMemberService();
      return service.getById(id);
    },
    enabled: !!id,
  });
}

export function useCreateMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const service = getMemberService();
      return service.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
}

export function useUpdateMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const service = getMemberService();
      return service.update(id, data);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['members', variables.id] });
    },
  });
}
