import { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Users, MessageSquare, FileText, Calendar } from 'lucide-react';
import AttendanceTracker from '@/components/instructor/AttendanceTracker';
import ClassAnnouncements from '@/components/instructor/ClassAnnouncements';
import SessionReportGenerator from '@/components/instructor/SessionReportGenerator';

export default function ClassManagement() {
  const [user, setUser] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await api.auth.me();
      setUser(userData);
    } catch (e) {
      api.auth.redirectToLogin();
    }
  };

  const { data: sessions = [] } = useQuery({
    queryKey: ['instructorSessions'],
    queryFn: () => api.entities.ClassSession.list('-startDate'),
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['programs'],
    queryFn: () => api.entities.Program.list(),
  });

  const upcomingSessions = sessions.filter(s => 
    new Date(s.startDate) >= new Date() && s.status === 'scheduled'
  ).slice(0, 10);

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Class Management</h1>
          <p className="text-slate-600">Manage attendance, announcements, and reports</p>
        </header>

        {/* Session Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              Select a Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingSessions.map(session => {
                const program = programs.find(p => p.id === session.programId);
                return (
                  <button
                    key={session.id}
                    onClick={() => setSelectedSession(session)}
                    className={`p-4 rounded-xl text-left transition-all ${
                      selectedSession?.id === session.id
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-900'
                    }`}
                  >
                    <h3 className="font-semibold mb-1">{session.name}</h3>
                    <p className={`text-sm ${selectedSession?.id === session.id ? 'text-white/80' : 'text-slate-600'}`}>
                      {program?.name}
                    </p>
                    <p className={`text-xs mt-2 ${selectedSession?.id === session.id ? 'text-white/70' : 'text-slate-500'}`}>
                      {new Date(session.startDate).toLocaleDateString()}
                    </p>
                  </button>
                );
              })}
            </div>
            {upcomingSessions.length === 0 && (
              <p className="text-center text-slate-600 py-8">No upcoming sessions</p>
            )}
          </CardContent>
        </Card>

        {selectedSession && (
          <Tabs defaultValue="attendance" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="attendance" className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Attendance
              </TabsTrigger>
              <TabsTrigger value="announcements" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Announcements
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Reports
              </TabsTrigger>
            </TabsList>

            <TabsContent value="attendance">
              <AttendanceTracker session={selectedSession} />
            </TabsContent>

            <TabsContent value="announcements">
              <ClassAnnouncements session={selectedSession} />
            </TabsContent>

            <TabsContent value="reports">
              <SessionReportGenerator session={selectedSession} />
            </TabsContent>
          </Tabs>
        )}

        {!selectedSession && (
          <Card>
            <CardContent className="text-center py-16">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Select a Session</h3>
              <p className="text-slate-600">Choose a session above to manage attendance, send announcements, or generate reports</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}