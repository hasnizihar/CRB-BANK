import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/types/supabase';
import { BaseRepository } from './BaseRepository';

export class TransactionRepository extends BaseRepository<'transactions'> {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'transactions');
  }

  async processTransaction(accountId: string, type: 'deposit' | 'withdrawal', amount: number, description?: string) {
    // @ts-expect-error - Supabase generated types might not perfectly match RPC signature yet
    const { data, error } = await this.supabase.rpc('process_transaction', {
      p_account_id: accountId,
      p_type: type,
      p_amount: amount,
      p_description: description || null
    });

    if (error) throw new Error(error.message);
    return data;
  }

  async getTransactionsByType(type: 'deposit' | 'withdrawal', limit = 50) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await (this.supabase
      .from(this.tableName)
      .select('*, savings_accounts(account_no, members(full_name), customers(full_name))')
      .eq('type', type)
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: false })
      .limit(limit) as any);

    if (error) throw new Error(error.message);
    return data;
  }
}
