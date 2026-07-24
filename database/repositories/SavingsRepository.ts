import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/types/supabase';
import { BaseRepository } from './BaseRepository';

export class SavingsRepository extends BaseRepository<'savings_accounts'> {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'savings_accounts');
  }

  // Savings specific complex queries can go here
  async getSavingsWithMember() {
    const { data, error } = await (this.supabase
      .from(this.tableName)
      .select('*, members(full_name, member_no), customers(full_name, nic, customer_type)')
      .order('created_at', { ascending: false }) as any);
    if (error) throw error;
    return data;
  }
  
  async getSavingsByMemberId(memberId: string) {
    const { data, error } = await (this.supabase
      .from(this.tableName)
      .select('*')
      .eq('member_id', memberId) as any);
    if (error) throw error;
    return data;
  }

  async getSavingsDetailById(id: string) {
    const { data, error } = await (this.supabase
      .from(this.tableName)
      .select('*, member:members(*), customer:customers(*)')
      .eq('id', id)
      .single() as any);

    if (error) throw new Error(error.message);
    return data;
  }

  async findByAccountNo(accountNo: string) {
    const { data, error } = await (this.supabase
      .from(this.tableName)
      .select('*, members(full_name, member_no), customers(full_name, nic)')
      .eq('account_no', accountNo.trim().toUpperCase())
      .single() as any);

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(error.message);
    }
    return data;
  }
}
