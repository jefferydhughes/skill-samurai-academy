import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { AlertCircle, Sparkles, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CampListView({ camps, onEventClick, onReserveClick, compareList = [], onCompareToggle, isRecommended }) {
  // Group camps by month
  const campsByMonth = camps.reduce((acc, camp) => {
    const month = format(new Date(camp.start_datetime), 'MMMM yyyy');
    if (!acc[month]) acc[month] = [];
    acc[month].push(camp);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {Object.entries(campsByMonth).map(([month, monthCamps]) => (
        <div key={month}>
          <h3 className="text-xl font-bold text-slate-900 mb-4">{month}</h3>
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {onCompareToggle && (
                      <th className="px-4 py-4 text-left text-sm font-semibold text-slate-900 w-12"></th>
                    )}
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Camp</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Dates</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Ages</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Price</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {monthCamps.map(camp => {
                    const spotsLeft = camp.capacity - camp.enrolled_count;
                    const isFull = spotsLeft <= 0;
                    const lowSpots = spotsLeft > 0 && spotsLeft <= 5;
                    const recommended = isRecommended?.(camp);
                    const isComparing = compareList.some(c => c.id === camp.id);

                    return (
                      <tr key={camp.id} className={`hover:bg-slate-50/50 transition-colors ${
                        recommended ? 'bg-green-50/50' : ''
                      } ${isComparing ? 'bg-indigo-50/50' : ''}`}>
                        {onCompareToggle && (
                          <td className="px-4 py-4">
                            <Checkbox 
                              checked={isComparing}
                              onCheckedChange={() => onCompareToggle(camp)}
                            />
                          </td>
                        )}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            {camp.thumbnail && (
                              <img 
                                src={camp.thumbnail} 
                                alt={camp.title}
                                className="w-16 h-16 rounded-xl object-cover"
                              />
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <div className="font-semibold text-slate-900">{camp.title}</div>
                                {recommended && (
                                  <Badge className="bg-green-500 text-white border-0 text-xs">
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    Match
                                  </Badge>
                                )}
                              </div>
                              {camp.category && (
                                <Badge variant="secondary" className="mt-1 text-xs">
                                  {camp.category}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          <div>{format(new Date(camp.start_datetime), 'MMM d')}</div>
                          <div className="text-xs text-slate-500">
                            {format(new Date(camp.start_datetime), 'h:mm a')} - {format(new Date(camp.end_datetime), 'h:mm a')}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {camp.age_min}-{camp.age_max}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                          ${(camp.price / 100).toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          {isFull ? (
                            <Badge variant="destructive">FULL</Badge>
                          ) : lowSpots ? (
                            <motion.div
                              animate={{ scale: [1, 1.05, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="flex items-center gap-1 text-orange-600"
                            >
                              <AlertCircle className="w-4 h-4 animate-pulse" />
                              <span className="text-xs font-semibold">Only {spotsLeft} left!</span>
                            </motion.div>
                          ) : (
                            <Badge className="bg-green-100 text-green-700 border-0">OPEN</Badge>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {!isFull && lowSpots && onReserveClick && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onReserveClick(camp)}
                                className="border-orange-500 text-orange-600 hover:bg-orange-50"
                              >
                                <Zap className="w-3 h-3 mr-1" />
                                Reserve
                              </Button>
                            )}
                            <Button
                              size="sm"
                              onClick={() => onEventClick(camp)}
                              disabled={isFull}
                              className="bg-indigo-600 hover:bg-indigo-700"
                            >
                              Course Info
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}