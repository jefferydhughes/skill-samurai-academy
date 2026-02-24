import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign } from 'lucide-react';

export default function RevenueGrowthCard({ snapshot, historical }) {
  const chartData = historical?.map(s => ({
    week: `W${s.week_number}`,
    mrr: s.revenue_metrics?.monthly_recurring_revenue || 0,
    members: s.member_metrics?.total_active || 0,
    target: s.member_metrics?.target || 0
  })).reverse() || [];

  const currentMRR = snapshot?.revenue_metrics?.monthly_recurring_revenue || 0;
  const previousMRR = historical?.[1]?.revenue_metrics?.monthly_recurring_revenue || 0;
  const mrrGrowth = previousMRR > 0 ? ((currentMRR - previousMRR) / previousMRR * 100).toFixed(1) : 0;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          Revenue & Growth
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl">
            <div className="text-sm text-slate-600 mb-1">Monthly Recurring Revenue</div>
            <div className="text-2xl font-bold text-green-700">
              ${currentMRR.toLocaleString()}
            </div>
            <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {mrrGrowth}% vs last week
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl">
            <div className="text-sm text-slate-600 mb-1">Avg Member Value</div>
            <div className="text-2xl font-bold text-blue-700">
              ${(snapshot?.revenue_metrics?.average_member_value || 0).toFixed(0)}
            </div>
            <div className="text-xs text-slate-500 mt-1">per month</div>
          </div>
        </div>

        {/* MRR Trend Chart */}
        <div className="mb-4">
          <div className="text-sm font-semibold text-slate-700 mb-2">MRR Trend</div>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="week" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip />
              <Area type="monotone" dataKey="mrr" stroke="#10b981" fillOpacity={1} fill="url(#colorMrr)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Member Growth vs Target */}
        <div>
          <div className="text-sm font-semibold text-slate-700 mb-2">Members vs Target</div>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="week" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="members" stroke="#3b82f6" strokeWidth={2} name="Active Members" />
              <Line type="monotone" dataKey="target" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" name="Target" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}