import React, { useState } from 'react';
import { api } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Copy, Trash2, Clock } from 'lucide-react';

const WEEKDAYS = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 7, label: 'Sunday' }
];

export default function WeeklySlotManager() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [form, setForm] = useState({
    location_id: '',
    program_id: '',
    weekday: 1,
    start_time: '16:00',
    duration_minutes: 60,
    capacity: 12,
    age_min: 7,
    age_max: 12,
    title: '',
    active: true
  });

  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: () => api.entities.Location.filter({ is_active: true })
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['programs'],
    queryFn: () => api.entities.Program.filter({ active: true })
  });

  const { data: slots = [] } = useQuery({
    queryKey: ['weeklySlots', selectedLocation],
    queryFn: () => {
      if (selectedLocation === 'all') {
        return api.entities.WeeklyClassSlot.list('-weekday');
      }
      return api.entities.WeeklyClassSlot.filter({ location_id: selectedLocation }, '-weekday');
    }
  });

  const createSlotMutation = useMutation({
    mutationFn: (data) => api.entities.WeeklyClassSlot.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['weeklySlots']);
      setShowForm(false);
      resetForm();
    }
  });

  const deleteSlotMutation = useMutation({
    mutationFn: (id) => api.entities.WeeklyClassSlot.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['weeklySlots']);
    }
  });

  const copyToAllLocationsMutation = useMutation({
    mutationFn: async (slotId) => {
      const slot = slots.find(s => s.id === slotId);
      const promises = locations.map(loc => 
        api.entities.WeeklyClassSlot.create({
          ...slot,
          location_id: loc.id
        })
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['weeklySlots']);
    }
  });

  const resetForm = () => {
    setForm({
      location_id: '',
      program_id: '',
      weekday: 1,
      start_time: '16:00',
      duration_minutes: 60,
      capacity: 12,
      age_min: 7,
      age_max: 12,
      title: '',
      active: true
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createSlotMutation.mutate(form);
  };

  const groupedSlots = slots.reduce((acc, slot) => {
    const day = slot.weekday;
    if (!acc[day]) acc[day] = [];
    acc[day].push(slot);
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Weekly Class Slots</h1>
          <p className="text-slate-600">Manage recurring class times across locations</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-indigo-600">
          <Plus className="w-4 h-4 mr-2" />
          Add Slot
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <Label>Filter by Location:</Label>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map(loc => (
                  <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Create Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Slot</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Location *</Label>
                  <Select value={form.location_id} onValueChange={(val) => setForm({...form, location_id: val})} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map(loc => (
                        <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Program *</Label>
                  <Select value={form.program_id} onValueChange={(val) => setForm({...form, program_id: val})} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select program" />
                    </SelectTrigger>
                    <SelectContent>
                      {programs.map(prog => (
                        <SelectItem key={prog.id} value={prog.id}>{prog.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Class Title *</Label>
                  <Input
                    required
                    value={form.title}
                    onChange={(e) => setForm({...form, title: e.target.value})}
                    placeholder="e.g., Junior Coders"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Weekday *</Label>
                  <Select value={String(form.weekday)} onValueChange={(val) => setForm({...form, weekday: Number(val)})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WEEKDAYS.map(day => (
                        <SelectItem key={day.value} value={String(day.value)}>{day.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Start Time *</Label>
                  <Input
                    type="time"
                    required
                    value={form.start_time}
                    onChange={(e) => setForm({...form, start_time: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Duration (minutes) *</Label>
                  <Input
                    type="number"
                    required
                    value={form.duration_minutes}
                    onChange={(e) => setForm({...form, duration_minutes: Number(e.target.value)})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Capacity *</Label>
                  <Input
                    type="number"
                    required
                    value={form.capacity}
                    onChange={(e) => setForm({...form, capacity: Number(e.target.value)})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Age Min *</Label>
                  <Input
                    type="number"
                    required
                    value={form.age_min}
                    onChange={(e) => setForm({...form, age_min: Number(e.target.value)})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Age Max *</Label>
                  <Input
                    type="number"
                    required
                    value={form.age_max}
                    onChange={(e) => setForm({...form, age_max: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createSlotMutation.isPending}>
                  {createSlotMutation.isPending ? 'Creating...' : 'Create Slot'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Slots by Day */}
      <div className="space-y-6">
        {WEEKDAYS.map(day => {
          const daySlots = groupedSlots[day.value] || [];
          if (daySlots.length === 0) return null;

          return (
            <Card key={day.value}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  {day.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {daySlots.map(slot => {
                    const location = locations.find(l => l.id === slot.location_id);
                    const program = programs.find(p => p.id === slot.program_id);

                    return (
                      <div key={slot.id} className="border rounded-lg p-4 flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-bold text-lg">{slot.start_time}</span>
                            <Badge variant="outline">{slot.duration_minutes} min</Badge>
                            <Badge className="bg-indigo-100 text-indigo-700 border-0">{slot.title}</Badge>
                          </div>
                          <div className="text-sm text-slate-600 space-y-1">
                            <div>📍 {location?.name || 'Unknown'}</div>
                            <div>📚 {program?.name || 'Unknown'}</div>
                            <div>👥 Capacity: {slot.capacity} | Ages: {slot.age_min}-{slot.age_max}</div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToAllLocationsMutation.mutate(slot.id)}
                            disabled={copyToAllLocationsMutation.isPending}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteSlotMutation.mutate(slot.id)}
                            disabled={deleteSlotMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {slots.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No weekly slots created yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}