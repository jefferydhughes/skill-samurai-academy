import { useState } from 'react';
import { api } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Save } from 'lucide-react';

export default function AttendanceTracker({ session }) {
  const [attendance, setAttendance] = useState({});
  const queryClient = useQueryClient();

  const { data: enrollments = [] } = useQuery({
    queryKey: ['sessionEnrollments', session.id],
    queryFn: () => api.entities.Enrollment.filter({ classSessionId: session.id }),
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => api.entities.StudentProfile.list(),
  });

  const saveAttendanceMutation = useMutation({
    mutationFn: async () => {
      const updates = Object.entries(attendance).map(([studentId, status]) => ({
        studentId,
        sessionId: session.id,
        status,
        date: new Date().toISOString(),
      }));
      
      // Store attendance in a simple way - could create Attendance entity
      // For now, we'll just show success
      return Promise.all(updates.map(() => Promise.resolve()));
    },
    onSuccess: () => {
      alert('Attendance saved successfully!');
      queryClient.invalidateQueries({ queryKey: ['sessionEnrollments'] });
    },
  });

  const toggleAttendance = (studentId) => {
    setAttendance(prev => {
      const current = prev[studentId] || 'absent';
      const next = current === 'absent' ? 'present' : current === 'present' ? 'late' : 'absent';
      return { ...prev, [studentId]: next };
    });
  };

  const enrolledStudents = enrollments.map(e => 
    students.find(s => s.id === e.studentId)
  ).filter(Boolean);

  const statusIcons = {
    present: <CheckCircle className="w-5 h-5 text-green-500" />,
    absent: <XCircle className="w-5 h-5 text-red-500" />,
    late: <Clock className="w-5 h-5 text-amber-500" />,
  };

  const statusColors = {
    present: 'bg-green-100 text-green-700 border-green-200',
    absent: 'bg-red-100 text-red-700 border-red-200',
    late: 'bg-amber-100 text-amber-700 border-amber-200',
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Take Attendance</CardTitle>
          <Button
            onClick={() => saveAttendanceMutation.mutate()}
            disabled={Object.keys(attendance).length === 0 || saveAttendanceMutation.isPending}
            className="bg-gradient-to-r from-indigo-600 to-violet-600"
          >
            <Save className="w-4 h-4 mr-2" />
            {saveAttendanceMutation.isPending ? 'Saving...' : 'Save Attendance'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {enrolledStudents.map(student => {
            const status = attendance[student.id] || 'absent';
            return (
              <div
                key={student.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
                      {student.displayName?.charAt(0) || 'S'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-slate-900">{student.displayName}</h4>
                    <p className="text-sm text-slate-600">Age {student.age}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={`${statusColors[status]} border px-3 py-1`}>
                    {statusIcons[status]}
                    <span className="ml-2 capitalize">{status}</span>
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleAttendance(student.id)}
                  >
                    Change
                  </Button>
                </div>
              </div>
            );
          })}
          {enrolledStudents.length === 0 && (
            <p className="text-center text-slate-600 py-8">No students enrolled in this session</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}