Here's the CRBMS plan reworked around **Next.js + Supabase + Vercel**, with an "agent skills" breakdown for building it efficiently with an AI coding agent (Claude Code). No files — just the plan.

## 1. Why this stack fits an MPCS MVP

Supabase replaces the Laravel/Node + MySQL layer with Postgres, Auth, Storage, and auto-generated APIs in one place — much less backend code to write and maintain for a small cooperative society. Vercel gives zero-config CI/CD for Next.js. Next.js (App Router) gives you server-side rendering for dashboards/reports and Server Actions for form-heavy banking operations (deposits, withdrawals, loan approvals) without hand-building a separate REST API.

## 2. Architecture

```
Next.js (App Router, Vercel)
 ├── Server Components → read data (dashboard, reports, search)
 ├── Server Actions → write data (deposit, withdrawal, loan approval)
 ├── Client Components → forms, tables, charts (Recharts)
 └── Supabase JS/SSR client → auth + DB calls

Supabase (Postgres)
 ├── Auth (email/password, magic link later) → maps to `profiles` + role
 ├── Row Level Security (RLS) → enforces role permissions at DB level
 ├── Storage → member photos, signatures, scanned documents
 ├── Edge Functions → PDF receipt generation, interest calculation cron, notifications
 └── Database Webhooks → trigger notifications on due installments
```

Role-based access (Administrator, Manager, Cashier, Loan Officer, Accountant, Auditor) is enforced twice: in the UI (hide/show modules) and in Postgres RLS (the real security boundary — never trust the frontend alone for a banking system).

## 3. Database schema (Postgres/Supabase)

```sql
profiles (id uuid FK auth.users, name, username, role, status)

members (
  id, member_no, nic, full_name, address, phone, gender,
  occupation, dob, join_date, nominee, photo_url, signature_url, status
)

customers (  -- non-member / minor accounts
  id, member_id FK, is_minor, guardian_name, guardian_nic,
  birth_cert_no, relationship
)

savings_accounts (
  id, member_id FK, account_no, passbook_no, account_type,
  opening_balance, current_balance, interest_rate, status
)

transactions (
  id, account_no FK, type (deposit|withdrawal|transfer),
  amount, balance_after, officer_id FK, receipt_no, created_at
)

loans (
  id, member_id FK, loan_category, requested_amount, approved_amount,
  interest_rate, repayment_period, guarantor, purpose,
  status (pending|reviewed|approved|disbursed|active|completed|rejected),
  start_date, end_date
)

loan_payments (
  id, loan_id FK, date, capital, interest, balance_remaining, receipt_no
)

cash_book (
  id, date, opening_balance, cash_in, cash_out, closing_balance, verified_by
)

audit_log (
  id, user_id FK, action, table_name, record_id, before, after, created_at
)

notifications (
  id, type, member_id FK, due_date, status, created_at
)
```

RLS policy pattern: each table gets policies keyed off `profiles.role`, e.g. Cashier can `insert` into `transactions` but not `delete`; Auditor gets `select`-only across every table; Loan Officer can `insert`/`update` `loans` only while `status = 'pending'` or `'reviewed'`.

## 4. Workflows, adapted to Server Actions

**Deposit workflow**
`Search account (Server Component query) → enter amount (client form) → Server Action validates + inserts transaction → Postgres trigger updates savings_accounts.current_balance → receipt generated via Edge Function → dashboard revalidated (Next.js revalidatePath)`

**Withdrawal workflow**
Same shape, plus a balance check constraint at the DB level (`CHECK` or trigger) so it's impossible to overdraw even if the UI has a bug.

**Loan workflow**
`Application (insert, status=pending) → Loan Officer review (status=reviewed) → Manager approval (status=approved) → Cashier disbursement (status=disbursed, creates transaction) → Active → monthly loan_payments rows → status=completed when balance=0`
Each status transition is a separate Server Action gated by role, so the approval chain can't be skipped from the client.

**Loan recovery workflow**
Cron (Supabase scheduled Edge Function) flags due installments daily → appears in Notifications → Cashier receives payment → interest/capital split calculated server-side → receipt printed.

## 5. Dashboard & Reports

Dashboard stats (today's deposits, cash balance, active/overdue loans, etc.) are Postgres views or RPC functions (`get_dashboard_summary()`), called from a Server Component so the page loads pre-rendered with fresh data — no client-side loading spinner needed. Charts (Savings Collection, Loan Recovery, Cash Flow) render with Recharts fed by those same RPCs. Reports (Trial Balance, Income Statement, Balance Sheet, etc.) are SQL views exported to PDF via an Edge Function or a serverless route using a PDF library.

## 6. Agent skills — building this with Claude Code

Since this is a big multi-module system, it's worth splitting the build into distinct "skills" (reusable playbooks) rather than building it as one long undirected session. Suggested skill set:

- **supabase-schema** — conventions for table naming, migrations folder structure, and how to write/apply RLS policies consistently across every table.
- **rbac-policies** — the six-role permission matrix (Admin/Manager/Cashier/Loan Officer/Accountant/Auditor) translated into RLS + UI guards, applied the same way each time a new table is added.
- **server-action-crud** — a standard pattern for each module's create/update Server Actions (validation with zod, error shape, revalidation) so Members, Savings, Loans etc. all look and behave the same.
- **transaction-integrity** — rules for anything touching money: balance checks, receipt numbering, atomic writes (deposit/withdrawal/loan disbursement must never partially fail).
- **receipt-and-report-pdf** — generating Deposit/Withdrawal/Loan receipts and the formal reports (Balance Sheet, Trial Balance) as PDFs.
- **dashboard-charts** — wiring Postgres RPCs to Recharts components consistently.
- **notifications-cron** — scheduled checks for due installments, birthdays, inactive accounts, matured deposits.
- **audit-logging** — auto-writing to `audit_log` on every insert/update/delete across sensitive tables, since this is a bank system and needs a trail.

Each of these can be a `SKILL.md` Claude Code reads before touching that part of the codebase, so the AI agent applies the same schema, security, and code-style conventions every time instead of re-deriving them per session. I can generate the actual skill files later if you want — you just said no documents for now, so this is the outline only.

## 7. Revised roadmap (faster than the original, thanks to Supabase)

| Phase | Duration | Deliverables |
|---|---|---|
| 1 | 1 week | Supabase project, schema, RLS, Auth, Next.js scaffold, login |
| 2 | 1.5 weeks | Member management, Savings accounts |
| 3 | 1 week | Deposits, Withdrawals, Cash Book |
| 4 | 2 weeks | Loan application → approval → disbursement → recovery |
| 5 | 1 week | Dashboard, Reports, Receipts (PDF) |
| 6 | 0.5 week | Notifications, Search, Audit trail |
| 7 | 1 week | Testing, RLS hardening, Vercel deployment, staff training |

**Estimated total: ~7–8 weeks**, down from the original 10 — the time saved comes mostly from not building a custom auth/API layer.

## 8. Deployment workflow

`git push → Vercel builds preview deployment per PR → Supabase migrations run via CLI (supabase db push) in CI → merge to main → Vercel promotes to production → environment variables (Supabase URL/anon key/service key) managed in Vercel dashboard, service key never exposed to client.` Daily automated Postgres backups are handled by Supabase; add a weekly export to external storage for extra safety given this is core banking data.

If you want, I can next turn this into an actual Next.js + Supabase project scaffold, or write the real `SKILL.md` files for Claude Code.