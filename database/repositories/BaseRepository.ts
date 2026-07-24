import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/types/supabase';

export abstract class BaseRepository<T extends keyof Database['public']['Tables']> {
  protected supabase: SupabaseClient<Database>;
  protected tableName: T;

  constructor(supabase: SupabaseClient<Database>, tableName: T) {
    this.supabase = supabase;
    this.tableName = tableName;
  }

  async getAll() {
    const { data, error } = await (this.supabase
      .from(this.tableName) as any)
      .select('*');
    
    if (error) throw new Error(error.message);
    return data;
  }

  async getById(id: string) {
    const { data, error } = await (this.supabase
      .from(this.tableName) as any)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  }

  async create(payload: Database['public']['Tables'][T]['Insert']) {
    const { data, error } = await (this.supabase
      .from(this.tableName) as any)
      .insert(payload)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  }

  async update(id: string, payload: Database['public']['Tables'][T]['Update']) {
    const { data, error } = await (this.supabase
      .from(this.tableName) as any)
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  }

  async softDelete(id: string) {
    // Assuming 'status' is a common field for soft deletes
    const { data, error } = await (this.supabase
      .from(this.tableName) as any)
      .update({ status: 'suspended' })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  }

  async delete(id: string) {
    const { error } = await (this.supabase
      .from(this.tableName) as any)
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(error.message);
    return true;
  }
}
