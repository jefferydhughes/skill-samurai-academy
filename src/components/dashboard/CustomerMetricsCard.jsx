import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, UserPlus, UserMinus, AlertTriangle } from 'lucide-react';

export default function CustomerMetricsCard({ snapshot, historical }) {
  const chartData = historical?.map(s => ({
    week: `W${s.week_number}`,
    new: s.member_metrics?.new_members || 0,
    lost: s.member_metrics?.member_loss || 0,
    net: (s.member_metrics?.new_members || 0) - (s.member_metrics?.member_loss || 0)
  })).reverse() || [];

  const conversionData = [
    { name: 'Converted', value: snapshot?.trial_metrics?.conversion_rate || 0, color: '#10b981' },
    { name: 'Not Converted', value: 100 - (snapshot?.trial_metrics?.conversion_rate || 0), color: '#e2e8f0' }
  ];

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Customer Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-green-50 p-3 rounded-xl">
            <UserPlus className="w-4 h-4 text-green-600 mb-1" />
            <div className="text-xl font-bold text-green-700">
              {snapshot?.member_metrics?.new_members || 0}
            </div>
            <div className="text-xs text-slate-600">New</div>
          </div>

          <div className="bg-red-50 p-3 rounded-xl">
            <UserMinus className="w-4 h-4 text-red-600 mb-1" />
            <div className="text-xl font-bold text-red-700">
              {snapshot?.member_metrics?.member_loss || 0}
            </div>
            <div className="text-xs text-slate-600">Lost</div>
          </div>

          <div className="bg-amber-50 p-3 rounded-xl">
            <AlertTriangle className="w-4 h-4 text-amber-600 mb-1" />
            <div className="text-xl font-bold text-amber-700">
              {snapshot?.member_metrics?.mia_14_days || 0}
            </div>
            <div className="text-xs text-slate-600">MIA 14+</div>
          </div>
        </div>

        {/* Member Flow Chart */}
        <div className="mb-6">
          <div className="text-sm font-semibold text-slate-700 mb-2">Weekly Member Flow</div>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="week" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip />
              <Bar dataKey="new" fill="#10b981" name="New Members" />
              <Bar dataKey="lost" fill="#ef4444" name="Lost Members" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Conversion Rate */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-semibold text-slate-700 mb-2">Trial Conversion</div>
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie
                  data={conversionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {conversionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center text-xl font-bold text-green-600 -mt-2">
              {snapshot?.trial_metrics?.conversion_rate || 0}%
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <div className="space-y-2">
              <div>
                <div className="text-xs text-slate-600">Trials Booked</div>
                <div className="text-lg font-semibold">{snapshot?.trial_metrics?.trials_booked || 0}</div>
              </div>
              <div>
                <div className="text-xs text-slate-600">Trials Completed</div>
                <div className="text-lg font-semibold">{snapshot?.trial_metrics?.trials_completed || 0}</div>
              </div>
              <div>
                <div className="text-xs text-slate-600">Attendance Rate</div>
                <div className="text-lg font-semibold">{snapshot?.trial_metrics?.trial_attendance_rate || 0}%</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}