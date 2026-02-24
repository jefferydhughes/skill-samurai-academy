import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function OperationsCard({ snapshot, historical }) {
  const chartData = historical?.map(s => ({
    week: `W${s.week_number}`,
    attendance: s.attendance_metrics?.attendance_percentage || 0,
    capacity: s.attendance_metrics?.members_vs_capacity_percentage || 0
  })).reverse() || [];

  const attendanceRate = snapshot?.attendance_metrics?.attendance_percentage || 0;
  const capacityUtilization = snapshot?.attendance_metrics?.members_vs_capacity_percentage || 0;
  const suspensions = snapshot?.member_metrics?.suspensions || 0;
  const miaCount = snapshot?.member_metrics?.mia_14_days || 0;

  const getHealthStatus = (value, good, warning) => {
    if (value >= good) return { color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle2 };
    if (value >= warning) return { color: 'text-amber-600', bg: 'bg-amber-50', icon: AlertCircle };
    return { color: 'text-red-600', bg: 'bg-red-50', icon: AlertCircle };
  };

  const attendanceStatus = getHealthStatus(attendanceRate, 80, 70);
  const capacityStatus = getHealthStatus(capacityUtilization, 70, 50);

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-600" />
          Operations & Capacity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Attendance Rate */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <attendanceStatus.icon className={`w-4 h-4 ${attendanceStatus.color}`} />
              <span className="text-sm font-semibold text-slate-700">Attendance Rate</span>
            </div>
            <span className={`text-lg font-bold ${attendanceStatus.color}`}>{attendanceRate}%</span>
          </div>
          <Progress value={attendanceRate} className="h-2" />
          <div className="text-xs text-slate-500 mt-1">
            {snapshot?.attendance_metrics?.last_week_attendance || 0} of {snapshot?.member_metrics?.total_active || 0} members attended
          </div>
        </div>

        {/* Capacity Utilization */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <capacityStatus.icon className={`w-4 h-4 ${capacityStatus.color}`} />
              <span className="text-sm font-semibold text-slate-700">Capacity Utilization</span>
            </div>
            <span className={`text-lg font-bold ${capacityStatus.color}`}>{capacityUtilization}%</span>
          </div>
          <Progress value={capacityUtilization} className="h-2" />
          <div className="text-xs text-slate-500 mt-1">
            {snapshot?.member_metrics?.total_active || 0} of {snapshot?.capacity_metrics?.practical_capacity || 0} capacity
          </div>
        </div>

        {/* Trend Chart */}
        <div className="mb-6">
          <div className="text-sm font-semibold text-slate-700 mb-2">Performance Trends</div>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="week" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="attendance" stroke="#06b6d4" strokeWidth={2} name="Attendance %" />
              <Line type="monotone" dataKey="capacity" stroke="#8b5cf6" strokeWidth={2} name="Capacity %" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Indicators */}
        <div className="grid grid-cols-2 gap-3">
          <div className={`p-3 rounded-xl ${miaCount > 5 ? 'bg-red-50' : 'bg-slate-50'}`}>
            <div className="text-xs text-slate-600 mb-1">Members MIA 14+</div>
            <div className={`text-xl font-bold ${miaCount > 5 ? 'text-red-700' : 'text-slate-700'}`}>
              {miaCount}
            </div>
            {miaCount > 5 && (
              <div className="text-xs text-red-600 mt-1">⚠️ Needs attention</div>
            )}
          </div>

          <div className="bg-slate-50 p-3 rounded-xl">
            <div className="text-xs text-slate-600 mb-1">Suspensions</div>
            <div className="text-xl font-bold text-slate-700">
              {suspensions}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}