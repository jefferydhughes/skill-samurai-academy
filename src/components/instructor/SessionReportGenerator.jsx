import { useState } from 'react';
import { api } from '@/api/apiClient';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { FileText, Send, Sparkles } from 'lucide-react';

export default function SessionReportGenerator({ session }) {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [report, setReport] = useState({
    achievements: '',
    nextSteps: '',
    instructorNotes: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: enrollments = [] } = useQuery({
    queryKey: ['sessionEnrollments', session.id],
    queryFn: () => api.entities.Enrollment.filter({ classSessionId: session.id }),
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => api.entities.StudentProfile.list(),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.entities.User.list(),
  });

  const generateReportMutation = useMutation({
    mutationFn: async () => {
      const student = students.find(s => s.id === selectedStudent);
      
      // Create session report
      const reportData = await api.entities.SessionReport.create({
        student_id: student.id,
        session_date: session.startDate,
        duration_minutes: session.schedule?.duration || 60,
        achievements: report.achievements.split('\n').filter(Boolean),
        next_steps: report.nextSteps.split('\n').filter(Boolean),
        instructor_notes: report.instructorNotes,
        progress_summary: `Session report for ${session.name}`,
        parent_email_sent: false,
      });

      // Send email to parent
      const parent = users.find(u => u.id === student.userId);
      if (parent) {
        await api.integrations.Core.SendEmail({
          to: parent.email,
          from_name: 'Skill Samurai',
          subject: `Session Report for ${student.displayName}`,
          body: `Hi ${parent.full_name},

Here's the session report for ${student.displayName}:

Class: ${session.name}
Date: ${new Date(session.startDate).toLocaleDateString()}

🎯 Achievements:
${report.achievements}

📝 Next Steps:
${report.nextSteps}

💬 Instructor Notes:
${report.instructorNotes}

Keep up the great work!

- Your Instructor`
        });

        // Mark email as sent
        await api.entities.SessionReport.update(reportData.id, {
          parent_email_sent: true,
        });
      }

      return student;
    },
    onSuccess: (student) => {
      alert(`Report sent to ${student.displayName}'s parent!`);
      setSelectedStudent(null);
      setReport({ achievements: '', nextSteps: '', instructorNotes: '' });
    },
  });

  const generateWithAI = async () => {
    if (!selectedStudent) return;
    
    setIsGenerating(true);
    try {
      const student = students.find(s => s.id === selectedStudent);
      const response = await api.integrations.Core.InvokeLLM({
        prompt: `Generate a positive and constructive session report for a student named ${student.displayName}, age ${student.age}, in a coding class called "${session.name}". 

Include:
1. 3-4 specific achievements (things they learned or accomplished)
2. 2-3 next steps for continued learning
3. Brief encouraging instructor notes

Keep it concise, positive, and age-appropriate.`,
        response_json_schema: {
          type: 'object',
          properties: {
            achievements: { type: 'string' },
            nextSteps: { type: 'string' },
            instructorNotes: { type: 'string' }
          }
        }
      });

      setReport({
        achievements: response.achievements,
        nextSteps: response.nextSteps,
        instructorNotes: response.instructorNotes,
      });
    } catch (error) {
      alert('Failed to generate AI report');
    }
    setIsGenerating(false);
  };

  const enrolledStudents = enrollments.map(e => 
    students.find(s => s.id === e.studentId)
  ).filter(Boolean);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Student Selector */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg">Select Student</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {enrolledStudents.map(student => (
              <button
                key={student.id}
                onClick={() => setSelectedStudent(student.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                  selectedStudent === student.id
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-900'
                }`}
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className={selectedStudent === student.id ? 'bg-white/20' : 'bg-indigo-100'}>
                    {student.displayName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="font-semibold text-sm">{student.displayName}</p>
                  <p className={`text-xs ${selectedStudent === student.id ? 'text-white/70' : 'text-slate-600'}`}>
                    Age {student.age}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Generator */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Session Report
            </CardTitle>
            {selectedStudent && (
              <Button
                variant="outline"
                onClick={generateWithAI}
                disabled={isGenerating}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {isGenerating ? 'Generating...' : 'Generate with AI'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {selectedStudent ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Achievements</Label>
                <Textarea
                  value={report.achievements}
                  onChange={(e) => setReport(prev => ({ ...prev, achievements: e.target.value }))}
                  placeholder="What did the student accomplish today? (one per line)"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Next Steps</Label>
                <Textarea
                  value={report.nextSteps}
                  onChange={(e) => setReport(prev => ({ ...prev, nextSteps: e.target.value }))}
                  placeholder="What should the student work on next? (one per line)"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Instructor Notes</Label>
                <Textarea
                  value={report.instructorNotes}
                  onChange={(e) => setReport(prev => ({ ...prev, instructorNotes: e.target.value }))}
                  placeholder="Any additional notes for the parent..."
                  rows={3}
                />
              </div>

              <Button
                onClick={() => generateReportMutation.mutate()}
                disabled={generateReportMutation.isPending || !report.achievements}
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600"
              >
                <Send className="w-4 h-4 mr-2" />
                {generateReportMutation.isPending ? 'Sending...' : 'Generate & Send Report'}
              </Button>
            </div>
          ) : (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">Select a student to create a report</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}