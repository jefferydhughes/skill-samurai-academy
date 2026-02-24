import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingCart, CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';

export default function CheckoutCart({ 
  items = [], 
  onUpdateQuantity, 
  onRemoveItem, 
  onCheckout,
  isOpen,
  onClose 
}) {
  const [upsells, setUpsells] = useState({
    early_dropoff: false,
    late_pickup: false,
    lunch_program: false,
    tshirt: false,
  });
  const [processing, setProcessing] = useState(false);

  const upsellPrices = {
    early_dropoff: 1500, // $15/day
    late_pickup: 1500,
    lunch_program: 2000, // $20/day
    tshirt: 2500, // $25 one-time
  };

  const upsellLabels = {
    early_dropoff: 'Early Drop-off (8:00 AM)',
    late_pickup: 'Late Pick-up (until 6:00 PM)',
    lunch_program: 'Lunch Program',
    tshirt: 'Custom T-Shirt',
  };

  const calculateSubtotal = () => {
    return items.reduce((total, item) => {
      const basePrice = item.price * (item.quantity || 1);
      return total + basePrice;
    }, 0);
  };

  const calculateUpsellsTotal = () => {
    return Object.entries(upsells)
      .filter(([key, enabled]) => enabled)
      .reduce((total, [key]) => {
        const price = upsellPrices[key];
        // For camp items, multiply by number of days
        const campItem = items.find(item => item.type === 'camp');
        const multiplier = campItem && key !== 'tshirt' 
          ? (campItem.selectedDays?.length || 1) 
          : 1;
        return total + (price * multiplier);
      }, 0);
  };

  const subtotal = calculateSubtotal();
  const upsellsTotal = calculateUpsellsTotal();
  const total = subtotal + upsellsTotal;

  // Get location tax info if available
  const locationTax = items[0]?.locationTax || null;

  const handleCheckout = async () => {
    setProcessing(true);
    try {
      await onCheckout({
        items,
        upsells: Object.entries(upsells)
          .filter(([key, enabled]) => enabled)
          .map(([key]) => key),
        subtotal,
        upsellsTotal,
        total,
      });
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b flex items-center justify-between bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-bold">Your Cart</h2>
                <p className="text-sm text-indigo-100">{items.length} item{items.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-xl"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Your cart is empty</p>
              </div>
            ) : (
              <>
                {/* Cart Items */}
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex gap-4">
                        {item.image && (
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 truncate">{item.name}</h3>
                          <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                          
                          {item.type === 'subscription' && (
                            <Badge className="mt-2 bg-indigo-100 text-indigo-700 border-0">
                              {item.plan === '1x' ? '1x per week' : '2x per week'}
                            </Badge>
                          )}
                          
                          {item.type === 'camp' && item.selectedDays && (
                            <Badge className="mt-2 bg-amber-100 text-amber-700 border-0">
                              {item.selectedDays.length} day{item.selectedDays.length !== 1 ? 's' : ''}
                            </Badge>
                          )}
                          
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-lg font-bold text-slate-900">
                              ${(item.price / 100).toFixed(2)}
                              {item.type === 'subscription' && <span className="text-sm text-slate-500">/mo</span>}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onRemoveItem(index)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Upsells - only show for camp bookings */}
                {items.some(item => item.type === 'camp') && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-slate-900">Add-ons</h3>
                    <Card className="p-4 space-y-3">
                      {Object.entries(upsellLabels).map(([key, label]) => (
                        <div key={key} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={upsells[key]}
                              onCheckedChange={(checked) => 
                                setUpsells({...upsells, [key]: checked})
                              }
                            />
                            <div>
                              <p className="text-sm font-medium text-slate-900">{label}</p>
                              <p className="text-xs text-slate-500">
                                +${(upsellPrices[key] / 100).toFixed(2)}
                                {key !== 'tshirt' && '/day'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </Card>
                  </div>
                )}

                {/* Price Summary */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>${(subtotal / 100).toFixed(2)}</span>
                  </div>
                  
                  {upsellsTotal > 0 && (
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Add-ons</span>
                      <span>${(upsellsTotal / 100).toFixed(2)}</span>
                    </div>
                  )}
                  
                  {locationTax && (
                    <div className="flex items-center justify-between text-slate-600">
                      <span>{locationTax.displayName} ({locationTax.percentage}%)</span>
                      <span>${(((subtotal + upsellsTotal) * locationTax.percentage / 100) / 100).toFixed(2)}</span>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between text-lg font-bold text-slate-900">
                    <span>Total</span>
                    <span>
                      ${locationTax 
                        ? (((subtotal + upsellsTotal) * (1 + locationTax.percentage / 100)) / 100).toFixed(2)
                        : (total / 100).toFixed(2)
                      }
                    </span>
                  </div>
                  {locationTax && (
                    <p className="text-xs text-slate-500 text-center">
                      Tax calculated at checkout
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-6 border-t bg-slate-50">
              <Button
                onClick={handleCheckout}
                disabled={processing}
                className="w-full h-14 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-lg shadow-lg"
              >
                {processing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Proceed to Checkout
                  </>
                )}
              </Button>
              <p className="text-xs text-center text-slate-500 mt-3">
                Secure payment powered by Stripe
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}