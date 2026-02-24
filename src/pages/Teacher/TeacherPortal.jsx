import { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Users, BookOpen, BarChart3, Calendar, ArrowRight, Bell, Code, Trophy, Edit, FileCheck } from 'lucide-react';
import { format } from 'date-fns';

function StatCard({ title, value, icon: Icon, change, gradient }) {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover-lift">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-700">{title}</CardTitle>
        <div className={`w-10 h-10 flex items-center justify-center rounded-xl text-white ${gradient}`}>
          <Icon className="w-5 h-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-slate-900 mb-1">{value}</div>
        <p className="text-xs text-slate-600">{change}</p>
      </CardContent>
    </Card>
  );
}

export default function TeacherPortal() {
  const [user, setUser] = useState(null);

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
    queryKey: ['students'],
    queryFn: () => api.entities.StudentProfile.list(),
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments'],
    queryFn: () => api.entities.Enrollment.list(),
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => api.entities.ClassSession.list(),
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['programs'],
    queryFn: () => api.entities.Program.list(),
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['progress'],
    queryFn: () => api.entities.LessonProgress.list('-updated_date'),
  });

  const { data: reports = [] } = useQuery({
    queryKey: ['reports'],
    queryFn: () => api.entities.SessionReport.list('-created_date'),
  });

  const activeStudents = students.filter(s => 
    enrollments.some(e => e.studentId === s.id && e.status === 'enrolled')
  ).length;

  const upcomingSessions = sessions
    .filter(s => new Date(s.startDate) >= new Date() && s.status === 'scheduled')
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    .slice(0, 5);

  const recentProgress = progress.slice(0, 5);

  const todaySessions = sessions.filter(s => {
    const sessionDate = new Date(s.startDate);
    const today = new Date();
    return sessionDate.toDateString() === today.toDateString();
  });

  if (!user) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3 mx-auto"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <style>{`
        .hover-lift {
          transition: all 0.3s ease;
        }
        .hover-lift:hover {
          transform: translateY(-4px);
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Instructor Dashboard</h1>
          <p className="text-slate-600 text-lg">Welcome back, {user?.full_name}. Here's your summary for today.</p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard 
            title="Active Students" 
            value={activeStudents} 
            icon={Users} 
            change={`${students.length} total students`}
            gradient="bg-gradient-to-r from-indigo-500 to-violet-600" 
          />
          <StatCard 
            title="Active Programs" 
            value={programs.filter(p => p.active).length} 
            icon={BookOpen} 
            change={`${programs.length} total programs`}
            gradient="bg-gradient-to-r from-emerald-500 to-teal-600" 
          />
          <StatCard 
            title="Upcoming Sessions" 
            value={upcomingSessions.length} 
            icon={Calendar} 
            change={`${todaySessions.length} today`}
            gradient="bg-gradient-to-r from-amber-500 to-orange-600" 
          />
          <StatCard 
            title="Reports Generated" 
            value={reports.length} 
            icon={BarChart3} 
            change="All time"
            gradient="bg-gradient-to-r from-pink-500 to-rose-600" 
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="hover-lift rounded-2xl border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Users className="w-5 h-5 text-indigo-600" />
                  Recent Student Progress
                </CardTitle>
                <Link to={createPageUrl("StudentsManager")}>
                  <Button variant="ghost" size="sm" className="text-indigo-600 hover:bg-indigo-50">
                    View All <ArrowRight className="w-4 h-4 ml-2"/>
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentProgress.length > 0 ? recentProgress.map(p => {
                    const student = students.find(s => s.id === p.studentId);
                    const progressPercent = p.totalSteps > 0 ? Math.round((p.completedSteps?.length || 0) / p.totalSteps * 100) : 0;
                    
                    return student ? (
                      <div key={p.id} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl border border-indigo-100">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-semibold">
                            {student.displayName?.charAt(0) || 'S'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-grow">
                          <p className="font-semibold text-slate-900">{student.displayName}</p>
                          <p className="text-sm text-slate-600">Age {student.age}</p>
                        </div>
                        <div className="w-1/4">
                          <Progress value={progressPercent} className="h-2" />
                          <p className="text-xs text-slate-600 mt-1">{progressPercent}% complete</p>
                        </div>
                      </div>
                    ) : null;
                  }) : (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600">No student progress yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="hover-lift rounded-2xl border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Bell className="w-5 h-5 text-emerald-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Link to={createPageUrl("ClassSchedule")}>
                    <Button className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl font-semibold">
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Class
                    </Button>
                  </Link>
                  <Link to={createPageUrl("StudentsManager")}>
                    <Button variant="outline" className="w-full border-emerald-500 text-emerald-700 hover:bg-emerald-50 rounded-xl">
                      <Users className="w-4 h-4 mr-2" />
                      View Students
                    </Button>
                  </Link>
                  <Link to={createPageUrl("Reports")}>
                    <Button variant="outline" className="w-full border-amber-500 text-amber-700 hover:bg-amber-50 rounded-xl">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Reports
                    </Button>
                  </Link>
                  <Link to="/Gradebook">
                    <Button variant="outline" className="w-full border-blue-500 text-blue-700 hover:bg-blue-50 rounded-xl">
                      <FileCheck className="w-4 h-4 mr-2" />
                      Gradebook
                    </Button>
                  </Link>
                  <Link to="/AssignmentManager">
                    <Button variant="outline" className="w-full border-purple-500 text-purple-700 hover:bg-purple-50 rounded-xl">
                      <Edit className="w-4 h-4 mr-2" />
                      Assignments
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="hover-lift rounded-2xl border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  Upcoming Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingSessions.length > 0 ? upcomingSessions.map((session) => {
                    const program = programs.find(p => p.id === session.programId);
                    return (
                      <div key={session.id} className="flex items-start gap-3 p-3 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                          {format(new Date(session.startDate), 'd')}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-slate-900">{session.name}</p>
                          <p className="text-xs text-slate-600">{program?.name}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {format(new Date(session.startDate), 'MMM d, h:mm a')}
                          </p>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600 text-sm">No upcoming sessions</p>
                    </div>
                  )}
                </div>
                <Link to={createPageUrl("ClassSchedule")}>
                  <Button variant="outline" className="w-full mt-4 border-indigo-200 text-indigo-700 hover:bg-indigo-50 rounded-xl">
                    <Calendar className="w-4 h-4 mr-2" /> View Full Schedule
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover-lift rounded-2xl border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Trophy className="w-5 h-5 text-amber-600" />
                  Programs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {programs.slice(0, 4).map(program => (
                    <div key={program.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm text-slate-900">{program.name}</p>
                          <p className="text-xs text-slate-600">Ages {program.age_min}-{program.age_max}</p>
                        </div>
                        <Code className="w-5 h-5 text-indigo-500" />
                      </div>
                    </div>
                  ))}
                </div>
                <Link to={createPageUrl("ProgramsManager")}>
                  <Button variant="outline" className="w-full mt-4 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl">
                    View All Programs
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}