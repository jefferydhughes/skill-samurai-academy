import { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar as CalendarIcon, Clock, Users, Plus, MapPin } from 'lucide-react';
import { format } from 'date-fns';

export default function InstructorSchedule() {
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newSession, setNewSession] = useState({
    programId: '',
    name: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    capacity: 10,
    location: '',
    instructorName: ''
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await api.auth.me();
      setUser(userData);
      setNewSession(prev => ({ ...prev, instructorName: userData.full_name }));
    } catch (e) {
      api.auth.redirectToLogin();
    }
  };

  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => api.entities.ClassSession.list('-startDate'),
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['programs'],
    queryFn: () => api.entities.Program.list(),
  });

  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: () => api.entities.Academy.list(),
  });

  const createSessionMutation = useMutation({
    mutationFn: (sessionData) => api.entities.ClassSession.create(sessionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      setShowForm(false);
      setNewSession({
        programId: '',
        name: '',
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        capacity: 10,
        location: '',
        instructorName: user?.full_name || ''
      });
    },
  });

  const handleCreateSession = (e) => {
    e.preventDefault();
    if (!newSession.programId || !newSession.startDate || !newSession.name) {
      alert("Please fill in all required fields.");
      return;
    }

    const program = programs.find(p => p.id === newSession.programId);
    const sessionData = {
      ...newSession,
      status: 'scheduled',
      enrolledCount: 0,
      schedule: {
        startTime: newSession.startTime,
        endTime: newSession.endTime,
        duration: 60
      }
    };

    createSessionMutation.mutate(sessionData);
  };

  const upcomingSessions = sessions.filter(s => 
    new Date(s.startDate) >= new Date() && s.status === 'scheduled'
  );

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <CalendarIcon className="text-indigo-600" /> My Schedule
            </h1>
            <p className="text-slate-600">View and manage your class sessions.</p>
          </div>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl">
                <Plus className="w-4 h-4 mr-2" /> Create Session
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Class Session</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateSession} className="space-y-6 mt-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="program">Program *</Label>
                    <Select 
                      value={newSession.programId}
                      onValueChange={(value) => setNewSession(s => ({ ...s, programId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a program" />
                      </SelectTrigger>
                      <SelectContent>
                        {programs.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Session Name *</Label>
                    <Input 
                      value={newSession.name}
                      onChange={e => setNewSession(s => ({ ...s, name: e.target.value }))}
                      placeholder="e.g., Week 1 - Introduction"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input 
                      type="date"
                      value={newSession.startDate}
                      onChange={e => setNewSession(s => ({ ...s, startDate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input 
                      type="date"
                      value={newSession.endDate}
                      onChange={e => setNewSession(s => ({ ...s, endDate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input 
                      type="time"
                      value={newSession.startTime}
                      onChange={e => setNewSession(s => ({ ...s, startTime: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input 
                      type="time"
                      value={newSession.endTime}
                      onChange={e => setNewSession(s => ({ ...s, endTime: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Max Students</Label>
                    <Input 
                      type="number"
                      value={newSession.capacity}
                      onChange={e => setNewSession(s => ({ ...s, capacity: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Select 
                      value={newSession.location}
                      onValueChange={(value) => setNewSession(s => ({ ...s, location: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map(l => (
                          <SelectItem key={l.id} value={l.name}>{l.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white"
                  disabled={createSessionMutation.isPending}
                >
                  {createSessionMutation.isPending ? 'Creating...' : 'Create Session'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </header>
        
        <Card className="rounded-2xl border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-slate-900">Upcoming Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingSessions.length > 0 ? upcomingSessions.map(session => {
                const program = programs.find(p => p.id === session.programId);
                const spotsLeft = session.capacity - (session.enrolledCount || 0);
                
                return (
                  <div key={session.id} className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-slate-900">{session.name}</h3>
                        <p className="text-sm text-slate-600 mt-1">
                          {program?.name || 'Program'}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          {format(new Date(session.startDate), 'EEEE, MMMM d, yyyy')}
                          {session.schedule?.startTime && ` at ${session.schedule.startTime}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        {session.schedule?.duration && (
                          <div className="flex items-center gap-1 text-sm text-slate-600">
                            <Clock className="w-4 h-4"/>
                            {session.schedule.duration} min
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <Users className="w-4 h-4"/>
                          {session.enrolledCount || 0}/{session.capacity}
                        </div>
                        {session.location && (
                          <div className="flex items-center gap-1 text-sm text-slate-600">
                            <MapPin className="w-4 h-4"/>
                            {session.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center py-12">
                  <CalendarIcon className="w-16 h-16 text-slate-300 mx-auto mb-4"/>
                  <h3 className="text-xl font-semibold text-slate-900">No sessions scheduled</h3>
                  <p className="text-slate-600 mt-2">Create your first session to get started.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}