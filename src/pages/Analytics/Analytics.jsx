import React, { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Users,
  BookOpen,
  GraduationCap,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { subDays, format, startOfMonth, endOfMonth } from 'date-fns';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export default function Analytics() {
  const [user, setUser] = useState(null);
  const [showTrackingSettings, setShowTrackingSettings] = useState(false);
  const [trackingConfig, setTrackingConfig] = useState({
    google_analytics_id: '',
    facebook_pixel_id: '',
    google_ads_account_id: ''
  });
  const queryClient = useQueryClient();

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

  const { data: progress = [] } = useQuery({
    queryKey: ['progress'],
    queryFn: () => api.entities.LessonProgress.list(),
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => api.entities.Booking.list(),
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['programs'],
    queryFn: () => api.entities.Program.list(),
  });

  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const locs = await api.entities.Location.list();
      if (locs.length > 0 && locs[0]) {
        setTrackingConfig({
          google_analytics_id: locs[0].google_analytics_id || '',
          facebook_pixel_id: locs[0].facebook_pixel_id || '',
          google_ads_account_id: locs[0].google_ads_account_id || ''
        });
      }
      return locs;
    },
  });

  const updateTrackingMutation = useMutation({
    mutationFn: async (data) => {
      if (locations.length > 0) {
        return await api.entities.Location.update(locations[0].id, data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['locations']);
      setShowTrackingSettings(false);
    },
  });

  const handleSaveTracking = () => {
    updateTrackingMutation.mutate(trackingConfig);
  };

  // Calculate metrics
  const activeEnrollments = enrollments.filter(e => e.status === 'enrolled').length;
  const completedLessons = progress.filter(p => p.completed).length;
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.amount || 0), 0) / 100;
  
  const lastMonthEnrollments = enrollments.filter(e => {
    const created = new Date(e.created_date);
    return created >= subDays(new Date(), 30);
  }).length;

  const previousMonthEnrollments = enrollments.filter(e => {
    const created = new Date(e.created_date);
    return created >= subDays(new Date(), 60) && created < subDays(new Date(), 30);
  }).length;

  const enrollmentGrowth = previousMonthEnrollments > 0
    ? ((lastMonthEnrollments - previousMonthEnrollments) / previousMonthEnrollments) * 100
    : 0;

  // Enrollment trend data (last 7 days)
  const enrollmentTrend = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const count = enrollments.filter(e => {
      const created = new Date(e.created_date);
      return created.toDateString() === date.toDateString();
    }).length;
    return {
      date: format(date, 'MMM dd'),
      enrollments: count
    };
  });

  // Program distribution
  const programDistribution = programs.map(program => ({
    name: program.name,
    value: enrollments.filter(e => e.programId === program.id).length
  })).filter(p => p.value > 0);

  // Student progress distribution
  const progressDistribution = [
    { name: 'Not Started', value: students.length - progress.length },
    { name: 'In Progress', value: progress.filter(p => !p.completed).length },
    { name: 'Completed', value: completedLessons }
  ];

  // Monthly revenue trend
  const revenueTrend = Array.from({ length: 6 }, (_, i) => {
    const date = subDays(new Date(), (5 - i) * 30);
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    
    const revenue = bookings.filter(b => {
      const created = new Date(b.created_date);
      return created >= monthStart && created <= monthEnd;
    }).reduce((sum, b) => sum + (b.amount || 0), 0) / 100;
    
    return {
      month: format(date, 'MMM'),
      revenue
    };
  });

  const StatCard = ({ title, value, change, icon: Icon, color }) => (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
            {change !== undefined && (
              <div className={`flex items-center gap-1 mt-2 text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                <span>{Math.abs(change).toFixed(1)}%</span>
              </div>
            )}
          </div>
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
          <p className="text-slate-600 mt-1">Track key metrics and performance</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowTrackingSettings(!showTrackingSettings)}
          className="gap-2"
        >
          <Settings className="w-4 h-4" />
          Tracking Setup
        </Button>
      </div>

      {/* Tracking Configuration */}
      {showTrackingSettings && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Advertising Tracking Configuration</CardTitle>
            <p className="text-sm text-slate-600">Connect your ad accounts to track spend and cost per acquisition</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Google Analytics ID
              </label>
              <Input
                placeholder="G-XXXXXXXXXX or UA-XXXXXXXXX-X"
                value={trackingConfig.google_analytics_id}
                onChange={(e) => setTrackingConfig({...trackingConfig, google_analytics_id: e.target.value})}
              />
              <p className="text-xs text-slate-500 mt-1">Find this in your Google Analytics property settings</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Facebook Meta Pixel ID
              </label>
              <Input
                placeholder="1234567890123456"
                value={trackingConfig.facebook_pixel_id}
                onChange={(e) => setTrackingConfig({...trackingConfig, facebook_pixel_id: e.target.value})}
              />
              <p className="text-xs text-slate-500 mt-1">Find this in your Meta Events Manager</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Google Ads Account ID
              </label>
              <Input
                placeholder="123-456-7890"
                value={trackingConfig.google_ads_account_id}
                onChange={(e) => setTrackingConfig({...trackingConfig, google_ads_account_id: e.target.value})}
              />
              <p className="text-xs text-slate-500 mt-1">10-digit account number from Google Ads</p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSaveTracking}
                disabled={updateTrackingMutation.isPending}
                className="bg-gradient-to-r from-indigo-600 to-violet-600"
              >
                {updateTrackingMutation.isPending ? 'Saving...' : 'Save Configuration'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowTrackingSettings(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={students.length}
          icon={Users}
          color="from-indigo-500 to-indigo-600"
        />
        <StatCard
          title="Active Enrollments"
          value={activeEnrollments}
          change={enrollmentGrowth}
          icon={GraduationCap}
          color="from-green-500 to-green-600"
        />
        <StatCard
          title="Lessons Completed"
          value={completedLessons}
          icon={BookOpen}
          color="from-amber-500 to-amber-600"
        />
        <StatCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="from-purple-500 to-purple-600"
        />
      </div>

      {/* Charts */}
      <Tabs defaultValue="enrollments" className="space-y-6">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="enrollments">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Enrollment Trend (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={enrollmentTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="enrollments" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="programs">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Enrollment Distribution by Program</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={programDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {programDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Student Progress Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={progressDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Revenue Trend (Last 6 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Line type="monotone" dataKey="revenue" stroke="#8B5CF6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}