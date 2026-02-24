import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Award,
  Plus,
  Search,
  Edit,
  Trash2,
  Upload
} from 'lucide-react';

const technologies = [
  { value: 'scratch', label: 'Scratch', icon: '🐱' },
  { value: 'voxel', label: 'Voxel', icon: '🎮' },
  { value: 'minecraft', label: 'Minecraft', icon: '⛏️' },
  { value: 'roblox', label: 'Roblox', icon: '🎯' },
  { value: 'python', label: 'Python', icon: '🐍' },
  { value: 'web', label: 'Web Dev', icon: '🌐' },
  { value: 'unity', label: 'Unity', icon: '🎲' },
  { value: 'general', label: 'General', icon: '⭐' },
];

const colorOptions = [
  { value: '#6366f1', label: 'Indigo' },
  { value: '#8b5cf6', label: 'Violet' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#f59e0b', label: 'Amber' },
  { value: '#10b981', label: 'Emerald' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#ef4444', label: 'Red' },
  { value: '#3b82f6', label: 'Blue' },
];

export default function BadgeManager() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingBadge, setEditingBadge] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    color: '#6366f1',
    technology: 'general',
    level: 1,
    isActive: true
  });

  // Fetch badges
  const { data: badges = [], isLoading } = useQuery({
    queryKey: ['badges'],
    queryFn: () => api.entities.Badge.list('technology,level'),
  });

  // Fetch courses for linking
  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => api.entities.Course.list(),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data) => api.entities.Badge.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badges'] });
      resetForm();
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.entities.Badge.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badges'] });
      resetForm();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => api.entities.Badge.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badges'] });
      setDeleteConfirm(null);
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingBadge(null);
    setFormData({
      name: '',
      description: '',
      icon: '',
      color: '#6366f1',
      technology: 'general',
      level: 1,
      isActive: true
    });
  };

  const handleEdit = (badge) => {
    setEditingBadge(badge);
    setFormData({
      name: badge.name || '',
      description: badge.description || '',
      icon: badge.icon || '',
      color: badge.color || '#6366f1',
      technology: badge.technology || 'general',
      level: badge.level || 1,
      isActive: badge.isActive !== false
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (editingBadge) {
      updateMutation.mutate({ id: editingBadge.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

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

  // Filter badges
  const filteredBadges = badges.filter(badge => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return badge.name.toLowerCase().includes(query) ||
           badge.description?.toLowerCase().includes(query) ||
           badge.technology?.toLowerCase().includes(query);
  });

  // Group badges by technology
  const badgesByTechnology = technologies.reduce((acc, tech) => {
    acc[tech.value] = filteredBadges.filter(b => b.technology === tech.value);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Badge Manager</h1>
          <p className="text-slate-500 mt-1">Create and manage course completion badges</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Badge
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search badges..."
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Badges Grid by Technology */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="w-16 h-16 rounded-full bg-slate-200 mx-auto mb-3" />
                <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {technologies.map(tech => {
            const techBadges = badgesByTechnology[tech.value];
            if (techBadges.length === 0) return null;
            
            return (
              <div key={tech.value}>
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="text-xl">{tech.icon}</span>
                  {tech.label} Badges
                  <Badge variant="secondary">{techBadges.length}</Badge>
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {techBadges.map(badge => (
                    <Card 
                      key={badge.id}
                      className="group hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => handleEdit(badge)}
                    >
                      <CardContent className="p-4 text-center relative">
                        {/* Badge visual */}
                        <div 
                          className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg"
                          style={{ backgroundColor: badge.color || '#6366f1' }}
                        >
                          {badge.icon ? (
                            <img src={badge.icon} alt="" className="w-10 h-10 object-contain" />
                          ) : (
                            <Award className="w-8 h-8 text-white" />
                          )}
                        </div>
                        
                        <h3 className="font-medium text-slate-900 text-sm line-clamp-1">
                          {badge.name}
                        </h3>
                        
                        <div className="flex items-center justify-center gap-1 mt-2">
                          <Badge variant="outline" className="text-xs">
                            Level {badge.level || 1}
                          </Badge>
                        </div>
                        
                        {/* Actions on hover */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 bg-white shadow-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(badge);
                            }}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 bg-white shadow-sm text-red-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirm(badge.id);
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
          
          {filteredBadges.length === 0 && (
            <Card>
              <CardContent className="py-16 text-center">
                <Award className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-medium text-slate-900">No badges found</h3>
                <p className="text-slate-500 mt-1">
                  {searchQuery ? 'Try a different search term' : 'Create your first badge to get started'}
                </p>
                {!searchQuery && (
                  <Button 
                    className="mt-4 bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => setShowForm(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Badge
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Badge Form Modal */}
      <Dialog open={showForm} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              {editingBadge ? 'Edit Badge' : 'Create Badge'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Preview */}
            <div className="flex justify-center py-4">
              <div 
                className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg"
                style={{ backgroundColor: formData.color }}
              >
                {formData.icon ? (
                  <img src={formData.icon} alt="" className="w-14 h-14 object-contain" />
                ) : (
                  <Award className="w-12 h-12 text-white" />
                )}
              </div>
            </div>
            
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Badge Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Scratch Explorer"
              />
            </div>
            
            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Awarded for completing..."
              />
            </div>
            
            {/* Technology & Level */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Technology</Label>
                <Select 
                  value={formData.technology} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, technology: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {technologies.map(tech => (
                      <SelectItem key={tech.value} value={tech.value}>
                        {tech.icon} {tech.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Level</Label>
                <Input
                  type="number"
                  min={1}
                  value={formData.level}
                  onChange={(e) => setFormData(prev => ({ ...prev, level: parseInt(e.target.value) || 1 }))}
                />
              </div>
            </div>
            
            {/* Color */}
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                {colorOptions.map(color => (
                  <button
                    key={color.value}
                    onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                    className={`
                      w-8 h-8 rounded-full transition-transform hover:scale-110
                      ${formData.color === color.value ? 'ring-2 ring-offset-2 ring-slate-400' : ''}
                    `}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
            
            {/* Icon Upload */}
            <div className="space-y-2">
              <Label>Custom Icon</Label>
              <div className="flex items-center gap-3">
                {formData.icon && (
                  <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                    <img src={formData.icon} alt="" className="w-8 h-8 object-contain" />
                  </div>
                )}
                <label>
                  <Input
                    type="file"
                    accept=".png,.svg"
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
                {formData.icon && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, icon: '' }))}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!formData.name || createMutation.isPending || updateMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {createMutation.isPending || updateMutation.isPending 
                ? 'Saving...' 
                : editingBadge ? 'Save Changes' : 'Create Badge'
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Badge?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this badge. Students who have earned this badge
              will still see it in their history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(deleteConfirm)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Badge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}