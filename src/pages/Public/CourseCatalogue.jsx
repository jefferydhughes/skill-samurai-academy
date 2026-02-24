import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  BookOpen,
  Plus,
  Search,
  Filter,
  Grid,
  List,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Award,
  ExternalLink,
  X,
  Save
} from 'lucide-react';
import CourseCard from '@/components/curriculum/CourseCard';

const technologies = [
  { value: 'scratch', label: 'Scratch', icon: '🐱' },
  { value: 'voxel', label: 'Voxel', icon: '🎮' },
  { value: 'minecraft', label: 'Minecraft', icon: '⛏️' },
  { value: 'roblox', label: 'Roblox', icon: '🎯' },
  { value: 'python', label: 'Python', icon: '🐍' },
  { value: 'web', label: 'Web Dev', icon: '🌐' },
  { value: 'unity', label: 'Unity', icon: '🎲' },
  { value: 'other', label: 'Other', icon: '💻' },
];

const difficulties = ['beginner', 'intro', 'intermediate', 'advanced'];
const statuses = ['draft', 'published', 'archived'];

export default function CourseCatalogue() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [technologyFilter, setTechnologyFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch courses
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['allCourses'],
    queryFn: () => api.entities.Course.list('-created_date'),
  });

  // Fetch badges for display
  const { data: badges = [] } = useQuery({
    queryKey: ['badges'],
    queryFn: () => api.entities.Badge.list(),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => api.entities.Course.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allCourses'] });
      setDeleteConfirm(null);
    },
  });

  // Duplicate mutation
  const duplicateMutation = useMutation({
    mutationFn: async (course) => {
      const { id, created_date, updated_date, created_by, ...courseData } = course;
      return api.entities.Course.create({
        ...courseData,
        name: `${course.name} (Copy)`,
        status: 'draft'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allCourses'] });
    },
  });

  // Filter courses
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!course.name.toLowerCase().includes(query) &&
            !course.description?.toLowerCase().includes(query) &&
            !course.tags?.some(t => t.toLowerCase().includes(query))) {
          return false;
        }
      }
      
      // Technology filter
      if (technologyFilter !== 'all' && course.technology !== technologyFilter) {
        return false;
      }
      
      // Difficulty filter
      if (difficultyFilter !== 'all' && course.difficulty !== difficultyFilter) {
        return false;
      }
      
      // Status filter
      if (statusFilter !== 'all' && course.status !== statusFilter) {
        return false;
      }
      
      return true;
    });
  }, [courses, searchQuery, technologyFilter, difficultyFilter, statusFilter]);

  // Group courses by technology for stats
  const courseStats = useMemo(() => {
    const stats = {
      total: courses.length,
      published: courses.filter(c => c.status === 'published').length,
      draft: courses.filter(c => c.status === 'draft').length,
      byTechnology: {}
    };
    
    technologies.forEach(tech => {
      stats.byTechnology[tech.value] = courses.filter(c => c.technology === tech.value).length;
    });
    
    return stats;
  }, [courses]);

  const hasFilters = technologyFilter !== 'all' || difficultyFilter !== 'all' || statusFilter !== 'all' || searchQuery;

  const clearFilters = () => {
    setSearchQuery('');
    setTechnologyFilter('all');
    setDifficultyFilter('all');
    setStatusFilter('all');
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    
    try {
      // Trigger a refetch to ensure data is saved
      await queryClient.invalidateQueries({ queryKey: ['allCourses'] });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Course Catalogue</h1>
          <p className="text-slate-500 mt-1">
            {courseStats.published} published • {courseStats.draft} drafts • {courseStats.total} total courses
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={handleSave}
            disabled={saving}
            className={saveSuccess ? 'border-green-500 text-green-600' : ''}
          >
            {saveSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Saved
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save All'}
              </>
            )}
          </Button>
          <Button variant="outline" asChild>
            <Link to={createPageUrl('CurriculumManager')}>
              <Award className="w-4 h-4 mr-2" />
              Manage Levels
            </Link>
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700" asChild>
            <Link to={createPageUrl('CourseEditor')}>
              <Plus className="w-4 h-4 mr-2" />
              Create Course
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {technologies.map(tech => (
          <Card 
            key={tech.value}
            className={`cursor-pointer transition-all hover:shadow-md ${
              technologyFilter === tech.value ? 'ring-2 ring-indigo-500' : ''
            }`}
            onClick={() => setTechnologyFilter(technologyFilter === tech.value ? 'all' : tech.value)}
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-1">{tech.icon}</div>
              <div className="text-xs text-slate-500">{tech.label}</div>
              <div className="text-lg font-bold text-slate-900">
                {courseStats.byTechnology[tech.value] || 0}
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
                placeholder="Search courses by name, description, or tags..."
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

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {statuses.map(s => (
                    <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
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

      {/* Course Grid/List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-video bg-slate-200" />
              <CardContent className="p-4">
                <div className="h-5 bg-slate-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-slate-100 rounded w-full mb-3" />
                <div className="h-4 bg-slate-100 rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-900">No courses found</h3>
            <p className="text-slate-500 mt-1">
              {hasFilters 
                ? 'Try adjusting your filters to find more courses'
                : 'Create your first course to get started'}
            </p>
            {hasFilters ? (
              <Button variant="outline" onClick={clearFilters} className="mt-4">
                Clear Filters
              </Button>
            ) : (
              <Button className="mt-4 bg-indigo-600 hover:bg-indigo-700" asChild>
                <Link to={createPageUrl('CourseEditor')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Course
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCourses.map(course => (
            <div key={course.id} className="relative group">
              <CourseCard course={course} />
              
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
                      <Link to={`${createPageUrl('CourseEditor')}?id=${course.id}`}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Course
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => duplicateMutation.mutate(course)}>
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    {course.driveResources?.folderUrl && (
                      <DropdownMenuItem asChild>
                        <a href={course.driveResources.folderUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Open Drive Folder
                        </a>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => setDeleteConfirm(course.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {/* Status badge */}
              {course.status !== 'published' && (
                <Badge 
                  className={`absolute bottom-3 right-3 ${
                    course.status === 'draft' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {course.status}
                </Badge>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredCourses.map(course => (
            <div key={course.id} className="relative group">
              <CourseCard course={course} compact />
              
              {/* Actions */}
              <div className="absolute right-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                  <Link to={`${createPageUrl('CourseEditor')}?id=${course.id}`}>
                    <Edit className="w-4 h-4" />
                  </Link>
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => duplicateMutation.mutate(course)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-red-500 hover:text-red-600"
                  onClick={() => setDeleteConfirm(course.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this course and remove it from all levels.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(deleteConfirm)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Course
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}