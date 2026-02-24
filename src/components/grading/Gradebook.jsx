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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  Edit,
  Eye,
  TrendingUp,
  Award,
  AlertCircle,
  Download,
  Filter,
  Search,
} from 'lucide-react';

export default function Gradebook() {
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showGradeForm, setShowGradeForm] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const queryClient = useQueryClient();

  // Get teacher's classes
  const { data: classes = [], isLoading: classesLoading } = useQuery({
    queryKey: ['teacher-classes'],
    queryFn: async () => {
      // Mock data - would be real API call
      return [
        {
          id: '1',
          name: 'Scratch Programming - Beginners',
          students: 12,
          grades: [
            { studentId: 's1', studentName: 'Alice Johnson', grade: 85, status: 'submitted', assignment: 'Platformer Game', date: '2024-01-15' },
            { studentId: 's2', studentName: 'Bob Smith', grade: 92, status: 'graded', assignment: 'Platformer Game', date: '2024-01-15' },
            { studentId: 's3', studentName: 'Charlie Brown', grade: null, status: 'missing', assignment: 'Platformer Game', date: '2024-01-15' },
          ],
          assignments: [
            { id: 'a1', name: 'Platformer Game', dueDate: '2024-01-15', type: 'project', weight: 30 },
            { id: 'a2', name: 'Quiz - Loops & Variables', dueDate: '2024-01-20', type: 'quiz', weight: 20 },
            { id: 'a3', name: 'Animation Project', dueDate: '2024-01-25', type: 'project', weight: 30 },
          ]
        },
        {
          id: '2',
          name: 'Python for Kids - Intermediate',
          students: 8,
          grades: [
            { studentId: 's4', studentName: 'Diana Prince', grade: 88, status: 'graded', assignment: 'Weather App', date: '2024-01-14' },
            { studentId: 's5', studentName: 'Ethan Hunt', grade: 76, status: 'graded', assignment: 'Weather App', date: '2024-01-14' },
          ],
          assignments: [
            { id: 'a4', name: 'Weather App', dueDate: '2024-01-14', type: 'project', weight: 40 },
            { id: 'a5', name: 'Functions Quiz', dueDate: '2024-01-19', type: 'quiz', weight: 20 },
          ]
        },
      ];
    },
  });

  // Calculate class statistics
  const getClassStats = (classItem) => {
    const grades = classItem.grades.filter(g => g.grade !== null).map(g => g.grade);
    const average = grades.length > 0 ? grades.reduce((sum, grade) => sum + grade, 0) / grades.length : 0;
    const submitted = classItem.grades.filter(g => g.status === 'submitted' || g.status === 'graded').length;
    const missing = classItem.grades.filter(g => g.status === 'missing').length;
    
    return {
      average: average.toFixed(1),
      submitted,
      missing,
      totalStudents: classItem.students,
      submissionRate: ((submitted / classItem.students) * 100).toFixed(1),
    };
  };

  const saveGradeMutation = useMutation({
    mutationFn: (gradeData) => {
      // API call to save grade
      console.log('Saving grade:', gradeData);
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-classes'] });
      setShowGradeForm(false);
      setEditingGrade(null);
    },
  });

  const handleEditGrade = (grade, classItem) => {
    setEditingGrade({
      ...grade,
      classId: classItem.id,
      className: classItem.name,
    });
    setShowGradeForm(true);
  };

  const handleNewGrade = (classItem) => {
    setEditingGrade({
      classId: classItem.id,
      className: classItem.name,
      studentName: '',
      studentId: '',
      assignment: '',
      grade: '',
      feedback: '',
      status: 'draft',
    });
    setShowGradeForm(true);
  };

  const exportGrades = (classItem) => {
    // CSV export functionality
    console.log('Exporting grades for:', classItem.name);
  };

  const filteredClasses = classes.filter(classItem => {
    const matchesSearch = classItem.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'missing' && getClassStats(classItem).missing > 0) ||
      (filterStatus === 'graded' && getClassStats(classItem).submitted === classItem.students);
    
    return matchesSearch && matchesFilter;
  });

  if (classesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gradebook</h1>
          <p className="text-gray-600">Manage student grades and assessments</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Search classes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              <SelectItem value="missing">Missing Grades</SelectItem>
              <SelectItem value="graded">Fully Graded</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Classes Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.map((classItem) => {
          const stats = getClassStats(classItem);
          return (
            <Card key={classItem.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg mb-2">{classItem.name}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Students: {stats.totalStudents}</span>
                      <span>Avg: {stats.average}%</span>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {stats.submissionRate}% submitted
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <div>
                      <div className="text-sm font-medium">{stats.submitted}</div>
                      <div className="text-xs text-gray-600">Submitted</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <div>
                      <div className="text-sm font-medium">{stats.missing}</div>
                      <div className="text-xs text-gray-600">Missing</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => setSelectedClass(classItem)}
                    size="sm"
                    variant="outline"
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Award className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleNewGrade(classItem)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Grade
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => exportGrades(classItem)}>
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Class Details Modal */}
      {selectedClass && (
        <Dialog open={true} onOpenChange={() => setSelectedClass(null)}>
          <DialogContent className="max-w-6xl">
            <DialogHeader>
              <DialogTitle>{selectedClass.name} - Grade Details</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Class Stats */}
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{getClassStats(selectedClass).average}%</div>
                    <div className="text-sm text-gray-600">Class Average</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{getClassStats(selectedClass).submitted}</div>
                    <div className="text-sm text-gray-600">Submitted</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{getClassStats(selectedClass).missing}</div>
                    <div className="text-sm text-gray-600">Missing</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{selectedClass.assignments.length}</div>
                    <div className="text-sm text-gray-600">Assignments</div>
                  </CardContent>
                </Card>
              </div>

              {/* Grades Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Assignment</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedClass.grades.map((grade, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{grade.studentName}</TableCell>
                        <TableCell>{grade.assignment}</TableCell>
                        <TableCell>{new Date(grade.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {grade.grade ? (
                            <span className={`font-medium ${
                              grade.grade >= 90 ? 'text-green-600' :
                              grade.grade >= 80 ? 'text-blue-600' :
                              grade.grade >= 70 ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {grade.grade}%
                            </span>
                          ) : (
                            <span className="text-gray-400">Not graded</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            grade.status === 'graded' ? 'default' :
                            grade.status === 'submitted' ? 'secondary' :
                            'destructive'
                          }>
                            {grade.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditGrade(grade, selectedClass)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => handleNewGrade(selectedClass)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Grade
                </Button>
                <Button variant="outline" onClick={() => exportGrades(selectedClass)}>
                  <Download className="w-4 h-4 mr-2" />
                  Export to CSV
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Grade Form Modal */}
      {showGradeForm && (
        <GradeForm
          grade={editingGrade}
          onSave={(gradeData) => saveGradeMutation.mutate(gradeData)}
          onClose={() => {
            setShowGradeForm(false);
            setEditingGrade(null);
          }}
          isSaving={saveGradeMutation.isPending}
        />
      )}
    </div>
  );
}

function GradeForm({ grade, onSave, onClose, isSaving }) {
  const [form, setForm] = useState({
    studentName: grade?.studentName || '',
    studentId: grade?.studentId || '',
    assignment: grade?.assignment || '',
    grade: grade?.grade || '',
    feedback: grade?.feedback || '',
    status: grade?.status || 'draft',
    classId: grade?.classId || '',
    className: grade?.className || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {grade?.id ? 'Edit Grade' : 'Add New Grade'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Student Name *</label>
              <Select value={form.studentName} onValueChange={(value) => setForm({ ...form, studentName: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Alice Johnson">Alice Johnson</SelectItem>
                  <SelectItem value="Bob Smith">Bob Smith</SelectItem>
                  <SelectItem value="Charlie Brown">Charlie Brown</SelectItem>
                  <SelectItem value="Diana Prince">Diana Prince</SelectItem>
                  <SelectItem value="Ethan Hunt">Ethan Hunt</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Grade (%) *</label>
              <Input
                type="number"
                min="0"
                max="100"
                required
                value={form.grade}
                onChange={(e) => setForm({ ...form, grade: e.target.value })}
                placeholder="85"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Assignment *</label>
            <Input
              required
              value={form.assignment}
              onChange={(e) => setForm({ ...form, assignment: e.target.value })}
              placeholder="Platformer Game Project"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Feedback</label>
            <Textarea
              value={form.feedback}
              onChange={(e) => setForm({ ...form, feedback: e.target.value })}
              placeholder="Great work on the game mechanics! Consider adding sound effects for better engagement."
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="graded">Graded</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="missing">Missing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="flex-1">
              {isSaving ? 'Saving...' : 'Save Grade'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}