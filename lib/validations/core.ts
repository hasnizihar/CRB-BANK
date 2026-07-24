import { z } from 'zod';

export const memberSchema = z.object({
  member_no: z.string().min(1, 'Member number is required'),
  nic: z.string().min(10, 'NIC must be at least 10 characters'),
  full_name: z.string().min(3, 'Full name must be at least 3 characters'),
  address: z.string().min(5, 'Address is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  gender: z.enum(['male', 'female']),
  occupation: z.string().optional(),
  dob: z.string(),
  join_date: z.string(),
  nominee: z.string().optional(),
  photo_url: z.string().nullable().optional(),
  signature_url: z.string().nullable().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional().default('active'),
});

export type MemberFormValues = z.infer<typeof memberSchema>;

export const savingsSchema = z.object({
  member_id: z.string().uuid('Valid member is required'),
  account_no: z.string().min(1, 'Account number is required'),
  passbook_no: z.string().min(1, 'Passbook number is required'),
  account_type: z.string().min(1, 'Account type is required'),
  opening_balance: z.number().min(0, 'Opening balance cannot be negative'),
  current_balance: z.number().min(0, 'Current balance cannot be negative').optional(),
  interest_rate: z.number().min(0, 'Interest rate cannot be negative').max(100, 'Interest rate cannot exceed 100'),
  status: z.enum(['active', 'dormant', 'closed', 'frozen']).optional().default('active'),
});

export type SavingsFormValues = z.infer<typeof savingsSchema>;
