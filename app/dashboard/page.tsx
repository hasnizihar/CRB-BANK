'use client';

import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Banknote,
  Users,
  UserCheck,
  HandCoins,
  AlertTriangle,
  PiggyBank,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendValue,
  color,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  trend?: 'up' | 'down';
  trendValue?: string;
  color: string;
}) {
  const colorMap: Record<string, { bg: string; icon: string }> = {
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600' },
    red: { bg: 'bg-red-50', icon: 'text-red-600' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600' },
  };

  const colors = colorMap[color] || colorMap.blue;

  return (
    <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${colors.bg} ${colors.icon}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && trendValue && (
          <div
            className={`flex items-center gap-1 text-xs font-medium ${
              trend === 'up' ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            {trend === 'up' ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {trendValue}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900 mb-1">{value}</p>
      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{label}</p>
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">{title}</h3>
      {children}
    </div>
  );
}

const monthlyData = [
  { month: 'Jan', deposits: 450000, savings: 170000 },
  { month: 'Feb', deposits: 520000, savings: 210000 },
  { month: 'Mar', deposits: 480000, savings: 190000 },
  { month: 'Apr', deposits: 600000, savings: 250000 },
  { month: 'May', deposits: 550000, savings: 230000 },
  { month: 'Jun', deposits: 680000, savings: 300000 },
];

const loanRecoveryData = [
  { month: 'Jan', recovered: 380000, due: 450000 },
  { month: 'Feb', recovered: 420000, due: 460000 },
  { month: 'Mar', recovered: 400000, due: 440000 },
  { month: 'Apr', recovered: 490000, due: 500000 },
  { month: 'May', recovered: 460000, due: 480000 },
  { month: 'Jun', recovered: 520000, due: 530000 },
];

const loanCategoryData = [
  { name: 'Livelihood', value: 35, color: '#2563eb' },
  { name: 'Production', value: 25, color: '#059669' },
  { name: 'Small Industrial', value: 15, color: '#d97706' },
  { name: 'Consumption', value: 12, color: '#7c3aed' },
  { name: 'Govt. Servant', value: 8, color: '#db2777' },
  { name: 'Special', value: 5, color: '#0891b2' },
];

const cashFlowData = [
  { month: 'Jan', inflow: 830000, outflow: 710000 },
  { month: 'Feb', inflow: 940000, outflow: 770000 },
  { month: 'Mar', inflow: 880000, outflow: 730000 },
  { month: 'Apr', inflow: 1090000, outflow: 850000 },
  { month: 'May', inflow: 1010000, outflow: 800000 },
  { month: 'Jun', inflow: 1200000, outflow: 910000 },
];

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-md p-3 shadow-md">
        <p className="text-xs text-slate-500 mb-1 font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs font-semibold" style={{ color: entry.color }}>
            {entry.name}: Rs. {(entry.value / 1000).toFixed(0)}K
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Overview of cooperative bank performance
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard label="Today's Deposits" value="Rs. 125,400" icon={ArrowDownToLine} trend="up" trendValue="+12.5%" color="emerald" />
        <StatCard label="Today's Withdrawals" value="Rs. 78,250" icon={ArrowUpFromLine} trend="down" trendValue="-5.2%" color="amber" />
        <StatCard label="Cash Balance" value="Rs. 2.45M" icon={Banknote} color="blue" />
        <StatCard label="Total Members" value="1,247" icon={Users} trend="up" trendValue="+3" color="purple" />
        <StatCard label="Total Customers" value="1,892" icon={UserCheck} color="blue" />
        <StatCard label="Active Loans" value="342" icon={HandCoins} color="amber" />
        <StatCard label="Overdue Loans" value="18" icon={AlertTriangle} trend="down" trendValue="-2" color="red" />
        <StatCard label="Total Savings" value="Rs. 48.6M" icon={PiggyBank} trend="up" trendValue="+2.1%" color="emerald" />
        <StatCard label="Monthly Income" value="Rs. 1.2M" icon={TrendingUp} trend="up" trendValue="+8.3%" color="emerald" />
        <StatCard label="Monthly Expenses" value="Rs. 910K" icon={DollarSign} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Monthly Deposits & Savings">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v / 1000}K`} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="deposits" name="Deposits" stroke="#2563eb" fill="#eff6ff" strokeWidth={2} />
                <Area type="monotone" dataKey="savings" name="Savings" stroke="#059669" fill="#ecfdf5" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Loan Recovery vs Due">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={loanRecoveryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v / 1000}K`} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="due" name="Due" fill="#94a3b8" radius={[2, 2, 0, 0]} />
                <Bar dataKey="recovered" name="Recovered" fill="#2563eb" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Active Loans by Category">
          <div className="h-72 flex items-center">
            <ResponsiveContainer width="50%" height="100%">
              <PieChart>
                <Pie data={loanCategoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={2} dataKey="value">
                  {loanCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {loanCategoryData.map((cat) => (
                <div key={cat.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-xs text-slate-600 flex-1">{cat.name}</span>
                  <span className="text-xs font-semibold text-slate-900">{cat.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Monthly Cash Flow">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cashFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v / 1000}K`} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="inflow" name="Cash In" stroke="#059669" strokeWidth={2} dot={{ fill: '#059669', r: 4, strokeWidth: 0 }} />
                <Line type="monotone" dataKey="outflow" name="Cash Out" stroke="#d97706" strokeWidth={2} dot={{ fill: '#d97706', r: 4, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
