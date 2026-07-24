import { BaseService } from './BaseService';
import { MemberRepository } from '@/database/repositories/MemberRepository';
import { memberSchema } from '@/lib/validations/core';

export class MemberService extends BaseService<'members', MemberRepository> {
  constructor(repository: MemberRepository) {
    super(repository);
  }

  async getPaginated(options: any) {
    return this.repository.getMembersPaginated(options);
  }

  // Example of overriding create to include validation
  async create(data: any) {
    // Validate with Zod
    const validatedData = memberSchema.parse(data);
    return this.repository.create(validatedData as any);
  }

  async update(id: string, data: any) {
    // Validate with Zod
    const validatedData = memberSchema.partial().parse(data);
    return this.repository.update(id, validatedData as any);
  }
}
