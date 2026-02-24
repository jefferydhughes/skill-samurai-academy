import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Clock, Calendar, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import BookingWizard from './BookingWizard';
import { format } from 'date-fns';

export default function OfferingCard({ offering, session, campEvent, availableSlots, index = 0 }) {
  const [wizardOpen, setWizardOpen] = useState(false);

  const bookingType = campEvent ? 'camp' : (offering?.type === 'weekly' ? 'weekly' : 'trial');

  const spotsLeft = session?.capacity ? session.capacity - (session.enrolledCount || 0) : null;
  const isLowCapacity = spotsLeft && spotsLeft <= 5;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.5 }}
        whileHover={{ y: -8, scale: 1.02 }}
        className="h-full"
      >
        <Card className="group h-full rounded-3xl bg-white/60 backdrop-blur-xl border border-white/50 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-500 overflow-hidden">
          {/* Image */}
          <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-indigo-500 to-violet-600">
            {offering?.thumbnail ? (
              <img 
                src={offering.thumbnail} 
                alt={offering.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Zap className="w-16 h-16 text-white/80" />
              </div>
            )}
            
            {/* Availability Badge */}
            {spotsLeft !== null && (
              <Badge className={`
                absolute top-4 right-4 border-0 rounded-xl px-3 py-1 shadow-lg backdrop-blur-xl text-sm font-bold
                ${isLowCapacity ? 'bg-amber-500 text-white animate-pulse' : 'bg-emerald-500 text-white'}
              `}>
                {spotsLeft} {spotsLeft === 1 ? 'spot' : 'spots'} left
              </Badge>
            )}

            {offering?.type && (
              <Badge className="absolute top-4 left-4 bg-white/90 text-slate-900 border-0 rounded-xl px-3 py-1 shadow-lg backdrop-blur-xl text-xs font-bold capitalize">
                {offering.type}
              </Badge>
            )}
          </div>
          
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2">
              {offering?.name || session?.name || 'Coding Session'}
            </h3>
            
            <p className="text-slate-600 mb-4 line-clamp-2 leading-relaxed text-sm">
              {offering?.description || 'An exciting coding adventure awaits!'}
            </p>

            {/* Session Details */}
            {session && (
              <div className="flex flex-col gap-2 mb-4 text-sm font-medium text-slate-500">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  {format(new Date(session.startDate), 'EEE, MMM d')}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  {format(new Date(session.startDate), 'h:mm a')}
                </div>
              </div>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap gap-3 mb-4 text-sm font-medium text-slate-500">
              {offering?.ageRange && (
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Ages {offering.ageRange.min}-{offering.ageRange.max}
                </span>
              )}
            </div>

            {/* CTA */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div>
                {offering?.price ? (
                  <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                    ${(offering.price / 100).toFixed(0)}
                  </span>
                ) : (
                  <span className="text-xl font-bold text-emerald-600">Free</span>
                )}
              </div>
              <Button 
                onClick={() => setWizardOpen(true)}
                className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all min-w-[120px]"
              >
                <Zap className="w-4 h-4 mr-2" />
                Instant Book
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <BookingWizard
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        offering={offering}
        session={session}
        bookingType={bookingType}
        campEvent={campEvent}
        availableSlots={availableSlots}
      />
    </>
  );
}