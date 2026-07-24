import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { UserRole } from '@/lib/types/database';

export function useRBAC() {
  const supabase = createClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return profile as any;
    },
  });

  const hasRole = (allowedRoles: UserRole[]) => {
    if (!profile) return false;
    return allowedRoles.includes(profile.role);
  };

  const isAdmin = hasRole(['administrator']);
  const isManager = hasRole(['administrator', 'bank_manager']);

  return {
    profile,
    isLoading,
    hasRole,
    isAdmin,
    isManager,
  };
}
