import React, { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, Check, Loader2, Calendar, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import ChildPicker from './ChildPicker';
import CampDaySelector from './CampDaySelector';
import SubscriptionSelector from './SubscriptionSelector';
import SlotSelector from './SlotSelector';
import { format } from 'date-fns';

const getSteps = (bookingType) => {
  const baseSteps = [
    { id: 'child', title: 'Select Child', icon: '👶' },
  ];

  if (bookingType === 'camp') {
    return [
      ...baseSteps,
      { id: 'days', title: 'Select Days', icon: '📅' },
      { id: 'payment', title: 'Payment', icon: '💳' },
      { id: 'success', title: 'Confirmed', icon: '✅' },
    ];
  } else if (bookingType === 'weekly') {
    return [
      ...baseSteps,
      { id: 'plan', title: 'Choose Plan', icon: '📋' },
      { id: 'schedule', title: 'Pick Schedule', icon: '📅' },
      { id: 'payment', title: 'Payment', icon: '💳' },
      { id: 'success', title: 'Confirmed', icon: '✅' },
    ];
  } else {
    return [
      ...baseSteps,
      { id: 'datetime', title: 'Confirm your Schedule', icon: '📅' },
      { id: 'parent-info', title: 'Your Information', icon: '👤' },
      { id: 'confirm', title: 'Confirm Booking', icon: '✅' },
      { id: 'success', title: 'Confirmed', icon: '🎉' },
    ];
  }
};

export default function BookingWizard({ isOpen, onClose, offering, session, bookingType = 'trial', campEvent, availableSlots }) {
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState('1x');
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [user, setUser] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [isFullCapacity, setIsFullCapacity] = useState(false);
  const [joiningWaitlist, setJoiningWaitlist] = useState(false);
  const [parentInfo, setParentInfo] = useState({
    fullName: '',
    email: '',
    phone: ''
  });

  const steps = getSteps(bookingType);

  useEffect(() => {
    loadUser();
    checkCapacity();
  }, [session, campEvent, selectedDays]);

  const checkCapacity = () => {
    if (bookingType === 'trial' && session) {
      const spotsLeft = session.capacity - (session.enrolledCount || 0);
      setIsFullCapacity(spotsLeft <= 0);
    } else if (bookingType === 'camp' && campEvent && selectedDays.length > 0) {
      const hasFullDay = selectedDays.some(dayId => {
        const day = campEvent.days?.find(d => (d.id || d.date) === dayId);
        const spotsLeft = (day?.capacity || campEvent.capacity || 20) - (day?.enrolled || 0);
        return spotsLeft <= 0;
      });
      setIsFullCapacity(hasFullDay);
    }
  };

  const loadUser = async () => {
    try {
      const userData = await api.auth.me();
      setUser(userData);
    } catch (e) {
      // Not logged in
    }
  };

  const { data: children = [] } = useQuery({
    queryKey: ['children', user?.id],
    queryFn: () => user ? api.entities.Student.filter({ parent_id: user.id }) : [],
    enabled: !!user,
  });

  const createChildMutation = useMutation({
    mutationFn: async (data) => {
      if (!user?.id) {
        throw new Error('User not logged in');
      }
      
      const newChild = await api.entities.Student.create({
        parent_id: user.id,
        location_id: session?.academyId || campEvent?.location_id || 'default',
        full_name: data.name,
        dob: '2015-01-01',
      });
      return newChild;
    },
    onSuccess: (newChild) => {
      queryClient.invalidateQueries(['children']);
      setSelectedChildId(newChild.id);
    },
    onError: (error) => {
      console.error('Error creating child:', error);
      alert('Failed to add child. Please try again.');
    }
  });

  const bookingMutation = useMutation({
    mutationFn: async (data) => {
      if (bookingType === 'trial') {
        return await api.entities.TrialBooking.create(data);
      } else if (bookingType === 'camp') {
        return await api.entities.CampBooking.create(data);
      } else if (bookingType === 'weekly') {
        return await api.entities.Membership.create(data);
      }
    },
    onSuccess: () => {
      setCurrentStep(steps.length - 1);
      queryClient.invalidateQueries(['bookings']);
      queryClient.invalidateQueries(['memberships']);
    }
  });

  const waitlistMutation = useMutation({
    mutationFn: async (data) => {
      const waitlistEntry = await api.entities.Waitlist.create(data);
      
      // Send confirmation email
      await api.integrations.Core.SendEmail({
        to: user.email,
        from_name: 'Skill Samurai',
        subject: "You're on the Waitlist! 🎯",
        body: `Hi ${user.full_name},

We've added you to the waitlist for ${offering?.name || session?.name || 'this program'}.

You'll receive an email as soon as a spot becomes available. Make sure to check your inbox regularly!

Your waitlist details:
• Program: ${offering?.name || session?.name}
• Student: ${children.find(c => c.id === selectedChildId)?.full_name}
• Status: Waiting for availability

We'll notify you within 24 hours if a spot opens up.

- Skill Samurai Team`
      });
      
      return waitlistEntry;
    },
    onSuccess: () => {
      setCurrentStep(steps.length - 1);
      setJoiningWaitlist(true);
      queryClient.invalidateQueries(['waitlist']);
    }
  });

  const handleNext = () => {
    if (currentStep === 0 && !selectedChildId) return;
    if (bookingType === 'camp' && steps[currentStep]?.id === 'days' && selectedDays.length === 0) return;
    if (bookingType === 'weekly' && steps[currentStep]?.id === 'schedule' && selectedSlots.length === 0) return;
    if (steps[currentStep]?.id === 'parent-info') {
      if (!parentInfo.fullName || !parentInfo.email || !parentInfo.phone) return;
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleConfirmTrial = async () => {
    setProcessing(true);
    
    try {
      const selectedChild = children.find(c => c.id === selectedChildId);
      const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = weekdays[session.weekday];
      
      // Calculate next occurrence of this weekday with specific time
      const today = new Date();
      const targetDay = session.weekday;
      const currentDay = today.getDay();
      let daysUntilTarget = targetDay - currentDay;
      if (daysUntilTarget <= 0) {
        daysUntilTarget += 7;
      }
      const nextOccurrence = new Date(today);
      nextOccurrence.setDate(today.getDate() + daysUntilTarget);
      
      // Parse the time from session (format: "HH:MM")
      const [hours, minutes] = session.start_time.split(':').map(Number);
      nextOccurrence.setHours(hours, minutes, 0, 0);
      
      // Create trial booking with required fields only
      const bookingData = {
        parent_name: parentInfo.fullName,
        parent_email: parentInfo.email,
        student_name: selectedChild?.full_name || selectedChild?.name,
        trial_datetime: nextOccurrence.toISOString(),
      };
      
      // Add optional fields
      if (session?.location_id) bookingData.location_id = session.location_id;
      if (parentInfo.phone) bookingData.parent_phone = parentInfo.phone;
      bookingData.student_age = 10;
      bookingData.trial_type = 'in_person';
      bookingData.pipeline_stage = 'confirmed';
      bookingData.confirmation_sent = true;
      bookingData.source = 'booking_wizard';
      bookingData.notes = `${dayName}s at ${session.start_time} - ${session.title}`;

      const newBooking = await api.entities.TrialBooking.create(bookingData);

      // Try to send confirmation email (don't fail if email service errors)
      try {
        await api.integrations.Core.SendEmail({
          to: parentInfo.email,
          from_name: 'Skill Samurai',
          subject: '🎉 Your Free Trial Session is Confirmed!',
          body: `Hi ${parentInfo.fullName},

Great news! Your free trial session for ${selectedChild?.full_name || selectedChild?.name} has been confirmed!

📅 Weekly Schedule: ${dayName}s
🕐 Time: ${session.start_time}
⏱️ Duration: ${session.duration_minutes} minutes
📍 Class: ${session.title}
👥 Ages: ${session.age_min}-${session.age_max}

What to Expect:
• Your child will learn coding concepts in a fun, interactive environment
• Expert instructors will guide them through age-appropriate projects
• No prior experience needed!

What to Bring:
• A curious mind and excitement to learn!
• Water bottle (optional)

We're excited to meet ${selectedChild?.full_name || selectedChild?.name}!

Questions? Reply to this email or give us a call.

- The Skill Samurai Team`
        });
      } catch (emailError) {
        console.log('Email notification could not be sent:', emailError);
      }

      // Move to success screen
      setCurrentStep(steps.length - 1);
      queryClient.invalidateQueries(['bookings']);
      queryClient.invalidateQueries(['trial-bookings']);
    } catch (error) {
      console.error('Error confirming trial:', error);
      alert('Failed to confirm booking. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handlePayment = async () => {
    setProcessing(true);
    
    setTimeout(() => {
      const selectedChild = children.find(c => c.id === selectedChildId);
      
      if (isFullCapacity) {
        // Join waitlist instead
        const waitlistData = {
          student_id: selectedChildId,
          parent_id: user.id,
          student_name: selectedChild?.full_name || selectedChild?.name,
          parent_email: user.email,
          parent_phone: user.phone || '',
          waitlist_type: bookingType,
          status: 'waiting',
          program_id: offering?.id,
          location_id: session?.academyId || campEvent?.location_id,
        };

        if (bookingType === 'trial') {
          waitlistData.class_session_id = session?.id;
        } else if (bookingType === 'camp') {
          waitlistData.camp_event_id = campEvent?.id;
        }

        waitlistMutation.mutate(waitlistData);
      } else {
        // Normal booking
        let bookingData = {};

        if (bookingType === 'trial') {
          bookingData = {
            location_id: session?.academyId,
            parent_name: user.full_name,
            parent_email: user.email,
            parent_phone: user.phone || '',
            student_name: selectedChild?.full_name || selectedChild?.name,
            student_age: 10,
            trial_datetime: session?.startDate,
            trial_type: 'in_person',
            pipeline_stage: 'confirmed',
            confirmation_sent: true,
            source: 'booking_wizard'
          };
        } else if (bookingType === 'camp') {
          bookingData = {
            camp_event_id: campEvent?.id,
            student_id: selectedChildId,
            parent_id: user.id,
            selected_days: selectedDays,
            status: 'confirmed',
            payment_status: 'paid',
          };
        } else if (bookingType === 'weekly') {
          bookingData = {
            student_id: selectedChildId,
            parent_id: user.id,
            plan: selectedPlan,
            slots: selectedSlots,
            status: 'active',
            start_date: new Date().toISOString().split('T')[0],
          };
        }

        bookingMutation.mutate(bookingData);
      }
      
      setProcessing(false);
    }, 800);
  };

  const handleClose = () => {
    setCurrentStep(0);
    setSelectedChildId(null);
    setSelectedDays([]);
    setSelectedPlan('1x');
    setSelectedSlots([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl bg-gradient-to-br from-white/95 to-indigo-50/50 backdrop-blur-xl rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/50 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              {currentStep > 0 && currentStep < 3 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBack}
                  className="rounded-xl"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {offering?.name || session?.name || 'Book Session'}
                </h2>
                <p className="text-sm text-slate-600">
                  Step {currentStep + 1} of {steps.length}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="rounded-xl"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="px-6 py-4 border-b border-white/50 flex-shrink-0">
            <div className="flex items-center gap-2">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className={`
                    flex-1 h-2 rounded-full transition-all
                    ${index <= currentStep ? 'bg-gradient-to-r from-indigo-600 to-violet-600' : 'bg-slate-200'}
                  `} />
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              {currentStep === 0 && (
                <motion.div
                  key="child"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-bold text-slate-900">Who's joining?</h3>
                  <ChildPicker
                    children={children}
                    selectedChild={selectedChildId}
                    onSelect={setSelectedChildId}
                    onAddNew={async (data) => {
                      await createChildMutation.mutateAsync(data);
                    }}
                  />
                </motion.div>
              )}

              {steps[currentStep]?.id === 'datetime' && (
                <motion.div
                  key="datetime"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-bold text-slate-900">Your Class Schedule</h3>
                  <Card className="p-6 bg-white/80 border-white/50">
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <Calendar className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          {session?.weekday !== undefined ? (
                            <>
                              <p className="font-semibold text-slate-900 text-lg">
                                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][session.weekday]}s
                              </p>
                              <p className="text-slate-600 mt-1">
                                {session.start_time} · {session.duration_minutes} minutes
                              </p>
                              <p className="text-sm text-slate-500 mt-2">
                                {session.title}
                              </p>
                              {session?.capacity && (
                                <Badge className="mt-3 bg-emerald-100 text-emerald-700 border-0">
                                  {session.capacity} spots available
                                </Badge>
                              )}
                            </>
                          ) : session?.startDate ? (
                            <>
                              <p className="font-semibold text-slate-900">
                                {format(new Date(session.startDate), 'EEEE, MMMM d, yyyy')}
                              </p>
                              <p className="text-sm text-slate-600 mt-1">
                                {format(new Date(session.startDate), 'h:mm a')}
                              </p>
                              {session?.capacity && (
                                <Badge className="mt-3 bg-emerald-100 text-emerald-700 border-0">
                                  {session.capacity - (session.enrolledCount || 0)} spots left
                                </Badge>
                              )}
                            </>
                          ) : (
                            <p className="text-slate-600">Schedule details will be confirmed</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {steps[currentStep]?.id === 'days' && (
                <motion.div
                  key="days"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <CampDaySelector
                    campEvent={campEvent}
                    selectedDays={selectedDays}
                    onSelectionChange={setSelectedDays}
                  />
                </motion.div>
              )}

              {steps[currentStep]?.id === 'plan' && (
                <motion.div
                  key="plan"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <SubscriptionSelector
                    selectedPlan={selectedPlan}
                    onPlanChange={setSelectedPlan}
                  />
                </motion.div>
              )}

              {steps[currentStep]?.id === 'schedule' && (
                <motion.div
                  key="schedule"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <SlotSelector
                    slots={availableSlots}
                    selectedSlots={selectedSlots}
                    onSelectionChange={setSelectedSlots}
                    maxSelection={selectedPlan === '2x' ? 2 : 1}
                  />
                </motion.div>
              )}

              {steps[currentStep]?.id === 'parent-info' && (
                <motion.div
                  key="parent-info"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-bold text-slate-900">Your Information</h3>
                  <Card className="p-6 bg-white/80 border-white/50 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">
                        Full Name *
                      </label>
                      <Input
                        required
                        value={parentInfo.fullName}
                        onChange={(e) => setParentInfo({...parentInfo, fullName: e.target.value})}
                        placeholder="Your full name"
                        className="bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">
                        Email *
                      </label>
                      <Input
                        required
                        type="email"
                        value={parentInfo.email}
                        onChange={(e) => setParentInfo({...parentInfo, email: e.target.value})}
                        placeholder="your@email.com"
                        className="bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">
                        Mobile Number *
                      </label>
                      <Input
                        required
                        type="tel"
                        value={parentInfo.phone}
                        onChange={(e) => setParentInfo({...parentInfo, phone: e.target.value})}
                        placeholder="(555) 123-4567"
                        className="bg-white"
                      />
                    </div>
                  </Card>
                </motion.div>
              )}

              {steps[currentStep]?.id === 'confirm' && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-bold text-slate-900">Confirm Booking</h3>
                  <Card className="p-6 bg-white/80 border-white/50">
                    <div className="space-y-3">
                      <Button
                        className="w-full h-14 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white"
                        onClick={handleConfirmTrial}
                        disabled={processing}
                      >
                        {processing ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          'Confirm Free Trial'
                        )}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}

              {steps[currentStep]?.id === 'payment' && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-bold text-slate-900">
                    {isFullCapacity ? 'Join Waitlist' : bookingType === 'trial' ? 'Confirm Booking' : 'Payment'}
                  </h3>
                  
                  {isFullCapacity && (
                    <Card className="p-4 bg-amber-50 border-amber-200">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xl">⏱️</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900 mb-1">This session is full</p>
                          <p className="text-sm text-slate-600">
                            Join the waitlist and we'll notify you immediately when a spot opens up.
                          </p>
                        </div>
                      </div>
                    </Card>
                  )}
                  
                  <Card className="p-6 bg-white/80 border-white/50">
                    {!isFullCapacity && bookingType !== 'trial' && (
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-slate-700">Total</span>
                        <span className="text-3xl font-bold text-slate-900">
                          {offering?.price ? `$${(offering.price / 100).toFixed(0)}` : 'Free'}
                        </span>
                      </div>
                    )}
                    <div className="space-y-3">
                      <Button
                        className={`w-full h-14 rounded-xl ${
                          isFullCapacity 
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600' 
                            : bookingType === 'trial'
                            ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700'
                            : 'bg-black hover:bg-black/90'
                        } text-white`}
                        onClick={handlePayment}
                        disabled={processing}
                      >
                        {processing ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : isFullCapacity ? (
                          'Join Waitlist (Free)'
                        ) : bookingType === 'trial' ? (
                          'Confirm Free Trial'
                        ) : (
                          <>
                            <CreditCard className="w-5 h-5 mr-2" />
                            Pay with Card
                          </>
                        )}
                      </Button>
                      {!isFullCapacity && bookingType !== 'trial' && (
                        <div className="text-center text-xs text-slate-500">
                          Secure payment powered by Stripe
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              )}

              {steps[currentStep]?.id === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-6 py-8"
                >
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-xl ${
                    joiningWaitlist 
                      ? 'bg-gradient-to-br from-amber-400 to-orange-500' 
                      : 'bg-gradient-to-br from-emerald-400 to-emerald-600'
                  }`}>
                    {joiningWaitlist ? (
                      <span className="text-4xl">⏱️</span>
                    ) : (
                      <Check className="w-10 h-10 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                      {joiningWaitlist ? "You're on the waitlist!" : "You're in! 🎉"}
                    </h3>
                    <p className="text-slate-600 text-lg">
                      {joiningWaitlist 
                        ? "We'll email you as soon as a spot opens up. Check your inbox!"
                        : session?.weekday !== undefined
                          ? `See you ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][session.weekday]}s!`
                          : session?.startDate 
                            ? `See you on ${format(new Date(session.startDate), 'EEEE')}!`
                            : 'See you at class!'
                      }
                    </p>
                  </div>
                  <Button
                    onClick={handleClose}
                    className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
                  >
                    Done
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Actions */}
          {steps[currentStep]?.id !== 'payment' && steps[currentStep]?.id !== 'confirm' && steps[currentStep]?.id !== 'success' && (
            <div className="p-6 border-t border-white/50 flex-shrink-0">
              <Button
                onClick={handleNext}
                disabled={
                  (currentStep === 0 && !selectedChildId) ||
                  (bookingType === 'camp' && steps[currentStep]?.id === 'days' && selectedDays.length === 0) ||
                  (bookingType === 'weekly' && steps[currentStep]?.id === 'schedule' && selectedSlots.length === 0) ||
                  (steps[currentStep]?.id === 'parent-info' && (!parentInfo.fullName || !parentInfo.email || !parentInfo.phone)) ||
                  createChildMutation.isPending
                }
                className="w-full h-12 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createChildMutation.isPending ? 'Adding Child...' : 'Continue'}
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}