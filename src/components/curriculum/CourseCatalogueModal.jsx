import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, X, Filter, BookOpen, CheckCircle2 } from 'lucide-react';
import CourseCard from './CourseCard';

const technologies = ['scratch', 'voxel', 'minecraft', 'roblox', 'python', 'web', 'unity', 'other'];
const difficulties = ['beginner', 'intro', 'intermediate', 'advanced'];
const ageRanges = [
  { label: 'Ages 5-7', min: 5, max: 7 },
  { label: 'Ages 8-10', min: 8, max: 10 },
  { label: 'Ages 11-13', min: 11, max: 13 },
  { label: 'Ages 14+', min: 14, max: 18 },
];

export default function CourseCatalogueModal({
  open,
  onOpenChange,
  courses = [],
  excludeIds = [],
  onConfirm,
  title = "Add Courses",
  multiSelect = true
}) {
  const [search, setSearch] = useState('');
  const [technology, setTechnology] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [ageRange, setAgeRange] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      // Exclude already added courses
      if (excludeIds.includes(course.id)) return false;
      
      // Search filter
      if (search && !course.name.toLowerCase().includes(search.toLowerCase()) &&
          !course.description?.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      
      // Technology filter
      if (technology !== 'all' && course.technology !== technology) return false;
      
      // Difficulty filter
      if (difficulty !== 'all' && course.difficulty !== difficulty) return false;
      
      // Age range filter
      if (ageRange !== 'all') {
        const range = ageRanges.find(r => r.label === ageRange);
        if (range && course.ageRange) {
          if (course.ageRange.min > range.max || course.ageRange.max < range.min) {
            return false;
          }
        }
      }
      
      return true;
    });
  }, [courses, excludeIds, search, technology, difficulty, ageRange]);

  const handleSelect = (courseId) => {
    if (multiSelect) {
      setSelectedIds(prev => 
        prev.includes(courseId) 
          ? prev.filter(id => id !== courseId)
          : [...prev, courseId]
      );
    } else {
      setSelectedIds([courseId]);
    }
  };

  const handleConfirm = () => {
    onConfirm(selectedIds);
    setSelectedIds([]);
    onOpenChange(false);
  };

  const clearFilters = () => {
    setSearch('');
    setTechnology('all');
    setDifficulty('all');
    setAgeRange('all');
  };

  const hasFilters = search || technology !== 'all' || difficulty !== 'all' || ageRange !== 'all';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        {/* Filters */}
        <div className="space-y-3 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses..."
                className="pl-9"
              />
            </div>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-slate-400" />
            
            <Select value={technology} onValueChange={setTechnology}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Technology" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tech</SelectItem>
                {technologies.map(tech => (
                  <SelectItem key={tech} value={tech} className="capitalize">{tech}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {difficulties.map(d => (
                  <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={ageRange} onValueChange={setAgeRange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Age Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ages</SelectItem>
                {ageRanges.map(r => (
                  <SelectItem key={r.label} value={r.label}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Course Grid */}
        <ScrollArea className="flex-1 -mx-6 px-6">
          {filteredCourses.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No courses match your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 py-4">
              {filteredCourses.map(course => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isSelected={selectedIds.includes(course.id)}
                  showCheckbox
                  onSelect={handleSelect}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <DialogFooter className="border-t pt-4">
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-slate-500">
              {selectedIds.length > 0 && (
                <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {selectedIds.length} selected
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleConfirm}
                disabled={selectedIds.length === 0}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Add {selectedIds.length > 0 ? `${selectedIds.length} Course${selectedIds.length > 1 ? 's' : ''}` : 'Courses'}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}