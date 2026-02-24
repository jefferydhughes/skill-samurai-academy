import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export default function CampDaySelector({ campEvent, selectedDays, onSelectionChange }) {
  const days = campEvent?.days || [];
  
  const toggleDay = (dayId) => {
    const newSelection = selectedDays.includes(dayId)
      ? selectedDays.filter(id => id !== dayId)
      : [...selectedDays, dayId];
    onSelectionChange(newSelection);
  };

  const toggleAll = () => {
    if (selectedDays.length === days.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(days.map(d => d.id || d.date));
    }
  };

  const totalPrice = days
    .filter(day => selectedDays.includes(day.id || day.date))
    .reduce((sum, day) => sum + (day.price || campEvent.daily_price || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Select Days</h3>
        <button
          onClick={toggleAll}
          className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
        >
          {selectedDays.length === days.length ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      <div className="space-y-2">
        {days.map((day, index) => {
          const dayId = day.id || day.date;
          const isSelected = selectedDays.includes(dayId);
          const dayPrice = day.price || campEvent.daily_price || 0;
          const spotsLeft = (day.capacity || campEvent.capacity || 20) - (day.enrolled || 0);

          return (
            <motion.div
              key={dayId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                onClick={() => toggleDay(dayId)}
                className={`
                  p-4 cursor-pointer transition-all border-2
                  ${isSelected 
                    ? 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-violet-50 shadow-md' 
                    : 'border-slate-200 bg-white/80 hover:border-indigo-300'
                  }
                `}
              >
                <div className="flex items-center gap-4">
                  <Checkbox checked={isSelected} className="pointer-events-none" />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span className="font-semibold text-slate-900">
                        {day.date ? format(new Date(day.date), 'EEEE, MMM d') : `Day ${index + 1}`}
                      </span>
                    </div>
                    {day.theme && (
                      <p className="text-sm text-slate-600">{day.theme}</p>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-slate-900">
                      ${(dayPrice / 100).toFixed(0)}
                    </div>
                    {spotsLeft <= 5 && (
                      <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">
                        {spotsLeft} left
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {selectedDays.length > 0 && (
        <Card className="p-4 bg-gradient-to-r from-indigo-50 to-violet-50 border-indigo-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-700">
              <DollarSign className="w-5 h-5" />
              <span className="font-semibold">
                {selectedDays.length} {selectedDays.length === 1 ? 'day' : 'days'} selected
              </span>
            </div>
            <div className="text-2xl font-bold text-indigo-600">
              ${(totalPrice / 100).toFixed(0)}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}