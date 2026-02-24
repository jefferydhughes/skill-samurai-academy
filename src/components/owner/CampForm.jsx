import React, { useState } from 'react';
import { api } from '@/api/apiClient';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';

export default function CampForm({ camp, onSuccess }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: camp?.title || '',
    description: camp?.description || '',
    short_description: camp?.short_description || '',
    thumbnail: camp?.thumbnail || '',
    category: camp?.category || 'Coding',
    location_id: camp?.location_id || '',
    start_datetime: camp?.start_datetime ? camp.start_datetime.slice(0, 16) : '',
    end_datetime: camp?.end_datetime ? camp.end_datetime.slice(0, 16) : '',
    capacity: camp?.capacity || 12,
    age_min: camp?.age_min || 7,
    age_max: camp?.age_max || 14,
    price: camp?.price ? camp.price / 100 : 0,
    active: camp?.active ?? true,
    what_you_will_learn: camp?.what_you_will_learn || [],
    tuition_includes: camp?.tuition_includes || [],
  });

  const [newLearningItem, setNewLearningItem] = useState('');
  const [newIncludesItem, setNewIncludesItem] = useState('');

  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: () => api.entities.Location.filter({ is_active: true }),
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        ...data,
        price: Math.round(data.price * 100), // convert to cents
      };
      
      if (camp?.id) {
        return api.entities.CampEvent.update(camp.id, payload);
      } else {
        return api.entities.CampEvent.create(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['camps'] });
      onSuccess?.();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const addLearningItem = () => {
    if (newLearningItem.trim()) {
      setFormData({ ...formData, what_you_will_learn: [...formData.what_you_will_learn, newLearningItem.trim()] });
      setNewLearningItem('');
    }
  };

  const removeLearningItem = (index) => {
    setFormData({ ...formData, what_you_will_learn: formData.what_you_will_learn.filter((_, i) => i !== index) });
  };

  const addIncludesItem = () => {
    if (newIncludesItem.trim()) {
      setFormData({ ...formData, tuition_includes: [...formData.tuition_includes, newIncludesItem.trim()] });
      setNewIncludesItem('');
    }
  };

  const removeIncludesItem = (index) => {
    setFormData({ ...formData, tuition_includes: formData.tuition_includes.filter((_, i) => i !== index) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="text-[#2A4169]">Camp Title</Label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Roblox Legends Camp"
          className="mt-1"
          required
        />
      </div>

      <div>
        <Label className="text-[#2A4169]">Short Description</Label>
        <Input
          value={formData.short_description}
          onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
          placeholder="One-line summary"
          className="mt-1"
        />
      </div>

      <div>
        <Label className="text-[#2A4169]">Full Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Detailed description of the camp"
          className="mt-1"
          rows={3}
        />
      </div>

      <div>
        <Label className="text-[#2A4169]">Thumbnail Image URL</Label>
        <Input
          value={formData.thumbnail}
          onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
          placeholder="https://..."
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-[#2A4169]">Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Coding">Coding</SelectItem>
              <SelectItem value="Minecraft">Minecraft</SelectItem>
              <SelectItem value="Roblox">Roblox</SelectItem>
              <SelectItem value="Python">Python</SelectItem>
              <SelectItem value="Game Dev">Game Dev</SelectItem>
              <SelectItem value="Web Dev">Web Dev</SelectItem>
              <SelectItem value="Robotics">Robotics</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-[#2A4169]">Location</Label>
          <Select value={formData.location_id} onValueChange={(value) => setFormData({ ...formData, location_id: value })}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map(loc => (
                <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-[#2A4169]">Start Date & Time</Label>
          <Input
            type="datetime-local"
            value={formData.start_datetime}
            onChange={(e) => setFormData({ ...formData, start_datetime: e.target.value })}
            className="mt-1"
            required
          />
        </div>

        <div>
          <Label className="text-[#2A4169]">End Date & Time</Label>
          <Input
            type="datetime-local"
            value={formData.end_datetime}
            onChange={(e) => setFormData({ ...formData, end_datetime: e.target.value })}
            className="mt-1"
            required
          />
        </div>
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
            required
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

      <div>
        <Label className="text-[#2A4169]">Price ($)</Label>
        <Input
          type="number"
          step="0.01"
          min="0"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
          className="mt-1"
          required
        />
      </div>

      <div>
        <Label className="text-[#2A4169]">What You Will Learn</Label>
        <div className="space-y-2 mt-1">
          {formData.what_you_will_learn.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input value={item} readOnly className="flex-1" />
              <Button type="button" variant="ghost" size="icon" onClick={() => removeLearningItem(index)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Input
              value={newLearningItem}
              onChange={(e) => setNewLearningItem(e.target.value)}
              placeholder="Add learning item"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLearningItem())}
            />
            <Button type="button" onClick={addLearningItem}>Add</Button>
          </div>
        </div>
      </div>

      <div>
        <Label className="text-[#2A4169]">Tuition Includes</Label>
        <div className="space-y-2 mt-1">
          {formData.tuition_includes.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input value={item} readOnly className="flex-1" />
              <Button type="button" variant="ghost" size="icon" onClick={() => removeIncludesItem(index)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Input
              value={newIncludesItem}
              onChange={(e) => setNewIncludesItem(e.target.value)}
              placeholder="Add included item"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIncludesItem())}
            />
            <Button type="button" onClick={addIncludesItem}>Add</Button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Switch
          checked={formData.active}
          onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
        />
        <Label className="text-[#2A4169]">Active & visible on website</Label>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="submit"
          className="bg-[#EE3E86] hover:bg-[#D62D73]"
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending ? 'Saving...' : 'Save Camp'}
        </Button>
      </div>
    </form>
  );
}