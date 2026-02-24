import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  Tent,
  Plus,
  Search,
  Filter,
  Grid,
  List,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Calendar,
  MapPin,
  Clock,
  X
} from 'lucide-react';
import CampTemplateCard from '@/components/curriculum/CampTemplateCard';

const technologies = [
  { value: 'scratch', label: 'Scratch', icon: '🐱' },
  { value: 'voxel', label: 'Voxel', icon: '🎮' },
  { value: 'minecraft', label: 'Minecraft', icon: '⛏️' },
  { value: 'roblox', label: 'Roblox', icon: '🎯' },
  { value: 'python', label: 'Python', icon: '🐍' },
  { value: 'web', label: 'Web Dev', icon: '🌐' },
  { value: 'unity', label: 'Unity', icon: '🎲' },
  { value: 'robotics', label: 'Robotics', icon: '🤖' },
  { value: 'mixed', label: 'Mixed', icon: '🎨' },
];

const difficulties = ['beginner', 'intro', 'intermediate', 'advanced'];
const durationTypes = [
  { value: 'half_day', label: 'Half Day' },
  { value: 'full_day', label: 'Full Day' },
  { value: 'multi_week', label: 'Multi-Week' },
];

export default function CampCatalogue() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [technologyFilter, setTechnologyFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [durationFilter, setDurationFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [createInstanceModal, setCreateInstanceModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  // Instance creation form state
  const [instanceForm, setInstanceForm] = useState({
    locationId: '',
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '16:00',
    price: 0,
    capacity: 20
  });

  // Fetch camp templates
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['campTemplates'],
    queryFn: () => api.entities.CampTemplate.list('-created_date'),
  });

  // Fetch locations for instance creation
  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: () => api.entities.Location.filter({ is_active: true }),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => api.entities.CampTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campTemplates'] });
      setDeleteConfirm(null);
    },
  });

  // Create camp instance mutation
  const createInstanceMutation = useMutation({
    mutationFn: async (data) => {
      return api.entities.CampEvent.create({
        template_id: data.templateId,
        name: data.templateName,
        location_id: data.locationId,
        start_date: data.startDate,
        end_date: data.endDate,
        start_time: data.startTime,
        end_time: data.endTime,
        price: data.price * 100, // Convert to cents
        capacity: data.capacity,
        status: 'scheduled'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campEvents'] });
      setCreateInstanceModal(null);
      setInstanceForm({
        locationId: '',
        startDate: '',
        endDate: '',
        startTime: '09:00',
        endTime: '16:00',
        price: 0,
        capacity: 20
      });
    },
  });

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!template.name.toLowerCase().includes(query) &&
            !template.description?.toLowerCase().includes(query)) {
          return false;
        }
      }
      
      if (technologyFilter !== 'all' && template.technology !== technologyFilter) {
        return false;
      }
      
      if (difficultyFilter !== 'all' && template.difficulty !== difficultyFilter) {
        return false;
      }
      
      if (durationFilter !== 'all' && template.duration?.type !== durationFilter) {
        return false;
      }
      
      return true;
    });
  }, [templates, searchQuery, technologyFilter, difficultyFilter, durationFilter]);

  // Stats
  const templateStats = useMemo(() => {
    return {
      total: templates.length,
      published: templates.filter(t => t.status === 'published').length,
      byType: {
        half_day: templates.filter(t => t.duration?.type === 'half_day').length,
        full_day: templates.filter(t => t.duration?.type === 'full_day').length,
        multi_week: templates.filter(t => t.duration?.type === 'multi_week').length,
      }
    };
  }, [templates]);

  const hasFilters = technologyFilter !== 'all' || difficultyFilter !== 'all' || durationFilter !== 'all' || searchQuery;

  const clearFilters = () => {
    setSearchQuery('');
    setTechnologyFilter('all');
    setDifficultyFilter('all');
    setDurationFilter('all');
  };

  const handleCreateInstance = (template) => {
    setCreateInstanceModal(template);
    setInstanceForm(prev => ({
      ...prev,
      price: template.basePrice ? template.basePrice / 100 : 0
    }));
  };

  const handleSubmitInstance = () => {
    createInstanceMutation.mutate({
      templateId: createInstanceModal.id,
      templateName: createInstanceModal.name,
      ...instanceForm
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Camp Catalogue</h1>
          <p className="text-slate-500 mt-1">
            {templateStats.published} published templates • {templateStats.total} total
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link to={createPageUrl('OwnerCamps')}>
              <Calendar className="w-4 h-4 mr-2" />
              View Scheduled
            </Link>
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700" asChild>
            <Link to={createPageUrl('CampTemplateEditor')}>
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Link>
          </Button>
        </div>
      </div>

      {/* Duration Type Stats */}
      <div className="grid grid-cols-3 gap-4">
        {durationTypes.map(type => (
          <Card 
            key={type.value}
            className={`cursor-pointer transition-all hover:shadow-md ${
              durationFilter === type.value ? 'ring-2 ring-indigo-500' : ''
            }`}
            onClick={() => setDurationFilter(durationFilter === type.value ? 'all' : type.value)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-500">{type.label}</div>
                  <div className="text-2xl font-bold text-slate-900">
                    {templateStats.byType[type.value] || 0}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
                  {type.value === 'half_day' && <Clock className="w-6 h-6 text-violet-600" />}
                  {type.value === 'full_day' && <Tent className="w-6 h-6 text-violet-600" />}
                  {type.value === 'multi_week' && <Calendar className="w-6 h-6 text-violet-600" />}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search camp templates..."
                className="pl-9"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              
              <Select value={technologyFilter} onValueChange={setTechnologyFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Technology" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tech</SelectItem>
                  {technologies.map(tech => (
                    <SelectItem key={tech.value} value={tech.value}>
                      {tech.icon} {tech.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {difficulties.map(d => (
                    <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            <div className="flex items-center border-l pl-3 ml-auto">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Template Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-video bg-slate-200" />
              <CardContent className="p-4">
                <div className="h-5 bg-slate-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-slate-100 rounded w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Tent className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-900">No camp templates found</h3>
            <p className="text-slate-500 mt-1">
              {hasFilters 
                ? 'Try adjusting your filters'
                : 'Create your first camp template to get started'}
            </p>
            {!hasFilters && (
              <Button className="mt-4 bg-indigo-600 hover:bg-indigo-700" asChild>
                <Link to={createPageUrl('CampTemplateEditor')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Template
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTemplates.map(template => (
            <div key={template.id} className="relative group">
              <CampTemplateCard
                template={template}
                onCreateInstance={handleCreateInstance}
              />
              
              {/* Actions */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="h-8 w-8 shadow-sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to={`${createPageUrl('CampTemplateEditor')}?id=${template.id}`}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Template
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => setDeleteConfirm(template.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Camp Instance Modal */}
      <Dialog open={!!createInstanceModal} onOpenChange={() => setCreateInstanceModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tent className="w-5 h-5" />
              Create Camp Instance
            </DialogTitle>
          </DialogHeader>
          
          {createInstanceModal && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-slate-50 border">
                <div className="font-medium text-slate-900">{createInstanceModal.name}</div>
                <div className="text-sm text-slate-500 mt-1">
                  {createInstanceModal.duration?.days} days • {createInstanceModal.duration?.type?.replace('_', ' ')}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Location *</Label>
                <Select 
                  value={instanceForm.locationId} 
                  onValueChange={(v) => setInstanceForm(p => ({ ...p, locationId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map(loc => (
                      <SelectItem key={loc.id} value={loc.id}>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {loc.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Input
                    type="date"
                    value={instanceForm.startDate}
                    onChange={(e) => setInstanceForm(p => ({ ...p, startDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date *</Label>
                  <Input
                    type="date"
                    value={instanceForm.endDate}
                    onChange={(e) => setInstanceForm(p => ({ ...p, endDate: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={instanceForm.startTime}
                    onChange={(e) => setInstanceForm(p => ({ ...p, startTime: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={instanceForm.endTime}
                    onChange={(e) => setInstanceForm(p => ({ ...p, endTime: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price ($)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={instanceForm.price}
                    onChange={(e) => setInstanceForm(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Capacity</Label>
                  <Input
                    type="number"
                    min={1}
                    value={instanceForm.capacity}
                    onChange={(e) => setInstanceForm(p => ({ ...p, capacity: parseInt(e.target.value) || 1 }))}
                  />
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateInstanceModal(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitInstance}
              disabled={!instanceForm.locationId || !instanceForm.startDate || !instanceForm.endDate || createInstanceMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {createInstanceMutation.isPending ? 'Creating...' : 'Create Camp'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Camp Template?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this camp template. Any scheduled camp instances
              will not be affected but will no longer be linked to this template.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(deleteConfirm)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Template
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}