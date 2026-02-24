import React, { useState } from 'react';
import { api } from '@/api/apiClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

export default function TrackForm({ track, projects, onSuccess }) {
  const [formData, setFormData] = useState({
    name: track?.name || '',
    description: track?.description || '',
    icon: track?.icon || '📚',
    color: track?.color || '#A3DAE8',
    order: track?.order || 0,
    is_template: track?.is_template || false,
    status: track?.status || 'active',
  });

  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (track?.id) {
        return api.entities.CurriculumTrack.update(track.id, data);
      } else {
        return api.entities.CurriculumTrack.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['curriculum-tracks'] });
      onSuccess?.();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const iconOptions = ['📚', '🛡️', '🎮', '💻', '🚀', '🎨', '🔧', '⚡'];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label>Track Name *</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="e.g., Way of the Hero"
          required
        />
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          rows={3}
          placeholder="Describe this learning track..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Icon</Label>
          <div className="flex gap-2 mt-2">
            {iconOptions.map(icon => (
              <button
                key={icon}
                type="button"
                onClick={() => setFormData({...formData, icon})}
                className={`w-10 h-10 rounded-lg border-2 text-xl flex items-center justify-center hover:bg-slate-50 ${
                  formData.icon === icon ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200'
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label>Color</Label>
          <Input
            type="color"
            value={formData.color}
            onChange={(e) => setFormData({...formData, color: e.target.value})}
            className="h-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Order</Label>
          <Input
            type="number"
            value={formData.order}
            onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label>Template Track</Label>
          <Switch
            checked={formData.is_template}
            onCheckedChange={(checked) => setFormData({...formData, is_template: checked})}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="submit"
          disabled={saveMutation.isPending}
          className="bg-[#EE3E86] hover:bg-[#d63577]"
        >
          {saveMutation.isPending ? 'Saving...' : 'Save Track'}
        </Button>
      </div>
    </form>
  );
}