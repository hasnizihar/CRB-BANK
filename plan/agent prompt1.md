Below is a comprehensive implementation brief that you can give to an AI coding agent (such as Codex, Claude Code, Cursor, or Windsurf). It explains the current state, the target state, priorities, architecture, acceptance criteria, and execution order.

---

# CRB Management System – Full Backend Integration & Functional Completion Agent Prompt

## Project

**Project Name:** Kattankudy MPCS Ltd – Cooperative Rural Bank Management System (CRBMS)

## Current Status

The UI and overall application structure have already been developed.

Authentication using Supabase is working successfully.

The application currently contains many placeholder values, dummy arrays, mock statistics, and simulated transactions.

The system looks complete visually but is **not yet functionally connected**.

The objective of this task is to convert the project into a fully working MVP where every module communicates with the database and with each other.

---

# Primary Objective

Transform the project from a UI prototype into a production-ready functional MVP.

The system must use the Supabase PostgreSQL database as the single source of truth.

No hardcoded data should remain unless explicitly marked as sample/demo data.

---

# General Rules

Never use hardcoded arrays.

Never create fake statistics.

Never generate fake transactions.

Never calculate values on the frontend when they belong in the database.

Always fetch real data.

Always validate before inserting.

Always use TypeScript types.

Always handle loading states.

Always handle errors.

Always use reusable services instead of duplicated code.

---

# Overall Architecture

Follow this structure:

app/

dashboard/

components/

hooks/

lib/

services/

types/

utils/

database/

---

# Phase 1 – Complete Database Integration

Replace every dummy dataset.

Replace every mocked dashboard value.

Replace every fake chart.

Replace every placeholder card.

Every page must retrieve its information from Supabase.

---

# Phase 2 – Members Module

Complete CRUD.

Create member.

Update member.

Suspend member.

Activate member.

Search member.

Pagination.

Sorting.

Filtering.

Member profile.

Member statistics.

Member documents.

Member photo.

Activity history.

Validation.

Duplicate NIC validation.

Duplicate member number validation.

---

# Phase 3 – Savings Module

Every savings account belongs to exactly one member.

Functions:

Open account.

Deposit.

Withdraw.

Balance.

Interest.

Passbook.

Statement.

Transaction history.

Closing account.

Reject withdrawal if balance is insufficient.

---

# Phase 4 – Transactions Module

Every financial action creates a transaction.

Deposit.

Withdrawal.

Loan disbursement.

Loan repayment.

Interest posting.

Adjustment.

Transfer.

Every transaction should include:

Transaction Number

Date

Time

User

Branch

Amount

Reference

Description

Status

Receipt Number

Transactions must never be deleted.

Only reversal transactions are allowed.

---

# Phase 5 – Loan Module

Loan application.

Approval workflow.

Guarantors.

Loan categories.

Installments.

Interest.

Repayment schedule.

Outstanding balance.

Penalty.

Overdue.

Settlement.

Loan history.

Loan documents.

---

# Phase 6 – Dashboard

Replace all fake numbers.

Display real statistics.

Today's Deposits

Today's Withdrawals

Today's Collections

Cash Balance

Savings Balance

Loan Portfolio

Active Members

Inactive Members

Active Loans

Overdue Loans

Monthly Income

Monthly Expenses

Charts should use database data.

---

# Phase 7 – Search Engine

Create one universal search.

Search by

Member Number

NIC

Account Number

Loan Number

Transaction Number

Name

Phone

Address

Results should navigate directly to the correct module.

---

# Phase 8 – Relationships

Everything must be connected.

Member

↓

Savings Accounts

↓

Transactions

↓

Loans

↓

Loan Payments

↓

Audit Logs

↓

Documents

Deleting a member must not delete financial records.

---

# Phase 9 – Reports

Daily Cash Report

Daily Transactions

Savings Summary

Loan Summary

Overdue Report

Interest Report

Member Report

Cash Book

Trial Balance

Income Statement

Balance Sheet

Reports must use live data.

---

# Phase 10 – Notifications

Loan Due

Loan Overdue

Birthday

Inactive Account

Large Deposit

Large Withdrawal

System Alerts

---

# Phase 11 – Security

Role Based Access

Administrator

Manager

Loan Officer

Cashier

Auditor

Viewer

Protect all routes.

Prevent unauthorized access.

Encrypt sensitive data.

Audit every action.

---

# Phase 12 – Audit Log

Record:

Login

Logout

Create

Update

Delete

Approval

Reversal

Print

Export

Include:

User

Timestamp

IP

Action

Record ID

Old Value

New Value

---

# Phase 13 – Validation

NIC uniqueness.

Member number uniqueness.

Phone format.

Email format.

Required fields.

Maximum loan amount.

Minimum savings.

Withdrawal balance check.

Duplicate transactions.

---

# Phase 14 – User Experience

Loading indicators.

Skeleton screens.

Toast notifications.

Confirmation dialogs.

Success messages.

Error messages.

Responsive layout.

Accessibility improvements.

---

# Phase 15 – Performance

Server-side pagination.

Lazy loading.

Indexed database queries.

Caching where appropriate.

Optimized API calls.

No duplicate requests.

---

# Phase 16 – Code Quality

Reusable components.

Reusable services.

Custom hooks.

Strong TypeScript typing.

Remove duplicated logic.

Consistent folder structure.

Clean architecture.

---

# Phase 17 – Future Ready

Design every module so future modules can integrate without restructuring.

Future modules include:

Inventory

Fuel Station

Consumer Outlet (Coop+)

Payroll

Accounting

Fixed Deposits

Shares

Dividend Management

Insurance

Asset Management

Human Resources

Mobile App

SMS Gateway

Email Notifications

Biometric Login

QR Passbook

Online Member Portal

---

# Expected Deliverables

There should be:

No dummy data.

No fake statistics.

No placeholder transactions.

No disconnected modules.

Every page should retrieve real information.

Every transaction should update the dashboard automatically.

Every member should connect to savings, loans, and transactions.

Every financial operation should be reflected in reports.

The application should function as a real Cooperative Rural Bank Management System suitable for Kattankudy MPCS Ltd.

---

# Success Criteria

The project will be considered complete when:

* Every dashboard metric is database-driven.
* Every CRUD operation works correctly.
* Search works across all modules.
* Member, Savings, Loan, and Transaction modules are fully integrated.
* Reports match database records.
* Authentication and permissions are enforced.
* The application contains no hardcoded business data.
* The codebase is clean, modular, documented, and ready for future expansion.

One additional recommendation: instead of asking the coding agent to implement everything in one pass, instruct it to work in **small phases (Members → Savings → Transactions → Loans → Dashboard → Reports)**. After each phase, it should run the application, fix all TypeScript and runtime errors, verify database operations, and only then proceed to the next phase. This incremental approach makes debugging much easier and results in a more stable MVP.
