import React, { useState } from 'react';
import { api } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { 
  Users,
  Search,
  BookOpen,
  Trophy,
  GraduationCap,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

const gradeColors = {
  'K-2': 'bg-pink-100 text-pink-700',
  '3-5': 'bg-blue-100 text-blue-700',
  '6-8': 'bg-green-100 text-green-700',
  '9-12': 'bg-purple-100 text-purple-700'
};

const avatarColors = [
  'from-rose-400 to-pink-500',
  'from-violet-400 to-purple-500',
  'from-blue-400 to-indigo-500',
  'from-cyan-400 to-teal-500',
  'from-emerald-400 to-green-500',
  'from-amber-400 to-orange-500',
];

export default function StudentsManager() {
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState(null);

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['allStudents'],
    queryFn: () => api.entities.StudentProfile.list('-created_date'),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => api.entities.User.list(),
  });

  const instructors = users.filter(u => u.role === 'admin' || u.role === 'instructor');

  const { data: enrollments = [] } = useQuery({
    queryKey: ['allEnrollments'],
    queryFn: () => api.entities.Enrollment.list(),
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['allProgress'],
    queryFn: () => api.entities.LessonProgress.list(),
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['allPrograms'],
    queryFn: () => api.entities.Program.list(),
  });

  const getParent = (userId) => users.find(u => u.id === userId);
  const getStudentEnrollments = (studentId) => enrollments.filter(e => e.studentId === studentId);
  const getStudentProgress = (studentId) => progress.filter(p => p.studentId === studentId);
  const getProgram = (programId) => programs.find(p => p.id === programId);

  const filteredStudents = students.filter(student => {
    const matchesSearch = !searchQuery || 
      student.displayName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = gradeFilter === 'all' || student.gradeRange === gradeFilter;
    return matchesSearch && matchesGrade;
  });

  const openDetails = (student) => {
    setSelectedStudent(student);
    setDetailsOpen(true);
  };

  const getStudentStats = (studentId) => {
    const studentEnrollments = getStudentEnrollments(studentId);
    const studentProgress = getStudentProgress(studentId);
    return {
      enrollments: studentEnrollments.length,
      activeEnrollments: studentEnrollments.filter(e => e.status === 'enrolled').length,
      completedLessons: studentProgress.filter(p => p.completed).length,
      inProgressLessons: studentProgress.filter(p => !p.completed).length,
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Students</h1>
          <p className="text-slate-600 mt-1">View and manage student profiles</p>
        </div>
        
        {instructors.length > 0 && (
          <Select onValueChange={(userId) => {
            const instructor = instructors.find(i => i.id === userId);
            if (instructor) {
              setSelectedInstructor(instructor);
              setOnboardingOpen(true);
            }
          }}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Start Instructor Onboarding..." />
            </SelectTrigger>
            <SelectContent>
              {instructors.map(instructor => (
                <SelectItem key={instructor.id} value={instructor.id}>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    {instructor.full_name} ({instructor.role})
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{students.length}</div>
              <div className="text-sm text-slate-500">Total Students</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {enrollments.filter(e => e.status === 'enrolled').length}
              </div>
              <div className="text-sm text-slate-500">Active Enrollments</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {progress.filter(p => p.completed).length}
              </div>
              <div className="text-sm text-slate-500">Lessons Completed</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">0</div>
              <div className="text-sm text-slate-500">Badges Earned</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                <SelectItem value="K-2">K-2</SelectItem>
                <SelectItem value="3-5">3-5</SelectItem>
                <SelectItem value="6-8">6-8</SelectItem>
                <SelectItem value="9-12">9-12</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Student</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Enrollments</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i} className="animate-pulse">
                  <TableCell><div className="h-10 w-32 bg-slate-200 rounded" /></TableCell>
                  <TableCell><div className="h-4 w-8 bg-slate-200 rounded" /></TableCell>
                  <TableCell><div className="h-6 w-12 bg-slate-200 rounded-full" /></TableCell>
                  <TableCell><div className="h-4 w-24 bg-slate-200 rounded" /></TableCell>
                  <TableCell><div className="h-4 w-8 bg-slate-200 rounded" /></TableCell>
                  <TableCell><div className="h-2 w-24 bg-slate-200 rounded" /></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              ))
            ) : filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No students found</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student, index) => {
                const parent = getParent(student.userId);
                const stats = getStudentStats(student.id);
                const colorClass = avatarColors[index % avatarColors.length];
                
                return (
                  <TableRow key={student.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => openDetails(student)}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-white font-medium`}>
                          {student.displayName?.[0]?.toUpperCase() || 'S'}
                        </div>
                        <span className="font-medium text-slate-900">{student.displayName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">{student.age}</TableCell>
                    <TableCell>
                      <Badge className={gradeColors[student.gradeRange] || 'bg-slate-100 text-slate-600'}>
                        {student.gradeRange}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {parent?.full_name || '-'}
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-slate-600">
                        <GraduationCap className="w-4 h-4" />
                        {stats.activeEnrollments}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={stats.completedLessons * 10} className="w-20 h-2" />
                        <span className="text-xs text-slate-500">{stats.completedLessons} done</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Student Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Student Profile</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-2xl font-bold`}>
                  {selectedStudent.displayName?.[0]?.toUpperCase() || 'S'}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedStudent.displayName}</h3>
                  <p className="text-slate-500">Age {selectedStudent.age} • {selectedStudent.gradeRange}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Card className="border-0 shadow-sm bg-slate-50">
                  <CardContent className="p-4 text-center">
                    <GraduationCap className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{getStudentStats(selectedStudent.id).activeEnrollments}</div>
                    <div className="text-sm text-slate-500">Enrollments</div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-slate-50">
                  <CardContent className="p-4 text-center">
                    <BookOpen className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{getStudentStats(selectedStudent.id).completedLessons}</div>
                    <div className="text-sm text-slate-500">Completed</div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-slate-50">
                  <CardContent className="p-4 text-center">
                    <Trophy className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold">0</div>
                    <div className="text-sm text-slate-500">Badges</div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h4 className="font-medium text-slate-900 mb-3">Current Enrollments</h4>
                <div className="space-y-2">
                  {getStudentEnrollments(selectedStudent.id).length === 0 ? (
                    <p className="text-slate-500 text-sm">No active enrollments</p>
                  ) : (
                    getStudentEnrollments(selectedStudent.id).map(enrollment => {
                      const program = getProgram(enrollment.programId);
                      return (
                        <div key={enrollment.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                              <BookOpen className="w-4 h-4 text-indigo-600" />
                            </div>
                            <span className="font-medium">{program?.name || 'Program'}</span>
                          </div>
                          <Badge className={enrollment.status === 'enrolled' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}>
                            {enrollment.status}
                          </Badge>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Onboarding Wizard */}
      {selectedInstructor && (
        <OnboardingWizard
          open={onboardingOpen}
          onClose={() => {
            setOnboardingOpen(false);
            setSelectedInstructor(null);
          }}
          instructor={selectedInstructor}
        />
      )}
    </div>
  );
}