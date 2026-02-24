import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { GraduationCap, Upload, Link as LinkIcon } from 'lucide-react';
import { api } from '@/api/apiClient';

const difficulties = ['beginner', 'intro', 'intermediate', 'advanced'];

export default function LevelFormModal({
  open,
  onOpenChange,
  level,
  onSave,
  isLoading
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    order: 1,
    ageRange: { min: 8, max: 12 },
    difficultyRange: { min: 'beginner', max: 'intermediate' },
    icon: '',
    externalUrl: '',
    isDefault: false,
    isActive: true
  });

  useEffect(() => {
    if (level) {
      setFormData({
        name: level.name || '',
        description: level.description || '',
        order: level.order || 1,
        ageRange: level.ageRange || { min: 8, max: 12 },
        difficultyRange: level.difficultyRange || { min: 'beginner', max: 'intermediate' },
        icon: level.icon || '',
        externalUrl: level.externalUrl || '',
        isDefault: level.isDefault || false,
        isActive: level.isActive !== false
      });
    } else {
      setFormData({
        name: '',
        description: '',
        order: 1,
        ageRange: { min: 8, max: 12 },
        difficultyRange: { min: 'beginner', max: 'intermediate' },
        icon: '',
        externalUrl: '',
        isDefault: false,
        isActive: true
      });
    }
  }, [level, open]);

  const handleIconUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const { file_url } = await api.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, icon: file_url }));
    } catch (error) {
      console.error('Failed to upload icon:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            {level ? 'Edit Level' : 'Create New Level'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Level Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Level Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Level 1 - Foundations"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Optional description of this level..."
              rows={3}
            />
          </div>

          {/* Age Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Min Age</Label>
              <Input
                type="number"
                min={4}
                max={18}
                value={formData.ageRange.min}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  ageRange: { ...prev.ageRange, min: parseInt(e.target.value) || 8 }
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Max Age</Label>
              <Input
                type="number"
                min={4}
                max={18}
                value={formData.ageRange.max}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  ageRange: { ...prev.ageRange, max: parseInt(e.target.value) || 12 }
                }))}
              />
            </div>
          </div>

          {/* Difficulty Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Min Difficulty</Label>
              <Select
                value={formData.difficultyRange.min}
                onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  difficultyRange: { ...prev.difficultyRange, min: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map(d => (
                    <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Max Difficulty</Label>
              <Select
                value={formData.difficultyRange.max}
                onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  difficultyRange: { ...prev.difficultyRange, max: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map(d => (
                    <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Icon */}
          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="flex items-center gap-3">
              {formData.icon ? (
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden">
                  <img src={formData.icon} alt="" className="w-8 h-8 object-contain" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-slate-400" />
                </div>
              )}
              <label className="flex-1">
                <Input
                  type="file"
                  accept=".png,.svg,.jpg,.jpeg"
                  onChange={handleIconUpload}
                  className="hidden"
                />
                <Button type="button" variant="outline" size="sm" asChild>
                  <span className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Icon
                  </span>
                </Button>
              </label>
            </div>
          </div>

          {/* External URL */}
          <div className="space-y-2">
            <Label htmlFor="externalUrl">External Resource URL</Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="externalUrl"
                value={formData.externalUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, externalUrl: e.target.value }))}
                placeholder="https://..."
                className="pl-9"
              />
            </div>
          </div>

          {/* Display Order */}
          <div className="space-y-2">
            <Label htmlFor="order">Display Order</Label>
            <Input
              id="order"
              type="number"
              min={1}
              value={formData.order}
              onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
            />
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!formData.name || isLoading}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isLoading ? 'Saving...' : level ? 'Save Changes' : 'Create Level'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}