import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';

const EMPTY_REPORT = (locationId) => ({
  location_id: locationId,
  year: new Date().getFullYear(),
  week_number: Math.ceil((new Date().getDate()) / 7),
  snapshot_date: new Date().toISOString().split('T')[0],
  seats: 0,
  max_classes: 0,
  centre_capacity: 0,
  practical_capacity: 0,
  new_members: 0,
  member_loss: 0,
  net_growth: 0,
  total_active_members: 0,
  member_target: 0,
  variance_from_target: 0,
  mia_14_days: 0,
  suspensions: 0,
  cancellations: 0,
  attendance_count: 0,
  attendance_percentage: 0,
  members_vs_capacity_pct: 0,
  trials_booked: 0,
  trials_completed: 0,
  trial_attendance_rate: 0,
  trial_conversion_rate: 0,
  postcards_sent: 0,
  postcards_percentage: 0,
  cost_per_lead: 0,
  cost_per_acquisition: 0,
  weekly_revenue: 0,
  monthly_recurring_revenue: 0,
  average_member_value: 0,
  health_score: 0,
  red_flags: [],
  wins: [],
  notes: '',
  status: 'draft',
});

export default function SnapReportCard({ snapshot, location, previousSnapshot }) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(!snapshot);
  const [formData, setFormData] = useState(snapshot || EMPTY_REPORT(location?.id));
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      // Auto-calculate derived metrics
      data.net_growth = data.new_members - data.member_loss;
      data.variance_from_target = data.total_active_members - data.member_target;

      data.attendance_percentage = data.total_active_members > 0
        ? parseFloat((data.attendance_count / data.total_active_members * 100).toFixed(1))
        : 0;

      data.members_vs_capacity_pct = data.practical_capacity > 0
        ? parseFloat((data.total_active_members / data.practical_capacity * 100).toFixed(1))
        : 0;

      data.trial_attendance_rate = data.trials_booked > 0
        ? parseFloat((data.trials_completed / data.trials_booked * 100).toFixed(1))
        : 0;

      data.postcards_percentage = data.total_active_members > 0
        ? parseFloat((data.postcards_sent / data.total_active_members * 100).toFixed(1))
        : 0;

      // Calculate health score
      const healthFactors = [
        data.net_growth >= 0 ? 20 : 0,
        data.trial_conversion_rate >= 30 ? 20 : data.trial_conversion_rate >= 20 ? 10 : 0,
        data.attendance_percentage >= 80 ? 20 : data.attendance_percentage >= 70 ? 10 : 0,
        data.mia_14_days === 0 ? 20 : data.mia_14_days <= 3 ? 10 : 0,
        data.variance_from_target >= 0 ? 20 : data.variance_from_target >= -5 ? 10 : 0,
      ];
      data.health_score = healthFactors.reduce((a, b) => a + b, 0);

      // Identify red flags
      const flags = [];
      if (data.net_growth < 0) flags.push('Negative member growth');
      if (data.trial_conversion_rate < 20) flags.push('Low trial conversion rate');
      if (data.attendance_percentage < 70) flags.push('Low attendance rate');
      if (data.mia_14_days > 5) flags.push(`${data.mia_14_days} members MIA 14+ days`);
      if (data.variance_from_target < -10) flags.push('Significantly below member target');
      data.red_flags = flags;

      // Remove fields that aren't in the table schema
      const { id, created_at, updated_at, ...insertData } = data;

      if (snapshot?.id) {
        const { data: updated, error } = await supabase
          .from('snap_weekly_reports')
          .update({
            ...insertData,
            submitted_by: user?.id,
            submitted_at: new Date().toISOString(),
            status: 'submitted',
            updated_at: new Date().toISOString(),
          })
          .eq('id', snapshot.id)
          .select()
          .single();

        if (error) throw error;
        return updated;
      } else {
        const { data: created, error } = await supabase
          .from('snap_weekly_reports')
          .insert({
            ...insertData,
            submitted_by: user?.id,
            submitted_at: new Date().toISOString(),
            status: 'submitted',
          })
          .select()
          .single();

        if (error) throw error;
        return created;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['snap-reports'] });
      setIsEditing(false);
    },
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const MetricRow = ({ label, value, previousValue, format = 'number' }) => {
    const getTrend = () => {
      if (previousValue == null || previousValue === value) return <Minus className="w-4 h-4 text-slate-400" />;
      if (value > previousValue) return <TrendingUp className="w-4 h-4 text-green-500" />;
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    };

    const formatValue = (val) => {
      if (format === 'percentage') return `${val}%`;
      if (format === 'currency') return `$${Number(val).toLocaleString()}`;
      return val;
    };

    return (
      <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
        <span className="text-sm text-slate-600">{label}</span>
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
          <div className="flex items-center justify-between">
            <CardTitle>Weekly SNAP Report</CardTitle>
            {snapshot && (
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(formData); }} className="space-y-6">
            {/* Capacity Metrics */}
            <div>
              <h3 className="font-semibold mb-3">Capacity Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  ['seats', 'Seats/Workstations'],
                  ['max_classes', 'Max Classes'],
                  ['centre_capacity', 'Centre Capacity'],
                  ['practical_capacity', 'Practical Capacity'],
                ].map(([field, label]) => (
                  <div key={field}>
                    <Label>{label}</Label>
                    <Input type="number" value={formData[field]}
                      onChange={(e) => updateField(field, parseInt(e.target.value) || 0)} />
                  </div>
                ))}
              </div>
            </div>

            {/* Member Metrics */}
            <div>
              <h3 className="font-semibold mb-3">Member Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  ['new_members', 'New Members'],
                  ['member_loss', 'Member Loss'],
                  ['total_active_members', 'Total Active Members'],
                  ['member_target', 'Target'],
                  ['mia_14_days', 'MIA 14+ Days'],
                  ['suspensions', 'Suspensions'],
                  ['cancellations', 'Cancellations'],
                ].map(([field, label]) => (
                  <div key={field}>
                    <Label>{label}</Label>
                    <Input type="number" value={formData[field]}
                      onChange={(e) => updateField(field, parseInt(e.target.value) || 0)} />
                  </div>
                ))}
              </div>
            </div>

            {/* Trial & Attendance */}
            <div>
              <h3 className="font-semibold mb-3">Trial & Attendance</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  ['attendance_count', 'Last Week Attendance'],
                  ['trials_booked', 'Trials Booked'],
                  ['trials_completed', 'Trials Completed'],
                  ['trial_conversion_rate', 'Conversion Rate (%)'],
                ].map(([field, label]) => (
                  <div key={field}>
                    <Label>{label}</Label>
                    <Input type="number" step={field.includes('rate') ? '0.1' : '1'}
                      value={formData[field]}
                      onChange={(e) => updateField(field, parseFloat(e.target.value) || 0)} />
                  </div>
                ))}
              </div>
            </div>

            {/* Marketing */}
            <div>
              <h3 className="font-semibold mb-3">Marketing</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  ['postcards_sent', 'Postcards Sent'],
                  ['cost_per_lead', 'Cost Per Lead ($)'],
                  ['cost_per_acquisition', 'Cost Per Acquisition ($)'],
                ].map(([field, label]) => (
                  <div key={field}>
                    <Label>{label}</Label>
                    <Input type="number" step="0.01" value={formData[field]}
                      onChange={(e) => updateField(field, parseFloat(e.target.value) || 0)} />
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue */}
            <div>
              <h3 className="font-semibold mb-3">Revenue</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  ['weekly_revenue', 'Weekly Revenue ($)'],
                  ['monthly_recurring_revenue', 'Monthly Recurring Revenue ($)'],
                  ['average_member_value', 'Average Member Value ($)'],
                ].map(([field, label]) => (
                  <div key={field}>
                    <Label>{label}</Label>
                    <Input type="number" step="0.01" value={formData[field]}
                      onChange={(e) => updateField(field, parseFloat(e.target.value) || 0)} />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Weekly Notes</Label>
              <Textarea value={formData.notes}
                onChange={(e) => updateField('notes', e.target.value)}
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

  // Read-only view
  const prev = previousSnapshot || {};
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Week #{snapshot?.week_number} - {snapshot?.snapshot_date}</h2>
          {snapshot?.health_score != null && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-slate-600">Health Score:</span>
              <Badge className={
                snapshot.health_score >= 80 ? 'bg-green-500' :
                  snapshot.health_score >= 60 ? 'bg-amber-500' : 'bg-red-500'
              }>
                {snapshot.health_score}/100
              </Badge>
            </div>
          )}
        </div>
        <Button onClick={() => { setFormData(snapshot); setIsEditing(true); }}>Edit Report</Button>
      </div>

      {/* Red flags */}
      {snapshot?.red_flags?.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2 text-red-700 font-semibold">
              <AlertTriangle className="w-5 h-5" />
              Red Flags
            </div>
            <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
              {snapshot.red_flags.map((flag, i) => <li key={i}>{flag}</li>)}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader><CardTitle className="text-sm">Capacity</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            <MetricRow label="Seats" value={snapshot?.seats || 0} previousValue={prev.seats} />
            <MetricRow label="Max Classes" value={snapshot?.max_classes || 0} previousValue={prev.max_classes} />
            <MetricRow label="Practical Cap." value={snapshot?.practical_capacity || 0} previousValue={prev.practical_capacity} />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader><CardTitle className="text-sm">Members</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            <MetricRow label="New" value={snapshot?.new_members || 0} previousValue={prev.new_members} />
            <MetricRow label="Lost" value={snapshot?.member_loss || 0} previousValue={prev.member_loss} />
            <MetricRow label="Growth" value={snapshot?.net_growth || 0} previousValue={prev.net_growth} />
            <MetricRow label="Total Active" value={snapshot?.total_active_members || 0} previousValue={prev.total_active_members} />
            <MetricRow label="MIA 14+" value={snapshot?.mia_14_days || 0} previousValue={prev.mia_14_days} />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader><CardTitle className="text-sm">Trials</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            <MetricRow label="Booked" value={snapshot?.trials_booked || 0} previousValue={prev.trials_booked} />
            <MetricRow label="Completed" value={snapshot?.trials_completed || 0} previousValue={prev.trials_completed} />
            <MetricRow label="Conversion" value={snapshot?.trial_conversion_rate || 0} previousValue={prev.trial_conversion_rate} format="percentage" />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader><CardTitle className="text-sm">Attendance & Revenue</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            <MetricRow label="Attendance" value={snapshot?.attendance_count || 0} previousValue={prev.attendance_count} />
            <MetricRow label="Attend %" value={snapshot?.attendance_percentage || 0} previousValue={prev.attendance_percentage} format="percentage" />
            <MetricRow label="Weekly Rev" value={snapshot?.weekly_revenue || 0} previousValue={prev.weekly_revenue} format="currency" />
            <MetricRow label="MRR" value={snapshot?.monthly_recurring_revenue || 0} previousValue={prev.monthly_recurring_revenue} format="currency" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
