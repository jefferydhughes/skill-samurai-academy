import React, { useState, useEffect } from 'react';
import OwnerLayout from '../../components/owner/OwnerLayout';
import { api } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import SlotForm from '../../components/owner/SlotForm';

const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function OwnerSchedule() {
  const [user, setUser] = useState(null);
  const [showSlotForm, setShowSlotForm] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await api.auth.me();
      setUser(userData);
    } catch (e) {
      api.auth.redirectToLogin();
    }
  };

  const { data: slots = [] } = useQuery({
    queryKey: ['slots'],
    queryFn: () => api.entities.WeeklyClassSlot.list(),
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['programs'],
    queryFn: () => api.entities.Program.list(),
  });

  const deleteSlotMutation = useMutation({
    mutationFn: (slotId) => api.entities.WeeklyClassSlot.delete(slotId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slots'] });
    },
  });

  const handleAddSlot = () => {
    setEditingSlot(null);
    setShowSlotForm(true);
  };

  const handleEditSlot = (slot) => {
    setEditingSlot(slot);
    setShowSlotForm(true);
  };

  const handleDeleteSlot = async (slotId) => {
    if (window.confirm('Are you sure you want to delete this time slot?')) {
      deleteSlotMutation.mutate(slotId);
    }
  };

  const handleFormClose = () => {
    setShowSlotForm(false);
    setEditingSlot(null);
  };

  const groupedSlots = weekdays.map((day, index) => ({
    day,
    dayIndex: index,
    slots: slots
      .filter(s => s.weekday === index)
      .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || '')),
  }));

  return (
    <OwnerLayout currentPageName="OwnerSchedule">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#2A4169]">Weekly Schedule</h1>
            <p className="text-slate-600 mt-1">Manage recurring class time slots</p>
          </div>
          <Button
            onClick={handleAddSlot}
            className="bg-[#EE3E86] hover:bg-[#D62D73] gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Time Slot
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
          {groupedSlots.map(({ day, dayIndex, slots: daySlots }) => (
            <div key={dayIndex}>
              <h2 className="text-center font-semibold mb-3 text-[#2A4169] bg-white rounded-lg py-2 shadow-sm">
                {day}
              </h2>
              <div className="space-y-3">
                {daySlots.length === 0 ? (
                  <div className="text-center text-sm text-slate-400 py-8 bg-slate-50 rounded-lg border-2 border-dashed">
                    No slots
                  </div>
                ) : (
                  daySlots.map((slot) => {
                    const program = programs.find(p => p.id === slot.program_id);
                    const enrolled = 0; // TODO: get from roster

                    return (
                      <Card key={slot.id} className="border-0 shadow-md hover:shadow-lg transition-all overflow-hidden group">
                        <div className="h-1 bg-gradient-to-r from-[#2A4169] to-[#A3DAE8]" />
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="font-semibold text-sm text-[#2A4169] mb-1">
                                {slot.title || program?.name || 'Class'}
                              </h3>
                              <p className="text-xs text-slate-600 font-mono">
                                {slot.start_time}
                              </p>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={() => handleEditSlot(slot)}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-red-600"
                                onClick={() => handleDeleteSlot(slot.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="text-xs">
                              {enrolled}/{slot.capacity || 0}
                            </Badge>
                            {slot.age_min && slot.age_max && (
                              <span className="text-xs text-slate-500">
                                Ages {slot.age_min}-{slot.age_max}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={showSlotForm} onOpenChange={setShowSlotForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#2A4169]">
              {editingSlot ? 'Edit Time Slot' : 'Add New Time Slot'}
            </DialogTitle>
          </DialogHeader>
          <SlotForm 
            slot={editingSlot} 
            onSuccess={handleFormClose}
            programs={programs}
          />
        </DialogContent>
      </Dialog>
    </OwnerLayout>
  );
}