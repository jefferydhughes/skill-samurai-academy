import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CampCalendarView({ camps, onEventClick }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get camps for each day
  const getCampsForDay = (day) => {
    return camps.filter(camp => {
      const campStart = new Date(camp.start_datetime);
      return isSameDay(campStart, day);
    });
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Week day headers */}
        {weekDays.map(day => (
          <div key={day} className="text-center font-semibold text-slate-700 py-2">
            {day}
          </div>
        ))}

        {/* Days */}
        {daysInMonth.map(day => {
          const dayCamps = getCampsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);

          return (
            <div
              key={day.toISOString()}
              className={`min-h-32 p-2 rounded-xl border ${
                isCurrentMonth 
                  ? 'bg-white border-slate-200' 
                  : 'bg-slate-50 border-slate-100'
              }`}
            >
              <div className="text-sm font-semibold text-slate-700 mb-2">
                {format(day, 'd')}
              </div>
              <div className="space-y-1">
                {dayCamps.map(camp => {
                  const spotsLeft = camp.capacity - camp.enrolled_count;
                  const isFull = spotsLeft <= 0;

                  return (
                    <button
                      key={camp.id}
                      onClick={() => onEventClick(camp)}
                      className="w-full text-left p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white hover:shadow-lg transition-all text-xs"
                    >
                      <div className="font-semibold line-clamp-1">{camp.title}</div>
                      <div className="text-white/90 mt-1">
                        Ages {camp.age_min}-{camp.age_max}
                      </div>
                      <div className="font-bold mt-1">
                        ${(camp.price / 100).toFixed(0)}
                      </div>
                      {isFull && (
                        <Badge className="mt-1 text-xs bg-red-500 border-0">FULL</Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}