import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Users,
  Search,
  BookOpen,
  Award,
  CheckCircle2
} from 'lucide-react';
import StudentEnrollmentPanel from '@/components/curriculum/StudentEnrollmentPanel';

export default function StudentEnrollmentManager() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Fetch students
  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ['students'],
    queryFn: () => api.entities.Student.list('full_name'),
  });

  // Fetch levels
  const { data: levels = [] } = useQuery({
    queryKey: ['curriculumLevels'],
    queryFn: () => api.entities.CurriculumLevel.list('order'),
  });

  // Fetch courses
  const { data: courses = [] } = useQuery({
    queryKey: ['publishedCourses'],
    queryFn: () => api.entities.Course.filter({ status: 'published' }),
  });

  // Fetch enrollments for selected student
  const { data: enrollments = [], refetch: refetchEnrollments } = useQuery({
    queryKey: ['studentEnrollments', selectedStudent?.id],
    queryFn: () => api.entities.StudentCourseEnrollment.filter({ 
      studentId: selectedStudent?.id 
    }),
    enabled: !!selectedStudent?.id,
  });

  // Fetch all enrollments for stats
  const { data: allEnrollments = [] } = useQuery({
    queryKey: ['allEnrollments'],
    queryFn: () => api.entities.StudentCourseEnrollment.list(),
  });

  // Enroll mutation
  const enrollMutation = useMutation({
    mutationFn: async (courseIds) => {
      const enrollments = courseIds.map(courseId => ({
        studentId: selectedStudent.id,
        courseId,
        status: 'enrolled',
        enrollmentType: 'manual',
        enrolledAt: new Date().toISOString(),
        progress: {
          lessonsCompleted: 0,
          totalLessons: courses.find(c => c.id === courseId)?.lessonCount || 0,
          percentComplete: 0
        }
      }));
      
      return Promise.all(
        enrollments.map(e => api.entities.StudentCourseEnrollment.create(e))
      );
    },
    onSuccess: () => {
      refetchEnrollments();
      queryClient.invalidateQueries({ queryKey: ['allEnrollments'] });
    },
  });

  // Unenroll mutation
  const unenrollMutation = useMutation({
    mutationFn: async (courseIds) => {
      const toUnenroll = enrollments.filter(e => 
        courseIds.includes(e.courseId) && 
        (e.status === 'enrolled' || e.status === 'in_progress')
      );
      
      return Promise.all(
        toUnenroll.map(e => 
          api.entities.StudentCourseEnrollment.update(e.id, { status: 'unenrolled' })
        )
      );
    },
    onSuccess: () => {
      refetchEnrollments();
      queryClient.invalidateQueries({ queryKey: ['allEnrollments'] });
    },
  });

  // Filter students
  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students;
    const query = searchQuery.toLowerCase();
    return students.filter(s => 
      s.full_name?.toLowerCase().includes(query)
    );
  }, [students, searchQuery]);

  // Calculate student stats
  const getStudentStats = (studentId) => {
    const studentEnrollments = allEnrollments.filter(e => e.studentId === studentId);
    return {
      enrolled: studentEnrollments.filter(e => e.status === 'enrolled' || e.status === 'in_progress').length,
      completed: studentEnrollments.filter(e => e.status === 'completed').length,
      badges: studentEnrollments.filter(e => e.badgeAwarded).length
    };
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Student Enrollment Manager</h1>
          <p className="text-slate-500 mt-1">
            Enroll and manage student course assignments
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        {/* Student List */}
        <div className="col-span-4 flex flex-col">
          <Card className="flex-1 flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Students
                </CardTitle>
                <Badge variant="outline">{students.length} total</Badge>
              </div>
              <div className="relative mt-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search students..."
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-2">
                  {studentsLoading ? (
                    Array(5).fill(0).map((_, i) => (
                      <div key={i} className="animate-pulse flex items-center gap-3 p-3 rounded-xl bg-slate-100">
                        <div className="w-10 h-10 rounded-full bg-slate-200" />
                        <div className="flex-1">
                          <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                          <div className="h-3 bg-slate-200 rounded w-1/2" />
                        </div>
                      </div>
                    ))
                  ) : filteredStudents.length === 0 ? (
                    <div className="py-12 text-center text-slate-500">
                      <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p>No students found</p>
                    </div>
                  ) : (
                    filteredStudents.map(student => {
                      const stats = getStudentStats(student.id);
                      const isSelected = selectedStudent?.id === student.id;
                      
                      return (
                        <div
                          key={student.id}
                          onClick={() => setSelectedStudent(student)}
                          className={`
                            flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all
                            ${isSelected 
                              ? 'bg-indigo-50 border-2 border-indigo-200' 
                              : 'bg-white border border-slate-200 hover:border-indigo-200 hover:bg-slate-50'
                            }
                          `}
                        >
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-violet-500 text-white">
                              {student.full_name?.[0]?.toUpperCase() || 'S'}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-slate-900 truncate">
                              {student.full_name}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                              <span className="flex items-center gap-1">
                                <BookOpen className="w-3 h-3" />
                                {stats.enrolled} active
                              </span>
                              <span className="flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                {stats.completed}
                              </span>
                              {stats.badges > 0 && (
                                <span className="flex items-center gap-1">
                                  <Award className="w-3 h-3 text-amber-500" />
                                  {stats.badges}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Enrollment Panel */}
        <div className="col-span-8 flex flex-col">
          {selectedStudent ? (
            <StudentEnrollmentPanel
              student={selectedStudent}
              levels={levels}
              courses={courses}
              enrollments={enrollments}
              onEnroll={(courseIds) => enrollMutation.mutate(courseIds)}
              onUnenroll={(courseIds) => unenrollMutation.mutate(courseIds)}
              isLoading={enrollMutation.isPending || unenrollMutation.isPending}
            />
          ) : (
            <Card className="flex-1 flex items-center justify-center">
              <div className="text-center text-slate-500">
                <Users className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <p className="text-lg font-medium">Select a student</p>
                <p className="text-sm mt-1">Choose a student to manage their course enrollments</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}