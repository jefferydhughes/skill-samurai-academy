import React, { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { Loader2, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ExpressCheckout({ 
  accountId, 
  items, 
  amount, 
  currency = 'usd',
  onSuccess, 
  onCancel,
  isSubscription = false,
  customerId,
  priceId
}) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [paymentElement, setPaymentElement] = useState(null);

  useEffect(() => {
    loadStripeElements();
  }, []);

  const loadStripeElements = async () => {
    try {
      // Load Stripe.js
      const stripe = window.Stripe?.(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
      if (!stripe) {
        throw new Error('Stripe.js failed to load');
      }

      let clientSecret;

      if (isSubscription && priceId && customerId) {
        // Create subscription intent
        const result = await api.functions.invoke('createSubscriptionIntent', {
          accountId,
          customerId,
          priceId,
          metadata: {
            items: JSON.stringify(items),
          },
        });
        clientSecret = result.data.clientSecret;
      } else {
        // Create payment intent
        const result = await api.functions.invoke('createPaymentIntent', {
          accountId,
          amount,
          currency,
          customerId,
          metadata: {
            items: JSON.stringify(items),
          },
        });
        clientSecret = result.data.clientSecret;
      }

      // Initialize Express Checkout Element
      const elements = stripe.elements({ 
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#4f46e5',
          },
        },
      });

      const expressCheckoutElement = elements.create('expressCheckout', {
        wallets: {
          applePay: 'auto',
          googlePay: 'auto',
        },
      });

      expressCheckoutElement.mount('#express-checkout-element');

      // Handle payment confirmation
      expressCheckoutElement.on('confirm', async (event) => {
        setProcessing(true);
        setError(null);

        const { error: confirmError } = await stripe.confirmPayment({
          elements,
          clientSecret,
          confirmParams: {
            return_url: `${window.location.origin}/CheckoutSuccess`,
          },
        });

        if (confirmError) {
          setError(confirmError.message);
          setProcessing(false);
        } else {
          onSuccess?.();
        }
      });

      setPaymentElement(expressCheckoutElement);
    } catch (err) {
      console.error('Error loading Stripe elements:', err);
      setError(err.message);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Express Checkout Element */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Quick Checkout
          </h3>
          <div id="express-checkout-element" className="mb-4"></div>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-slate-500">Or pay with card</span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Processing State */}
        {processing && (
          <div className="flex items-center justify-center gap-2 p-4 bg-indigo-50 rounded-lg">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
            <p className="text-sm text-indigo-700">Processing payment...</p>
          </div>
        )}

        {/* Cancel Button */}
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={processing}
          className="w-full"
        >
          Cancel
        </Button>
      </div>
    </Card>
  );
}