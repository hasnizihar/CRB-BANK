import { BaseRepository } from '@/database/repositories/BaseRepository';
import { Database } from '@/lib/types/supabase';

import { AuditLogRepository } from '@/database/repositories/AuditLogRepository';
import { AuditLogService } from '@/services/AuditLogService';

export abstract class BaseService<T extends keyof Database['public']['Tables'], R extends BaseRepository<T>> {
  protected repository: R;
  protected auditService?: AuditLogService;

  constructor(repository: R) {
    this.repository = repository;
    
    // We can infer the supabase client from the repository to instantiate the AuditLogService
    // Only instantiate if the table isn't audit_log itself to prevent infinite loops
    // @ts-ignore
    if (this.repository.tableName !== 'audit_log') {
      // @ts-ignore
      const auditRepo = new AuditLogRepository(this.repository.supabase);
      this.auditService = new AuditLogService(auditRepo);
    }
  }

  // Helper to get current user ID. This requires passing in the user ID context usually,
  // but for a generic service we might need to rely on the client or let the caller pass it.
  // For simplicity, we'll try to fetch the session from the client instance.
  protected async getCurrentUserId(): Promise<string> {
    try {
      // @ts-ignore
      const { data: { session } } = await this.repository.supabase.auth.getSession();
      // fallback to a dummy user if none (useful for testing or system processes)
      return session?.user?.id || '00000000-0000-0000-0000-000000000000';
    } catch {
      return '00000000-0000-0000-0000-000000000000';
    }
  }

  async getAll() {
    return this.repository.getAll();
  }

  async getById(id: string) {
    if (!id) throw new Error('ID is required');
    return this.repository.getById(id);
  }

  async create(data: Database['public']['Tables'][T]['Insert']) {
    const result = await this.repository.create(data);
    
    if (this.auditService) {
      const userId = await this.getCurrentUserId();
      // @ts-ignore
      this.auditService.logAction(userId, 'CREATE', this.repository.tableName, result.id, null, result);
    }
    
    return result;
  }

  async update(id: string, data: Database['public']['Tables'][T]['Update']) {
    if (!id) throw new Error('ID is required');
    
    let beforeState = null;
    try {
      beforeState = await this.getById(id);
    } catch (e) {
      // Ignore
    }

    const result = await this.repository.update(id, data);
    
    if (this.auditService && beforeState) {
      const userId = await this.getCurrentUserId();
      // @ts-ignore
      this.auditService.logAction(userId, 'UPDATE', this.repository.tableName, id, beforeState, result);
    }
    
    return result;
  }

  async softDelete(id: string) {
    if (!id) throw new Error('ID is required');
    
    const result = await this.repository.softDelete(id);
    
    if (this.auditService) {
      const userId = await this.getCurrentUserId();
      // @ts-ignore
      this.auditService.logAction(userId, 'SUSPEND', this.repository.tableName, id, null, { status: 'suspended' });
    }
    
    return result;
  }
}
