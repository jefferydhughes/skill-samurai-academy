import React, { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Calendar,
  Clock,
  TrendingUp,
  Mail,
  Sparkles,
  BarChart3,
  Target
} from 'lucide-react';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProgressChart from '../../components/analytics/ProgressChart';
import LearningGapsAnalysis from '../../components/analytics/LearningGapsAnalysis';
import PersonalizedFeedback from '../../components/analytics/PersonalizedFeedback';

const templateIcons = {
  standard: '📝',
  exploration: '🚗',
  persistence: '💪',
  achievement: '🎉',
  gentle_concern: '💭'
};

export default function ParentReports() {
  const [user, setUser] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

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

  const { data: students = [] } = useQuery({
    queryKey: ['students', user?.id],
    queryFn: () => api.entities.StudentProfile.filter({ userId: user?.id }),
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (students.length > 0 && !selectedStudent) {
      setSelectedStudent(students[0].id);
    }
  }, [students, selectedStudent]);

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['companionSessions', selectedStudent],
    queryFn: async () => {
      const allSessions = await api.entities.CompanionSession.filter({ 
        studentId: selectedStudent 
      });
      // Sort by most recent
      return allSessions
        .filter(s => s.endTime && s.parentSummary)
        .sort((a, b) => new Date(b.endTime) - new Date(a.endTime));
    },
    enabled: !!selectedStudent,
  });

  const currentStudent = students.find(s => s.id === selectedStudent);

  // Weekly stats
  const weekSessions = sessions.filter(s => {
    const sessionDate = new Date(s.endTime);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return sessionDate > weekAgo;
  });

  const totalTime = sessions.reduce((acc, s) => {
    const start = new Date(s.startTime);
    const end = new Date(s.endTime);
    return acc + Math.floor((end - start) / 60000);
  }, 0);

  const allConcepts = [...new Set(sessions.flatMap(s => s.conceptsTouched || []))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Parent Reports</h1>
          <p className="text-slate-600 mt-1">Track your child's coding progress</p>
        </div>
        {students.length > 1 && (
          <Select value={selectedStudent || ''} onValueChange={setSelectedStudent}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select student" />
            </SelectTrigger>
            <SelectContent>
              {students.map(student => (
                <SelectItem key={student.id} value={student.id}>
                  {student.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Stats Overview */}
      {currentStudent && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{sessions.length}</div>
                  <div className="text-sm text-slate-600">Total Sessions</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{totalTime}</div>
                  <div className="text-sm text-slate-600">Total Minutes</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{weekSessions.length}</div>
                  <div className="text-sm text-slate-600">This Week</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{allConcepts.length}</div>
                  <div className="text-sm text-slate-600">Concepts Explored</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Tabs */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-500">Loading reports...</div>
      ) : sessions.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="text-center py-12">
            <Mail className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Data Yet</h3>
            <p className="text-slate-600">
              Analytics will appear here after {currentStudent?.displayName} completes coding sessions
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl bg-slate-100">
            <TabsTrigger value="overview">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="gaps">
              <Target className="w-4 h-4 mr-2" />
              Learning Gaps
            </TabsTrigger>
            <TabsTrigger value="feedback">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Report
            </TabsTrigger>
            <TabsTrigger value="sessions">
              <Mail className="w-4 h-4 mr-2" />
              Sessions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ProgressChart sessions={sessions} type="timeline" />
              <ProgressChart sessions={sessions} type="weekly" />
            </div>
            <ProgressChart sessions={sessions} type="concepts" />
          </TabsContent>

          <TabsContent value="gaps">
            <LearningGapsAnalysis sessions={sessions} />
          </TabsContent>

          <TabsContent value="feedback">
            {currentStudent && (
              <PersonalizedFeedback 
                student={currentStudent} 
                sessions={sessions}
              />
            )}
          </TabsContent>

          <TabsContent value="sessions">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Detailed Session Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {sessions.map((session) => (
                      <Card key={session.id} className="border border-slate-200">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="text-3xl">
                                {templateIcons[session.templateUsed] || '📝'}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900">
                                  {format(new Date(session.endTime), 'MMMM d, yyyy')}
                                </div>
                                <div className="text-sm text-slate-500">
                                  {format(new Date(session.endTime), 'h:mm a')}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {Math.floor((new Date(session.endTime) - new Date(session.startTime)) / 60000)} min
                              </Badge>
                              {session.explorationMode && (
                                <Badge className="bg-purple-100 text-purple-700 text-xs">
                                  Exploration
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="prose prose-sm max-w-none">
                            <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                              {session.parentSummary}
                            </div>
                          </div>

                          {session.conceptsTouched?.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-slate-200">
                              <div className="text-xs text-slate-500 mb-2">Concepts Explored:</div>
                              <div className="flex flex-wrap gap-2">
                                {session.conceptsTouched.map((concept, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {concept.replace(/_/g, ' ')}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}