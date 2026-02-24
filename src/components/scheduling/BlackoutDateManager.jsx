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
import { Calendar, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

const reasonColors = {
  holiday: 'bg-red-100 text-red-700',
  maintenance: 'bg-orange-100 text-orange-700',
  event: 'bg-purple-100 text-purple-700',
  instructor_unavailable: 'bg-blue-100 text-blue-700',
  other: 'bg-gray-100 text-gray-700'
};

export default function BlackoutDateManager({ locations }) {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: blackoutDates = [], isLoading } = useQuery({
    queryKey: ['blackoutDates'],
    queryFn: () => api.entities.BlackoutDate.list('-start_date'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.entities.BlackoutDate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blackoutDates'] });
    },
  });

  const saveMutation = useMutation({
    mutationFn: (data) => api.entities.BlackoutDate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blackoutDates'] });
      setShowForm(false);
    },
  });

  const upcomingBlackouts = blackoutDates.filter(
    b => new Date(b.end_date) >= new Date()
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <CardTitle>Blackout Dates</CardTitle>
          </div>
          <Button onClick={() => setShowForm(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Blackout
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {upcomingBlackouts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No upcoming blackout dates</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingBlackouts.map((blackout) => {
              const location = locations.find(l => l.id === blackout.location_id);
              return (
                <div
                  key={blackout.id}
                  className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{blackout.title}</h4>
                      <Badge className={reasonColors[blackout.reason]}>
                        {blackout.reason.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      {format(new Date(blackout.start_date), 'MMM d, yyyy')} - {format(new Date(blackout.end_date), 'MMM d, yyyy')}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {location?.name || 'All locations'}
                    </div>
                  </div>
                  <Button
                    onClick={() => deleteMutation.mutate(blackout.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {showForm && (
          <BlackoutForm
            locations={locations}
            onSave={(data) => saveMutation.mutate(data)}
            onClose={() => setShowForm(false)}
            isSaving={saveMutation.isPending}
          />
        )}
      </CardContent>
    </Card>
  );
}

function BlackoutForm({ locations, onSave, onClose, isSaving }) {
  const [form, setForm] = useState({
    location_id: '',
    title: '',
    start_date: '',
    end_date: '',
    reason: 'holiday',
    affects_all_programs: true,
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Blackout Date</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input"
              placeholder="Christmas Break"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Start Date *</label>
              <input
                required
                type="date"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Date *</label>
              <input
                required
                type="date"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Reason</label>
            <select
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className="input"
            >
              <option value="holiday">Holiday</option>
              <option value="maintenance">Maintenance</option>
              <option value="event">Special Event</option>
              <option value="instructor_unavailable">Instructor Unavailable</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="input"
              rows="3"
              placeholder="Additional details..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
              {isSaving ? 'Saving...' : 'Add Blackout'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}