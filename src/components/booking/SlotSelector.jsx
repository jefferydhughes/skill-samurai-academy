import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function SlotSelector({ slots = [], selectedSlots, onSelectionChange, maxSelection = 1 }) {
  const toggleSlot = (slotId) => {
    if (selectedSlots.includes(slotId)) {
      onSelectionChange(selectedSlots.filter(id => id !== slotId));
    } else if (selectedSlots.length < maxSelection) {
      onSelectionChange([...selectedSlots, slotId]);
    } else {
      onSelectionChange([slotId]);
    }
  };

  const groupedSlots = slots.reduce((acc, slot) => {
    const day = WEEKDAYS[slot.weekday];
    if (!acc[day]) acc[day] = [];
    acc[day].push(slot);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Choose Your Schedule</h3>
        {maxSelection > 1 && (
          <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
            Select up to {maxSelection} times
          </Badge>
        )}
      </div>

      <div className="space-y-4">
        {Object.entries(groupedSlots).map(([day, daySlots]) => (
          <div key={day}>
            <h4 className="text-sm font-semibold text-slate-700 mb-2">{day}</h4>
            <div className="grid gap-2">
              {daySlots.map((slot, index) => {
                const isSelected = selectedSlots.includes(slot.id);
                const spotsLeft = slot.capacity - (slot.enrolled || 0);
                
                return (
                  <motion.div
                    key={slot.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      onClick={() => toggleSlot(slot.id)}
                      className={`
                        p-4 cursor-pointer transition-all border-2
                        ${isSelected 
                          ? 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-violet-50 shadow-md' 
                          : 'border-slate-200 bg-white/80 hover:border-indigo-300'
                        }
                      `}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                          ${isSelected ? 'bg-indigo-600' : 'bg-slate-100'}
                        `}>
                          {isSelected ? (
                            <Check className="w-5 h-5 text-white" />
                          ) : (
                            <Clock className="w-5 h-5 text-slate-500" />
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="font-semibold text-slate-900 mb-1">
                            {slot.start_time} - {slot.duration_minutes || 60} min
                          </div>
                          <div className="text-sm text-slate-600">
                            Ages {slot.age_min}-{slot.age_max}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                            <Users className="w-4 h-4" />
                            {spotsLeft} spots
                          </div>
                          {spotsLeft <= 3 && (
                            <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">
                              Low availability
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}