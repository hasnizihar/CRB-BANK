import { AuditLogRepository } from '@/database/repositories/AuditLogRepository';

export class AuditLogService {
  private repository: AuditLogRepository;

  constructor(repository: AuditLogRepository) {
    this.repository = repository;
  }

  async getRecentLogs(limit = 100) {
    return this.repository.getRecentLogs(limit);
  }

  async logAction(
    userId: string, 
    action: string, 
    tableName: string, 
    recordId: string, 
    beforeState?: any, 
    afterState?: any
  ) {
    // Fire and forget, we don't want to block main operations if logging fails
    this.repository.create({
      user_id: userId,
      action,
      table_name: tableName,
      record_id: recordId,
      before: beforeState || null,
      after: afterState || null,
    }).catch(err => console.error('Failed to write audit log:', err));
  }
}
