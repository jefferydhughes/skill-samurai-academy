import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  GraduationCap,
  BookOpen,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Sparkles,
  FolderPlus,
  ArrowUpDown
} from 'lucide-react';
import LevelCard from '@/components/curriculum/LevelCard';
import CourseCard from '@/components/curriculum/CourseCard';
import LevelFormModal from '@/components/curriculum/LevelFormModal';
import CourseCatalogueModal from '@/components/curriculum/CourseCatalogueModal';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function CurriculumManager() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('levels');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [showLevelForm, setShowLevelForm] = useState(false);
  const [editingLevel, setEditingLevel] = useState(null);
  const [showCourseCatalogue, setShowCourseCatalogue] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch data
  const { data: levels = [], isLoading: levelsLoading } = useQuery({
    queryKey: ['curriculumLevels'],
    queryFn: () => api.entities.CurriculumLevel.list('order'),
  });

  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => api.entities.Course.filter({ status: 'published' }),
  });

  const { data: badges = [] } = useQuery({
    queryKey: ['badges'],
    queryFn: () => api.entities.Badge.list(),
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['studentEnrollments'],
    queryFn: () => api.entities.StudentCourseEnrollment.list(),
  });

  // Mutations
  const createLevelMutation = useMutation({
    mutationFn: (data) => api.entities.CurriculumLevel.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['curriculumLevels'] });
      setShowLevelForm(false);
    },
  });

  const updateLevelMutation = useMutation({
    mutationFn: ({ id, data }) => api.entities.CurriculumLevel.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['curriculumLevels'] });
      setShowLevelForm(false);
      setEditingLevel(null);
    },
  });

  const deleteLevelMutation = useMutation({
    mutationFn: (id) => api.entities.CurriculumLevel.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['curriculumLevels'] });
      setDeleteConfirm(null);
      if (selectedLevel?.id === deleteConfirm) {
        setSelectedLevel(null);
      }
    },
  });

  // Get course count per level
  const levelCourseCounts = useMemo(() => {
    const counts = {};
    levels.forEach(level => {
      counts[level.id] = level.courseIds?.length || 0;
    });
    return counts;
  }, [levels]);

  // Get student count per level (based on enrollments)
  const levelStudentCounts = useMemo(() => {
    const counts = {};
    levels.forEach(level => {
      const levelCourseIds = level.courseIds || [];
      const uniqueStudents = new Set();
      enrollments.forEach(e => {
        if (levelCourseIds.includes(e.courseId) && e.status !== 'unenrolled') {
          uniqueStudents.add(e.studentId);
        }
      });
      counts[level.id] = uniqueStudents.size;
    });
    return counts;
  }, [levels, enrollments]);

  // Filtered levels
  const filteredLevels = useMemo(() => {
    if (!searchQuery) return levels;
    const query = searchQuery.toLowerCase();
    return levels.filter(l => 
      l.name.toLowerCase().includes(query) ||
      l.description?.toLowerCase().includes(query)
    );
  }, [levels, searchQuery]);

  // Courses in selected level
  const selectedLevelCourses = useMemo(() => {
    if (!selectedLevel) return [];
    return (selectedLevel.courseIds || [])
      .map(id => courses.find(c => c.id === id))
      .filter(Boolean);
  }, [selectedLevel, courses]);

  // Handle adding courses to level
  const handleAddCoursesToLevel = async (courseIds) => {
    if (!selectedLevel) return;
    const updatedCourseIds = [...new Set([...(selectedLevel.courseIds || []), ...courseIds])];
    await updateLevelMutation.mutateAsync({
      id: selectedLevel.id,
      data: { courseIds: updatedCourseIds }
    });
    setSelectedLevel(prev => ({ ...prev, courseIds: updatedCourseIds }));
  };

  // Handle removing course from level
  const handleRemoveCourseFromLevel = async (courseId) => {
    if (!selectedLevel) return;
    const updatedCourseIds = (selectedLevel.courseIds || []).filter(id => id !== courseId);
    await updateLevelMutation.mutateAsync({
      id: selectedLevel.id,
      data: { courseIds: updatedCourseIds }
    });
    setSelectedLevel(prev => ({ ...prev, courseIds: updatedCourseIds }));
  };

  // Handle reordering courses within level
  const handleReorderCourses = async (result) => {
    if (!result.destination || !selectedLevel) return;
    
    const items = Array.from(selectedLevel.courseIds || []);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    await updateLevelMutation.mutateAsync({
      id: selectedLevel.id,
      data: { courseIds: items }
    });
    setSelectedLevel(prev => ({ ...prev, courseIds: items }));
  };

  const handleSaveLevel = async (formData) => {
    if (editingLevel) {
      await updateLevelMutation.mutateAsync({ id: editingLevel.id, data: formData });
    } else {
      await createLevelMutation.mutateAsync(formData);
    }
  };

  const handleEditLevel = (level) => {
    setEditingLevel(level);
    setShowLevelForm(true);
  };

  const handleDeleteLevel = (levelId) => {
    setDeleteConfirm(levelId);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Curriculum Manager</h1>
          <p className="text-slate-500 mt-1">Manage levels, courses, and learning pathways</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => {
              setEditingLevel(null);
              setShowLevelForm(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Level
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        {/* Levels List */}
        <div className="col-span-4 flex flex-col">
          <Card className="flex-1 flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Levels
                </CardTitle>
                <Badge variant="outline">{levels.length} total</Badge>
              </div>
              <div className="relative mt-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search levels..."
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full px-4 pb-4">
                <div className="space-y-3">
                  {filteredLevels.map(level => (
                    <div key={level.id} className="relative group">
                      <LevelCard
                        level={level}
                        courseCount={levelCourseCounts[level.id]}
                        studentCount={levelStudentCounts[level.id]}
                        isSelected={selectedLevel?.id === level.id}
                        onClick={() => setSelectedLevel(level)}
                      />
                      
                      {/* Actions dropdown */}
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 bg-white shadow-sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditLevel(level)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Level
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            {level.externalUrl && (
                              <DropdownMenuItem>
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Open Resource
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteLevel(level.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Level
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                  
                  {filteredLevels.length === 0 && (
                    <div className="py-12 text-center text-slate-500">
                      <GraduationCap className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p>No levels found</p>
                      <Button 
                        variant="link" 
                        onClick={() => {
                          setEditingLevel(null);
                          setShowLevelForm(true);
                        }}
                        className="mt-2"
                      >
                        Create your first level
                      </Button>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Level Detail / Course Management */}
        <div className="col-span-8 flex flex-col">
          {selectedLevel ? (
            <Card className="flex-1 flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {selectedLevel.icon ? (
                        <img src={selectedLevel.icon} alt="" className="w-6 h-6 object-contain" />
                      ) : (
                        <GraduationCap className="w-5 h-5" />
                      )}
                      {selectedLevel.name}
                    </CardTitle>
                    {selectedLevel.description && (
                      <p className="text-sm text-slate-500 mt-1">{selectedLevel.description}</p>
                    )}
                  </div>
                  <Button 
                    onClick={() => setShowCourseCatalogue(true)}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    <FolderPlus className="w-4 h-4 mr-2" />
                    Add Courses
                  </Button>
                </div>
                
                {/* Level meta */}
                <div className="flex items-center gap-4 mt-3">
                  {selectedLevel.ageRange && (
                    <Badge variant="outline">
                      Ages {selectedLevel.ageRange.min}-{selectedLevel.ageRange.max}
                    </Badge>
                  )}
                  {selectedLevel.difficultyRange && (
                    <Badge variant="outline" className="capitalize">
                      {selectedLevel.difficultyRange.min} - {selectedLevel.difficultyRange.max}
                    </Badge>
                  )}
                  {selectedLevel.isDefault && (
                    <Badge className="bg-indigo-100 text-indigo-700">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Default Level
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-slate-700 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Courses in this Level
                    <Badge variant="secondary">{selectedLevelCourses.length}</Badge>
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <ArrowUpDown className="w-4 h-4" />
                    Drag to reorder
                  </div>
                </div>
                
                <ScrollArea className="h-[calc(100%-40px)]">
                  {selectedLevelCourses.length > 0 ? (
                    <DragDropContext onDragEnd={handleReorderCourses}>
                      <Droppable droppableId="courses">
                        {(provided) => (
                          <div 
                            {...provided.droppableProps} 
                            ref={provided.innerRef}
                            className="space-y-2"
                          >
                            {selectedLevelCourses.map((course, index) => (
                              <Draggable key={course.id} draggableId={course.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`
                                      relative group
                                      ${snapshot.isDragging ? 'shadow-lg' : ''}
                                    `}
                                  >
                                    <CourseCard
                                      course={course}
                                      compact
                                    />
                                    
                                    {/* Remove button */}
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                      onClick={() => handleRemoveCourseFromLevel(course.id)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  ) : (
                    <div className="py-12 text-center text-slate-500">
                      <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p>No courses in this level yet</p>
                      <Button 
                        variant="link" 
                        onClick={() => setShowCourseCatalogue(true)}
                        className="mt-2"
                      >
                        Add courses from catalogue
                      </Button>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          ) : (
            <Card className="flex-1 flex items-center justify-center">
              <div className="text-center text-slate-500">
                <GraduationCap className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <p className="text-lg font-medium">Select a level</p>
                <p className="text-sm mt-1">Choose a level to view and manage its courses</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Level Form Modal */}
      <LevelFormModal
        open={showLevelForm}
        onOpenChange={setShowLevelForm}
        level={editingLevel}
        onSave={handleSaveLevel}
        isLoading={createLevelMutation.isPending || updateLevelMutation.isPending}
      />

      {/* Course Catalogue Modal */}
      <CourseCatalogueModal
        open={showCourseCatalogue}
        onOpenChange={setShowCourseCatalogue}
        courses={courses}
        excludeIds={selectedLevel?.courseIds || []}
        onConfirm={handleAddCoursesToLevel}
        title={`Add Courses to ${selectedLevel?.name || 'Level'}`}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Level?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this level. Courses within the level will not be deleted,
              but will no longer be associated with this level.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteLevelMutation.mutate(deleteConfirm)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Level
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}