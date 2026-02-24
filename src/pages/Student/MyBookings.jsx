import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { 
  Calendar,
  Clock,
  MapPin,
  Users,
  BookOpen,
  ChevronRight,
  Receipt,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const statusStyles = {
  confirmed: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-700'
};

const paymentStyles = {
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-slate-100 text-slate-700'
};

export default function MyBookings() {
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

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings', user?.id],
    queryFn: () => api.entities.Booking.filter({ userId: user?.id }, '-created_date'),
    enabled: !!user?.id,
  });

  const { data: trialBookings = [] } = useQuery({
    queryKey: ['trialBookings', user?.email],
    queryFn: () => api.entities.TrialBooking.filter({ parent_email: user?.email }, '-trial_datetime'),
    enabled: !!user?.email,
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['allPrograms'],
    queryFn: () => api.entities.Program.list(),
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['allSessions'],
    queryFn: () => api.entities.ClassSession.list(),
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students', user?.id],
    queryFn: () => api.entities.StudentProfile.filter({ userId: user?.id }),
    enabled: !!user?.id,
  });

  const getProgram = (programId) => programs.find(p => p.id === programId);
  const getSession = (sessionId) => sessions.find(s => s.id === sessionId);
  const getStudent = (studentId) => students.find(s => s.id === studentId);

  const upcomingBookings = bookings.filter(b => {
    const session = getSession(b.classSessionId);
    return session && new Date(session.endDate) >= new Date() && b.bookingStatus !== 'cancelled';
  });

  const pastBookings = bookings.filter(b => {
    const session = getSession(b.classSessionId);
    return (session && new Date(session.endDate) < new Date()) || b.bookingStatus === 'cancelled';
  });

  const upcomingTrials = trialBookings.filter(t => 
    new Date(t.trial_datetime) >= new Date() && 
    !['no_show', 'converted', 'lost'].includes(t.pipeline_stage)
  );

  const pastTrials = trialBookings.filter(t => 
    new Date(t.trial_datetime) < new Date() || 
    ['attended', 'no_show', 'converted', 'lost'].includes(t.pipeline_stage)
  );

  const TrialCard = ({ trial, isPast = false }) => {
    const trialDate = new Date(trial.trial_datetime);
    const stageColors = {
      booked: 'bg-blue-100 text-blue-700',
      confirmed: 'bg-green-100 text-green-700',
      reminded_24h: 'bg-purple-100 text-purple-700',
      reminded_1h: 'bg-orange-100 text-orange-700',
      attended: 'bg-emerald-100 text-emerald-700',
      no_show: 'bg-red-100 text-red-700',
      converted: 'bg-indigo-100 text-indigo-700'
    };

    return (
      <Card className={`border-0 shadow-lg ${isPast ? 'opacity-75' : ''}`}>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            <div className="w-full lg:w-48 h-32 rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-cyan-600" />
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">Free Trial Session</h3>
                  <p className="text-slate-500 text-sm mt-1">
                    {trial.student_name}, Age {trial.student_age}
                  </p>
                </div>
                <Badge className={stageColors[trial.pipeline_stage] || stageColors.booked}>
                  {trial.pipeline_stage?.replace(/_/g, ' ')}
                </Badge>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-4 h-4" />
                  {format(trialDate, 'MMM d, yyyy')}
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="w-4 h-4" />
                  {format(trialDate, 'h:mm a')}
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="w-4 h-4" />
                  {trial.trial_type === 'online' ? 'Online' : 'In-person'}
                </div>
              </div>

              {trial.instructor_notes && (
                <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                  <strong>Notes:</strong> {trial.instructor_notes}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const BookingCard = ({ booking, isPast = false }) => {
    const program = getProgram(booking.programId);
    const session = getSession(booking.classSessionId);
    const bookingStudents = booking.studentIds?.map(id => getStudent(id)).filter(Boolean) || [];

    return (
      <Card className={`border-0 shadow-lg ${isPast ? 'opacity-75' : ''}`}>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            {/* Program Image */}
            <div className="w-full lg:w-48 h-32 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center overflow-hidden">
              {program?.thumbnail ? (
                <img src={program.thumbnail} alt={program.name} className="w-full h-full object-cover" />
              ) : (
                <BookOpen className="w-12 h-12 text-indigo-300" />
              )}
            </div>

            {/* Details */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">
                    {program?.name || booking.programName || 'Program'}
                  </h3>
                  <p className="text-slate-500 text-sm mt-1">
                    Booking #{booking.id?.slice(-8).toUpperCase()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge className={statusStyles[booking.bookingStatus] || statusStyles.pending}>
                    {booking.bookingStatus}
                  </Badge>
                  <Badge className={paymentStyles[booking.paymentStatus] || paymentStyles.pending}>
                    {booking.paymentStatus}
                  </Badge>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                {session && (
                  <>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="w-4 h-4" />
                      {session.startDate ? format(new Date(session.startDate), 'MMM d') : ''} - {session.endDate ? format(new Date(session.endDate), 'MMM d, yyyy') : ''}
                    </div>
                    {session.schedule?.startTime && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock className="w-4 h-4" />
                        {session.schedule.startTime} - {session.schedule.endTime}
                      </div>
                    )}
                    {session.location && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <MapPin className="w-4 h-4" />
                        {session.location}
                      </div>
                    )}
                  </>
                )}
              </div>

              {bookingStudents.length > 0 && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400" />
                  <div className="flex flex-wrap gap-2">
                    {bookingStudents.map(student => (
                      <Badge key={student.id} variant="secondary" className="bg-indigo-50 text-indigo-700">
                        {student.displayName}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-slate-400" />
                  <span className="text-lg font-semibold text-slate-900">
                    ${((booking.amount || 0) / 100).toFixed(2)}
                  </span>
                </div>
                {!isPast && booking.bookingStatus === 'confirmed' && (
                  <Button variant="ghost" className="text-indigo-600">
                    View Details
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Bookings</h1>
          <p className="text-slate-600 mt-1">Manage your program registrations</p>
        </div>
        <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
          <Link to={createPageUrl('ProgramsBrowser')}>
            <BookOpen className="w-4 h-4 mr-2" />
            Browse Programs
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} className="border-0 shadow-lg animate-pulse">
              <CardContent className="p-6">
                <div className="flex gap-6">
                  <div className="w-48 h-32 bg-slate-200 rounded-xl" />
                  <div className="flex-1 space-y-4">
                    <div className="h-6 w-48 bg-slate-200 rounded" />
                    <div className="h-4 w-32 bg-slate-100 rounded" />
                    <div className="h-4 w-64 bg-slate-100 rounded" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : bookings.length === 0 && trialBookings.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-indigo-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">No bookings yet</h2>
            <p className="text-slate-600 mb-6">Browse our programs and book your first class</p>
            <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
              <Link to={createPageUrl('ProgramsBrowser')}>Explore Programs</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="bg-slate-100">
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingBookings.length + upcomingTrials.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({pastBookings.length + pastTrials.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingTrials.map((trial, index) => (
              <motion.div
                key={trial.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <TrialCard trial={trial} />
              </motion.div>
            ))}
            {upcomingBookings.length === 0 && upcomingTrials.length === 0 ? (
              <Card className="border-0 shadow-md">
                <CardContent className="text-center py-8">
                  <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">No upcoming bookings</p>
                </CardContent>
              </Card>
            ) : (
              upcomingBookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <BookingCard booking={booking} />
                </motion.div>
              ))
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastTrials.map((trial, index) => (
              <motion.div
                key={trial.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <TrialCard trial={trial} isPast />
              </motion.div>
            ))}
            {pastBookings.length === 0 && pastTrials.length === 0 ? (
              <Card className="border-0 shadow-md">
                <CardContent className="text-center py-8">
                  <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">No past bookings</p>
                </CardContent>
              </Card>
            ) : (
              pastBookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <BookingCard booking={booking} isPast />
                </motion.div>
              ))
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}