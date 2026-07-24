import { BaseService } from './BaseService';
import { SavingsRepository } from '@/database/repositories/SavingsRepository';
import { savingsSchema } from '@/lib/validations/core';

export class SavingsService extends BaseService<'savings_accounts', SavingsRepository> {
  constructor(repository: SavingsRepository) {
    super(repository);
  }

  async getAllWithMember() {
    return await this.repository.getSavingsWithMember();
  }
  
  async getByMemberId(memberId: string) {
    return this.repository.getSavingsByMemberId(memberId);
  }

  async findByAccountNo(accountNo: string) {
    if (!accountNo) return null;
    return this.repository.findByAccountNo(accountNo);
  }

  async create(data: any) {
    const validatedData = savingsSchema.parse(data);
    return await super.create(validatedData as any);
  }

  async update(id: string, data: any) {
    const validatedData = savingsSchema.partial().parse(data);
    return await super.update(id, validatedData as any);
  }

  async getSavingsDetailById(id: string) {
    return await this.repository.getSavingsDetailById(id);
  }
}
