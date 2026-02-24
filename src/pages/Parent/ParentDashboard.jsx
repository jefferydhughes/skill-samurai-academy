import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { 
  Calendar,
  Clock,
  Users,
  BookOpen,
  TrendingUp,
  MessageCircle,
  Bell,
  Award,
  ArrowRight,
  Activity,
  AlertCircle,
  Receipt,
  User,
  Download,
  Edit,
  Plus,
  Trash2,
  Mail,
  MapPin,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import MessagingPanel from '@/components/parent/MessagingPanel';

export default function ParentDashboard() {
  const [user, setUser] = useState(null);
  const [showMessaging, setShowMessaging] = useState(false);

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

  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings', user?.id],
    queryFn: () => api.entities.Booking.filter({ userId: user?.id }),
    enabled: !!user?.id,
  });

  const { data: trialBookings = [] } = useQuery({
    queryKey: ['trialBookings', user?.email],
    queryFn: () => api.entities.TrialBooking.filter({ parent_email: user?.email }),
    enabled: !!user?.email,
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['progress'],
    queryFn: () => api.entities.LessonProgress.list(),
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['allSessions'],
    queryFn: () => api.entities.ClassSession.list(),
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['programs'],
    queryFn: () => api.entities.Program.list(),
  });

  const { data: announcements = [] } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => api.entities.Announcement?.list() || [],
  });

  const { data: familyData = [] } = useQuery({
    queryKey: ['family', user?.id],
    queryFn: () => api.entities.Family?.filter({ primary_contact_email: user?.email }) || [],
    enabled: !!user?.email,
  });

  const { data: studentRecords = [] } = useQuery({
    queryKey: ['studentRecords', user?.id],
    queryFn: () => api.entities.Student?.filter({ parent_id: user?.id }) || [],
    enabled: !!user?.id,
  });

  // Calculate stats
  const upcomingClasses = bookings.filter(b => {
    const session = sessions.find(s => s.id === b.classSessionId);
    return session && new Date(session.endDate) >= new Date();
  });

  const upcomingTrials = trialBookings.filter(t => 
    new Date(t.trial_datetime) >= new Date() && 
    !['no_show', 'converted', 'lost'].includes(t.pipeline_stage)
  );

  const totalLessons = progress.filter(p => 
    students.some(s => s.id === p.studentId) && p.completed
  ).length;

  const weekProgress = progress.filter(p => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return students.some(s => s.id === p.studentId) && 
           p.completedAt && 
           new Date(p.completedAt) > weekAgo;
  }).length;

  const unreadMessages = 0; // TODO: Connect to actual messaging system

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back, {user?.full_name?.split(' ')[0] || 'Parent'}! 👋
          </h1>
          <p className="text-slate-600 mt-1">Here's what's happening with your children's learning</p>
        </div>
        <Button 
          onClick={() => setShowMessaging(true)}
          className="relative bg-indigo-600 hover:bg-indigo-700"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Messages
          {unreadMessages > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white px-2 py-0.5 text-xs">
              {unreadMessages}
            </Badge>
          )}
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900">{students.length}</div>
                  <div className="text-sm text-slate-600">Children</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900">
                    {upcomingClasses.length + upcomingTrials.length}
                  </div>
                  <div className="text-sm text-slate-600">Upcoming</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-amber-600" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900">{totalLessons}</div>
                  <div className="text-sm text-slate-600">Lessons Done</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-violet-600" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900">+{weekProgress}</div>
                  <div className="text-sm text-slate-600">This Week</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Announcements */}
      {announcements.length > 0 && (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-indigo-50 to-violet-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 mb-2">Latest Announcement</h3>
                <p className="text-slate-700">{announcements[0]?.message}</p>
                {announcements[0]?.created_date && (
                  <p className="text-sm text-slate-500 mt-2">
                    {format(new Date(announcements[0].created_date), 'MMM d, yyyy')}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="children" className="space-y-6">
        <TabsList className="bg-slate-100 p-1 rounded-xl grid grid-cols-5 w-full max-w-3xl">
          <TabsTrigger value="children" className="rounded-lg">
            <Users className="w-4 h-4 mr-2" />
            My Children
          </TabsTrigger>
          <TabsTrigger value="schedule" className="rounded-lg">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="progress" className="rounded-lg">
            <Activity className="w-4 h-4 mr-2" />
            Progress
          </TabsTrigger>
          <TabsTrigger value="invoices" className="rounded-lg">
            <Receipt className="w-4 h-4 mr-2" />
            Invoices
          </TabsTrigger>
          <TabsTrigger value="profile" className="rounded-lg">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
        </TabsList>

        {/* Children Tab */}
        <TabsContent value="children" className="space-y-4">
          {students.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="text-center py-12">
                <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No children added yet</h3>
                <p className="text-slate-600 mb-6">Add your first child to get started</p>
                <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
                  <Link to={createPageUrl('MyChildren')}>Add Child</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {students.map((student, index) => {
                const studentProgress = progress.filter(p => p.studentId === student.id);
                const completedLessons = studentProgress.filter(p => p.completed).length;
                const totalStudentLessons = studentProgress.length;
                const progressPercentage = totalStudentLessons > 0 
                  ? Math.round((completedLessons / totalStudentLessons) * 100) 
                  : 0;

                return (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl">{student.displayName}</CardTitle>
                          <Badge variant="secondary">Age {student.age}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-slate-600">Overall Progress</span>
                            <span className="font-semibold text-slate-900">{progressPercentage}%</span>
                          </div>
                          <Progress value={progressPercentage} className="h-2" />
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-center pt-3 border-t">
                          <div>
                            <div className="text-2xl font-bold text-indigo-600">{completedLessons}</div>
                            <div className="text-xs text-slate-600">Lessons</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-green-600">0</div>
                            <div className="text-xs text-slate-600">Badges</div>
                          </div>
                        </div>

                        <Button variant="outline" className="w-full" asChild>
                          <Link to={createPageUrl('ParentReports')}>
                            View Full Report
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}

          <Button asChild variant="outline" className="w-full md:w-auto">
            <Link to={createPageUrl('MyChildren')}>
              <Users className="w-4 h-4 mr-2" />
              Manage Children
            </Link>
          </Button>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Upcoming Classes & Trials
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingClasses.length === 0 && upcomingTrials.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p>No upcoming classes scheduled</p>
                  <Button asChild className="mt-4" variant="outline">
                    <Link to={createPageUrl('ProgramsBrowser')}>Browse Programs</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingTrials.map(trial => (
                    <div key={trial.id} className="p-4 border rounded-lg bg-cyan-50 border-cyan-200">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold text-slate-900">Free Trial Session</div>
                          <div className="text-sm text-slate-600 mt-1">
                            {trial.student_name}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-500 mt-2">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(trial.trial_datetime), 'MMM d, yyyy')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {format(new Date(trial.trial_datetime), 'h:mm a')}
                            </span>
                          </div>
                        </div>
                        <Badge className="bg-cyan-600">Trial</Badge>
                      </div>
                    </div>
                  ))}

                  {upcomingClasses.map(booking => {
                    const session = sessions.find(s => s.id === booking.classSessionId);
                    const program = programs.find(p => p.id === booking.programId);
                    
                    return (
                      <div key={booking.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-semibold text-slate-900">
                              {program?.name || 'Program'}
                            </div>
                            {session && (
                              <div className="flex items-center gap-4 text-sm text-slate-500 mt-2">
                                {session.startDate && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {format(new Date(session.startDate), 'MMM d')}
                                  </span>
                                )}
                                {session.schedule?.startTime && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {session.schedule.startTime}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <Badge className="bg-green-600">Active</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Button asChild variant="outline">
            <Link to={createPageUrl('MyBookings')}>
              View All Bookings
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-4">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Learning Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  Add children to track their progress
                </div>
              ) : (
                <div className="space-y-6">
                  {students.map(student => {
                    const studentProgress = progress.filter(p => p.studentId === student.id);
                    const recentProgress = studentProgress
                      .filter(p => p.completedAt)
                      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
                      .slice(0, 3);

                    return (
                      <div key={student.id} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-slate-900">{student.displayName}</h3>
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={createPageUrl('ParentReports')}>
                              Full Report
                              <ArrowRight className="w-4 h-4 ml-1" />
                            </Link>
                          </Button>
                        </div>

                        {recentProgress.length === 0 ? (
                          <p className="text-sm text-slate-500">No recent activity</p>
                        ) : (
                          <div className="space-y-2">
                            {recentProgress.map(p => (
                              <div key={p.id} className="flex items-center gap-3 text-sm p-3 bg-slate-50 rounded-lg">
                                <Award className="w-5 h-5 text-green-600" />
                                <div className="flex-1">
                                  <div className="font-medium text-slate-900">Lesson Completed</div>
                                  {p.completedAt && (
                                    <div className="text-slate-500">
                                      {format(new Date(p.completedAt), 'MMM d, yyyy')}
                                    </div>
                                  )}
                                </div>
                                {p.score && (
                                  <Badge variant="secondary">{p.score}%</Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Button asChild variant="outline">
            <Link to={createPageUrl('ParentReports')}>
              View Detailed Reports
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-4">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Payment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bookings.filter(b => b.paymentStatus === 'paid').length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p>No payment records found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.filter(b => b.paymentStatus === 'paid').map(booking => {
                    const program = programs.find(p => p.id === booking.programId);
                    
                    return (
                      <div key={booking.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-slate-900">
                              {program?.name || booking.programName || 'Program'}
                            </div>
                            <div className="text-sm text-slate-600 mt-1">
                              Invoice #{booking.id?.slice(-8).toUpperCase()}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              {booking.created_date && format(new Date(booking.created_date), 'MMM d, yyyy')}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-green-600">
                              ${((booking.amount || 0) / 100).toFixed(2)}
                            </div>
                            <Badge className="mt-2 bg-green-600">Paid</Badge>
                            <Button variant="ghost" size="sm" className="mt-2 w-full">
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          {/* Participants Section */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Participants</CardTitle>
                <Button asChild size="sm" variant="outline">
                  <Link to={createPageUrl('MyChildren')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add New
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {students.map(student => (
                  <div key={student.id} className="border rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                    <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-3">
                      <Users className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div className="font-semibold text-slate-900">{student.displayName}</div>
                    <div className="text-sm text-slate-500">Grade: {student.gradeRange}</div>
                    <div className="flex justify-center gap-2 mt-3">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={createPageUrl('MyChildren')}>
                          <Edit className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Parents/Guardians Section */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Parents/Guardians</CardTitle>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900">{user?.full_name}</div>
                      <Badge variant="secondary" className="mt-1">Primary</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Mail className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <User className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Shield className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MapPin className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Authorized Pickups */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Authorized Pickups</CardTitle>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500 text-center py-8">
                No authorized pickups added yet
              </p>
            </CardContent>
          </Card>

          {/* Emergency Contacts & Insurance */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Emergency Contacts</CardTitle>
                  <Button size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {studentRecords.filter(s => s.emergency_contact_name).map(student => (
                  <div key={student.id} className="p-3 border rounded-lg mb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-slate-900">{student.emergency_contact_name}</div>
                        <div className="text-sm text-slate-600">{student.emergency_contact_phone}</div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {studentRecords.filter(s => s.emergency_contact_name).length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">No emergency contacts</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Insurance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-900">Company name:</label>
                    <Input className="mt-1" placeholder="Insurance company" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-900">Policy number:</label>
                    <Input className="mt-1" placeholder="Policy number" />
                  </div>
                  <Button className="w-full" variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Update Insurance
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Messaging Panel */}
      {showMessaging && (
        <MessagingPanel
          isOpen={showMessaging}
          onClose={() => setShowMessaging(false)}
          user={user}
        />
      )}
    </div>
  );
}