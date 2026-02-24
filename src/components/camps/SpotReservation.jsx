import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const RESERVATION_MINUTES = 15;

export default function SpotReservation({ camp, onClose, onContinue }) {
  const [timeLeft, setTimeLeft] = useState(RESERVATION_MINUTES * 60);
  const [isReserved, setIsReserved] = useState(false);

  useEffect(() => {
    if (!camp || isReserved) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [camp, isReserved, onClose]);

  if (!camp) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = (timeLeft / (RESERVATION_MINUTES * 60)) * 100;

  const handleReserve = () => {
    setIsReserved(true);
    // In production, this would create a temporary reservation in Supabase
    setTimeout(() => {
      onContinue();
    }, 1500);
  };

  return (
    <Dialog open={!!camp} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        {!isReserved ? (
          <>
            <DialogHeader>
              <DialogTitle>Save Your Spot</DialogTitle>
              <DialogDescription>
                Reserve this camp for {RESERVATION_MINUTES} minutes while you complete registration
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-6">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-12 h-12 text-indigo-600" />
                </div>
                <div className="text-4xl font-bold text-slate-900 mb-2">
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </div>
                <Progress value={progress} className="h-2 mb-2" />
                <p className="text-sm text-slate-600">Time remaining</p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">{camp.title}</h3>
                <div className="text-sm text-slate-600">
                  <div>Ages {camp.age_min}-{camp.age_max}</div>
                  <div className="font-semibold text-slate-900 mt-2">
                    ${(camp.price / 100).toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleReserve} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                  Reserve & Continue
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Spot Reserved!</DialogTitle>
            </DialogHeader>
            <div className="py-8 text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <p className="text-slate-600">
                Your spot is reserved for {RESERVATION_MINUTES} minutes
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}