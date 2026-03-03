import React, { useState } from 'react';
import { api } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar, Plus, Edit, Trash2, Zap, Clock, Users, CheckCircle, User } from 'lucide-react';
import { addWeeks, startOfWeek, addDays, isWithinInterval } from 'date-fns';
import BlackoutDateManager from '@/components/scheduling/BlackoutDateManager';
import { instructorsApi } from '@/lib/supabase/punchpassApi';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function WeeklyScheduleManager() {
  const [editingSlot, setEditingSlot] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState(null);
  const queryClient = useQueryClient();

  const { data: slots = [], isLoading } = useQuery({
    queryKey: ['weeklySlots'],
    queryFn: () => api.entities.WeeklyClassSlot.list('-weekday'),
  });

  const { data: locations = [] } = useQuery({
    queryKey: ['academies'],
    queryFn: () => api.entities.Academy.list(),
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['programs'],
    queryFn: () => api.entities.Program.list(),
  });

  const { data: blackoutDates = [] } = useQuery({
    queryKey: ['blackoutDates'],
    queryFn: () => api.entities.BlackoutDate.list(),
  });

  const { data: instructors = [] } = useQuery({
    queryKey: ['instructors'],
    queryFn: async () => {
      // Load instructors for all locations; filter in SlotForm by location_id
      const results = [];
      for (const loc of locations) {
        const locInstructors = await instructorsApi.getByLocation(loc.id);
        results.push(...locInstructors);
      }
      return results;
    },
    enabled: locations.length > 0,
  });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (editingSlot?.id) {
        return api.entities.WeeklyClassSlot.update(editingSlot.id, data);
      }
      return api.entities.WeeklyClassSlot.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weeklySlots'] });
      setShowForm(false);
      setEditingSlot(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.entities.WeeklyClassSlot.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weeklySlots'] });
    },
  });

  const generateSessions = async () => {
    setGenerating(true);
    setGenerationResult(null);
    
    try {
      const weeksToGenerate = 8;
      const today = new Date();
      const startDate = startOfWeek(today, { weekStartsOn: 0 });
      let created = 0;
      let skipped = 0;

      for (const slot of slots.filter(s => s.active)) {
        for (let week = 0; week < weeksToGenerate; week++) {
          const weekStart = addWeeks(startDate, week);
          const sessionDate = addDays(weekStart, slot.weekday);
          
          if (sessionDate < today) continue;

          // Check if date falls within any blackout period
          const isBlackedOut = blackoutDates.some(blackout => {
            if (blackout.location_id !== slot.location_id) return false;
            return isWithinInterval(sessionDate, {
              start: new Date(blackout.start_date),
              end: new Date(blackout.end_date)
            });
          });

          if (isBlackedOut) {
            skipped++;
            continue;
          }

          const sessionDateTime = new Date(sessionDate);
          const [hours, minutes] = slot.start_time.split(':');
          sessionDateTime.setHours(parseInt(hours), parseInt(minutes), 0);

          const existing = await api.entities.ClassSession.filter({
            academyId: slot.location_id,
            programId: slot.program_id,
            startDate: sessionDateTime.toISOString().split('T')[0],
          });

          if (existing.length === 0) {
            await api.entities.ClassSession.create({
              academyId: slot.location_id,
              programId: slot.program_id,
              name: slot.title,
              startDate: sessionDateTime.toISOString(),
              schedule: {
                startTime: slot.start_time,
                duration: slot.duration_minutes,
              },
              capacity: slot.capacity,
              enrolledCount: 0,
              status: 'scheduled',
            });
            created++;
          }
        }
      }

      setGenerationResult({ success: true, created, skipped });
      queryClient.invalidateQueries({ queryKey: ['classSessions'] });
    } catch (error) {
      console.error('Generation error:', error);
      setGenerationResult({ success: false, error: error.message });
    } finally {
      setGenerating(false);
    }
  };

  const handleEdit = (slot) => {
    setEditingSlot(slot);
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingSlot(null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this weekly slot? This will not affect existing sessions.')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const groupedSlots = slots.reduce((acc, slot) => {
    const day = WEEKDAYS[slot.weekday];
    if (!acc[day]) acc[day] = [];
    acc[day].push(slot);
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Weekly Schedule</h1>
          <p className="text-gray-600">Manage recurring class slots and generate sessions</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={generateSessions}
            disabled={generating || slots.length === 0}
            className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
          >
            <Zap className="w-4 h-4 mr-2" />
            {generating ? 'Generating...' : 'Generate Sessions'}
          </Button>
          <Button onClick={handleNew} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Slot
          </Button>
        </div>
      </div>

      {generationResult && (
        <Card className={generationResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <CardContent className="p-4 flex items-center gap-3">
            {generationResult.success ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div className="text-green-900">
                  Successfully generated <strong>{generationResult.created}</strong> class sessions
                  {generationResult.skipped > 0 && (
                    <span className="text-orange-700"> ({generationResult.skipped} skipped due to blackout dates)</span>
                  )}
                </div>
              </>
            ) : (
              <div className="text-red-900">Error: {generationResult.error}</div>
            )}
          </CardContent>
        </Card>
      )}

      <BlackoutDateManager locations={locations} />

      {slots.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No weekly slots yet</h3>
            <p className="text-gray-600 mb-6">Create recurring class slots to generate sessions automatically</p>
            <Button onClick={handleNew} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Create First Slot
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {WEEKDAYS.map((day) => {
            const daySlots = groupedSlots[day];
            if (!daySlots) return null;

            return (
              <div key={day}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-8 bg-indigo-600 rounded"></div>
                  <h2 className="text-2xl font-bold text-gray-900">{day}</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {daySlots.map((slot) => {
                    const location = locations.find(l => l.id === slot.location_id);
                    const program = programs.find(p => p.id === slot.program_id);
                    const instructor = instructors.find(i => i.id === slot.instructor_id);

                    return (
                      <Card key={slot.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg mb-2">{slot.title}</CardTitle>
                              <div className="flex flex-wrap gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {location?.name || 'Unknown Location'}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {program?.name || 'Unknown Program'}
                                </Badge>
                                {instructor && (
                                  <Badge variant="outline" className="text-xs bg-blue-50">
                                    <User className="w-3 h-3 mr-1" />
                                    {instructor.first_name}{instructor.last_name ? ` ${instructor.last_name}` : ''}
                                  </Badge>
                                )}
                                {!slot.active && (
                                  <Badge variant="secondary" className="text-xs">Inactive</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {slot.start_time?.slice(0, 5)} • {slot.duration_minutes}min
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              {slot.capacity} seats
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">
                            Ages {slot.age_min}-{slot.age_max}
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button
                              onClick={() => handleEdit(slot)}
                              variant="outline"
                              size="sm"
                              className="flex-1"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              onClick={() => handleDelete(slot.id)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <SlotForm
          slot={editingSlot}
          locations={locations}
          programs={programs}
          instructors={instructors}
          onSave={(data) => saveMutation.mutate(data)}
          onClose={() => {
            setShowForm(false);
            setEditingSlot(null);
          }}
          isSaving={saveMutation.isPending}
        />
      )}
    </div>
  );
}

function SlotForm({ slot, locations, programs, instructors = [], onSave, onClose, isSaving }) {
  const [form, setForm] = useState({
    location_id: slot?.location_id || '',
    program_id: slot?.program_id || '',
    instructor_id: slot?.instructor_id || '',
    weekday: slot?.weekday ?? 1,
    start_time: slot?.start_time || '16:00:00',
    duration_minutes: slot?.duration_minutes || 60,
    capacity: slot?.capacity || 12,
    age_min: slot?.age_min || 7,
    age_max: slot?.age_max || 12,
    title: slot?.title || '',
    active: slot?.active ?? true,
  });

  // Filter instructors by selected location
  const locationInstructors = form.location_id
    ? instructors.filter(i => i.location_id === form.location_id)
    : instructors;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      instructor_id: form.instructor_id || null,
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {slot ? 'Edit Weekly Slot' : 'Create Weekly Slot'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Location *</label>
              <select
                required
                value={form.location_id}
                onChange={(e) => setForm({ ...form, location_id: e.target.value })}
                className="input"
              >
                <option value="">Select location</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Program *</label>
              <select
                required
                value={form.program_id}
                onChange={(e) => setForm({ ...form, program_id: e.target.value })}
                className="input"
              >
                <option value="">Select program</option>
                {programs.map(prog => (
                  <option key={prog.id} value={prog.id}>{prog.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Instructor</label>
              <select
                value={form.instructor_id}
                onChange={(e) => setForm({ ...form, instructor_id: e.target.value || null })}
                className="input"
              >
                <option value="">No instructor</option>
                {locationInstructors.map(inst => (
                  <option key={inst.id} value={inst.id}>
                    {inst.first_name}{inst.last_name ? ` ${inst.last_name}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Day of Week *</label>
              <select
                required
                value={form.weekday}
                onChange={(e) => setForm({ ...form, weekday: parseInt(e.target.value) })}
                className="input"
              >
                {WEEKDAYS.map((day, i) => (
                  <option key={i} value={i}>{day}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Start Time *</label>
              <input
                required
                type="time"
                value={form.start_time.slice(0, 5)}
                onChange={(e) => setForm({ ...form, start_time: e.target.value + ':00' })}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Duration (minutes) *</label>
              <input
                required
                type="number"
                value={form.duration_minutes}
                onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) })}
                className="input"
                min="15"
                step="15"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Capacity *</label>
              <input
                required
                type="number"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) })}
                className="input"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Min Age *</label>
              <input
                required
                type="number"
                value={form.age_min}
                onChange={(e) => setForm({ ...form, age_min: parseInt(e.target.value) })}
                className="input"
                min="5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Max Age *</label>
              <input
                required
                type="number"
                value={form.age_max}
                onChange={(e) => setForm({ ...form, age_max: parseInt(e.target.value) })}
                className="input"
                min="5"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input"
              placeholder="Free Trial Coding Session"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded"
            />
            <label htmlFor="active" className="text-sm font-medium">
              Active (generate sessions for this slot)
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
              {isSaving ? 'Saving...' : 'Save Slot'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}