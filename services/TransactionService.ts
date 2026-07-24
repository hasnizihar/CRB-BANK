import { BaseService } from './BaseService';
import { TransactionRepository } from '@/database/repositories/TransactionRepository';
import { z } from 'zod';

const processTransactionSchema = z.object({
  accountId: z.string().uuid(),
  type: z.enum(['deposit', 'withdrawal']),
  amount: z.number().positive("Amount must be greater than zero"),
  description: z.string().optional()
});

export class TransactionService extends BaseService<'transactions', TransactionRepository> {
  constructor(repository: TransactionRepository) {
    super(repository);
  }

  async processTransaction(payload: { accountId: string, type: 'deposit' | 'withdrawal', amount: number, description?: string }) {
    const validated = processTransactionSchema.parse(payload);
    
    // Process the transaction using the RPC via the repository
    const result = await this.repository.processTransaction(
      validated.accountId, 
      validated.type, 
      validated.amount, 
      validated.description
    );
    
    // Manually trigger an audit log for this important action
    if (this.auditService) {
      try {
        const userId = await this.getCurrentUserId();
        // The RPC creates a transaction record and updates the savings account.
        // We'll log the RPC execution event itself since we can't easily capture the inner DB state transitions directly from the client.
        this.auditService.logAction(
          userId, 
          `PROCESS_${validated.type.toUpperCase()}`, 
          'savings_accounts', 
          validated.accountId, 
          null, 
          result
        );
      } catch(e) {
        // ignore audit failure
      }
    }
    
    return result;
  }

  async getTransactionsByType(type: 'deposit' | 'withdrawal', limit = 50) {
    return this.repository.getTransactionsByType(type, limit);
  }
}
