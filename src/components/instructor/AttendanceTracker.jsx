import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  CheckCircle, XCircle, Clock, Save, LogIn, LogOut,
  AlertTriangle, Users, CalendarCheck, Search, Filter,
} from 'lucide-react';

const STATUS_CONFIG = {
  present: { icon: CheckCircle, color: 'bg-green-100 text-green-700 border-green-200', iconColor: 'text-green-500', label: 'Present' },
  absent: { icon: XCircle, color: 'bg-red-100 text-red-700 border-red-200', iconColor: 'text-red-500', label: 'Absent' },
  late: { icon: Clock, color: 'bg-amber-100 text-amber-700 border-amber-200', iconColor: 'text-amber-500', label: 'Late' },
  excused: { icon: AlertTriangle, color: 'bg-blue-100 text-blue-700 border-blue-200', iconColor: 'text-blue-500', label: 'Excused' },
};

export default function AttendanceTracker({ session }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [noteEditing, setNoteEditing] = useState(null);
  const [noteText, setNoteText] = useState('');

  // Fetch enrolled students for this session via membership_slot_reservations
  const { data: enrolledStudents = [], isLoading: loadingStudents } = useQuery({
    queryKey: ['session-enrolled-students', session?.id, session?.weekly_slot_id],
    queryFn: async () => {
      if (!session?.weekly_slot_id) return [];

      const { data: reservations, error } = await supabase
        .from('membership_slot_reservations')
        .select(`
          id,
          membership_id,
          memberships!inner (
            id,
            student_id,
            status,
            students!inner (
              id,
              first_name,
              last_name,
              dob,
              location_id
            )
          )
        `)
        .eq('weekly_class_slot_id', session.weekly_slot_id)
        .eq('memberships.status', 'active');

      if (error) throw error;

      return (reservations || []).map(r => ({
        studentId: r.memberships.student_id,
        firstName: r.memberships.students.first_name,
        lastName: r.memberships.students.last_name,
        dob: r.memberships.students.dob,
        locationId: r.memberships.students.location_id,
        membershipId: r.membership_id,
      }));
    },
    enabled: !!session?.weekly_slot_id,
  });

  // Fetch existing attendance records for this session
  const { data: existingRecords = [], isLoading: loadingRecords } = useQuery({
    queryKey: ['attendance-records', session?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('class_session_id', session.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!session?.id,
  });

  // Build attendance state from existing records
  const [attendance, setAttendance] = useState({});

  useEffect(() => {
    if (existingRecords.length > 0) {
      const state = {};
      existingRecords.forEach(record => {
        state[record.student_id] = {
          status: record.status,
          checkedInAt: record.checked_in_at,
          checkedOutAt: record.checked_out_at,
          notes: record.notes,
          recordId: record.id,
        };
      });
      setAttendance(state);
    }
  }, [existingRecords]);

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: async ({ studentId, status }) => {
      const now = new Date().toISOString();
      const existing = attendance[studentId];

      const record = {
        class_session_id: session.id,
        student_id: studentId,
        location_id: session.location_id,
        status,
        checked_in_by: user?.id,
        updated_at: now,
      };

      if (status === 'present' || status === 'late') {
        record.checked_in_at = existing?.checkedInAt || now;
      }

      if (existing?.recordId) {
        const { data, error } = await supabase
          .from('attendance_records')
          .update(record)
          .eq('id', existing.recordId)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        record.created_at = now;
        const { data, error } = await supabase
          .from('attendance_records')
          .insert(record)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (data, { studentId, status }) => {
      setAttendance(prev => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          status,
          checkedInAt: data.checked_in_at,
          checkedOutAt: data.checked_out_at,
          recordId: data.id,
        },
      }));
    },
  });

  // Check-out mutation
  const checkOutMutation = useMutation({
    mutationFn: async (studentId) => {
      const existing = attendance[studentId];
      if (!existing?.recordId) return;

      const { data, error } = await supabase
        .from('attendance_records')
        .update({
          checked_out_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.recordId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, studentId) => {
      setAttendance(prev => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          checkedOutAt: data.checked_out_at,
        },
      }));
    },
  });

  // Save note mutation
  const saveNoteMutation = useMutation({
    mutationFn: async ({ studentId, notes }) => {
      const existing = attendance[studentId];
      if (!existing?.recordId) return;

      const { error } = await supabase
        .from('attendance_records')
        .update({ notes, updated_at: new Date().toISOString() })
        .eq('id', existing.recordId);

      if (error) throw error;
    },
    onSuccess: (_, { studentId, notes }) => {
      setAttendance(prev => ({
        ...prev,
        [studentId]: { ...prev[studentId], notes },
      }));
      setNoteEditing(null);
      setNoteText('');
    },
  });

  // Complete session + trigger workflow
  const completeSessionMutation = useMutation({
    mutationFn: async () => {
      // Call the edge function to auto-mark absences and check streaks
      const { data, error } = await supabase.functions.invoke('process-attendance-workflow', {
        body: { class_session_id: session.id },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-records', session?.id] });
      queryClient.invalidateQueries({ queryKey: ['session-enrolled-students'] });
    },
  });

  // Mark all present shortcut
  const markAllPresent = () => {
    enrolledStudents.forEach(student => {
      if (!attendance[student.studentId]?.status || attendance[student.studentId]?.status === 'absent') {
        checkInMutation.mutate({ studentId: student.studentId, status: 'present' });
      }
    });
  };

  // Cycle through statuses
  const cycleStatus = (studentId) => {
    const current = attendance[studentId]?.status || 'absent';
    const cycle = ['absent', 'present', 'late', 'excused'];
    const nextIndex = (cycle.indexOf(current) + 1) % cycle.length;
    checkInMutation.mutate({ studentId, status: cycle[nextIndex] });
  };

  // Filter students by search
  const filteredStudents = useMemo(() => {
    if (!searchTerm) return enrolledStudents;
    const term = searchTerm.toLowerCase();
    return enrolledStudents.filter(s =>
      s.firstName?.toLowerCase().includes(term) ||
      s.lastName?.toLowerCase().includes(term)
    );
  }, [enrolledStudents, searchTerm]);

  // Stats
  const stats = useMemo(() => {
    const total = enrolledStudents.length;
    const present = enrolledStudents.filter(s => attendance[s.studentId]?.status === 'present').length;
    const late = enrolledStudents.filter(s => attendance[s.studentId]?.status === 'late').length;
    const absent = enrolledStudents.filter(s => !attendance[s.studentId]?.status || attendance[s.studentId]?.status === 'absent').length;
    const excused = enrolledStudents.filter(s => attendance[s.studentId]?.status === 'excused').length;
    const checkedOut = enrolledStudents.filter(s => attendance[s.studentId]?.checkedOutAt).length;
    return { total, present, late, absent, excused, checkedOut };
  }, [enrolledStudents, attendance]);

  const formatTime = (isoString) => {
    if (!isoString) return null;
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isSessionCompleted = session?.status === 'completed';
  const isLoading = loadingStudents || loadingRecords;

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-indigo-600" />
                Class Attendance
              </CardTitle>
              <p className="text-sm text-slate-500 mt-1">
                {session?.start_datetime
                  ? new Date(session.start_datetime).toLocaleDateString(undefined, {
                    weekday: 'long', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                  })
                  : 'No session selected'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!isSessionCompleted && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={markAllPresent}
                    disabled={isLoading}
                  >
                    <Users className="w-4 h-4 mr-1" />
                    Mark All Present
                  </Button>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-indigo-600 to-violet-600"
                    onClick={() => completeSessionMutation.mutate()}
                    disabled={completeSessionMutation.isPending}
                  >
                    <Save className="w-4 h-4 mr-1" />
                    {completeSessionMutation.isPending ? 'Completing...' : 'Complete Session'}
                  </Button>
                </>
              )}
              {isSessionCompleted && (
                <Badge className="bg-green-100 text-green-700 border border-green-200 px-3 py-1">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Session Completed
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        {/* Quick Stats Row */}
        <CardContent className="pt-0">
          <div className="grid grid-cols-5 gap-3">
            <div className="text-center p-3 rounded-lg bg-slate-50">
              <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
              <div className="text-xs text-slate-500">Enrolled</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-green-50">
              <div className="text-2xl font-bold text-green-600">{stats.present}</div>
              <div className="text-xs text-green-600">Present</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-amber-50">
              <div className="text-2xl font-bold text-amber-600">{stats.late}</div>
              <div className="text-xs text-amber-600">Late</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-red-50">
              <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
              <div className="text-xs text-red-600">Absent</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-blue-50">
              <div className="text-2xl font-bold text-blue-600">{stats.checkedOut}</div>
              <div className="text-xs text-blue-600">Checked Out</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      {enrolledStudents.length > 5 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {/* Student Roster */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {isLoading && (
              <div className="p-8 text-center text-slate-500">Loading roster...</div>
            )}

            {!isLoading && filteredStudents.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                {searchTerm ? 'No students match your search' : 'No students enrolled in this session'}
              </div>
            )}

            {filteredStudents.map(student => {
              const record = attendance[student.studentId] || {};
              const status = record.status || 'absent';
              const config = STATUS_CONFIG[status];
              const StatusIcon = config.icon;
              const isCheckedIn = record.checkedInAt && (status === 'present' || status === 'late');
              const isCheckedOut = !!record.checkedOutAt;

              return (
                <div
                  key={student.studentId}
                  className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                >
                  {/* Student info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-sm">
                        {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-slate-900 truncate">
                        {student.firstName} {student.lastName}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        {record.checkedInAt && (
                          <span className="flex items-center gap-1">
                            <LogIn className="w-3 h-3" />
                            In: {formatTime(record.checkedInAt)}
                          </span>
                        )}
                        {record.checkedOutAt && (
                          <span className="flex items-center gap-1">
                            <LogOut className="w-3 h-3" />
                            Out: {formatTime(record.checkedOutAt)}
                          </span>
                        )}
                        {record.notes && (
                          <span className="text-indigo-500 truncate max-w-[150px]" title={record.notes}>
                            {record.notes}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Status badge - clickable to cycle */}
                    <button
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${config.color} ${isSessionCompleted ? 'cursor-default' : 'cursor-pointer hover:opacity-80'}`}
                      onClick={() => !isSessionCompleted && cycleStatus(student.studentId)}
                      disabled={isSessionCompleted}
                    >
                      <StatusIcon className={`w-4 h-4 ${config.iconColor}`} />
                      {config.label}
                    </button>

                    {/* Quick check-in button */}
                    {!isCheckedIn && !isSessionCompleted && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => checkInMutation.mutate({ studentId: student.studentId, status: 'present' })}
                      >
                        <LogIn className="w-4 h-4" />
                      </Button>
                    )}

                    {/* Check-out button */}
                    {isCheckedIn && !isCheckedOut && !isSessionCompleted && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-orange-600 border-orange-200 hover:bg-orange-50"
                        onClick={() => checkOutMutation.mutate(student.studentId)}
                      >
                        <LogOut className="w-4 h-4" />
                      </Button>
                    )}

                    {/* Note button */}
                    {!isSessionCompleted && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-slate-600"
                        onClick={() => {
                          setNoteEditing(student.studentId);
                          setNoteText(record.notes || '');
                        }}
                      >
                        <Filter className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {/* Inline note editor */}
                  {noteEditing === student.studentId && (
                    <div className="absolute right-0 top-full mt-1 z-10 w-72 p-3 bg-white border shadow-lg rounded-lg">
                      <Textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Add a note..."
                        rows={2}
                        className="mb-2"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => saveNoteMutation.mutate({ studentId: student.studentId, notes: noteText })}
                          disabled={saveNoteMutation.isPending}
                        >
                          Save
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setNoteEditing(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Completion feedback */}
      {completeSessionMutation.isSuccess && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Session completed.</span>
              <span className="text-sm">
                {completeSessionMutation.data?.auto_marked_absent > 0 &&
                  `${completeSessionMutation.data.auto_marked_absent} student(s) auto-marked absent. `}
                {completeSessionMutation.data?.streak_alerts_created > 0 &&
                  `${completeSessionMutation.data.streak_alerts_created} absence alert(s) triggered.`}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
