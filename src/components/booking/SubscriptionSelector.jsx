import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Calendar, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SubscriptionSelector({ selectedPlan, onPlanChange, availableSlots = [] }) {
  const plans = [
    {
      id: '1x',
      name: 'Once Weekly',
      description: 'Perfect for getting started',
      price: 14900,
      sessions: 1,
      popular: false,
    },
    {
      id: '2x',
      name: 'Twice Weekly',
      description: 'Accelerated learning',
      price: 24900,
      sessions: 2,
      popular: true,
      discount: 17,
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-900">Choose Your Plan</h3>

      <div className="grid md:grid-cols-2 gap-4">
        {plans.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          
          return (
            <motion.div
              key={plan.id}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                onClick={() => onPlanChange(plan.id)}
                className={`
                  relative p-6 cursor-pointer transition-all border-2
                  ${isSelected 
                    ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-violet-50 shadow-xl' 
                    : 'border-slate-200 bg-white/80 hover:border-indigo-300 shadow-md'
                  }
                `}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-0">
                    Most Popular
                  </Badge>
                )}

                <div className="text-center space-y-3">
                  <div className={`
                    w-12 h-12 rounded-full mx-auto flex items-center justify-center
                    ${isSelected ? 'bg-indigo-600' : 'bg-slate-200'}
                  `}>
                    {isSelected ? (
                      <Check className="w-6 h-6 text-white" />
                    ) : (
                      <Calendar className="w-6 h-6 text-slate-500" />
                    )}
                  </div>

                  <div>
                    <h4 className="text-xl font-bold text-slate-900 mb-1">{plan.name}</h4>
                    <p className="text-sm text-slate-600">{plan.description}</p>
                  </div>

                  <div>
                    <div className="text-3xl font-bold text-slate-900">
                      ${(plan.price / 100).toFixed(0)}
                      <span className="text-sm font-normal text-slate-500">/month</span>
                    </div>
                    {plan.discount && (
                      <Badge variant="secondary" className="mt-2 bg-emerald-100 text-emerald-700 border-0">
                        Save {plan.discount}%
                      </Badge>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-200 text-sm text-slate-600 space-y-1">
                    <div className="flex items-center justify-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{plan.sessions} session{plan.sessions > 1 ? 's' : ''} per week</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}