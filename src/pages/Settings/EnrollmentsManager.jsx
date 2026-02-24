import React, { useState } from 'react';
import { api } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  GraduationCap,
  Search,
  MoreVertical,
  Calendar,
  User,
  BookOpen,
  Check,
  X,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';

const statusColors = {
  enrolled: 'bg-green-100 text-green-700',
  waitlisted: 'bg-amber-100 text-amber-700',
  completed: 'bg-blue-100 text-blue-700',
  withdrawn: 'bg-red-100 text-red-700'
};

const paymentColors = {
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  refunded: 'bg-slate-100 text-slate-600'
};

export default function EnrollmentsManager() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('enrollments');

  const queryClient = useQueryClient();

  const { data: enrollments = [], isLoading: enrollmentsLoading } = useQuery({
    queryKey: ['enrollments'],
    queryFn: () => api.entities.Enrollment.list('-created_date'),
  });

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => api.entities.Booking.list('-created_date'),
  });

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

  const { data: users = [] } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => api.entities.User.list(),
  });

  const updateEnrollmentMutation = useMutation({
    mutationFn: ({ id, data }) => api.entities.Enrollment.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['enrollments']);
    }
  });

  const getStudent = (studentId) => students.find(s => s.id === studentId);
  const getProgram = (programId) => programs.find(p => p.id === programId);
  const getSession = (sessionId) => sessions.find(s => s.id === sessionId);
  const getUser = (userId) => users.find(u => u.id === userId);

  const filteredEnrollments = enrollments.filter(enrollment => {
    const student = getStudent(enrollment.studentId);
    const program = getProgram(enrollment.programId);
    const matchesSearch = !searchQuery || 
      student?.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || enrollment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredBookings = bookings.filter(booking => {
    const user = getUser(booking.userId);
    const program = getProgram(booking.programId);
    const matchesSearch = !searchQuery || 
      user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const stats = {
    total: enrollments.length,
    enrolled: enrollments.filter(e => e.status === 'enrolled').length,
    waitlisted: enrollments.filter(e => e.status === 'waitlisted').length,
    completed: enrollments.filter(e => e.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Enrollments & Bookings</h1>
        <p className="text-slate-600 mt-1">Manage student enrollments and parent bookings</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
              <div className="text-sm text-slate-500">Total</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{stats.enrolled}</div>
              <div className="text-sm text-slate-500">Enrolled</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{stats.waitlisted}</div>
              <div className="text-sm text-slate-500">Waitlisted</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{stats.completed}</div>
              <div className="text-sm text-slate-500">Completed</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="enrolled">Enrolled</SelectItem>
                <SelectItem value="waitlisted">Waitlisted</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="withdrawn">Withdrawn</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-100">
          <TabsTrigger value="enrollments">
            Enrollments ({enrollments.length})
          </TabsTrigger>
          <TabsTrigger value="bookings">
            Bookings ({bookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="enrollments" className="mt-6">
          <Card className="border-0 shadow-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Student</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollmentsLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i} className="animate-pulse">
                      <TableCell><div className="h-4 w-24 bg-slate-200 rounded" /></TableCell>
                      <TableCell><div className="h-4 w-32 bg-slate-200 rounded" /></TableCell>
                      <TableCell><div className="h-4 w-24 bg-slate-200 rounded" /></TableCell>
                      <TableCell><div className="h-6 w-16 bg-slate-200 rounded-full" /></TableCell>
                      <TableCell><div className="h-6 w-16 bg-slate-200 rounded-full" /></TableCell>
                      <TableCell><div className="h-4 w-20 bg-slate-200 rounded" /></TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  ))
                ) : filteredEnrollments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">No enrollments found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEnrollments.map((enrollment) => {
                    const student = getStudent(enrollment.studentId);
                    const program = getProgram(enrollment.programId);
                    const session = getSession(enrollment.classSessionId);
                    
                    return (
                      <TableRow key={enrollment.id} className="hover:bg-slate-50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-sm font-medium">
                              {student?.displayName?.[0]?.toUpperCase() || 'S'}
                            </div>
                            <span className="font-medium">{student?.displayName || 'Student'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600">{program?.name || 'Program'}</TableCell>
                        <TableCell className="text-slate-600">{session?.name || 'Session'}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[enrollment.status] || 'bg-slate-100 text-slate-600'}>
                            {enrollment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={paymentColors[enrollment.paymentStatus] || 'bg-slate-100 text-slate-600'}>
                            {enrollment.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-500 text-sm">
                          {enrollment.created_date ? format(new Date(enrollment.created_date), 'MMM d, yyyy') : '-'}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => updateEnrollmentMutation.mutate({ id: enrollment.id, data: { status: 'enrolled' } })}>
                                <Check className="w-4 h-4 mr-2 text-green-600" />
                                Mark Enrolled
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateEnrollmentMutation.mutate({ id: enrollment.id, data: { status: 'completed' } })}>
                                <BookOpen className="w-4 h-4 mr-2 text-blue-600" />
                                Mark Completed
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => updateEnrollmentMutation.mutate({ id: enrollment.id, data: { status: 'withdrawn' } })} className="text-red-600">
                                <X className="w-4 h-4 mr-2" />
                                Withdraw
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="mt-6">
          <Card className="border-0 shadow-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Parent</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookingsLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i} className="animate-pulse">
                      <TableCell><div className="h-4 w-24 bg-slate-200 rounded" /></TableCell>
                      <TableCell><div className="h-4 w-32 bg-slate-200 rounded" /></TableCell>
                      <TableCell><div className="h-4 w-8 bg-slate-200 rounded" /></TableCell>
                      <TableCell><div className="h-4 w-16 bg-slate-200 rounded" /></TableCell>
                      <TableCell><div className="h-6 w-16 bg-slate-200 rounded-full" /></TableCell>
                      <TableCell><div className="h-6 w-16 bg-slate-200 rounded-full" /></TableCell>
                      <TableCell><div className="h-4 w-20 bg-slate-200 rounded" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">No bookings found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((booking) => {
                    const user = getUser(booking.userId);
                    const program = getProgram(booking.programId);
                    
                    return (
                      <TableRow key={booking.id} className="hover:bg-slate-50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-400" />
                            <span className="font-medium">{user?.full_name || 'Parent'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600">{program?.name || booking.programName || 'Program'}</TableCell>
                        <TableCell className="text-slate-600">{booking.studentIds?.length || 0}</TableCell>
                        <TableCell className="font-medium">${((booking.amount || 0) / 100).toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className={paymentColors[booking.paymentStatus] || 'bg-slate-100 text-slate-600'}>
                            {booking.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={booking.bookingStatus === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                            {booking.bookingStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-500 text-sm">
                          {booking.created_date ? format(new Date(booking.created_date), 'MMM d, yyyy') : '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}