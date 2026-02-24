import React, { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, Check, Loader2, Calendar, CreditCard, Apple } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const getSteps = (bookingType) => {
  if (bookingType === 'trial') {
    return [
      { id: 'child', title: "Child's Name", icon: '👶' },
      { id: 'datetime', title: 'Date & Time', icon: '📅' },
      { id: 'contact', title: 'Your Contact', icon: '📧' },
      { id: 'payment', title: 'Confirm', icon: '✅' },
      { id: 'post-purchase', title: 'Additional Info', icon: '📋' },
      { id: 'account', title: 'Create Account', icon: '🔐' },
      { id: 'success', title: 'Complete', icon: '🎉' },
    ];
  }
  return [
    { id: 'child', title: "Child's Name", icon: '👶' },
    { id: 'datetime', title: 'Date & Time', icon: '📅' },
    { id: 'contact', title: 'Your Contact', icon: '📧' },
    { id: 'payment', title: 'Payment', icon: '💳' },
    { id: 'post-purchase', title: 'Additional Info', icon: '📋' },
    { id: 'account', title: 'Create Account', icon: '🔐' },
    { id: 'success', title: 'Complete', icon: '🎉' },
  ];
};

export default function GuestBookingWizard({ isOpen, onClose, offering, session, bookingType = 'trial' }) {
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [childName, setChildName] = useState('');
  const [contactInfo, setContactInfo] = useState({ email: '', phone: '' });
  const [medicalInfo, setMedicalInfo] = useState({
    dob: '',
    allergies: '',
    emergencyName: '',
    emergencyPhone: '',
  });
  const [accountInfo, setAccountInfo] = useState({ password: '' });
  const [processing, setProcessing] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [user, setUser] = useState(null);

  const steps = getSteps(bookingType);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const userData = await api.auth.me();
      setUser(userData);
      // If logged in, pre-fill contact info
      setContactInfo({
        email: userData.email || '',
        phone: userData.phone || '',
      });
    } catch (e) {
      // Guest user - that's fine!
    }
  };

  const handleNext = () => {
    if (currentStep === 0 && !childName.trim()) return;
    if (steps[currentStep]?.id === 'contact' && (!contactInfo.email || !contactInfo.phone)) return;
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePayment = async () => {
    setProcessing(true);
    
    // Simulate payment processing
    setTimeout(async () => {
      try {
        // Create trial booking as guest
        const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = weekdays[session.weekday];
        
        const today = new Date();
        const targetDay = session.weekday;
        const currentDay = today.getDay();
        let daysUntilTarget = targetDay - currentDay;
        if (daysUntilTarget <= 0) {
          daysUntilTarget += 7;
        }
        const nextOccurrence = new Date(today);
        nextOccurrence.setDate(today.getDate() + daysUntilTarget);
        
        const [hours, minutes] = session.start_time.split(':').map(Number);
        nextOccurrence.setHours(hours, minutes, 0, 0);
        
        const bookingData = {
          parent_name: 'Guest', // Will update after account creation
          parent_email: contactInfo.email,
          parent_phone: contactInfo.phone,
          student_name: childName,
          trial_datetime: nextOccurrence.toISOString(),
          location_id: session?.location_id,
          student_age: 10,
          trial_type: 'in_person',
          pipeline_stage: 'payment_complete',
          confirmation_sent: false, // Send after full registration
          source: 'guest_booking',
          notes: `${dayName}s at ${session.start_time} - ${session.title}`,
        };

        const booking = await api.entities.TrialBooking.create(bookingData);
        setBookingId(booking.id);
        
        // Move to post-purchase step
        setCurrentStep(currentStep + 1);
      } catch (error) {
        console.error('Error creating booking:', error);
        alert('Booking failed. Please try again.');
      } finally {
        setProcessing(false);
      }
    }, 1500);
  };

  const handlePostPurchaseSubmit = async () => {
    setProcessing(true);
    
    try {
      // Update booking with additional info
      if (bookingId) {
        await api.entities.TrialBooking.update(bookingId, {
          student_age: medicalInfo.dob ? new Date().getFullYear() - new Date(medicalInfo.dob).getFullYear() : 10,
          notes: `Medical: ${medicalInfo.allergies || 'None'}. Emergency: ${medicalInfo.emergencyName} (${medicalInfo.emergencyPhone})`,
        });
      }
      
      // Move to account creation
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error('Error updating booking:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleAccountCreation = async () => {
    setProcessing(true);
    
    try {
      // In Base44, we can't create accounts programmatically
      // So we'll redirect to login with a return URL
      const returnUrl = window.location.origin + '/ParentDashboard';
      
      // Store booking data in localStorage for after login
      localStorage.setItem('pendingBooking', JSON.stringify({
        bookingId,
        childName,
        email: contactInfo.email,
        phone: contactInfo.phone,
        medicalInfo,
      }));
      
      // Send email with booking details and login link
      await api.integrations.Core.SendEmail({
        to: contactInfo.email,
        from_name: 'Skill Samurai',
        subject: '🎉 Your Trial is Confirmed! Create Your Account',
        body: `Hi there!

Great news! Your free trial session for ${childName} has been confirmed!

📅 Weekly Schedule: ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][session.weekday]}s
🕐 Time: ${session.start_time}
📍 Class: ${session.title}

Next Step: Create your account to access your parent dashboard, where you can:
• View your booking details
• Track ${childName}'s progress
• Book additional classes
• Manage your family profile

👉 Create your account now: ${window.location.origin}/ParentDashboard

See you soon!
- Skill Samurai Team`
      });
      
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleFinalStep = () => {
    // Redirect to login
    api.auth.redirectToLogin(window.location.origin + '/ParentDashboard');
  };

  const handleClose = () => {
    setCurrentStep(0);
    setChildName('');
    setContactInfo({ email: '', phone: '' });
    setMedicalInfo({ dob: '', allergies: '', emergencyName: '', emergencyPhone: '' });
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
              {currentStep > 0 && currentStep < steps.length - 1 && (
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
                  {offering?.name || session?.name || 'Book Free Trial'}
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
              {steps.slice(0, 4).map((step, index) => (
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
              {/* Step 1: Child Name */}
              {currentStep === 0 && (
                <motion.div
                  key="child"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">What's your child's name?</h3>
                  <p className="text-slate-600 mb-6">We'll collect more details after booking</p>
                  <Input
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    placeholder="Enter child's first name"
                    className="h-14 text-lg"
                    autoFocus
                  />
                </motion.div>
              )}

              {/* Step 2: Date/Time */}
              {steps[currentStep]?.id === 'datetime' && (
                <motion.div
                  key="datetime"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-2xl font-bold text-slate-900">Your Class Schedule</h3>
                  <Card className="p-6 bg-white/80 border-white/50">
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <Calendar className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900 text-lg">
                            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][session.weekday]}s
                          </p>
                          <p className="text-slate-600 mt-1">
                            {session.start_time} · {session.duration_minutes} minutes
                          </p>
                          <p className="text-sm text-slate-500 mt-2">
                            {session.title}
                          </p>
                          <Badge className="mt-3 bg-emerald-100 text-emerald-700 border-0">
                            Ages {session.age_min}-{session.age_max}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Step 3: Contact Info */}
              {steps[currentStep]?.id === 'contact' && (
                <motion.div
                  key="contact"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Your Contact Information</h3>
                  <p className="text-slate-600 mb-6">So we can send you booking details</p>
                  <div className="space-y-4">
                    <div>
                      <Input
                        type="email"
                        value={contactInfo.email}
                        onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                        placeholder="your@email.com"
                        className="h-14 text-lg"
                      />
                    </div>
                    <div>
                      <Input
                        type="tel"
                        value={contactInfo.phone}
                        onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                        placeholder="(555) 123-4567"
                        className="h-14 text-lg"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Payment/Confirm */}
              {steps[currentStep]?.id === 'payment' && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-2xl font-bold text-slate-900">Confirm Your Booking</h3>
                  
                  <Card className="p-6 bg-white/80 border-white/50">
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Child:</span>
                        <span className="font-semibold">{childName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Day:</span>
                        <span className="font-semibold">
                          {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][session.weekday]}s
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Time:</span>
                        <span className="font-semibold">{session.start_time}</span>
                      </div>
                      <div className="flex justify-between text-xl pt-4 border-t">
                        <span className="font-bold">Total:</span>
                        <span className="font-bold text-green-600">FREE</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Button
                        className="w-full h-14 rounded-xl bg-black hover:bg-black/90 text-white"
                        onClick={handlePayment}
                        disabled={processing}
                      >
                        {processing ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <Apple className="w-6 h-6 mr-2" />
                            Pay with Apple Pay
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full h-14 rounded-xl"
                        onClick={handlePayment}
                        disabled={processing}
                      >
                        <CreditCard className="w-5 h-5 mr-2" />
                        Pay with Card
                      </Button>
                      <div className="text-center text-xs text-slate-500">
                        No payment required for free trial
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Step 5: Post-Purchase Data Collection */}
              {steps[currentStep]?.id === 'post-purchase' && (
                <motion.div
                  key="post-purchase"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Almost Done!</h3>
                  <p className="text-slate-600 mb-6">A few quick details for {childName}'s safety</p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">
                        Date of Birth
                      </label>
                      <Input
                        type="date"
                        value={medicalInfo.dob}
                        onChange={(e) => setMedicalInfo({...medicalInfo, dob: e.target.value})}
                        className="h-12"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">
                        Allergies or Medical Conditions (Optional)
                      </label>
                      <Input
                        value={medicalInfo.allergies}
                        onChange={(e) => setMedicalInfo({...medicalInfo, allergies: e.target.value})}
                        placeholder="None"
                        className="h-12"
                      />
                    </div>

                    <div className="pt-4 border-t">
                      <p className="font-semibold text-slate-900 mb-4">Emergency Contact</p>
                      <div className="space-y-3">
                        <Input
                          value={medicalInfo.emergencyName}
                          onChange={(e) => setMedicalInfo({...medicalInfo, emergencyName: e.target.value})}
                          placeholder="Emergency contact name"
                          className="h-12"
                        />
                        <Input
                          type="tel"
                          value={medicalInfo.emergencyPhone}
                          onChange={(e) => setMedicalInfo({...medicalInfo, emergencyPhone: e.target.value})}
                          placeholder="Emergency contact phone"
                          className="h-12"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handlePostPurchaseSubmit}
                      disabled={processing}
                      className="w-full h-12 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 mt-6"
                    >
                      {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue'}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 6: Account Creation */}
              {steps[currentStep]?.id === 'account' && (
                <motion.div
                  key="account"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6 text-center"
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto">
                    <Check className="w-10 h-10 text-white" />
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Booking Confirmed! 🎉</h3>
                    <p className="text-slate-600 text-lg">
                      We've sent booking details to {contactInfo.email}
                    </p>
                  </div>

                  <Card className="p-6 bg-indigo-50 border-indigo-200 text-left">
                    <p className="font-semibold text-slate-900 mb-2">Create Your Account</p>
                    <p className="text-sm text-slate-600 mb-4">
                      Access your parent dashboard to track {childName}'s progress, book more classes, and manage your profile.
                    </p>
                    <Button
                      onClick={handleAccountCreation}
                      disabled={processing}
                      className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
                    >
                      {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account Now'}
                    </Button>
                  </Card>

                  <button
                    onClick={handleClose}
                    className="text-sm text-slate-500 hover:text-slate-700"
                  >
                    I'll do this later
                  </button>
                </motion.div>
              )}

              {/* Step 7: Success */}
              {steps[currentStep]?.id === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-6 py-8"
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto shadow-xl">
                    <Check className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                      Check Your Email! 📧
                    </h3>
                    <p className="text-slate-600 text-lg">
                      We've sent you a link to create your account and access your parent dashboard.
                    </p>
                  </div>
                  <Button
                    onClick={handleFinalStep}
                    className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
                  >
                    Go to Login
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Actions */}
          {steps[currentStep]?.id !== 'payment' && 
           steps[currentStep]?.id !== 'post-purchase' && 
           steps[currentStep]?.id !== 'account' && 
           steps[currentStep]?.id !== 'success' && (
            <div className="p-6 border-t border-white/50 flex-shrink-0">
              <Button
                onClick={handleNext}
                disabled={
                  (currentStep === 0 && !childName.trim()) ||
                  (steps[currentStep]?.id === 'contact' && (!contactInfo.email || !contactInfo.phone))
                }
                className="w-full h-12 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl shadow-lg disabled:opacity-50"
              >
                Continue
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}