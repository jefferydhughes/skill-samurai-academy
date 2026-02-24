import React, { useState } from 'react';
import { api } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  Calendar, 
  Clock, 
  Mail, 
  CheckCircle2,
  Bell,
  Target,
  TrendingUp,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';
import TrialBookingForm from '../../components/crm/TrialBookingForm';
import TrialDetailsModal from '../../components/crm/TrialDetailsModal';

const pipelineStages = [
  { id: 'booked', label: 'Booked', icon: Calendar, color: 'bg-blue-100 text-blue-700' },
  { id: 'confirmed', label: 'Confirmed', icon: CheckCircle2, color: 'bg-green-100 text-green-700' },
  { id: 'reminded_24h', label: '24h Reminder', icon: Bell, color: 'bg-amber-100 text-amber-700' },
  { id: 'reminded_1h', label: '1h Reminder', icon: Clock, color: 'bg-orange-100 text-orange-700' },
  { id: 'attended', label: 'Attended', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700' },
  { id: 'review_requested', label: 'Review Sent', icon: Mail, color: 'bg-purple-100 text-purple-700' },
  { id: 'converted', label: 'Converted', icon: Target, color: 'bg-indigo-100 text-indigo-700' },
];

export default function TrialPipeline() {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState('all');

  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['trial-bookings'],
    queryFn: () => api.entities.TrialBooking.list('-created_date'),
  });

  const updateStageMutation = useMutation({
    mutationFn: ({ id, stage }) => 
      api.entities.TrialBooking.update(id, { pipeline_stage: stage }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trial-bookings'] });
    },
  });

  const sendReminderMutation = useMutation({
    mutationFn: async ({ booking, type }) => {
      const reminderText = type === '24h' 
        ? `Hi ${booking.parent_name}, this is a reminder that ${booking.student_name}'s trial class is scheduled for tomorrow at ${format(new Date(booking.trial_datetime), 'h:mm a')}. We're excited to see you at Skill Samurai!`
        : `Hi ${booking.parent_name}, ${booking.student_name}'s trial class starts in 1 hour at ${format(new Date(booking.trial_datetime), 'h:mm a')}. See you soon!`;

      await api.integrations.Core.SendEmail({
        to: booking.parent_email,
        subject: type === '24h' ? 'Trial Class Tomorrow!' : 'Trial Class Starting Soon!',
        body: reminderText
      });

      const updateField = type === '24h' ? 'reminder_24h_sent' : 'reminder_1h_sent';
      const newStage = type === '24h' ? 'reminded_24h' : 'reminded_1h';

      await api.entities.TrialBooking.update(booking.id, {
        [updateField]: true,
        pipeline_stage: newStage,
        last_contacted: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trial-bookings'] });
    }
  });

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const bookingId = result.draggableId;
    const newStage = result.destination.droppableId;

    updateStageMutation.mutate({ id: bookingId, stage: newStage });
  };

  const getBookingsByStage = (stage) => {
    return bookings.filter(b => {
      const stageMatch = b.pipeline_stage === stage;
      const searchMatch = searchTerm === '' || 
        b.parent_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.parent_email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return stageMatch && searchMatch;
    });
  };

  const filteredBookings = filterStage === 'all' 
    ? bookings 
    : bookings.filter(b => b.pipeline_stage === filterStage);

  const stats = {
    total: bookings.length,
    thisWeek: bookings.filter(b => {
      const bookingDate = new Date(b.trial_datetime);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return bookingDate > weekAgo;
    }).length,
    attended: bookings.filter(b => b.attended).length,
    converted: bookings.filter(b => b.converted_to_member).length,
    conversionRate: bookings.filter(b => b.attended).length > 0
      ? Math.round((bookings.filter(b => b.converted_to_member).length / bookings.filter(b => b.attended).length) * 100)
      : 0
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Trial Booking Pipeline</h1>
          <p className="text-slate-600 mt-1">Manage trial classes and conversions</p>
        </div>
        <Button
          onClick={() => setShowBookingForm(true)}
          className="bg-[#EE3E86] hover:bg-[#d63577]"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Trial Booking
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-slate-600">Total Bookings</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-amber-600" />
              <div>
                <div className="text-2xl font-bold">{stats.thisWeek}</div>
                <div className="text-sm text-slate-600">This Week</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{stats.attended}</div>
                <div className="text-sm text-slate-600">Attended</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-indigo-600" />
              <div>
                <div className="text-2xl font-bold">{stats.converted}</div>
                <div className="text-sm text-slate-600">Converted</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{stats.conversionRate}%</div>
                <div className="text-sm text-slate-600">Conversion</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <Select value={filterStage} onValueChange={setFilterStage}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {pipelineStages.map(stage => (
              <SelectItem key={stage.id} value={stage.id}>{stage.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Pipeline View */}
      <Tabs defaultValue="kanban">
        <TabsList>
          <TabsTrigger value="kanban">Kanban View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="mt-6">
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {pipelineStages.map((stage) => {
                const stageBookings = getBookingsByStage(stage.id);
                const StageIcon = stage.icon;

                return (
                  <div key={stage.id} className="flex-shrink-0 w-80">
                    <div className="bg-slate-100 rounded-t-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <StageIcon className="w-5 h-5 text-slate-600" />
                        <h3 className="font-semibold text-slate-900">{stage.label}</h3>
                        <Badge variant="secondary" className="ml-auto">
                          {stageBookings.length}
                        </Badge>
                      </div>
                    </div>

                    <Droppable droppableId={stage.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`min-h-[500px] bg-slate-50 rounded-b-xl p-2 space-y-2 ${
                            snapshot.isDraggingOver ? 'bg-slate-100' : ''
                          }`}
                        >
                          {stageBookings.map((booking, index) => (
                            <Draggable
                              key={booking.id}
                              draggableId={booking.id}
                              index={index}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setShowDetailsModal(true);
                                  }}
                                  className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                >
                                  <div className="font-semibold text-slate-900 mb-1">
                                    {booking.student_name}
                                  </div>
                                  <div className="text-sm text-slate-600 mb-2">
                                    {booking.parent_name}
                                  </div>
                                  <div className="text-xs text-slate-500 space-y-1">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {format(new Date(booking.trial_datetime), 'MMM d, h:mm a')}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Mail className="w-3 h-3" />
                                      {booking.parent_email}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </div>
          </DragDropContext>
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          {/* List view implementation */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Student</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Parent</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Trial Date</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Stage</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredBookings.map(booking => {
                      const stage = pipelineStages.find(s => s.id === booking.pipeline_stage);
                      return (
                        <tr key={booking.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4">{booking.student_name}</td>
                          <td className="px-6 py-4">
                            <div>{booking.parent_name}</div>
                            <div className="text-xs text-slate-500">{booking.parent_email}</div>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {format(new Date(booking.trial_datetime), 'MMM d, yyyy h:mm a')}
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={stage?.color}>{stage?.label}</Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowDetailsModal(true);
                              }}
                            >
                              View
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Booking Form Dialog */}
      <Dialog open={showBookingForm} onOpenChange={setShowBookingForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Trial Booking</DialogTitle>
          </DialogHeader>
          <TrialBookingForm
            onSuccess={() => {
              setShowBookingForm(false);
              queryClient.invalidateQueries({ queryKey: ['trial-bookings'] });
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Details Modal */}
      {selectedBooking && (
        <TrialDetailsModal
          booking={selectedBooking}
          open={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedBooking(null);
          }}
          onSendReminder={(type) => sendReminderMutation.mutate({ booking: selectedBooking, type })}
        />
      )}
    </div>
  );
}