import React, { useState } from 'react';
import { api } from '@/api/apiClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function FamilyForm({ family, onSuccess }) {
  const [formData, setFormData] = useState({
    primary_contact_name: family?.primary_contact_name || '',
    primary_contact_email: family?.primary_contact_email || '',
    primary_contact_phone: family?.primary_contact_phone || '',
    secondary_contact_name: family?.secondary_contact_name || '',
    secondary_contact_email: family?.secondary_contact_email || '',
    secondary_contact_phone: family?.secondary_contact_phone || '',
    address: family?.address || '',
    emergency_contact_name: family?.emergency_contact_name || '',
    emergency_contact_phone: family?.emergency_contact_phone || '',
    checkin_code: family?.checkin_code || Math.floor(1000 + Math.random() * 9000).toString(),
    status: family?.status || 'active',
  });

  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (family?.id) {
        return api.entities.Family.update(family.id, data);
      } else {
        return api.entities.Family.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['families'] });
      onSuccess?.();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Primary Contact</h3>
        
        <div>
          <Label>Name *</Label>
          <Input
            value={formData.primary_contact_name}
            onChange={(e) => setFormData({...formData, primary_contact_name: e.target.value})}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Email *</Label>
            <Input
              type="email"
              value={formData.primary_contact_email}
              onChange={(e) => setFormData({...formData, primary_contact_email: e.target.value})}
              required
            />
          </div>
          <div>
            <Label>Phone</Label>
            <Input
              value={formData.primary_contact_phone}
              onChange={(e) => setFormData({...formData, primary_contact_phone: e.target.value})}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Secondary Contact (Optional)</h3>
        
        <div>
          <Label>Name</Label>
          <Input
            value={formData.secondary_contact_name}
            onChange={(e) => setFormData({...formData, secondary_contact_name: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.secondary_contact_email}
              onChange={(e) => setFormData({...formData, secondary_contact_email: e.target.value})}
            />
          </div>
          <div>
            <Label>Phone</Label>
            <Input
              value={formData.secondary_contact_phone}
              onChange={(e) => setFormData({...formData, secondary_contact_phone: e.target.value})}
            />
          </div>
        </div>
      </div>

      <div>
        <Label>Address</Label>
        <Textarea
          value={formData.address}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
          rows={3}
        />
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Emergency Contact</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Name</Label>
            <Input
              value={formData.emergency_contact_name}
              onChange={(e) => setFormData({...formData, emergency_contact_name: e.target.value})}
            />
          </div>
          <div>
            <Label>Phone</Label>
            <Input
              value={formData.emergency_contact_phone}
              onChange={(e) => setFormData({...formData, emergency_contact_phone: e.target.value})}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Check-in Code</Label>
          <Input
            value={formData.checkin_code}
            onChange={(e) => setFormData({...formData, checkin_code: e.target.value})}
            maxLength={4}
          />
        </div>
        <div>
          <Label>Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({...formData, status: value})}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="submit"
          disabled={saveMutation.isPending}
          className="bg-[#EE3E86] hover:bg-[#d63577]"
        >
          {saveMutation.isPending ? 'Saving...' : 'Save Family'}
        </Button>
      </div>
    </form>
  );
}