import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Check,
  AlertCircle,
  CreditCard,
  User,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export default function BookingFlow() {
  const [step, setStep] = useState(1);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  const urlParams = new URLSearchParams(window.location.search);
  const programId = urlParams.get('programId');

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

  const { data: program, isLoading: programLoading } = useQuery({
    queryKey: ['program', programId],
    queryFn: async () => {
      const programs = await api.entities.Program.filter({ id: programId });
      return programs[0];
    },
    enabled: !!programId,
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions', programId],
    queryFn: () => api.entities.ClassSession.filter({ 
      programId, 
      status: 'scheduled' 
    }),
    enabled: !!programId,
  });

  const { data: students = [] } = useQuery({
    queryKey: ['myStudents', user?.id],
    queryFn: () => api.entities.StudentProfile.filter({ userId: user?.id }),
    enabled: !!user?.id,
  });

  const createBookingMutation = useMutation({
    mutationFn: async () => {
      const session = sessions.find(s => s.id === selectedSession);
      
      // Create booking
      const booking = await api.entities.Booking.create({
        userId: user.id,
        programId: program.id,
        classSessionId: selectedSession,
        studentIds: selectedStudents,
        amount: (program.price || 0) * selectedStudents.length,
        currency: program.currency || 'USD',
        paymentStatus: 'pending',
        bookingStatus: 'confirmed',
        programName: program.name,
        sessionDates: `${session?.startDate} - ${session?.endDate}`
      });

      // Create enrollments for each student
      for (const studentId of selectedStudents) {
        await api.entities.Enrollment.create({
          studentId,
          classSessionId: selectedSession,
          programId: program.id,
          academyId: program.academyId,
          bookingId: booking.id,
          status: 'enrolled',
          paymentStatus: 'pending'
        });
      }

      return booking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['bookings']);
      setStep(4);
    }
  });

  const toggleStudent = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const canProceed = () => {
    if (step === 1) return !!selectedSession;
    if (step === 2) return selectedStudents.length > 0;
    if (step === 3) return true;
    return false;
  };

  if (!programId) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-700">No program selected</h2>
        <Button asChild className="mt-4">
          <Link to={createPageUrl('ProgramsBrowser')}>Browse Programs</Link>
        </Button>
      </div>
    );
  }

  if (programLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="h-8 bg-slate-200 rounded w-1/3 animate-pulse" />
        <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        asChild 
        className="mb-6 text-slate-600 hover:text-slate-900"
      >
        <Link to={createPageUrl('ProgramsBrowser')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Programs
        </Link>
      </Button>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {['Session', 'Students', 'Review', 'Complete'].map((label, index) => (
          <div key={label} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all
              ${step > index + 1 
                ? 'bg-green-500 text-white' 
                : step === index + 1 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                  : 'bg-slate-100 text-slate-400'
              }`}>
              {step > index + 1 ? <Check className="w-5 h-5" /> : index + 1}
            </div>
            {index < 3 && (
              <div className={`hidden sm:block w-16 md:w-24 h-1 mx-2 rounded-full ${step > index + 1 ? 'bg-green-500' : 'bg-slate-100'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Program Header */}
      <Card className="mb-6 border-0 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-violet-600 p-6 text-white">
          <Badge className="bg-white/20 text-white border-0 mb-2">{program?.type}</Badge>
          <h1 className="text-2xl font-bold">{program?.name}</h1>
          <p className="text-indigo-100 mt-2">{program?.description}</p>
        </div>
      </Card>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  Select a Session
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sessions.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>No sessions available for this program</p>
                  </div>
                ) : (
                  <RadioGroup value={selectedSession} onValueChange={setSelectedSession}>
                    <div className="space-y-3">
                      {sessions.map((session) => (
                        <Label
                          key={session.id}
                          htmlFor={session.id}
                          className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
                            ${selectedSession === session.id 
                              ? 'border-indigo-500 bg-indigo-50' 
                              : 'border-slate-100 hover:border-slate-200'
                            }`}
                        >
                          <RadioGroupItem value={session.id} id={session.id} className="mt-1" />
                          <div className="flex-1">
                            <div className="font-medium text-slate-900">{session.name || 'Session'}</div>
                            <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {session.startDate ? format(new Date(session.startDate), 'MMM d') : ''} - {session.endDate ? format(new Date(session.endDate), 'MMM d, yyyy') : ''}
                              </span>
                              {session.schedule?.startTime && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {session.schedule.startTime} - {session.schedule.endTime}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {session.enrolledCount || 0}/{session.capacity || '∞'} enrolled
                              </span>
                            </div>
                            {session.location && (
                              <div className="flex items-center gap-1 mt-2 text-sm text-slate-500">
                                <MapPin className="w-4 h-4" />
                                {session.location}
                              </div>
                            )}
                          </div>
                        </Label>
                      ))}
                    </div>
                  </RadioGroup>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  Select Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                {students.length === 0 ? (
                  <div className="text-center py-8">
                    <User className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-slate-600 mb-4">No students added yet</p>
                    <Button asChild>
                      <Link to={createPageUrl('MyChildren')}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add a Student
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {students.map((student) => (
                      <Label
                        key={student.id}
                        htmlFor={`student-${student.id}`}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
                          ${selectedStudents.includes(student.id) 
                            ? 'border-indigo-500 bg-indigo-50' 
                            : 'border-slate-100 hover:border-slate-200'
                          }`}
                      >
                        <Checkbox 
                          id={`student-${student.id}`}
                          checked={selectedStudents.includes(student.id)}
                          onCheckedChange={() => toggleStudent(student.id)}
                        />
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-medium">
                          {student.displayName?.[0]?.toUpperCase() || 'S'}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{student.displayName}</div>
                          <div className="text-sm text-slate-500">Age {student.age} • {student.gradeRange}</div>
                        </div>
                      </Label>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-indigo-600" />
                  Review & Confirm
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <h4 className="font-medium text-slate-700 mb-3">Booking Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Program</span>
                      <span className="font-medium">{program?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Session</span>
                      <span className="font-medium">{sessions.find(s => s.id === selectedSession)?.name || 'Selected'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Students</span>
                      <span className="font-medium">{selectedStudents.length} student{selectedStudents.length > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Total Amount</span>
                    <span className="text-2xl font-bold text-slate-900">
                      ${(((program?.price || 0) * selectedStudents.length) / 100).toFixed(2)}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-slate-500 text-center">
                  By confirming, you agree to our terms and conditions
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-0 shadow-lg text-center p-8">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Booking Confirmed!</h2>
              <p className="text-slate-600 mb-6">
                Your booking has been successfully submitted. We'll send you a confirmation email shortly.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild>
                  <Link to={createPageUrl('MyBookings')}>View My Bookings</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to={createPageUrl('LearningWorlds')}>Start Learning</Link>
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      {step < 4 && (
        <div className="flex justify-between mt-6">
          <Button 
            variant="outline" 
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
          >
            Back
          </Button>
          <Button 
            onClick={() => {
              if (step === 3) {
                createBookingMutation.mutate();
              } else {
                setStep(step + 1);
              }
            }}
            disabled={!canProceed() || createBookingMutation.isPending}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {createBookingMutation.isPending ? 'Processing...' : step === 3 ? 'Confirm Booking' : 'Continue'}
          </Button>
        </div>
      )}
    </div>
  );
}