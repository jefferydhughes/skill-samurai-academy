import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Calendar, Clock, Users, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

export default function CompareDrawer({ camps, onClose, onRemove, onEventClick }) {
  if (camps.length === 0) return null;

  return (
    <Sheet open={camps.length > 0} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Compare Camps ({camps.length}/3)</SheetTitle>
        </SheetHeader>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {camps.map((camp) => {
            const spotsLeft = camp.capacity - camp.enrolled_count;
            const isFull = spotsLeft <= 0;

            return (
              <div key={camp.id} className="bg-white rounded-xl border border-slate-200 p-6 relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => onRemove(camp.id)}
                >
                  <X className="w-4 h-4" />
                </Button>

                {camp.thumbnail && (
                  <img 
                    src={camp.thumbnail} 
                    alt={camp.title}
                    className="w-full h-32 object-cover rounded-lg mb-4"
                  />
                )}

                <h3 className="font-bold text-lg mb-4">{camp.title}</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-indigo-600 mt-0.5" />
                    <div>
                      <div className="font-medium">Dates</div>
                      <div className="text-slate-600">
                        {format(new Date(camp.start_datetime), 'MMM d')} - {format(new Date(camp.end_datetime), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-indigo-600 mt-0.5" />
                    <div>
                      <div className="font-medium">Daily Schedule</div>
                      <div className="text-slate-600">
                        {camp.daily_schedule?.drop_off || '9:00 AM'} - {camp.daily_schedule?.pickup || '3:00 PM'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Users className="w-4 h-4 text-indigo-600 mt-0.5" />
                    <div>
                      <div className="font-medium">Age Range</div>
                      <div className="text-slate-600">{camp.age_min}-{camp.age_max} years</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <DollarSign className="w-4 h-4 text-indigo-600 mt-0.5" />
                    <div>
                      <div className="font-medium">Price</div>
                      <div className="text-slate-600">${(camp.price / 100).toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <div className="font-medium mb-1">Category</div>
                    <Badge variant="secondary">{camp.category || 'General'}</Badge>
                  </div>

                  <div className="pt-3 border-t">
                    <div className="font-medium mb-1">Availability</div>
                    {isFull ? (
                      <Badge variant="destructive">FULL</Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-700 border-0">
                        {spotsLeft} spots available
                      </Badge>
                    )}
                  </div>
                </div>

                <Button
                  className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => {
                    onEventClick(camp);
                    onClose();
                  }}
                  disabled={isFull}
                >
                  {isFull ? 'Full' : 'Register Now'}
                </Button>
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}