import { useState } from 'react';
import { api } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Send, MessageSquare } from 'lucide-react';

export default function ClassAnnouncements({ session }) {
  const [announcement, setAnnouncement] = useState({
    subject: '',
    message: '',
  });
  const queryClient = useQueryClient();

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

  const sendAnnouncementMutation = useMutation({
    mutationFn: async () => {
      const enrolledStudents = enrollments.map(e => 
        students.find(s => s.id === e.studentId)
      ).filter(Boolean);

      // Get parent emails
      const parentUserIds = [...new Set(enrolledStudents.map(s => s.userId))];
      const parents = users.filter(u => parentUserIds.includes(u.id));

      // Send emails to all parents
      await Promise.all(parents.map(parent => 
        api.integrations.Core.SendEmail({
          to: parent.email,
          from_name: 'Skill Samurai',
          subject: `Class Announcement: ${announcement.subject}`,
          body: `Hi ${parent.full_name},

${announcement.message}

Class: ${session.name}
Date: ${new Date(session.startDate).toLocaleDateString()}

- Your Instructor`
        })
      ));

      return parents.length;
    },
    onSuccess: (count) => {
      alert(`Announcement sent to ${count} parent(s)!`);
      setAnnouncement({ subject: '', message: '' });
    },
  });

  const handleSend = () => {
    if (!announcement.subject || !announcement.message) {
      alert('Please fill in both subject and message');
      return;
    }
    sendAnnouncementMutation.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-600" />
          Send Class-Wide Announcement
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Subject</Label>
          <Input
            value={announcement.subject}
            onChange={(e) => setAnnouncement(prev => ({ ...prev, subject: e.target.value }))}
            placeholder="e.g., Important: Class Rescheduled"
          />
        </div>

        <div className="space-y-2">
          <Label>Message</Label>
          <Textarea
            value={announcement.message}
            onChange={(e) => setAnnouncement(prev => ({ ...prev, message: e.target.value }))}
            placeholder="Write your announcement here..."
            rows={8}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg border border-indigo-100">
          <div>
            <p className="font-semibold text-slate-900">Recipients</p>
            <p className="text-sm text-slate-600">
              {enrollments.length} student(s) and their parents will receive this announcement
            </p>
          </div>
          <Button
            onClick={handleSend}
            disabled={sendAnnouncementMutation.isPending}
            className="bg-gradient-to-r from-indigo-600 to-violet-600"
          >
            <Send className="w-4 h-4 mr-2" />
            {sendAnnouncementMutation.isPending ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}