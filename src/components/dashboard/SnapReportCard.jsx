import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/api/apiClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function SnapReportCard({ snapshot, location }) {
  const [isEditing, setIsEditing] = useState(!snapshot);
  const [formData, setFormData] = useState(snapshot || {
    location_id: location?.id,
    week_number: Math.ceil((new Date().getDate()) / 7),
    snapshot_date: new Date().toISOString().split('T')[0],
    capacity_metrics: {
      seats: 0,
      max_classes: 0,
      centre_capacity: 0,
      practical_capacity: 0
    },
    member_metrics: {
      new_members: 0,
      member_loss: 0,
      growth: 0,
      total_active: 0,
      target: 0,
      variance_from_target: 0,
      mia_14_days: 0,
      suspensions: 0
    },
    attendance_metrics: {
      last_week_attendance: 0,
      attendance_percentage: 0,
      members_vs_capacity_percentage: 0
    },
    trial_metrics: {
      trials_booked: 0,
      trials_completed: 0,
      trial_attendance_rate: 0,
      conversion_rate: 0
    },
    marketing_metrics: {
      postcards_sent: 0,
      postcards_percentage: 0,
      cost_per_lead: 0,
      cost_per_acquisition: 0
    },
    revenue_metrics: {
      weekly_revenue: 0,
      monthly_recurring_revenue: 0,
      average_member_value: 0
    },
    wins: [],
    notes: ''
  });

  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      // Auto-calculate derived metrics
      data.member_metrics.growth = data.member_metrics.new_members - data.member_metrics.member_loss;
      data.member_metrics.variance_from_target = data.member_metrics.total_active - data.member_metrics.target;
      
      data.attendance_metrics.attendance_percentage = 
        data.member_metrics.total_active > 0 
          ? (data.attendance_metrics.last_week_attendance / data.member_metrics.total_active * 100).toFixed(1)
          : 0;
      
      data.attendance_metrics.members_vs_capacity_percentage = 
        data.capacity_metrics.practical_capacity > 0
          ? (data.member_metrics.total_active / data.capacity_metrics.practical_capacity * 100).toFixed(1)
          : 0;

      data.trial_metrics.trial_attendance_rate = 
        data.trial_metrics.trials_booked > 0
          ? (data.trial_metrics.trials_completed / data.trial_metrics.trials_booked * 100).toFixed(1)
          : 0;

      data.marketing_metrics.postcards_percentage = 
        data.member_metrics.total_active > 0
          ? (data.marketing_metrics.postcards_sent / data.member_metrics.total_active * 100).toFixed(1)
          : 0;

      // Calculate health score
      const healthFactors = [
        data.member_metrics.growth >= 0 ? 20 : 0,
        data.trial_metrics.conversion_rate >= 30 ? 20 : data.trial_metrics.conversion_rate >= 20 ? 10 : 0,
        data.attendance_metrics.attendance_percentage >= 80 ? 20 : data.attendance_metrics.attendance_percentage >= 70 ? 10 : 0,
        data.member_metrics.mia_14_days === 0 ? 20 : data.member_metrics.mia_14_days <= 3 ? 10 : 0,
        data.member_metrics.variance_from_target >= 0 ? 20 : data.member_metrics.variance_from_target >= -5 ? 10 : 0
      ];
      data.health_score = healthFactors.reduce((a, b) => a + b, 0);

      // Identify red flags
      data.red_flags = [];
      if (data.member_metrics.growth < 0) data.red_flags.push('Negative member growth');
      if (data.trial_metrics.conversion_rate < 20) data.red_flags.push('Low trial conversion rate');
      if (data.attendance_metrics.attendance_percentage < 70) data.red_flags.push('Low attendance rate');
      if (data.member_metrics.mia_14_days > 5) data.red_flags.push(`${data.member_metrics.mia_14_days} members MIA 14+ days`);
      if (data.member_metrics.variance_from_target < -10) data.red_flags.push('Significantly below member target');

      if (snapshot) {
        return await api.entities.WeeklySnapshot.update(snapshot.id, data);
      } else {
        return await api.entities.WeeklySnapshot.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-snapshot'] });
      queryClient.invalidateQueries({ queryKey: ['historical-snapshots'] });
      setIsEditing(false);
    }
  });

  const MetricRow = ({ label, value, previousValue, format = 'number', icon = null }) => {
    const getTrend = () => {
      if (!previousValue || previousValue === value) return <Minus className="w-4 h-4 text-slate-400" />;
      if (value > previousValue) return <TrendingUp className="w-4 h-4 text-green-500" />;
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    };

    const formatValue = (val) => {
      if (format === 'percentage') return `${val}%`;
      if (format === 'currency') return `$${val.toLocaleString()}`;
      return val;
    };

    return (
      <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm text-slate-600">{label}</span>
        </div>
        <div className="flex items-center gap-3">
          {getTrend()}
          <span className="font-semibold text-slate-900">{formatValue(value)}</span>
        </div>
      </div>
    );
  };

  if (isEditing) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>📊 Weekly SNAP Report</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(formData); }} className="space-y-6">
            {/* Capacity Metrics */}
            <div>
              <h3 className="font-semibold mb-3">Capacity Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Seats/Workstations</Label>
                  <Input type="number" value={formData.capacity_metrics.seats} 
                    onChange={(e) => setFormData({...formData, capacity_metrics: {...formData.capacity_metrics, seats: parseInt(e.target.value)}})} />
                </div>
                <div>
                  <Label>Max Classes</Label>
                  <Input type="number" value={formData.capacity_metrics.max_classes}
                    onChange={(e) => setFormData({...formData, capacity_metrics: {...formData.capacity_metrics, max_classes: parseInt(e.target.value)}})} />
                </div>
                <div>
                  <Label>Centre Capacity</Label>
                  <Input type="number" value={formData.capacity_metrics.centre_capacity}
                    onChange={(e) => setFormData({...formData, capacity_metrics: {...formData.capacity_metrics, centre_capacity: parseInt(e.target.value)}})} />
                </div>
                <div>
                  <Label>Practical Capacity</Label>
                  <Input type="number" value={formData.capacity_metrics.practical_capacity}
                    onChange={(e) => setFormData({...formData, capacity_metrics: {...formData.capacity_metrics, practical_capacity: parseInt(e.target.value)}})} />
                </div>
              </div>
            </div>

            {/* Member Metrics */}
            <div>
              <h3 className="font-semibold mb-3">Member Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>New Members</Label>
                  <Input type="number" value={formData.member_metrics.new_members}
                    onChange={(e) => setFormData({...formData, member_metrics: {...formData.member_metrics, new_members: parseInt(e.target.value)}})} />
                </div>
                <div>
                  <Label>Member Loss</Label>
                  <Input type="number" value={formData.member_metrics.member_loss}
                    onChange={(e) => setFormData({...formData, member_metrics: {...formData.member_metrics, member_loss: parseInt(e.target.value)}})} />
                </div>
                <div>
                  <Label>Total Active Members</Label>
                  <Input type="number" value={formData.member_metrics.total_active}
                    onChange={(e) => setFormData({...formData, member_metrics: {...formData.member_metrics, total_active: parseInt(e.target.value)}})} />
                </div>
                <div>
                  <Label>Target</Label>
                  <Input type="number" value={formData.member_metrics.target}
                    onChange={(e) => setFormData({...formData, member_metrics: {...formData.member_metrics, target: parseInt(e.target.value)}})} />
                </div>
                <div>
                  <Label>MIA 14+ Days</Label>
                  <Input type="number" value={formData.member_metrics.mia_14_days}
                    onChange={(e) => setFormData({...formData, member_metrics: {...formData.member_metrics, mia_14_days: parseInt(e.target.value)}})} />
                </div>
                <div>
                  <Label>Suspensions</Label>
                  <Input type="number" value={formData.member_metrics.suspensions}
                    onChange={(e) => setFormData({...formData, member_metrics: {...formData.member_metrics, suspensions: parseInt(e.target.value)}})} />
                </div>
              </div>
            </div>

            {/* Trial & Attendance */}
            <div>
              <h3 className="font-semibold mb-3">Trial & Attendance</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Last Week Attendance</Label>
                  <Input type="number" value={formData.attendance_metrics.last_week_attendance}
                    onChange={(e) => setFormData({...formData, attendance_metrics: {...formData.attendance_metrics, last_week_attendance: parseInt(e.target.value)}})} />
                </div>
                <div>
                  <Label>Trials Booked</Label>
                  <Input type="number" value={formData.trial_metrics.trials_booked}
                    onChange={(e) => setFormData({...formData, trial_metrics: {...formData.trial_metrics, trials_booked: parseInt(e.target.value)}})} />
                </div>
                <div>
                  <Label>Trials Completed</Label>
                  <Input type="number" value={formData.trial_metrics.trials_completed}
                    onChange={(e) => setFormData({...formData, trial_metrics: {...formData.trial_metrics, trials_completed: parseInt(e.target.value)}})} />
                </div>
                <div>
                  <Label>Conversion Rate (%)</Label>
                  <Input type="number" value={formData.trial_metrics.conversion_rate}
                    onChange={(e) => setFormData({...formData, trial_metrics: {...formData.trial_metrics, conversion_rate: parseFloat(e.target.value)}})} />
                </div>
              </div>
            </div>

            {/* Marketing */}
            <div>
              <h3 className="font-semibold mb-3">Marketing</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Postcards Sent</Label>
                  <Input type="number" value={formData.marketing_metrics.postcards_sent}
                    onChange={(e) => setFormData({...formData, marketing_metrics: {...formData.marketing_metrics, postcards_sent: parseInt(e.target.value)}})} />
                </div>
                <div>
                  <Label>Cost Per Lead</Label>
                  <Input type="number" value={formData.marketing_metrics.cost_per_lead}
                    onChange={(e) => setFormData({...formData, marketing_metrics: {...formData.marketing_metrics, cost_per_lead: parseFloat(e.target.value)}})} />
                </div>
              </div>
            </div>

            <div>
              <Label>Weekly Notes</Label>
              <Textarea value={formData.notes} 
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={4} />
            </div>

            <Button type="submit" disabled={saveMutation.isPending} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              {saveMutation.isPending ? 'Saving...' : 'Save SNAP Report'}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Week #{snapshot?.week_number} - {snapshot?.snapshot_date}</h2>
        <Button onClick={() => setIsEditing(true)}>Edit Report</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm">Capacity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <MetricRow label="Seats" value={snapshot?.capacity_metrics?.seats || 0} />
            <MetricRow label="Max Classes" value={snapshot?.capacity_metrics?.max_classes || 0} />
            <MetricRow label="Practical Cap." value={snapshot?.capacity_metrics?.practical_capacity || 0} />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm">Members</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <MetricRow label="New" value={snapshot?.member_metrics?.new_members || 0} />
            <MetricRow label="Lost" value={snapshot?.member_metrics?.member_loss || 0} />
            <MetricRow label="Growth" value={snapshot?.member_metrics?.growth || 0} />
            <MetricRow label="Total Active" value={snapshot?.member_metrics?.total_active || 0} />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm">Trials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <MetricRow label="Booked" value={snapshot?.trial_metrics?.trials_booked || 0} />
            <MetricRow label="Completed" value={snapshot?.trial_metrics?.trials_completed || 0} />
            <MetricRow label="Conversion" value={snapshot?.trial_metrics?.conversion_rate || 0} format="percentage" />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm">Attendance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <MetricRow label="Last Week" value={snapshot?.attendance_metrics?.last_week_attendance || 0} />
            <MetricRow label="Attendance %" value={snapshot?.attendance_metrics?.attendance_percentage || 0} format="percentage" />
            <MetricRow label="vs Capacity %" value={snapshot?.attendance_metrics?.members_vs_capacity_percentage || 0} format="percentage" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}