import React, { useState } from 'react';
import { api } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  Users,
  DollarSign,
  Calendar,
  Check,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
import CollectionDetail from '@/components/layouts/CollectionDetail';
import InspectorPanel from '@/components/layouts/InspectorPanel';

const typeColors = {
  camp: 'bg-amber-100 text-amber-700',
  course: 'bg-blue-100 text-blue-700',
  club: 'bg-green-100 text-green-700',
  workshop: 'bg-purple-100 text-purple-700'
};

const defaultForm = {
  name: '',
  type: 'course',
  description: '',
  ageRange: { min: 8, max: 12 },
  capacity: 20,
  price: 0,
  deliveryMode: 'in_person',
  active: true,
};

export default function ProgramsManager() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgramId, setSelectedProgramId] = useState(null);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [programToDelete, setProgramToDelete] = useState(null);
  const [formData, setFormData] = useState(defaultForm);

  const queryClient = useQueryClient();

  const { data: programs = [], isLoading } = useQuery({
    queryKey: ['programs'],
    queryFn: () => api.entities.Program.list('-created_date'),
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['allSessions'],
    queryFn: () => api.entities.ClassSession.list(),
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['allEnrollments'],
    queryFn: () => api.entities.Enrollment.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.entities.Program.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['programs']);
      closeInspector();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.entities.Program.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['programs']);
      closeInspector();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.entities.Program.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['programs']);
      setDeleteDialogOpen(false);
      setProgramToDelete(null);
    }
  });

  const openCreateInspector = () => {
    navigate(createPageUrl('CreateEvent'));
  };

  const openEditInspector = (program) => {
    setEditingProgram(program);
    setFormData({
      name: program.name || '',
      type: program.type || 'course',
      description: program.description || '',
      ageRange: program.ageRange || { min: 8, max: 12 },
      capacity: program.capacity || 20,
      price: program.price || 0,
      deliveryMode: program.deliveryMode || 'in_person',
      active: program.active !== false,
    });
    setInspectorOpen(true);
  };

  const closeInspector = () => {
    setInspectorOpen(false);
    setEditingProgram(null);
    setFormData(defaultForm);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingProgram) {
      updateMutation.mutate({ id: editingProgram.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };



  const getSessionCount = (programId) => sessions.filter(s => s.programId === programId).length;
  const getEnrollmentCount = (programId) => enrollments.filter(e => e.programId === programId && e.status === 'enrolled').length;

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = !searchQuery || 
      program.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const selectedProgram = programs.find(p => p.id === selectedProgramId);

  return (
    <>
      <CollectionDetail
        items={filteredPrograms}
        selectedId={selectedProgramId}
        onSelectItem={(program) => setSelectedProgramId(program.id)}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search programs..."
        collectionEmpty="No programs found"
        renderCollectionItem={(program, isSelected) => (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium truncate">{program.name}</span>
              {!program.active && (
                <Badge variant="secondary" className="text-xs">Inactive</Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs">
              <Badge className={typeColors[program.type] || 'bg-slate-100 text-slate-600'}>
                {program.type}
              </Badge>
              <span className={isSelected ? 'text-slate-300' : 'text-slate-500'}>
                Ages {program.ageRange?.min || 8}-{program.ageRange?.max || 12}
              </span>
            </div>
          </div>
        )}
        renderDetail={() => selectedProgram && (
          <div className="p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-semibold text-slate-900">{selectedProgram.name}</h2>
                  {selectedProgram.active ? (
                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>
                <Badge className={typeColors[selectedProgram.type]}>
                  {selectedProgram.type}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openEditInspector(selectedProgram)}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setProgramToDelete(selectedProgram);
                    setDeleteDialogOpen(true);
                  }}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>

            {selectedProgram.description && (
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-2">Description</h3>
                <p className="text-slate-700">{selectedProgram.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Users className="w-4 h-4" />
                    <span className="text-xs">Age Range</span>
                  </div>
                  <div className="text-lg font-semibold text-slate-900">
                    {selectedProgram.ageRange?.min || 8}-{selectedProgram.ageRange?.max || 12}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-xs">Price</span>
                  </div>
                  <div className="text-lg font-semibold text-slate-900">
                    ${((selectedProgram.price || 0) / 100).toFixed(0)}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs">Sessions</span>
                  </div>
                  <div className="text-lg font-semibold text-slate-900">
                    {getSessionCount(selectedProgram.id)}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Users className="w-4 h-4" />
                    <span className="text-xs">Enrolled</span>
                  </div>
                  <div className="text-lg font-semibold text-slate-900">
                    {getEnrollmentCount(selectedProgram.id)}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-3">Details</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <dt className="text-slate-500">Delivery Mode</dt>
                  <dd className="font-medium capitalize">{selectedProgram.deliveryMode?.replace('_', ' ')}</dd>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <dt className="text-slate-500">Capacity</dt>
                  <dd className="font-medium">{selectedProgram.capacity || 20} students</dd>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <dt className="text-slate-500">Currency</dt>
                  <dd className="font-medium">{selectedProgram.currency || 'USD'}</dd>
                </div>
              </dl>
            </div>

            {selectedProgram.skills?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProgram.skills.map(skill => (
                    <Badge key={skill} variant="secondary" className="bg-slate-100">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        detailEmpty={
          <div className="text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500 mb-4">Select a program to view details</p>
            <Button onClick={openCreateInspector} size="sm" className="bg-slate-900">
              <Plus className="w-4 h-4 mr-2" />
              Create Program
            </Button>
          </div>
        }
      />

      {/* Inspector Panel for Create/Edit */}
      <InspectorPanel
        open={inspectorOpen}
        onClose={closeInspector}
        title={editingProgram ? 'Edit Program' : 'New Program'}
        subtitle={editingProgram ? selectedProgram?.name : 'Create a new program'}
        actions={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeInspector}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="bg-slate-900 hover:bg-slate-800"
            >
              <Check className="w-4 h-4 mr-2" />
              {editingProgram ? 'Update' : 'Create'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Program Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Summer Coding Camp"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="camp">Camp</SelectItem>
                  <SelectItem value="course">Course</SelectItem>
                  <SelectItem value="club">Club</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryMode">Delivery</Label>
              <Select 
                value={formData.deliveryMode} 
                onValueChange={(value) => setFormData({ ...formData, deliveryMode: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_person">In Person</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the program..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ageMin">Min Age</Label>
              <Input
                id="ageMin"
                type="number"
                min="4"
                max="18"
                value={formData.ageRange.min}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  ageRange: { ...formData.ageRange, min: parseInt(e.target.value) }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ageMax">Max Age</Label>
              <Input
                id="ageMax"
                type="number"
                min="4"
                max="18"
                value={formData.ageRange.max}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  ageRange: { ...formData.ageRange, max: parseInt(e.target.value) }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (cents)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
              />
            </div>
            <div className="flex items-center gap-3 pt-8">
              <Switch
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
              <Label>Active</Label>
            </div>
          </div>
        </div>
      </InspectorPanel>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Program</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{programToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(programToDelete?.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}