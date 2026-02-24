import React from 'react';
import { useCart } from './CartContext';
import CheckoutCart from './CheckoutCart';
import { api } from '@/api/apiClient';

export default function CheckoutCartWrapper() {
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, clearCart } = useCart();

  const handleCheckout = async ({ items, upsells, total }) => {
    try {
      // Get the location and its Stripe account from the first item
      const firstItem = items[0];
      if (!firstItem?.locationId) {
        throw new Error('No location specified');
      }

      // Fetch location to get Stripe account ID and tax info
      const locations = await api.entities.Location.filter({ id: firstItem.locationId });
      const location = locations[0];

      if (!location?.stripe_connect_account_id) {
        throw new Error('Location does not have Stripe Connect configured');
      }

      // Create or get tax rate if location has tax configured
      let taxRateId = null;
      if (location.tax_rate && location.tax_display_name) {
        const taxResult = await api.functions.invoke('createTaxRate', {
          accountId: location.stripe_connect_account_id,
          displayName: location.tax_display_name,
          percentage: location.tax_rate,
          inclusive: false,
        });
        taxRateId = taxResult.data.taxRate.id;
      }

      // Create checkout session
      const result = await api.functions.invoke('createConnectedCheckout', {
        accountId: location.stripe_connect_account_id,
        items: items.map(item => ({
          name: item.name,
          description: item.description,
          price: item.price,
          quantity: item.quantity || 1,
          type: item.type,
          currency: 'usd',
          stripePriceId: item.stripePriceId,
          recurring: item.type === 'subscription' ? 'month' : null,
          metadata: {
            student_id: item.studentId,
            location_id: item.locationId,
            camp_event_id: item.campEventId,
            selected_days: item.selectedDays ? JSON.stringify(item.selectedDays) : null,
            plan: item.plan,
          },
        })),
        upsells,
        taxRateId,
        metadata: {
          location_id: firstItem.locationId,
        },
      });

      // Clear cart and redirect to Stripe Checkout
      clearCart();
      window.location.href = result.data.url;
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Checkout failed: ' + error.message);
    }
  };

  return (
    <CheckoutCart
      items={cartItems}
      isOpen={isCartOpen}
      onClose={() => setIsCartOpen(false)}
      onRemoveItem={removeFromCart}
      onCheckout={handleCheckout}
    />
  );
}