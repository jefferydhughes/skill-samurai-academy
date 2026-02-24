import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Target, Mail } from 'lucide-react';

export default function MarketingROICard({ snapshot, historical }) {
  const chartData = historical?.map(s => ({
    week: `W${s.week_number}`,
    cpl: s.marketing_metrics?.cost_per_lead || 0,
    cpa: s.marketing_metrics?.cost_per_acquisition || 0
  })).reverse() || [];

  const costPerLead = snapshot?.marketing_metrics?.cost_per_lead || 0;
  const costPerAcquisition = snapshot?.marketing_metrics?.cost_per_acquisition || 0;
  const roi = costPerAcquisition > 0 
    ? ((snapshot?.revenue_metrics?.average_member_value * 12 - costPerAcquisition) / costPerAcquisition * 100).toFixed(0)
    : 0;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          Marketing ROI
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-purple-50 p-3 rounded-xl">
            <DollarSign className="w-4 h-4 text-purple-600 mb-1" />
            <div className="text-lg font-bold text-purple-700">
              ${costPerLead.toFixed(0)}
            </div>
            <div className="text-xs text-slate-600">Cost/Lead</div>
          </div>

          <div className="bg-indigo-50 p-3 rounded-xl">
            <Target className="w-4 h-4 text-indigo-600 mb-1" />
            <div className="text-lg font-bold text-indigo-700">
              ${costPerAcquisition.toFixed(0)}
            </div>
            <div className="text-xs text-slate-600">Cost/Member</div>
          </div>

          <div className={`p-3 rounded-xl ${roi >= 100 ? 'bg-green-50' : 'bg-amber-50'}`}>
            <TrendingUp className={`w-4 h-4 mb-1 ${roi >= 100 ? 'text-green-600' : 'text-amber-600'}`} />
            <div className={`text-lg font-bold ${roi >= 100 ? 'text-green-700' : 'text-amber-700'}`}>
              {roi}%
            </div>
            <div className="text-xs text-slate-600">ROI</div>
          </div>
        </div>

        {/* Cost Trend Chart */}
        <div className="mb-6">
          <div className="text-sm font-semibold text-slate-700 mb-2">Acquisition Costs Trend</div>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="week" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip />
              <Bar dataKey="cpl" fill="#a855f7" name="Cost Per Lead" />
              <Bar dataKey="cpa" fill="#6366f1" name="Cost Per Acquisition" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Postcard Marketing */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <Mail className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-slate-700">Postcard Campaign</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-slate-600">Sent This Week</div>
              <div className="text-lg font-bold text-blue-700">
                {snapshot?.marketing_metrics?.postcards_sent || 0}
              </div>
            </div>
            <div>
              <div className="text-slate-600">% of Members</div>
              <div className="text-lg font-bold text-blue-700">
                {snapshot?.marketing_metrics?.postcards_percentage || 0}%
              </div>
            </div>
          </div>
        </div>

        {/* Channel Performance Placeholder */}
        <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-dashed border-slate-300">
          <div className="text-xs text-slate-500 text-center">
            🔗 Connect Google & Facebook Analytics for detailed channel performance
          </div>
        </div>
      </CardContent>
    </Card>
  );
}