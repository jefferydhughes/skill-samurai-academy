import React, { useState } from 'react';
import { api } from '@/api/apiClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, XCircle, Send, Mail, Phone, Calendar, Clock, User } from 'lucide-react';
import { format } from 'date-fns';

export default function TrialDetailsModal({ booking, open, onClose, onSendReminder }) {
  const [instructorNotes, setInstructorNotes] = useState(booking?.instructor_notes || '');
  const queryClient = useQueryClient();

  const markAttendedMutation = useMutation({
    mutationFn: async (attended) => {
      await api.entities.TrialBooking.update(booking.id, {
        attended,
        attended_date: attended ? new Date().toISOString() : null,
        pipeline_stage: attended ? 'attended' : 'no_show',
        instructor_notes: instructorNotes
      });

      if (attended) {
        // Send review request
        await api.integrations.Core.SendEmail({
          to: booking.parent_email,
          subject: 'How was the trial class?',
          body: `Hi ${booking.parent_name},

Thank you for bringing ${booking.student_name} to our trial class! We hope they had a great time learning to code.

We'd love to hear your feedback! Please take a moment to share your experience:
[Review Link]

Ready to continue the coding journey? Let's discuss membership options!

Best regards,
The Skill Samurai Team`
        });

        await api.entities.TrialBooking.update(booking.id, {
          review_sent: true,
          pipeline_stage: 'review_requested'
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trial-bookings'] });
    }
  });

  const markConvertedMutation = useMutation({
    mutationFn: () => 
      api.entities.TrialBooking.update(booking.id, {
        converted_to_member: true,
        conversion_date: new Date().toISOString(),
        pipeline_stage: 'converted'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trial-bookings'] });
      onClose();
    }
  });

  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Trial Booking Details
            <Badge className={
              booking.pipeline_stage === 'converted' ? 'bg-indigo-500' :
              booking.pipeline_stage === 'attended' ? 'bg-green-500' :
              booking.pipeline_stage === 'no_show' ? 'bg-red-500' :
              'bg-blue-500'
            }>
              {booking.pipeline_stage.replace(/_/g, ' ')}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="communication">Communication</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Parent Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <span>{booking.parent_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>{booking.parent_email}</span>
                </div>
                {booking.parent_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{booking.parent_phone}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Student Information</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Name:</strong> {booking.student_name}</div>
                <div><strong>Age:</strong> {booking.student_age}</div>
                {booking.student_interests?.length > 0 && (
                  <div>
                    <strong>Interests:</strong>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {booking.student_interests.map((interest, i) => (
                        <Badge key={i} variant="secondary">{interest}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Trial Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>{format(new Date(booking.trial_datetime), 'MMMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{format(new Date(booking.trial_datetime), 'h:mm a')}</span>
                </div>
                <div><strong>Format:</strong> {booking.trial_type === 'in_person' ? 'In-Person' : 'Online'}</div>
                {booking.source && <div><strong>Source:</strong> {booking.source}</div>}
              </div>
            </div>

            {booking.notes && (
              <div>
                <h3 className="font-semibold mb-2">Notes</h3>
                <p className="text-sm text-slate-600">{booking.notes}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="communication" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">Confirmation Email</span>
                </div>
                {booking.confirmation_sent ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-slate-300" />
                )}
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-amber-500" />
                  <span className="text-sm">24h Reminder</span>
                </div>
                {booking.reminder_24h_sent ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSendReminder('24h')}
                  >
                    <Send className="w-3 h-3 mr-1" />
                    Send Now
                  </Button>
                )}
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-orange-500" />
                  <span className="text-sm">1h Reminder</span>
                </div>
                {booking.reminder_1h_sent ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSendReminder('1h')}
                  >
                    <Send className="w-3 h-3 mr-1" />
                    Send Now
                  </Button>
                )}
              </div>

              {booking.review_sent && (
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-purple-500" />
                    <span className="text-sm">Review Request</span>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            {!booking.attended && booking.pipeline_stage !== 'no_show' && (
              <div className="space-y-4">
                <Label>Mark Attendance</Label>
                <Textarea
                  placeholder="Instructor notes about the trial session..."
                  value={instructorNotes}
                  onChange={(e) => setInstructorNotes(e.target.value)}
                  rows={4}
                />
                <div className="flex gap-3">
                  <Button
                    onClick={() => markAttendedMutation.mutate(true)}
                    disabled={markAttendedMutation.isPending}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Attended
                  </Button>
                  <Button
                    onClick={() => markAttendedMutation.mutate(false)}
                    disabled={markAttendedMutation.isPending}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    No Show
                  </Button>
                </div>
              </div>
            )}

            {booking.attended && !booking.converted_to_member && (
              <div>
                <Button
                  onClick={() => markConvertedMutation.mutate()}
                  disabled={markConvertedMutation.isPending}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Mark as Converted to Member
                </Button>
              </div>
            )}

            {booking.instructor_notes && (
              <div>
                <Label>Instructor Notes</Label>
                <div className="mt-2 p-4 bg-slate-50 rounded-lg text-sm">
                  {booking.instructor_notes}
                </div>
              </div>
            )}

            {booking.converted_to_member && (
              <div className="p-4 bg-indigo-50 rounded-lg text-center">
                <CheckCircle2 className="w-12 h-12 text-indigo-600 mx-auto mb-2" />
                <div className="font-semibold text-indigo-900">Successfully Converted!</div>
                <div className="text-sm text-indigo-700">
                  Converted on {format(new Date(booking.conversion_date), 'MMM d, yyyy')}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}