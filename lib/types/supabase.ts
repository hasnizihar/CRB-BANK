import {
  Profile,
  Member,
  Customer,
  SavingsAccount,
  Transaction,
  Loan,
  LoanPayment,
  CashBook,
  AuditLog,
  Notification
} from './database';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile>;
        Update: Partial<Profile>;
      };
      members: {
        Row: Member;
        Insert: Partial<Member>;
        Update: Partial<Member>;
      };
      customers: {
        Row: Customer;
        Insert: Partial<Customer>;
        Update: Partial<Customer>;
      };
      savings_accounts: {
        Row: SavingsAccount;
        Insert: Partial<SavingsAccount>;
        Update: Partial<SavingsAccount>;
      };
      transactions: {
        Row: Transaction;
        Insert: Partial<Transaction>;
        Update: Partial<Transaction>;
      };
      loans: {
        Row: Loan;
        Insert: Partial<Loan>;
        Update: Partial<Loan>;
      };
      loan_payments: {
        Row: LoanPayment;
        Insert: Partial<LoanPayment>;
        Update: Partial<LoanPayment>;
      };
      cash_book: {
        Row: CashBook;
        Insert: Partial<CashBook>;
        Update: Partial<CashBook>;
      };
      audit_log: {
        Row: AuditLog;
        Insert: Partial<AuditLog>;
        Update: Partial<AuditLog>;
      };
      notifications: {
        Row: Notification;
        Insert: Partial<Notification>;
        Update: Partial<Notification>;
      };
    };
    Views: {
      [_ in never]: never
    };
    Functions: {
      process_transaction: {
        Args: {
          p_account_id: string;
          p_type: string;
          p_amount: number;
          p_description?: string | null;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never
    };
    CompositeTypes: {
      [_ in never]: never
    };
  };
}
