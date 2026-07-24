import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/types/supabase';
import { BaseRepository } from './BaseRepository';

export class AuditLogRepository extends BaseRepository<'audit_log'> {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'audit_log');
  }

  async getRecentLogs(limit = 100) {
    const { data, error } = await (this.supabase
      .from(this.tableName)
      .select('*, user:profiles(name, role)')
      .order('created_at', { ascending: false })
      .limit(limit) as any);
      
    if (error) throw error;
    return data;
  }
}
