import React, { useState } from 'react';
import { api } from '@/api/apiClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function SlotForm({ slot, programs, onSuccess }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    weekday: slot?.weekday ?? 1,
    start_time: slot?.start_time || '16:00',
    duration_minutes: slot?.duration_minutes || 60,
    capacity: slot?.capacity || 10,
    program_id: slot?.program_id || '',
    title: slot?.title || '',
    age_min: slot?.age_min || 7,
    age_max: slot?.age_max || 14,
    active: slot?.active ?? true,
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (slot?.id) {
        return api.entities.WeeklyClassSlot.update(slot.id, data);
      } else {
        return api.entities.WeeklyClassSlot.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slots'] });
      onSuccess?.();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-[#2A4169]">Day of Week</Label>
          <Select 
            value={String(formData.weekday)} 
            onValueChange={(val) => setFormData({ ...formData, weekday: parseInt(val) })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {weekdays.map((day, idx) => (
                <SelectItem key={idx} value={String(idx)}>
                  {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-[#2A4169]">Start Time</Label>
          <Input
            type="time"
            value={formData.start_time}
            onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label className="text-[#2A4169]">Program</Label>
        <Select 
          value={formData.program_id} 
          onValueChange={(val) => setFormData({ ...formData, program_id: val })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select program" />
          </SelectTrigger>
          <SelectContent>
            {programs.map((prog) => (
              <SelectItem key={prog.id} value={prog.id}>
                {prog.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-[#2A4169]">Title</Label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Coding Create 8-14"
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="text-[#2A4169]">Capacity</Label>
          <Input
            type="number"
            min="1"
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-[#2A4169]">Min Age</Label>
          <Input
            type="number"
            min="5"
            value={formData.age_min}
            onChange={(e) => setFormData({ ...formData, age_min: parseInt(e.target.value) })}
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-[#2A4169]">Max Age</Label>
          <Input
            type="number"
            min="5"
            value={formData.age_max}
            onChange={(e) => setFormData({ ...formData, age_max: parseInt(e.target.value) })}
            className="mt-1"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="submit"
          className="bg-[#EE3E86] hover:bg-[#D62D73]"
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending ? 'Saving...' : 'Save Slot'}
        </Button>
      </div>
    </form>
  );
}