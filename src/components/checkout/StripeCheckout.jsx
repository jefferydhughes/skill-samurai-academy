import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function StripeCheckout({ checkoutData, onSuccess, onCancel }) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (checkoutData) {
      handleStripeCheckout();
    }
  }, [checkoutData]);

  const handleStripeCheckout = async () => {
    setProcessing(true);
    setError(null);

    try {
      // This would call a backend function to create Stripe checkout session
      // Since Base44 requires backend functions to be enabled, 
      // the user needs to enable them first and create the function
      
      // For now, we'll show instructions
      console.log('Checkout data:', checkoutData);
      
      // Mock successful payment for demo
      setTimeout(() => {
        onSuccess?.({
          sessionId: 'mock_session_' + Date.now(),
          ...checkoutData
        });
      }, 2000);

    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || 'Payment failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-6">
        {processing ? (
          <>
            <Loader2 className="w-16 h-16 animate-spin text-indigo-600 mx-auto" />
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Processing Payment...
              </h3>
              <p className="text-slate-600">
                Please wait while we securely process your payment
              </p>
            </div>
          </>
        ) : error ? (
          <>
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <span className="text-3xl">❌</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Payment Failed
              </h3>
              <p className="text-slate-600">{error}</p>
            </div>
            <button
              onClick={onCancel}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Try Again
            </button>
          </>
        ) : null}
      </Card>
    </div>
  );
}