import React, { useState } from 'react';
import { api } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  Users,
  MoreVertical,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-700',
  running: 'bg-green-100 text-green-700',
  completed: 'bg-slate-100 text-slate-600',
  cancelled: 'bg-red-100 text-red-700'
};

const defaultForm = {
  programId: '',
  name: '',
  startDate: '',
  endDate: '',
  schedule: { startTime: '09:00', endTime: '12:00', days: ['Monday', 'Wednesday', 'Friday'] },
  capacity: 20,
  location: '',
  instructorId: '',
  instructorName: '',
  status: 'scheduled',
};

export default function ClassSchedule() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [formData, setFormData] = useState(defaultForm);

  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => api.entities.ClassSession.list('-startDate'),
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['programs'],
    queryFn: () => api.entities.Program.filter({ active: true }),
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['allEnrollments'],
    queryFn: () => api.entities.Enrollment.list(),
  });

  const { data: instructors = [] } = useQuery({
    queryKey: ['instructors'],
    queryFn: async () => {
      const users = await api.entities.User.list();
      return users.filter(u => u.role === 'admin' || u.role === 'instructor');
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.entities.ClassSession.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['sessions']);
      closeDialog();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.entities.ClassSession.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['sessions']);
      closeDialog();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.entities.ClassSession.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['sessions']);
      setDeleteDialogOpen(false);
      setSessionToDelete(null);
    }
  });

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getSessionsForDay = (day) => {
    return sessions.filter(session => {
      if (!session.startDate || !session.endDate) return false;
      const start = parseISO(session.startDate);
      const end = parseISO(session.endDate);
      return day >= start && day <= end;
    });
  };

  const getProgram = (programId) => programs.find(p => p.id === programId);
  const getEnrollmentCount = (sessionId) => enrollments.filter(e => e.classSessionId === sessionId && e.status === 'enrolled').length;

  const openAddDialog = () => {
    setEditingSession(null);
    setFormData(defaultForm);
    setDialogOpen(true);
  };

  const openEditDialog = (session) => {
    setEditingSession(session);
    setFormData({
      programId: session.programId || '',
      name: session.name || '',
      startDate: session.startDate || '',
      endDate: session.endDate || '',
      schedule: session.schedule || { startTime: '09:00', endTime: '12:00', days: [] },
      capacity: session.capacity || 20,
      location: session.location || '',
      instructorId: session.instructorId || '',
      instructorName: session.instructorName || '',
      status: session.status || 'scheduled',
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingSession(null);
    setFormData(defaultForm);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const program = getProgram(formData.programId);
    const data = {
      ...formData,
      academyId: program?.academyId,
    };
    
    if (editingSession) {
      updateMutation.mutate({ id: editingSession.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Class Schedule</h1>
          <p className="text-slate-600 mt-1">Manage class sessions and schedules</p>
        </div>
        <Button onClick={openAddDialog} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Session
        </Button>
      </div>

      {/* Week Navigation */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="text-center">
              <h2 className="text-lg font-semibold text-slate-900">
                {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
              </h2>
              <Button 
                variant="link" 
                size="sm" 
                className="text-indigo-600"
                onClick={() => setCurrentWeek(new Date())}
              >
                Today
              </Button>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Week Calendar */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => {
          const daySessions = getSessionsForDay(day);
          const isToday = isSameDay(day, new Date());
          
          return (
            <Card 
              key={day.toISOString()} 
              className={`border-0 shadow-md min-h-[200px] ${isToday ? 'ring-2 ring-indigo-500' : ''}`}
            >
              <CardHeader className="p-3 pb-2">
                <div className={`text-center ${isToday ? 'text-indigo-600' : 'text-slate-500'}`}>
                  <div className="text-xs font-medium uppercase">{format(day, 'EEE')}</div>
                  <div className={`text-lg font-bold ${isToday ? 'bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto' : ''}`}>
                    {format(day, 'd')}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-2 space-y-1">
                {daySessions.slice(0, 3).map((session) => {
                  const program = getProgram(session.programId);
                  return (
                    <div
                      key={session.id}
                      onClick={() => openEditDialog(session)}
                      className="p-2 bg-indigo-50 rounded-lg cursor-pointer hover:bg-indigo-100 transition-colors"
                    >
                      <div className="text-xs font-medium text-indigo-900 truncate">
                        {program?.name || session.name}
                      </div>
                      <div className="text-xs text-indigo-600">
                        {session.schedule?.startTime}
                      </div>
                    </div>
                  );
                })}
                {daySessions.length > 3 && (
                  <div className="text-xs text-slate-500 text-center">
                    +{daySessions.length - 3} more
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Sessions List */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>All Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-slate-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No sessions scheduled</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => {
                const program = getProgram(session.programId);
                const enrolled = getEnrollmentCount(session.id);
                
                return (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">{program?.name || session.name}</h4>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {session.startDate ? format(parseISO(session.startDate), 'MMM d') : ''} - {session.endDate ? format(parseISO(session.endDate), 'MMM d') : ''}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {session.schedule?.startTime} - {session.schedule?.endTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {enrolled}/{session.capacity}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={statusColors[session.status] || statusColors.scheduled}>
                        {session.status}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(session)}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              setSessionToDelete(session);
                              setDeleteDialogOpen(true);
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingSession ? 'Edit Session' : 'Add New Session'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Program</Label>
              <Select 
                value={formData.programId} 
                onValueChange={(value) => setFormData({ ...formData, programId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select program" />
                </SelectTrigger>
                <SelectContent>
                  {programs.map(program => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Session Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Week 1 Session"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.schedule.startTime}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    schedule: { ...formData.schedule, startTime: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.schedule.endTime}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    schedule: { ...formData.schedule, endTime: e.target.value }
                  })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="running">Running</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Room 101 or Online"
              />
            </div>

            <div className="space-y-2">
              <Label>Instructor</Label>
              <Select 
                value={formData.instructorId} 
                onValueChange={(value) => {
                  const instructor = instructors.find(i => i.id === value);
                  setFormData({ 
                    ...formData, 
                    instructorId: value,
                    instructorName: instructor?.full_name || ''
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="No instructor assigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>No instructor</SelectItem>
                  {instructors.map(instructor => (
                    <SelectItem key={instructor.id} value={instructor.id}>
                      {instructor.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingSession ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Session</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this session? This will also affect any enrollments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(sessionToDelete?.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}