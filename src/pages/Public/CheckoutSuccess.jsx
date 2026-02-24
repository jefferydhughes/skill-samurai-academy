import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Loader2, Calendar, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function CheckoutSuccess() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bookingDetails, setBookingDetails] = useState(null);

  useEffect(() => {
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Get session ID from URL params
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');

    if (sessionId) {
      // In a real implementation, verify the payment with backend
      verifyPayment(sessionId);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyPayment = async (sessionId) => {
    try {
      // This would call a backend function to verify the Stripe session
      // and create the membership/booking records
      
      // Mock booking details
      setTimeout(() => {
        setBookingDetails({
          type: 'subscription',
          plan: '2x',
          studentName: 'Demo Student',
          startDate: new Date().toISOString(),
        });
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Error verifying payment:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50">
        <Card className="p-8 text-center">
          <Loader2 className="w-16 h-16 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-slate-600">Confirming your booking...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full"
      >
        <Card className="p-8 md:p-12 text-center space-y-8">
          {/* Success Icon */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto shadow-xl">
            <Check className="w-12 h-12 text-white" />
          </div>

          {/* Success Message */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Payment Successful! 🎉
            </h1>
            <p className="text-lg text-slate-600">
              Thank you for your purchase. We're excited to have you join us!
            </p>
          </div>

          {/* Booking Details */}
          <Card className="p-6 bg-gradient-to-br from-indigo-50 to-violet-50 border-0">
            <div className="space-y-4 text-left">
              <div className="flex items-center gap-3 text-slate-700">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="text-sm text-slate-500">Booking Confirmed</p>
                  <p className="font-semibold">Registration Complete</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <Mail className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="text-sm text-slate-500">Confirmation Sent</p>
                  <p className="font-semibold">Check your email for details</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Next Steps */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900">What's Next?</h3>
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <Card className="p-4">
                <div className="text-2xl mb-2">📧</div>
                <h4 className="font-semibold text-slate-900 mb-1">Check Your Email</h4>
                <p className="text-sm text-slate-600">
                  We've sent you a confirmation with all the details
                </p>
              </Card>
              <Card className="p-4">
                <div className="text-2xl mb-2">📱</div>
                <h4 className="font-semibold text-slate-900 mb-1">Access Your Dashboard</h4>
                <p className="text-sm text-slate-600">
                  Track progress and manage your bookings
                </p>
              </Card>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={() => navigate('/ParentDashboard')}
              className="flex-1 h-12 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl"
            >
              Go to Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/ProgramsBrowser')}
              className="flex-1 h-12 rounded-xl"
            >
              Browse More Programs
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}