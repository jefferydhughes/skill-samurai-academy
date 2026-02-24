import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
  Lock,
  Unlock,
  UserPlus,
  UserMinus,
  Award,
  CheckCircle2,
  Clock,
  AlertTriangle
} from 'lucide-react';

const technologyIcons = {
  scratch: '🐱',
  voxel: '🎮',
  minecraft: '⛏️',
  roblox: '🎯',
  python: '🐍',
  web: '🌐',
  unity: '🎲',
  other: '💻'
};

const statusColors = {
  enrolled: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-amber-100 text-amber-700',
  completed: 'bg-emerald-100 text-emerald-700',
  unenrolled: 'bg-slate-100 text-slate-500'
};

export default function StudentEnrollmentPanel({
  student,
  levels = [],
  courses = [],
  enrollments = [],
  onEnroll,
  onUnenroll,
  isLoading
}) {
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);
  const [confirmAction, setConfirmAction] = useState(null); // 'enroll' | 'unenroll'

  // Map enrollments by courseId for quick lookup
  const enrollmentMap = useMemo(() => {
    const map = {};
    enrollments.forEach(e => {
      map[e.courseId] = e;
    });
    return map;
  }, [enrollments]);

  // Group courses by level
  const coursesByLevel = useMemo(() => {
    const map = {};
    levels.forEach(level => {
      map[level.id] = (level.courseIds || [])
        .map(id => courses.find(c => c.id === id))
        .filter(Boolean);
    });
    return map;
  }, [levels, courses]);

  const handleToggleCourse = (courseId) => {
    setSelectedCourseIds(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleSelectAll = (levelId, select) => {
    const levelCourseIds = coursesByLevel[levelId]?.map(c => c.id) || [];
    if (select) {
      setSelectedCourseIds(prev => [...new Set([...prev, ...levelCourseIds])]);
    } else {
      setSelectedCourseIds(prev => prev.filter(id => !levelCourseIds.includes(id)));
    }
  };

  const handleConfirmEnroll = () => {
    onEnroll(selectedCourseIds);
    setSelectedCourseIds([]);
    setConfirmAction(null);
  };

  const handleConfirmUnenroll = () => {
    onUnenroll(selectedCourseIds);
    setSelectedCourseIds([]);
    setConfirmAction(null);
  };

  const selectedCount = selectedCourseIds.length;
  const hasEnrolledSelected = selectedCourseIds.some(id => enrollmentMap[id]?.status === 'enrolled' || enrollmentMap[id]?.status === 'in_progress');
  const hasUnenrolledSelected = selectedCourseIds.some(id => !enrollmentMap[id] || enrollmentMap[id]?.status === 'unenrolled');

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-lg font-semibold text-indigo-600">
                  {student?.full_name?.[0]?.toUpperCase() || 'S'}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{student?.full_name || 'Student'}</h3>
                <p className="text-sm text-slate-500">Course & Level Enrollment</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!hasUnenrolledSelected || isLoading}
                onClick={() => setConfirmAction('enroll')}
                className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Enroll ({selectedCourseIds.filter(id => !enrollmentMap[id] || enrollmentMap[id]?.status === 'unenrolled').length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!hasEnrolledSelected || isLoading}
                onClick={() => setConfirmAction('unenroll')}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <UserMinus className="w-4 h-4 mr-2" />
                Unenroll ({selectedCourseIds.filter(id => enrollmentMap[id]?.status === 'enrolled' || enrollmentMap[id]?.status === 'in_progress').length})
              </Button>
            </div>
          </div>
          
          {selectedCount > 0 && (
            <div className="mt-3 pt-3 border-t flex items-center justify-between">
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {selectedCount} course{selectedCount !== 1 ? 's' : ''} selected
              </Badge>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedCourseIds([])}
              >
                Clear selection
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Levels & Courses */}
      <ScrollArea className="h-[500px]">
        <Accordion type="multiple" defaultValue={levels.map(l => l.id)} className="space-y-3">
          {levels.map(level => {
            const levelCourses = coursesByLevel[level.id] || [];
            const levelSelectedCount = levelCourses.filter(c => selectedCourseIds.includes(c.id)).length;
            const allSelected = levelSelectedCount === levelCourses.length && levelCourses.length > 0;
            
            // Calculate level progress
            const completedCourses = levelCourses.filter(c => enrollmentMap[c.id]?.status === 'completed').length;
            const levelProgress = levelCourses.length > 0 ? (completedCourses / levelCourses.length) * 100 : 0;

            return (
              <AccordionItem key={level.id} value={level.id} className="border rounded-xl overflow-hidden bg-white">
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-slate-50">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                      {level.icon ? (
                        <img src={level.icon} alt="" className="w-6 h-6 object-contain" />
                      ) : (
                        <GraduationCap className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{level.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {levelCourses.length} courses
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={levelProgress} className="h-1.5 w-32" />
                        <span className="text-xs text-slate-500">{completedCourses}/{levelCourses.length} completed</span>
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                
                <AccordionContent className="px-4 pb-4">
                  {/* Select all for level */}
                  <div className="flex items-center justify-between py-2 mb-2 border-b">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={(checked) => handleSelectAll(level.id, checked)}
                      />
                      <span className="text-sm text-slate-600">Select all in this level</span>
                    </label>
                    {levelSelectedCount > 0 && (
                      <span className="text-xs text-slate-500">{levelSelectedCount} selected</span>
                    )}
                  </div>
                  
                  {/* Course list */}
                  <div className="space-y-2">
                    {levelCourses.map(course => {
                      const enrollment = enrollmentMap[course.id];
                      const isEnrolled = enrollment && enrollment.status !== 'unenrolled';
                      const isSelected = selectedCourseIds.includes(course.id);
                      const progress = enrollment?.progress?.percentComplete || 0;

                      return (
                        <div
                          key={course.id}
                          className={`
                            flex items-center gap-3 p-3 rounded-lg border transition-all
                            ${isSelected ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200'}
                            ${isEnrolled ? '' : 'opacity-60'}
                          `}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleToggleCourse(course.id)}
                          />
                          
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-xl">{technologyIcons[course.technology] || '💻'}</span>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-900 truncate">{course.name}</span>
                              {isEnrolled ? (
                                <Unlock className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                              ) : (
                                <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                              )}
                            </div>
                            
                            {isEnrolled && (
                              <div className="flex items-center gap-2 mt-1">
                                <Progress value={progress} className="h-1 flex-1 max-w-[100px]" />
                                <span className="text-xs text-slate-500">{Math.round(progress)}%</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {enrollment?.status && (
                              <Badge className={`text-xs ${statusColors[enrollment.status]}`}>
                                {enrollment.status === 'completed' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                {enrollment.status === 'in_progress' && <Clock className="w-3 h-3 mr-1" />}
                                {enrollment.status.replace('_', ' ')}
                              </Badge>
                            )}
                            {enrollment?.badgeAwarded && (
                              <Award className="w-5 h-5 text-amber-500" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                    
                    {levelCourses.length === 0 && (
                      <div className="py-6 text-center text-slate-500 text-sm">
                        <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        No courses in this level yet
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </ScrollArea>

      {/* Confirmation Dialogs */}
      <AlertDialog open={confirmAction === 'enroll'} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-600" />
              Enroll Student in Courses
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will enroll {student?.full_name} in {selectedCourseIds.filter(id => !enrollmentMap[id] || enrollmentMap[id]?.status === 'unenrolled').length} course(s).
              The courses will appear on their dashboard immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmEnroll}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Confirm Enrollment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmAction === 'unenroll'} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Unenroll Student from Courses
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will unenroll {student?.full_name} from {selectedCourseIds.filter(id => enrollmentMap[id]?.status === 'enrolled' || enrollmentMap[id]?.status === 'in_progress').length} course(s).
              Progress will be preserved but courses will become locked.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmUnenroll}
              className="bg-red-600 hover:bg-red-700"
            >
              Confirm Unenrollment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}