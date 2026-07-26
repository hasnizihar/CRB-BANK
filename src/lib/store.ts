import type { Member, SavingsAccount, Loan, PawnRecord, Transaction, AuditLog } from '../types';
import { supabase } from './supabase';

const INITIAL_MEMBERS: Member[] = [
  {
    id: 'mem-1',
    organization_id: 'org-1',
    member_number: 'MEM-000001',
    first_name: 'Ahamed',
    last_name: 'Rifke',
    nic: '883451234V',
    phone: '077-2345678',
    email: 'rifke@kattankudympcs.lk',
    address: '124 Main Street, Divisi 04',
    city: 'Kattankudy',
    occupation: 'Merchant',
    member_type: 'MEMBER',
    membership_status: 'ACTIVE',
    membership_date: '2023-01-15',
    created_at: '2023-01-15T08:30:00Z'
  },
  {
    id: 'mem-2',
    organization_id: 'org-1',
    member_number: 'MEM-000002',
    first_name: 'Fathima',
    last_name: 'Zahra',
    nic: '925671234V',
    phone: '071-8765432',
    email: 'zahra.f@gmail.com',
    address: '45 Mosque Road, Divisi 02',
    city: 'Kattankudy',
    occupation: 'Teacher',
    member_type: 'MEMBER',
    membership_status: 'ACTIVE',
    membership_date: '2023-03-20',
    created_at: '2023-03-20T10:15:00Z'
  },
  {
    id: 'mem-3',
    organization_id: 'org-1',
    member_number: 'MEM-000003',
    first_name: 'Mohamed',
    last_name: 'Faiz',
    nic: '791234567V',
    phone: '076-5432109',
    address: '89 Beach Road, Divisi 06',
    city: 'Kattankudy',
    occupation: 'Fisheries Contractor',
    member_type: 'MEMBER',
    membership_status: 'ACTIVE',
    membership_date: '2022-11-10',
    created_at: '2022-11-10T14:20:00Z'
  },
  {
    id: 'mem-4',
    organization_id: 'org-1',
    member_number: 'CUS-000004',
    first_name: 'Abdul',
    last_name: 'Kalam',
    nic: '852345678V',
    phone: '075-1122334',
    address: '12 Market Lane, Divisi 01',
    city: 'Kattankudy',
    occupation: 'Hardware Store Owner',
    member_type: 'NON_MEMBER',
    non_member_type: 'INSTITUTION',
    membership_status: 'ACTIVE',
    membership_date: '2021-08-05',
    created_at: '2021-08-05T09:00:00Z'
  },
  {
    id: 'mem-5',
    organization_id: 'org-1',
    member_number: 'MEM-000005',
    first_name: 'Noor',
    last_name: 'Jahan',
    nic: '956781234V',
    phone: '077-9988776',
    address: '34 School Lane, Divisi 03',
    city: 'Kattankudy',
    occupation: 'Nurse',
    member_type: 'MEMBER',
    membership_status: 'ACTIVE',
    membership_date: '2024-02-12',
    created_at: '2024-02-12T11:45:00Z'
  }
];

const INITIAL_SAVINGS: SavingsAccount[] = [
  {
    id: 'sav-1',
    organization_id: 'org-1',
    account_number: 'SAV-000001',
    member_id: 'mem-1',
    account_type: 'REGULAR',
    customer_name: 'Ahamed Rifke',
    customer_nic: '883451234V',
    balance: 145000.50,
    interest_rate: 6.5,
    status: 'ACTIVE',
    created_at: '2023-01-15T08:35:00Z'
  },
  {
    id: 'sav-2',
    organization_id: 'org-1',
    account_number: 'SAV-000002',
    member_id: 'mem-2',
    account_type: 'SENIOR',
    customer_name: 'Fathima Zahra',
    customer_nic: '925671234V',
    balance: 320500.00,
    interest_rate: 7.5,
    status: 'ACTIVE',
    created_at: '2023-03-20T10:20:00Z'
  },
  {
    id: 'sav-3',
    organization_id: 'org-1',
    account_number: 'SAV-000003',
    member_id: 'mem-3',
    account_type: 'REGULAR',
    customer_name: 'Mohamed Faiz',
    customer_nic: '791234567V',
    balance: 89000.00,
    interest_rate: 6.5,
    status: 'ACTIVE',
    created_at: '2022-11-10T14:25:00Z'
  },
  {
    id: 'sav-4',
    organization_id: 'org-1',
    account_number: 'SAV-000004',
    member_id: undefined, // Non-member customer per Rule 1
    account_type: 'CHILDREN',
    customer_name: 'Zeyd Ahamed (Minor)',
    customer_nic: '883451234V-C',
    balance: 55000.00,
    interest_rate: 8.0,
    status: 'ACTIVE',
    created_at: '2024-01-05T09:15:00Z'
  }
];

const INITIAL_LOANS: Loan[] = [
  {
    id: 'lon-1',
    organization_id: 'org-1',
    loan_number: 'LON-000001',
    member_id: 'mem-1',
    loan_type: 'BUSINESS',
    original_amount: 500000,
    interest_rate: 12.5,
    total_payable: 562500,
    paid_amount: 250000,
    outstanding_amount: 312500,
    duration_months: 24,
    installment_frequency: 'MONTHLY',
    start_date: '2023-06-01',
    due_date: '2025-06-01',
    guarantor_name: 'Mohamed Faiz',
    guarantor_nic: '791234567V',
    guarantor2_name: 'Zeyd Ahamed',
    guarantor2_nic: '991234567V',
    purpose: 'Shop inventory expansion',
    status: 'ACTIVE',
    created_at: '2023-06-01T10:00:00Z'
  },
  {
    id: 'lon-2',
    organization_id: 'org-1',
    loan_number: 'LON-000002',
    member_id: 'mem-3',
    loan_type: 'AGRICULTURAL',
    original_amount: 300000,
    interest_rate: 10.0,
    total_payable: 330000,
    paid_amount: 330000,
    outstanding_amount: 0,
    duration_months: 12,
    installment_frequency: 'MONTHLY',
    start_date: '2022-12-01',
    due_date: '2023-12-01',
    purpose: 'Boat engine repair',
    status: 'COMPLETED',
    created_at: '2022-12-01T11:00:00Z'
  }
];

const INITIAL_PAWNS: PawnRecord[] = [
  {
    id: 'pwn-1',
    organization_id: 'org-1',
    pawn_number: 'PWN-000001',
    member_id: 'mem-2',
    item_description: '22K Gold Bangle Set (2 pairs)',
    category: 'GOLD_22K',
    weight_grams: 32.5,
    condition: 'Excellent, hallmarked',
    valuation_amount: 650000,
    loan_amount: 450000,
    interest_rate: 14.0,
    start_date: '2024-03-01',
    due_date: '2025-03-01',
    status: 'ACTIVE',
    storage_location: 'Safe 02 - Drawer B',
    notes: 'Verified by Appraiser S. Rahman',
    created_at: '2024-03-01T15:30:00Z'
  },
  {
    id: 'pwn-2',
    organization_id: 'org-1',
    pawn_number: 'PWN-000002',
    member_id: 'mem-5',
    item_description: '24K Gold Chain with Pendant',
    category: 'GOLD_24K',
    weight_grams: 18.2,
    condition: 'Mint condition',
    valuation_amount: 400000,
    loan_amount: 280000,
    interest_rate: 13.5,
    start_date: '2024-04-10',
    due_date: '2025-04-10',
    status: 'ACTIVE',
    storage_location: 'Safe 01 - Drawer A',
    created_at: '2024-04-10T11:00:00Z'
  }
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'txn-1',
    organization_id: 'org-1',
    transaction_number: 'TXN-000001',
    account_id: 'sav-1',
    member_id: 'mem-1',
    transaction_type: 'DEPOSIT',
    amount: 25000,
    transaction_date: '2026-07-26T09:15:00Z',
    reference_number: 'DEP-10029',
    description: 'Cash deposit at counter',
    created_by: 'Staff Admin (M. Nizar)',
    created_at: '2026-07-26T09:15:00Z'
  },
  {
    id: 'txn-2',
    organization_id: 'org-1',
    transaction_number: 'TXN-000002',
    account_id: 'sav-2',
    member_id: 'mem-2',
    transaction_type: 'WITHDRAWAL',
    amount: 15000,
    transaction_date: '2026-07-26T10:30:00Z',
    reference_number: 'WTH-8832',
    description: 'Counter cash withdrawal',
    created_by: 'Staff Admin (M. Nizar)',
    created_at: '2026-07-26T10:30:00Z'
  },
  {
    id: 'txn-3',
    organization_id: 'org-1',
    transaction_number: 'TXN-000003',
    account_id: 'sav-1',
    member_id: 'mem-1',
    transaction_type: 'LOAN_REPAYMENT',
    amount: 25000,
    transaction_date: '2026-07-26T11:00:00Z',
    reference_number: 'LRP-4451',
    description: 'Monthly installment for LON-000001',
    created_by: 'Staff Admin (M. Nizar)',
    created_at: '2026-07-26T11:00:00Z'
  }
];

const INITIAL_AUDITS: AuditLog[] = [
  {
    id: 'aud-1',
    organization_id: 'org-1',
    user_email: 'admin@kattankudympcs.lk',
    action: 'RECORD_DEPOSIT',
    target_id: 'SAV-000001',
    target_type: 'TRANSACTION',
    details: 'Recorded cash deposit of Rs. 25,000.00 for account SAV-000001',
    created_at: '2026-07-26T09:15:00Z'
  },
  {
    id: 'aud-2',
    organization_id: 'org-1',
    user_email: 'admin@kattankudympcs.lk',
    action: 'RECORD_WITHDRAWAL',
    target_id: 'SAV-000002',
    target_type: 'TRANSACTION',
    details: 'Recorded withdrawal of Rs. 15,000.00 for account SAV-000002',
    created_at: '2026-07-26T10:30:00Z'
  }
];

class LocalStoreService {
  private isSyncing = false;

  constructor() {
    setTimeout(() => {
      this.syncFromSupabase();
    }, 500);
  }

  async syncFromSupabase(): Promise<void> {
    if (this.isSyncing) return;
    this.isSyncing = true;
    try {
      const { data: members, error: mErr } = await supabase.from('members').select('*');
      if (!mErr && members && members.length > 0) this.set('members', members);

      const { data: savings, error: sErr } = await supabase.from('savings_accounts').select('*');
      if (!sErr && savings && savings.length > 0) this.set('savings', savings);

      const { data: loans, error: lErr } = await supabase.from('loans').select('*');
      if (!lErr && loans && loans.length > 0) this.set('loans', loans);

      const { data: pawns, error: pErr } = await supabase.from('pawn_records').select('*');
      if (!pErr && pawns && pawns.length > 0) this.set('pawns', pawns);

      const { data: txs, error: tErr } = await supabase.from('transactions').select('*');
      if (!tErr && txs && txs.length > 0) this.set('transactions', txs);

      const { data: audits, error: aErr } = await supabase.from('audit_logs').select('*');
      if (!aErr && audits && audits.length > 0) this.set('audits', audits);

      window.dispatchEvent(new Event('crbms-store-updated'));
    } catch (e) {
      console.warn('Supabase offline or tables not created yet. Using localStorage:', e);
    } finally {
      this.isSyncing = false;
    }
  }

  private async upsertToSupabase(table: string, data: any[] | any): Promise<void> {
    try {
      await supabase.from(table).upsert(data);
    } catch (e) {
      console.warn(`Failed to sync to Supabase table ${table}:`, e);
    }
  }

  private get<T>(key: string, initial: T[]): T[] {
    try {
      const item = localStorage.getItem(`crbms_${key}`);
      return item ? JSON.parse(item) : initial;
    } catch {
      return initial;
    }
  }

  private set<T>(key: string, data: T[]): void {
    try {
      localStorage.setItem(`crbms_${key}`, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }

  // Members
  getMembers(): Member[] { return this.get('members', INITIAL_MEMBERS); }
  saveMembers(members: Member[]): void {
    this.set('members', members);
    window.dispatchEvent(new Event('crbms-store-updated'));
    this.upsertToSupabase('members', members);
  }

  // Savings
  getSavings(): SavingsAccount[] { return this.get('savings', INITIAL_SAVINGS); }
  saveSavings(savings: SavingsAccount[]): void {
    this.set('savings', savings);
    window.dispatchEvent(new Event('crbms-store-updated'));
    this.upsertToSupabase('savings_accounts', savings);
  }

  // Loans
  getLoans(): Loan[] { return this.get('loans', INITIAL_LOANS); }
  saveLoans(loans: Loan[]): void {
    this.set('loans', loans);
    window.dispatchEvent(new Event('crbms-store-updated'));
    this.upsertToSupabase('loans', loans);
  }

  // Pawns
  getPawns(): PawnRecord[] { return this.get('pawns', INITIAL_PAWNS); }
  savePawns(pawns: PawnRecord[]): void {
    this.set('pawns', pawns);
    window.dispatchEvent(new Event('crbms-store-updated'));
    this.upsertToSupabase('pawn_records', pawns);
  }

  // Transactions
  getTransactions(): Transaction[] { return this.get('transactions', INITIAL_TRANSACTIONS); }
  saveTransactions(txs: Transaction[]): void {
    this.set('transactions', txs);
    window.dispatchEvent(new Event('crbms-store-updated'));
    this.upsertToSupabase('transactions', txs);
  }

  // Audits
  getAudits(): AuditLog[] { return this.get('audits', INITIAL_AUDITS); }
  addAudit(log: Omit<AuditLog, 'id' | 'created_at'>): void {
    const current = this.getAudits();
    const newLog: AuditLog = {
      ...log,
      id: `aud-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    const updated = [newLog, ...current];
    this.set('audits', updated);
    window.dispatchEvent(new Event('crbms-store-updated'));
    this.upsertToSupabase('audit_logs', newLog);
  }

  // Reset store to demo defaults
  resetToDefaults(): void {
    localStorage.removeItem('crbms_members');
    localStorage.removeItem('crbms_savings');
    localStorage.removeItem('crbms_loans');
    localStorage.removeItem('crbms_pawns');
    localStorage.removeItem('crbms_transactions');
    localStorage.removeItem('crbms_audits');
    window.dispatchEvent(new Event('crbms-store-updated'));
  }
}

export const localStore = new LocalStoreService();
