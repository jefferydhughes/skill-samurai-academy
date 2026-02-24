import React, { useState } from 'react';
import { api } from '@/api/apiClient';
import { useMutation, useQuery } from '@tanstack/react-query';
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

export default function TrialBookingForm({ onSuccess, isPublic = false }) {
  const [formData, setFormData] = useState({
    parent_name: '',
    parent_email: '',
    parent_phone: '',
    student_name: '',
    student_age: '',
    student_interests: [],
    trial_datetime: '',
    trial_type: 'in_person',
    source: '',
    notes: ''
  });

  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: () => api.entities.Location.list(),
  });

  const bookTrialMutation = useMutation({
    mutationFn: async (data) => {
      const booking = await api.entities.TrialBooking.create({
        ...data,
        pipeline_stage: 'booked',
        confirmation_sent: false
      });

      // Send confirmation email
      await api.integrations.Core.SendEmail({
        to: data.parent_email,
        subject: 'Trial Class Confirmed!',
        body: `Hi ${data.parent_name},

Thank you for booking a trial class for ${data.student_name}!

📅 Date & Time: ${new Date(data.trial_datetime).toLocaleString()}
📍 Type: ${data.trial_type === 'in_person' ? 'In-Person' : 'Online'}

We're excited to introduce ${data.student_name} to the world of coding!

What to expect:
• Meet our expert instructor
• Explore fun coding projects
• Discover your child's learning path
• Ask any questions you have

See you soon!
- The Skill Samurai Team`
      });

      // Update confirmation sent
      await api.entities.TrialBooking.update(booking.id, {
        confirmation_sent: true,
        pipeline_stage: 'confirmed',
        last_contacted: new Date().toISOString()
      });

      return booking;
    },
    onSuccess: () => {
      onSuccess?.();
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    bookTrialMutation.mutate(formData);
  };

  const interests = [
    'Game Development',
    'Roblox',
    'Minecraft',
    'Python',
    'JavaScript',
    'Web Design',
    'App Development',
    '3D Modeling'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Parent Information</h3>
        
        <div>
          <Label>Full Name *</Label>
          <Input
            value={formData.parent_name}
            onChange={(e) => setFormData({...formData, parent_name: e.target.value})}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Email *</Label>
            <Input
              type="email"
              value={formData.parent_email}
              onChange={(e) => setFormData({...formData, parent_email: e.target.value})}
              required
            />
          </div>
          <div>
            <Label>Phone</Label>
            <Input
              value={formData.parent_phone}
              onChange={(e) => setFormData({...formData, parent_phone: e.target.value})}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Student Information</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Student Name *</Label>
            <Input
              value={formData.student_name}
              onChange={(e) => setFormData({...formData, student_name: e.target.value})}
              required
            />
          </div>
          <div>
            <Label>Age *</Label>
            <Input
              type="number"
              value={formData.student_age}
              onChange={(e) => setFormData({...formData, student_age: parseInt(e.target.value)})}
              required
            />
          </div>
        </div>

        <div>
          <Label>Interests (select up to 3)</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {interests.map(interest => (
              <label key={interest} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.student_interests.includes(interest)}
                  onChange={(e) => {
                    if (e.target.checked && formData.student_interests.length < 3) {
                      setFormData({
                        ...formData,
                        student_interests: [...formData.student_interests, interest]
                      });
                    } else if (!e.target.checked) {
                      setFormData({
                        ...formData,
                        student_interests: formData.student_interests.filter(i => i !== interest)
                      });
                    }
                  }}
                  className="rounded"
                />
                <span className="text-sm">{interest}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Trial Details</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Date & Time *</Label>
            <Input
              type="datetime-local"
              value={formData.trial_datetime}
              onChange={(e) => setFormData({...formData, trial_datetime: e.target.value})}
              required
            />
          </div>
          <div>
            <Label>Format *</Label>
            <Select
              value={formData.trial_type}
              onValueChange={(value) => setFormData({...formData, trial_type: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_person">In-Person</SelectItem>
                <SelectItem value="online">Online</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {!isPublic && (
          <>
            <div>
              <Label>How did you hear about us?</Label>
              <Input
                value={formData.source}
                onChange={(e) => setFormData({...formData, source: e.target.value})}
                placeholder="Google, Facebook, Friend, etc."
              />
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={3}
                placeholder="Any special requests or information..."
              />
            </div>
          </>
        )}
      </div>

      <Button
        type="submit"
        disabled={bookTrialMutation.isPending}
        className="w-full bg-[#EE3E86] hover:bg-[#d63577]"
      >
        {bookTrialMutation.isPending ? 'Booking...' : 'Book Free Trial'}
      </Button>
    </form>
  );
}