import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { Calendar, Clock, Users, AlertCircle, Sparkles, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CampCardView({ camps, onEventClick, onReserveClick, compareList = [], onCompareToggle, isRecommended }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {camps.map((camp, index) => {
        const spotsLeft = camp.capacity - camp.enrolled_count;
        const isFull = spotsLeft <= 0;
        const lowSpots = spotsLeft > 0 && spotsLeft <= 5;
        const recommended = isRecommended?.(camp);
        const isComparing = compareList.some(c => c.id === camp.id);

        return (
          <motion.div
            key={camp.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className={`group border-0 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden h-full flex flex-col ${
              recommended ? 'ring-2 ring-green-400 bg-green-50/30' : ''
            } ${isComparing ? 'ring-2 ring-indigo-400' : ''}`}>
              {/* Image */}
              <div className="aspect-video bg-gradient-to-br from-indigo-100 to-violet-100 relative overflow-hidden">
                {camp.thumbnail ? (
                  <img 
                    src={camp.thumbnail} 
                    alt={camp.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600">
                    <Calendar className="w-16 h-16 text-white/80" />
                  </div>
                )}

                {/* Compare Checkbox */}
                <div className="absolute top-4 left-4 z-10">
                  {onCompareToggle && (
                    <div 
                      className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 cursor-pointer hover:bg-white transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCompareToggle(camp);
                      }}
                    >
                      <Checkbox checked={isComparing} />
                      <span className="text-xs font-medium">Compare</span>
                    </div>
                  )}
                </div>
                
                {/* Recommended Badge */}
                {recommended && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg"
                  >
                    <Sparkles className="w-3 h-3" />
                    Perfect Match
                  </motion.div>
                )}

                {/* Status Badge */}
                {isFull ? (
                  <Badge className="absolute top-4 right-4 bg-red-500 text-white border-0">
                    FULL
                  </Badge>
                ) : lowSpots ? (
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute top-4 right-4"
                  >
                    <Badge className="bg-orange-500 text-white border-0 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 animate-pulse" />
                      Only {spotsLeft} left!
                    </Badge>
                  </motion.div>
                ) : null}

                {/* Category Badge */}
                {camp.category && (
                  <Badge className="absolute bottom-4 left-4 bg-black/50 text-white border-0 backdrop-blur-sm">
                    {camp.category}
                  </Badge>
                )}
              </div>

              {/* Content */}
              <CardContent className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                  {camp.title}
                </h3>

                {camp.short_description && (
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                    {camp.short_description}
                  </p>
                )}

                <div className="space-y-2 mb-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <span>
                      {format(new Date(camp.start_datetime), 'MMM d')} - {format(new Date(camp.end_datetime), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <span>
                      {camp.daily_schedule?.drop_off || '9:00 AM'} - {camp.daily_schedule?.pickup || '3:00 PM'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <span>Ages {camp.age_min}-{camp.age_max}</span>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-slate-900">
                      ${(camp.price / 100).toFixed(2)}
                    </span>
                    <span className="text-sm text-slate-500">per week</span>
                  </div>
                  {!isFull && lowSpots && onReserveClick ? (
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full border-orange-500 text-orange-600 hover:bg-orange-50"
                        onClick={() => onReserveClick(camp)}
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Save My Spot
                      </Button>
                      <Button
                        className="w-full bg-indigo-600 hover:bg-indigo-700"
                        onClick={() => onEventClick(camp)}
                      >
                        Register Now
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className="w-full bg-indigo-600 hover:bg-indigo-700"
                      onClick={() => onEventClick(camp)}
                      disabled={isFull}
                    >
                      {isFull ? 'Full - Join Waitlist' : 'Learn More & Register'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}