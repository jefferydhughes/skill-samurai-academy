import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Target, Plus, CheckCircle2, AlertTriangle, XCircle, Trash2 } from 'lucide-react';

const EMPTY_ROCK = (locationId) => ({
  location_id: locationId,
  quarter: `Q${Math.floor((new Date().getMonth() / 3)) + 1} ${new Date().getFullYear()}`,
  owner_name: '',
  title: '',
  description: '',
  target_date: '',
  status: 'on_track',
  completion_percentage: 0,
  milestones: [],
});

export default function EOSScorecard({ rocks = [], location }) {
  const { user } = useAuth();
  const [showRockForm, setShowRockForm] = useState(false);
  const [editingRock, setEditingRock] = useState(null);
  const [formData, setFormData] = useState(EMPTY_ROCK(location?.id));
  const [newMilestone, setNewMilestone] = useState('');

  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const record = {
        location_id: data.location_id,
        quarter: data.quarter,
        title: data.title,
        description: data.description,
        owner_name: data.owner_name,
        owner_user_id: user?.id,
        target_date: data.target_date,
        status: data.status,
        completion_percentage: data.completion_percentage,
        milestones: data.milestones || [],
        updated_at: new Date().toISOString(),
      };

      if (editingRock?.id) {
        const { data: updated, error } = await supabase
          .from('eos_quarterly_rocks')
          .update(record)
          .eq('id', editingRock.id)
          .select()
          .single();
        if (error) throw error;
        return updated;
      } else {
        const { data: created, error } = await supabase
          .from('eos_quarterly_rocks')
          .insert(record)
          .select()
          .single();
        if (error) throw error;
        return created;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eos-rocks'] });
      setShowRockForm(false);
      setEditingRock(null);
      setFormData(EMPTY_ROCK(location?.id));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (rockId) => {
      const { error } = await supabase
        .from('eos_quarterly_rocks')
        .delete()
        .eq('id', rockId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eos-rocks'] });
      setShowRockForm(false);
      setEditingRock(null);
    },
  });

  const getStatusBadge = (status) => {
    const configs = {
      completed: { className: 'bg-green-500', icon: CheckCircle2, label: 'Completed' },
      on_track: { className: 'bg-blue-500', icon: null, label: 'On Track' },
      at_risk: { className: 'bg-amber-500', icon: AlertTriangle, label: 'At Risk' },
      off_track: { className: 'bg-red-500', icon: XCircle, label: 'Off Track' },
      dropped: { className: 'bg-slate-400', icon: null, label: 'Dropped' },
    };
    const config = configs[status] || configs.on_track;
    const Icon = config.icon;
    return (
      <Badge className={config.className}>
        {Icon && <Icon className="w-3 h-3 mr-1" />}
        {config.label}
      </Badge>
    );
  };

  const addMilestone = () => {
    if (!newMilestone.trim()) return;
    setFormData(prev => ({
      ...prev,
      milestones: [...(prev.milestones || []), { title: newMilestone, completed: false }],
    }));
    setNewMilestone('');
  };

  const toggleMilestone = (index) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.map((m, i) =>
        i === index ? { ...m, completed: !m.completed } : m
      ),
    }));
  };

  const removeMilestone = (index) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index),
    }));
  };

  const completedRocks = rocks.filter(r => r.status === 'completed').length;
  const totalRocks = rocks.length;
  const overallProgress = totalRocks > 0 ? Math.round((completedRocks / totalRocks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Target className="w-6 h-6 text-indigo-600" />
            Quarterly Rocks - {formData.quarter}
          </h2>
          <p className="text-slate-600 mt-1">Your 3-5 most important priorities this quarter</p>
        </div>
        <Button onClick={() => { setEditingRock(null); setFormData(EMPTY_ROCK(location?.id)); setShowRockForm(true); }} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Rock
        </Button>
      </div>

      {/* Overall Progress */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-700">Quarterly Progress</span>
            <span className="text-2xl font-bold text-indigo-600">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-3 mb-2" />
          <div className="text-sm text-slate-600">
            {completedRocks} of {totalRocks} rocks completed
          </div>
        </CardContent>
      </Card>

      {/* Rocks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rocks.map(rock => (
          <Card key={rock.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => {
              setEditingRock(rock);
              setFormData({
                ...rock,
                milestones: rock.milestones || [],
              });
              setShowRockForm(true);
            }}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{rock.title}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span>Owner: {rock.owner_name}</span>
                    <span>-</span>
                    <span>Due: {new Date(rock.target_date).toLocaleDateString()}</span>
                  </div>
                </div>
                {getStatusBadge(rock.status)}
              </div>
            </CardHeader>
            <CardContent>
              {rock.description && (
                <p className="text-sm text-slate-600 mb-4">{rock.description}</p>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Progress</span>
                  <span className="font-semibold text-slate-900">{rock.completion_percentage}%</span>
                </div>
                <Progress value={rock.completion_percentage} className="h-2" />
              </div>

              {rock.milestones && rock.milestones.length > 0 && (
                <div className="mt-4">
                  <div className="text-xs font-semibold text-slate-700 mb-2">Milestones</div>
                  <div className="space-y-1">
                    {rock.milestones.map((milestone, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        {milestone.completed ? (
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                        ) : (
                          <div className="w-3 h-3 rounded-full border-2 border-slate-300" />
                        )}
                        <span className={milestone.completed ? 'line-through text-slate-400' : 'text-slate-700'}>
                          {milestone.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {rocks.length === 0 && (
          <Card className="border-dashed border-2 col-span-full">
            <CardContent className="p-12 text-center text-slate-500">
              <Target className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p className="font-medium">No rocks yet this quarter</p>
              <p className="text-sm mt-1">Add 3-5 critical priorities to track</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Rock Form Dialog */}
      <Dialog open={showRockForm} onOpenChange={setShowRockForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRock ? 'Edit' : 'New'} Quarterly Rock</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(formData); }} className="space-y-4">
            <div>
              <Label>Rock Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Increase active members to 120"
                required
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="What does done look like?"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Owner *</Label>
                <Input
                  value={formData.owner_name}
                  onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                  placeholder="Person responsible"
                  required
                />
              </div>
              <div>
                <Label>Target Date *</Label>
                <Input
                  type="date"
                  value={formData.target_date}
                  onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Status</Label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="on_track">On Track</option>
                  <option value="at_risk">At Risk</option>
                  <option value="off_track">Off Track</option>
                  <option value="completed">Completed</option>
                  <option value="dropped">Dropped</option>
                </select>
              </div>
              <div>
                <Label>Completion %</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.completion_percentage}
                  onChange={(e) => setFormData({ ...formData, completion_percentage: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            {/* Milestones */}
            <div>
              <Label>Milestones</Label>
              <div className="space-y-2 mt-2">
                {(formData.milestones || []).map((m, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <button type="button" onClick={() => toggleMilestone(i)} className="flex-shrink-0">
                      {m.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                      )}
                    </button>
                    <span className={`flex-1 text-sm ${m.completed ? 'line-through text-slate-400' : ''}`}>
                      {m.title}
                    </span>
                    <button type="button" onClick={() => removeMilestone(i)} className="text-slate-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    value={newMilestone}
                    onChange={(e) => setNewMilestone(e.target.value)}
                    placeholder="Add a milestone..."
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addMilestone(); } }}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addMilestone}>Add</Button>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={saveMutation.isPending} className="flex-1">
                {saveMutation.isPending ? 'Saving...' : 'Save Rock'}
              </Button>
              {editingRock?.id && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => { if (confirm('Delete this rock?')) deleteMutation.mutate(editingRock.id); }}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
