import React, { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus,
  Edit2,
  Trash2,
  User,
  GraduationCap,
  BookOpen,
  Trophy,
  Target,
  Eye,
  Ear,
  Hand,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { motion } from 'framer-motion';

const avatarColors = [
  'from-rose-400 to-pink-500',
  'from-violet-400 to-purple-500',
  'from-blue-400 to-indigo-500',
  'from-cyan-400 to-teal-500',
  'from-emerald-400 to-green-500',
  'from-amber-400 to-orange-500',
];

export default function MyChildren() {
  const [user, setUser] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [formData, setFormData] = useState({
    displayName: '',
    age: '',
    gradeRange: 'K-2',
    learningGoals: [],
    learningStyle: 'mixed',
    strengths: [],
    growthAreas: [],
    learningPreferences: {},
  });
  const [newGoal, setNewGoal] = useState('');
  const [newStrength, setNewStrength] = useState('');
  const [newGrowthArea, setNewGrowthArea] = useState('');

  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await api.auth.me();
      setUser(userData);
    } catch (e) {
      api.auth.redirectToLogin();
    }
  };

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['students', user?.id],
    queryFn: () => api.entities.StudentProfile.filter({ userId: user?.id }),
    enabled: !!user?.id,
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['allProgress'],
    queryFn: () => api.entities.LessonProgress.list(),
    enabled: students.length > 0,
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['allEnrollments'],
    queryFn: () => api.entities.Enrollment.list(),
    enabled: students.length > 0,
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.entities.StudentProfile.create({
      ...data,
      userId: user.id,
      age: parseInt(data.age),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['students']);
      closeDialog();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.entities.StudentProfile.update(id, {
      ...data,
      age: parseInt(data.age),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['students']);
      closeDialog();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.entities.StudentProfile.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['students']);
      setDeleteDialogOpen(false);
      setStudentToDelete(null);
    }
  });

  const openAddDialog = () => {
    setEditingStudent(null);
    setFormData({ 
      displayName: '', 
      age: '', 
      gradeRange: 'K-2',
      learningGoals: [],
      learningStyle: 'mixed',
      strengths: [],
      growthAreas: [],
      learningPreferences: {}
    });
    setDialogOpen(true);
  };

  const openEditDialog = (student) => {
    setEditingStudent(student);
    setFormData({
      displayName: student.displayName,
      age: student.age?.toString() || '',
      gradeRange: student.gradeRange || 'K-2',
      learningGoals: student.learningGoals || [],
      learningStyle: student.learningStyle || 'mixed',
      strengths: student.strengths || [],
      growthAreas: student.growthAreas || [],
      learningPreferences: student.learningPreferences || {}
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingStudent(null);
    setFormData({ 
      displayName: '', 
      age: '', 
      gradeRange: 'K-2',
      learningGoals: [],
      learningStyle: 'mixed',
      strengths: [],
      growthAreas: [],
      learningPreferences: {}
    });
    setNewGoal('');
    setNewStrength('');
    setNewGrowthArea('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingStudent) {
      updateMutation.mutate({ id: editingStudent.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getStudentStats = (studentId) => {
    const studentProgress = progress.filter(p => p.studentId === studentId);
    const studentEnrollments = enrollments.filter(e => e.studentId === studentId);
    return {
      completedLessons: studentProgress.filter(p => p.completed).length,
      totalLessons: studentProgress.length,
      activeEnrollments: studentEnrollments.filter(e => e.status === 'enrolled').length,
    };
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Children</h1>
          <p className="text-slate-600 mt-1">Manage your children's learning profiles</p>
        </div>
        <Button onClick={openAddDialog} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Child
        </Button>
      </div>

      {/* Students Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-slate-200" />
                  <div className="space-y-2">
                    <div className="h-5 w-32 bg-slate-200 rounded" />
                    <div className="h-4 w-24 bg-slate-100 rounded" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : students.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10 text-indigo-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">No students yet</h2>
            <p className="text-slate-600 mb-6">Add your first child to start their coding journey</p>
            <Button onClick={openAddDialog} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Child
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student, index) => {
            const stats = getStudentStats(student.id);
            const colorClass = avatarColors[index % avatarColors.length];
            
            return (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="group border-0 shadow-lg hover:shadow-xl transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>
                          {student.displayName?.[0]?.toUpperCase() || 'S'}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">{student.displayName}</h3>
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <span>Age {student.age}</span>
                            <span>•</span>
                            <Badge variant="secondary" className="text-xs">{student.gradeRange}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => openEditDialog(student)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => {
                            setStudentToDelete(student);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100">
                      <div className="text-center">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 mx-auto mb-2">
                          <BookOpen className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="text-lg font-semibold text-slate-900">{stats.completedLessons}</div>
                        <div className="text-xs text-slate-500">Lessons</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-50 mx-auto mb-2">
                          <GraduationCap className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="text-lg font-semibold text-slate-900">{stats.activeEnrollments}</div>
                        <div className="text-xs text-slate-500">Enrolled</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-50 mx-auto mb-2">
                          <Trophy className="w-5 h-5 text-amber-600" />
                        </div>
                        <div className="text-lg font-semibold text-slate-900">0</div>
                        <div className="text-xs text-slate-500">Badges</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{editingStudent ? 'Edit Student Profile' : 'Add New Student'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="learning">Learning Profile</TabsTrigger>
                <TabsTrigger value="progress">Goals & Growth</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Name</Label>
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    placeholder="Enter child's name"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      min="4"
                      max="18"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      placeholder="Age"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gradeRange">Grade Range</Label>
                    <Select 
                      value={formData.gradeRange} 
                      onValueChange={(value) => setFormData({ ...formData, gradeRange: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="K-2">K-2</SelectItem>
                        <SelectItem value="3-5">3-5</SelectItem>
                        <SelectItem value="6-8">6-8</SelectItem>
                        <SelectItem value="9-12">9-12</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="learning" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Learning Style</Label>
                  <Select 
                    value={formData.learningStyle} 
                    onValueChange={(value) => setFormData({ ...formData, learningStyle: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visual">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          Visual - Learns through seeing
                        </div>
                      </SelectItem>
                      <SelectItem value="auditory">
                        <div className="flex items-center gap-2">
                          <Ear className="w-4 h-4" />
                          Auditory - Learns through listening
                        </div>
                      </SelectItem>
                      <SelectItem value="kinesthetic">
                        <div className="flex items-center gap-2">
                          <Hand className="w-4 h-4" />
                          Kinesthetic - Learns through doing
                        </div>
                      </SelectItem>
                      <SelectItem value="mixed">Mixed - Combination of styles</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">
                    This helps the AI companion adapt its teaching approach
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Strengths</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newStrength}
                      onChange={(e) => setNewStrength(e.target.value)}
                      placeholder="e.g., Problem solving, Creative thinking"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newStrength.trim()) {
                            setFormData({ 
                              ...formData, 
                              strengths: [...formData.strengths, newStrength.trim()] 
                            });
                            setNewStrength('');
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        if (newStrength.trim()) {
                          setFormData({ 
                            ...formData, 
                            strengths: [...formData.strengths, newStrength.trim()] 
                          });
                          setNewStrength('');
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.strengths.map((strength, i) => (
                      <Badge key={i} variant="secondary" className="gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {strength}
                        <button
                          type="button"
                          onClick={() => setFormData({ 
                            ...formData, 
                            strengths: formData.strengths.filter((_, idx) => idx !== i) 
                          })}
                          className="ml-1 hover:text-red-600"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Growth Areas</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newGrowthArea}
                      onChange={(e) => setNewGrowthArea(e.target.value)}
                      placeholder="e.g., Debugging, Planning ahead"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newGrowthArea.trim()) {
                            setFormData({ 
                              ...formData, 
                              growthAreas: [...formData.growthAreas, newGrowthArea.trim()] 
                            });
                            setNewGrowthArea('');
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        if (newGrowthArea.trim()) {
                          setFormData({ 
                            ...formData, 
                            growthAreas: [...formData.growthAreas, newGrowthArea.trim()] 
                          });
                          setNewGrowthArea('');
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.growthAreas.map((area, i) => (
                      <Badge key={i} variant="outline" className="gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {area}
                        <button
                          type="button"
                          onClick={() => setFormData({ 
                            ...formData, 
                            growthAreas: formData.growthAreas.filter((_, idx) => idx !== i) 
                          })}
                          className="ml-1 hover:text-red-600"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="progress" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Learning Goals</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newGoal}
                      onChange={(e) => setNewGoal(e.target.value)}
                      placeholder="e.g., Master loops, Build a game"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newGoal.trim()) {
                            setFormData({ 
                              ...formData, 
                              learningGoals: [...formData.learningGoals, newGoal.trim()] 
                            });
                            setNewGoal('');
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        if (newGoal.trim()) {
                          setFormData({ 
                            ...formData, 
                            learningGoals: [...formData.learningGoals, newGoal.trim()] 
                          });
                          setNewGoal('');
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.learningGoals.map((goal, i) => (
                      <Badge key={i} className="bg-indigo-100 text-indigo-700 gap-1">
                        <Target className="w-3 h-3" />
                        {goal}
                        <button
                          type="button"
                          onClick={() => setFormData({ 
                            ...formData, 
                            learningGoals: formData.learningGoals.filter((_, idx) => idx !== i) 
                          })}
                          className="ml-1 hover:text-red-600"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">
                    Goals help focus learning and are included in parent reports
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingStudent ? 'Update Profile' : 'Create Profile'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {studentToDelete?.displayName}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(studentToDelete?.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}