import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/types/supabase';
import { BaseRepository } from './BaseRepository';

export class MemberRepository extends BaseRepository<'members'> {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'members');
  }

  async getMembersPaginated(options: { 
    page: number; 
    limit: number; 
    search?: string; 
    status?: string; 
    sortBy?: string; 
    sortOrder?: 'asc' | 'desc';
  }) {
    const { page, limit, search, status, sortBy = 'created_at', sortOrder = 'desc' } = options;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = (this.supabase.from(this.tableName) as any).select('*', { count: 'exact' });

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,member_no.ilike.%${search}%,nic.ilike.%${search}%`);
    }

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    query = query.range(from, to);

    const { data, error, count } = await query;
    
    if (error) throw new Error(error.message);
    
    return { data, count };
  }
}
