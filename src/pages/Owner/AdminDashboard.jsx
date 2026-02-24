import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { 
  Users,
  BookOpen,
  Calendar,
  GraduationCap,
  DollarSign,
  Clock,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: students = [] } = useQuery({
    queryKey: ['allStudents'],
    queryFn: () => api.entities.StudentProfile.list(),
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['allPrograms'],
    queryFn: () => api.entities.Program.list(),
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['allSessions'],
    queryFn: () => api.entities.ClassSession.list(),
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['allEnrollments'],
    queryFn: () => api.entities.Enrollment.list(),
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['allBookings'],
    queryFn: () => api.entities.Booking.list(),
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['allProgress'],
    queryFn: () => api.entities.LessonProgress.list(),
  });

  // Calculate stats
  const activeEnrollments = enrollments.filter(e => e.status === 'enrolled').length;
  const completedLessons = progress.filter(p => p.completed).length;
  const upcomingSessions = sessions.filter(s => s.status === 'scheduled').length;
  const totalRevenue = bookings.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + (b.amount || 0), 0);

  // Mock chart data
  const enrollmentData = [
    { name: 'Mon', value: 12 },
    { name: 'Tue', value: 19 },
    { name: 'Wed', value: 15 },
    { name: 'Thu', value: 25 },
    { name: 'Fri', value: 22 },
    { name: 'Sat', value: 30 },
    { name: 'Sun', value: 18 },
  ];

  const recentEnrollments = enrollments
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 5);

  const StatCard = ({ title, value, icon: Icon, change, changeType, color }) => (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
            {change && (
              <div className={`flex items-center gap-1 mt-2 text-sm ${changeType === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {changeType === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {change} from last week
              </div>
            )}
          </div>
          <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">Welcome back, {user?.full_name || 'Admin'}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <StatCard
            title="Total Students"
            value={students.length}
            icon={Users}
            change="+12%"
            changeType="up"
            color="bg-gradient-to-br from-blue-500 to-indigo-600"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <StatCard
            title="Active Enrollments"
            value={activeEnrollments}
            icon={GraduationCap}
            change="+8%"
            changeType="up"
            color="bg-gradient-to-br from-green-500 to-emerald-600"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <StatCard
            title="Upcoming Sessions"
            value={upcomingSessions}
            icon={Calendar}
            color="bg-gradient-to-br from-violet-500 to-purple-600"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <StatCard
            title="Revenue"
            value={`$${(totalRevenue / 100).toFixed(0)}`}
            icon={DollarSign}
            change="+23%"
            changeType="up"
            color="bg-gradient-to-br from-amber-500 to-orange-600"
          />
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Enrollment Trend</CardTitle>
            <Badge variant="secondary">This Week</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={enrollmentData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#6366f1" 
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Lessons Completed</CardTitle>
            <Badge variant="secondary">{completedLessons} Total</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={enrollmentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links & Recent Activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="ghost" asChild className="w-full justify-between hover:bg-indigo-50">
              <Link to={createPageUrl('ProgramsManager')}>
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  Manage Programs
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            </Button>
            <Button variant="ghost" asChild className="w-full justify-between hover:bg-indigo-50">
              <Link to={createPageUrl('ClassSchedule')}>
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  Class Schedule
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            </Button>
            <Button variant="ghost" asChild className="w-full justify-between hover:bg-indigo-50">
              <Link to={createPageUrl('StudentsManager')}>
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-violet-600" />
                  View Students
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            </Button>
            <Button variant="ghost" asChild className="w-full justify-between hover:bg-indigo-50">
              <Link to={createPageUrl('EnrollmentsManager')}>
                <span className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-amber-600" />
                  Enrollments
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            </Button>
            <Button variant="ghost" asChild className="w-full justify-between hover:bg-indigo-50">
              <Link to={createPageUrl('LocationsManager')}>
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  Locations
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            </Button>
            <Button variant="ghost" asChild className="w-full justify-between hover:bg-indigo-50">
              <Link to={createPageUrl('WeeklyScheduleManager')}>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-600" />
                  Weekly Schedule
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Enrollments */}
        <Card className="border-0 shadow-lg lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Enrollments</CardTitle>
            <Button variant="ghost" size="sm" asChild className="text-indigo-600">
              <Link to={createPageUrl('EnrollmentsManager')}>
                View all
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentEnrollments.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <GraduationCap className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                <p>No enrollments yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentEnrollments.map((enrollment) => {
                  const student = students.find(s => s.id === enrollment.studentId);
                  const program = programs.find(p => p.id === enrollment.programId);
                  
                  return (
                    <div key={enrollment.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-medium">
                          {student?.displayName?.[0]?.toUpperCase() || 'S'}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{student?.displayName || 'Student'}</p>
                          <p className="text-sm text-slate-500">{program?.name || 'Program'}</p>
                        </div>
                      </div>
                      <Badge className={enrollment.status === 'enrolled' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}>
                        {enrollment.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}