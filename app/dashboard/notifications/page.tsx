'use client';

import { Bell, Calendar, DollarSign, AlertTriangle, Gift, Clock, CheckCheck } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const notifications = [
  { id: '1', type: 'installment_due', title: 'Installment Due', message: 'Mohamed Rilwan (CRB-00001) has a loan installment of Rs. 24,722 due on 01 Feb 2024', due_date: '2024-02-01', is_read: false, icon: DollarSign, color: 'amber' },
  { id: '2', type: 'loan_overdue', title: 'Loan Overdue', message: 'Ahamed Lebbe (CRB-00007) has an overdue installment of Rs. 28,000 since 01 Jan 2024', due_date: '2024-01-01', is_read: false, icon: AlertTriangle, color: 'red' },
  { id: '3', type: 'birthday', title: 'Birthday', message: 'Abdul Hameed (CRB-00003) has a birthday on 25 Jan 2024', due_date: '2024-01-25', is_read: false, icon: Gift, color: 'purple' },
  { id: '4', type: 'inactive_account', title: 'Inactive Account', message: 'Siththy Haseena (CRB-00004) account SAV-0001012 has been dormant for 90+ days', due_date: null, is_read: true, icon: Clock, color: 'blue' },
  { id: '5', type: 'installment_due', title: 'Installment Due', message: 'Mohamed Farook (CRB-00005) has a loan installment of Rs. 24,194 due on 15 Feb 2024', due_date: '2024-02-15', is_read: true, icon: DollarSign, color: 'amber' },
];

const colorMap: Record<string, { bg: string; border: string; icon: string }> = {
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-600 bg-amber-100' },
  red: { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-600 bg-red-100' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'text-purple-600 bg-purple-100' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600 bg-blue-100' },
};

export default function NotificationsPage() {
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Bell className="w-6 h-6 text-brand-600" /> Notifications</h1>
          <p className="text-sm text-slate-500 mt-1">{unreadCount} unread notification(s)</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-slate-300 text-sm text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm">
          <CheckCheck className="w-4 h-4" /> Mark all read
        </button>
      </div>

      <div className="space-y-3">
        {notifications.map((notif) => {
          const Icon = notif.icon;
          const colors = colorMap[notif.color];
          return (
            <div
              key={notif.id}
              className={`rounded-xl border p-4 transition-colors ${
                notif.is_read ? 'bg-white border-slate-200 shadow-sm' : `${colors.bg} ${colors.border} shadow-sm`
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-md ${colors.icon} flex-shrink-0 mt-0.5`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={`text-sm font-semibold ${notif.is_read ? 'text-slate-700' : 'text-slate-900'}`}>{notif.title}</h3>
                    {!notif.is_read && <span className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                  {notif.due_date && (
                    <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(notif.due_date)}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
