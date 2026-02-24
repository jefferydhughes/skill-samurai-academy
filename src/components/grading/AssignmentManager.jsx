import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';


import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Plus,
  Edit,
  Trash2,
  Calendar as CalendarIcon,
  FileText,
  Code,
  HelpCircle,
  Users,
  Copy,
} from 'lucide-react';
import { format } from 'date-fns';

export default function AssignmentManager() {
  const [selectedClass, setSelectedClass] = useState(null);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [dueDate, setDueDate] = useState(null);
  const queryClient = useQueryClient();

  // Get teacher's classes
  const { data: classes = [] } = useQuery({
    queryKey: ['teacher-classes'],
    queryFn: async () => {
      return [
        { id: '1', name: 'Scratch Programming - Beginners', students: 12 },
        { id: '2', name: 'Python for Kids - Intermediate', students: 8 },
        { id: '3', name: 'Web Development Basics', students: 15 },
      ];
    },
  });

  // Get assignments for selected class
  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ['class-assignments', selectedClass?.id],
    queryFn: async () => {
      if (!selectedClass) return [];
      
      // Mock data
      return [
        {
          id: 'a1',
          title: 'Platformer Game Project',
          description: 'Create a complete platformer game with player movement, enemies, and collectibles.',
          type: 'project',
          dueDate: new Date('2024-01-25'),
          weight: 30,
          status: 'published',
          submissions: 8,
          maxScore: 100,
          instructions: 'Design and implement a 2D platformer game using Scratch. Include at least 3 levels, player character, enemy AI, and collectible items.',
          rubric: {
            'Game Mechanics': 25,
            'Level Design': 25,
            'Code Quality': 25,
            'Creativity': 25,
          },
        },
        {
          id: 'a2',
          title: 'Quiz - Loops & Variables',
          description: 'Test your understanding of loops and variables in programming.',
          type: 'quiz',
          dueDate: new Date('2024-01-20'),
          weight: 20,
          status: 'published',
          submissions: 10,
          maxScore: 50,
          instructions: 'Complete the quiz covering loops, variables, and basic programming concepts.',
          questions: [
            { type: 'multiple_choice', question: 'What is a variable?', options: ['Storage location', 'Loop', 'Function'] },
            { type: 'code', question: 'Write a for loop that counts to 10' },
          ],
        },
        {
          id: 'a3',
          title: 'Animation Project',
          description: 'Create an animated story with at least 3 scenes.',
          type: 'project',
          dueDate: new Date('2024-01-30'),
          weight: 25,
          status: 'draft',
          submissions: 0,
          maxScore: 100,
          instructions: 'Use animation tools to create a short story with clear beginning, middle, and end.',
        },
      ];
    },
    enabled: !!selectedClass,
  });

  const saveAssignmentMutation = useMutation({
    mutationFn: (assignmentData) => {
      console.log('Saving assignment:', assignmentData);
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-assignments'] });
      setShowAssignmentForm(false);
      setEditingAssignment(null);
      setDueDate(null);
    },
  });

  const deleteAssignmentMutation = useMutation({
    mutationFn: (assignmentId) => {
      console.log('Deleting assignment:', assignmentId);
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-assignments'] });
    },
  });

  const duplicateAssignment = (assignment) => {
    setEditingAssignment({
      ...assignment,
      title: `${assignment.title} (Copy)`,
      status: 'draft',
      id: null,
    });
    setShowAssignmentForm(true);
  };

  const handleEditAssignment = (assignment) => {
    setEditingAssignment(assignment);
    setDueDate(new Date(assignment.dueDate));
    setShowAssignmentForm(true);
  };

  const getAssignmentIcon = (type) => {
    switch (type) {
      case 'project':
        return <Code className="w-4 h-4" />;
      case 'quiz':
        return <HelpCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getAssignmentStats = () => {
    const published = assignments.filter(a => a.status === 'published').length;
    const draft = assignments.filter(a => a.status === 'draft').length;
    const totalSubmissions = assignments.reduce((sum, a) => sum + a.submissions, 0);
    const averageWeight = assignments.length > 0 
      ? assignments.reduce((sum, a) => sum + a.weight, 0) / assignments.length 
      : 0;

    return { published, draft, totalSubmissions, averageWeight };
  };

  const stats = getAssignmentStats();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Assignment Manager</h1>
          <p className="text-gray-600">Create and manage class assignments</p>
        </div>
        <Button onClick={() => setEditingAssignment(null)} disabled={!selectedClass}>
          <Plus className="w-4 h-4 mr-2" />
          Create Assignment
        </Button>
      </div>

      {/* Class Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {classes.map((classItem) => (
          <Card 
            key={classItem.id} 
            className={`cursor-pointer transition-all ${
              selectedClass?.id === classItem.id 
                ? 'ring-2 ring-indigo-600 bg-indigo-50' 
                : 'hover:shadow-lg'
            }`}
            onClick={() => setSelectedClass(classItem)}
          >
            <CardHeader>
              <CardTitle className="text-lg">{classItem.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>{classItem.students} students</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Assignment Management */}
      {selectedClass && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{stats.published}</div>
                <div className="text-sm text-gray-600">Published</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{stats.draft}</div>
                <div className="text-sm text-gray-600">Drafts</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
                <div className="text-sm text-gray-600">Total Submissions</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{stats.averageWeight.toFixed(0)}%</div>
                <div className="text-sm text-gray-600">Average Weight</div>
              </CardContent>
            </Card>
          </div>

          {/* Assignments List */}
          <Card>
            <CardHeader>
              <CardTitle>Assignments - {selectedClass.name}</CardTitle>
            </CardHeader>
            <CardContent>
              {assignmentsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignments.map((assignment) => (
                    <div key={assignment.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getAssignmentIcon(assignment.type)}
                            <h3 className="font-semibold text-lg">{assignment.title}</h3>
                            <Badge variant={
                              assignment.status === 'published' ? 'default' : 'secondary'
                            }>
                              {assignment.status}
                            </Badge>
                            <Badge variant="outline">{assignment.weight}% weight</Badge>
                          </div>
                          
                          <p className="text-gray-600 mb-3">{assignment.description}</p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="w-4 h-4" />
                              Due: {format(assignment.dueDate, 'MMM dd, yyyy')}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {assignment.submissions} submissions
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              {assignment.maxScore} points
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditAssignment(assignment)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => duplicateAssignment(assignment)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteAssignmentMutation.mutate(assignment.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {assignments.length === 0 && (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No assignments created yet</p>
                      <Button 
                        onClick={() => setEditingAssignment(null)} 
                        className="mt-4"
                      >
                        Create First Assignment
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Assignment Form Modal */}
      {(showAssignmentForm || editingAssignment) && (
        <AssignmentForm
          assignment={editingAssignment}
          classData={selectedClass}
          dueDate={dueDate}
          setDueDate={setDueDate}
          onSave={(assignmentData) => saveAssignmentMutation.mutate(assignmentData)}
          onClose={() => {
            setShowAssignmentForm(false);
            setEditingAssignment(null);
            setDueDate(null);
          }}
          isSaving={saveAssignmentMutation.isPending}
        />
      )}
    </div>
  );
}

function AssignmentForm({ 
  assignment, 
  classData, 
  dueDate, 
  setDueDate, 
  onSave, 
  onClose, 
  isSaving 
}) {
  const [form, setForm] = useState({
    title: assignment?.title || '',
    description: assignment?.description || '',
    type: assignment?.type || 'project',
    weight: assignment?.weight || 20,
    maxScore: assignment?.maxScore || 100,
    status: assignment?.status || 'draft',
    instructions: assignment?.instructions || '',
    classId: classData?.id || '',
  });

  const [activeTab, setActiveTab] = useState('details');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      dueDate: dueDate,
      className: classData?.name,
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {assignment?.id ? 'Edit Assignment' : 'Create Assignment'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="rubric">Rubric</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Assignment Title *</label>
                  <Input
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Platformer Game Project"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Type *</label>
                  <Select value={form.type} onValueChange={(value) => setForm({ ...form, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="project">Project</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="essay">Essay</SelectItem>
                      <SelectItem value="presentation">Presentation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Weight (%) *</label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={form.weight}
                    onChange={(e) => setForm({ ...form, weight: parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Max Score *</label>
                  <Input
                    type="number"
                    min="1"
                    required
                    value={form.maxScore}
                    onChange={(e) => setForm({ ...form, maxScore: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the assignment and what students need to accomplish."
                  rows={3}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Due Date *</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dueDate ? format(dueDate, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={setDueDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Instructions</label>
                <Textarea
                  value={form.instructions}
                  onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                  placeholder="Provide detailed instructions for completing this assignment."
                  rows={8}
                />
              </div>

              {form.type === 'project' && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2">Project Requirements</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Clear deliverables and objectives</li>
                    <li>Technical requirements and constraints</li>
                    <li>Submission format and guidelines</li>
                    <li>Evaluation criteria</li>
                  </ul>
                </div>
              )}

              {form.type === 'quiz' && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium mb-2">Quiz Settings</h4>
                  <p className="text-sm text-gray-600">
                    Quiz questions and multiple choice options will be added after creating the assignment.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="rubric" className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Grading Rubric</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Define criteria and point values for grading this assignment.
                </p>
                
                <div className="space-y-3">
                  {form.type === 'project' ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <Input placeholder="Criteria (e.g., Code Quality)" />
                        <Input type="number" placeholder="Points" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Input placeholder="Criteria (e.g., Design)" />
                        <Input type="number" placeholder="Points" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Input placeholder="Criteria (e.g., Functionality)" />
                        <Input type="number" placeholder="Points" />
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-600">
                      Rubric will be customized based on assignment type.
                    </p>
                  )}
                </div>
                
                <Button type="button" variant="outline" className="mt-3">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Criteria
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSaving || !dueDate} 
              className="flex-1"
            >
              {isSaving ? 'Saving...' : assignment?.id ? 'Update Assignment' : 'Create Assignment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}