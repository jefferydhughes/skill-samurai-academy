import React, { useState } from 'react';
import { api } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Mail, XCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function WaitlistManager() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('waiting');

  const { data: waitlist = [], isLoading } = useQuery({
    queryKey: ['waitlist', filter],
    queryFn: () => api.entities.Waitlist.filter(
      filter === 'all' ? {} : { status: filter },
      '-created_date'
    ),
  });

  const notifyMutation = useMutation({
    mutationFn: async (entry) => {
      // Update waitlist status
      await api.entities.Waitlist.update(entry.id, {
        status: 'notified',
        notified_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      // Send notification email
      await api.integrations.Core.SendEmail({
        to: entry.parent_email,
        from_name: 'Skill Samurai',
        subject: '🎉 A Spot Opened Up!',
        body: `Hi ${entry.parent_email.split('@')[0]},

Great news! A spot is now available for ${entry.student_name}.

You have 24 hours to claim this spot. Click the link below to complete your booking:

[Book Now Link]

If we don't hear from you within 24 hours, we'll offer the spot to the next person on the waitlist.

- Skill Samurai Team`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['waitlist']);
    }
  });

  const removeMutation = useMutation({
    mutationFn: (id) => api.entities.Waitlist.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['waitlist']);
    }
  });

  const statusColors = {
    waiting: 'bg-amber-100 text-amber-700',
    notified: 'bg-blue-100 text-blue-700',
    converted: 'bg-emerald-100 text-emerald-700',
    expired: 'bg-slate-100 text-slate-500',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Waitlist Management</h2>
          <p className="text-slate-600">Manage students waiting for available spots</p>
        </div>
        <Badge className="bg-amber-500 text-white border-0 text-lg px-4 py-2">
          {waitlist.filter(w => w.status === 'waiting').length} waiting
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['waiting', 'notified', 'converted', 'expired', 'all'].map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            onClick={() => setFilter(status)}
            className="capitalize"
          >
            {status}
          </Button>
        ))}
      </div>

      {/* Waitlist Entries */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      ) : waitlist.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No waitlist entries found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {waitlist.map((entry) => (
            <Card key={entry.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg">
                        {entry.student_name?.[0]?.toUpperCase() || 'S'}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{entry.student_name}</h3>
                        <p className="text-sm text-slate-600">{entry.parent_email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500">Type:</span>
                        <span className="ml-2 font-semibold capitalize">{entry.waitlist_type}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Added:</span>
                        <span className="ml-2 font-semibold">
                          {format(new Date(entry.created_date), 'MMM d, yyyy')}
                        </span>
                      </div>
                      {entry.position && (
                        <div>
                          <span className="text-slate-500">Position:</span>
                          <span className="ml-2 font-semibold">#{entry.position}</span>
                        </div>
                      )}
                      {entry.notified_at && (
                        <div>
                          <span className="text-slate-500">Notified:</span>
                          <span className="ml-2 font-semibold">
                            {format(new Date(entry.notified_at), 'MMM d, h:mm a')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <Badge className={`${statusColors[entry.status]} border-0`}>
                      {entry.status}
                    </Badge>

                    <div className="flex gap-2">
                      {entry.status === 'waiting' && (
                        <Button
                          size="sm"
                          onClick={() => notifyMutation.mutate(entry)}
                          disabled={notifyMutation.isPending}
                          className="bg-indigo-600 hover:bg-indigo-700"
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Notify
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeMutation.mutate(entry.id)}
                        disabled={removeMutation.isPending}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}