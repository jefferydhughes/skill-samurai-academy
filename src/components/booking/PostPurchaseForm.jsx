import React, { useState } from 'react';
import { api } from '@/api/apiClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { X, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';

export default function PostPurchaseForm({ isOpen, onClose, childId, bookingId }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    dob: '',
    school_name: '',
    medical_allergies: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    medical_release_accepted: false,
    media_release_accepted: false,
  });

  const updateChildMutation = useMutation({
    mutationFn: (data) => api.entities.Student.update(childId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['children']);
      onClose();
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateChildMutation.mutate(formData);
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4"
      onClick={handleSkip}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-gradient-to-br from-white/95 to-indigo-50/50 backdrop-blur-xl rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/50 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Just a few more details
            </h2>
            <p className="text-sm text-slate-600">
              Help us provide the best care for your child
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSkip}
            className="rounded-xl"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth *</Label>
            <Input
              id="dob"
              type="date"
              required
              value={formData.dob}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              className="h-12 bg-white/80 border-white/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="school_name">School Name</Label>
            <Input
              id="school_name"
              value={formData.school_name}
              onChange={(e) => setFormData({ ...formData, school_name: e.target.value })}
              placeholder="Current school"
              className="h-12 bg-white/80 border-white/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="medical_allergies">Medical Conditions or Allergies</Label>
            <Textarea
              id="medical_allergies"
              value={formData.medical_allergies}
              onChange={(e) => setFormData({ ...formData, medical_allergies: e.target.value })}
              placeholder="Please list any medical conditions, allergies, or special needs we should be aware of"
              rows={3}
              className="bg-white/80 border-white/50"
            />
          </div>

          <Card className="p-4 bg-amber-50/50 border border-amber-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-slate-700">
                <p className="font-semibold mb-1">Emergency Contact Information</p>
                <p className="text-slate-600">Required for all participants</p>
              </div>
            </div>
          </Card>

          <div className="space-y-2">
            <Label htmlFor="emergency_contact_name">Emergency Contact Name *</Label>
            <Input
              id="emergency_contact_name"
              required
              value={formData.emergency_contact_name}
              onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
              placeholder="Full name"
              className="h-12 bg-white/80 border-white/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergency_contact_phone">Emergency Contact Phone *</Label>
            <Input
              id="emergency_contact_phone"
              type="tel"
              required
              value={formData.emergency_contact_phone}
              onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
              placeholder="(555) 123-4567"
              className="h-12 bg-white/80 border-white/50"
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-start gap-3">
              <Checkbox
                id="medical_release"
                checked={formData.medical_release_accepted}
                onCheckedChange={(checked) => setFormData({ ...formData, medical_release_accepted: checked })}
              />
              <Label htmlFor="medical_release" className="text-sm leading-relaxed cursor-pointer">
                <span className="font-semibold">Medical Release:</span> I authorize Skill Samurai to obtain medical treatment for my child in case of emergency.
              </Label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="media_release"
                checked={formData.media_release_accepted}
                onCheckedChange={(checked) => setFormData({ ...formData, media_release_accepted: checked })}
              />
              <Label htmlFor="media_release" className="text-sm leading-relaxed cursor-pointer">
                <span className="font-semibold">Media Release:</span> I grant permission for photos/videos of my child to be used for promotional purposes.
              </Label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={updateChildMutation.isPending || !formData.medical_release_accepted}
              className="flex-1 h-12 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
            >
              {updateChildMutation.isPending ? (
                'Saving...'
              ) : (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Complete Setup
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleSkip}
              className="px-6"
            >
              Skip for now
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}