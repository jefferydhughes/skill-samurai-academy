import { useState } from "react";
import { api } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Users, Clock, Calendar } from "lucide-react";

const WEEKDAYS = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  7: "Sunday",
};

export default function WeeklyClassBooking() {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);

  const { data: slots = [], isLoading: loading, error } = useQuery({
    queryKey: ['weeklyClassSlots'],
    queryFn: async () => {
      const data = await api.entities.WeeklyClassSlot.filter({ active: true });
      return data.sort((a, b) => {
        if (a.weekday !== b.weekday) return a.weekday - b.weekday;
        return a.start_time.localeCompare(b.start_time);
      });
    },
  });

  const { data: rosters = [] } = useQuery({
    queryKey: ['weeklyClassRosters'],
    queryFn: () => api.entities.WeeklyClassRoster.list(),
  });

  const { data: students = [] } = useQuery({
    queryKey: ['myStudents'],
    queryFn: async () => {
      const user = await api.auth.me();
      return api.entities.Student.filter({ parent_id: user.id });
    },
  });

  function getEnrolledCount(slotId) {
    return rosters.filter(r => r.slot_id === slotId).length;
  }

  function handleSelectSlot(slot) {
    setSelectedSlot(slot);
    setShowRegisterDialog(true);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading class times…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800 font-medium">Error loading classes</p>
          <p className="text-red-600 text-sm mt-1">{error.message}</p>
        </div>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">
          Choose a Weekly Class Time
        </h1>
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No weekly class slots available at the moment.</p>
            <p className="text-sm text-gray-500 mt-2">Check back soon or contact us for more information.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const grouped = slots.reduce((acc, slot) => {
    const day = slot.weekday;
    if (!acc[day]) acc[day] = [];
    acc[day].push(slot);
    return acc;
  }, {});

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Weekly Class Schedule
        </h1>
        <p className="text-lg text-gray-600">
          Choose a class time that works for your student
        </p>
      </div>

      <div className="space-y-8">
        {Object.keys(WEEKDAYS).map((dayKey) => {
          const daySlots = grouped[dayKey];
          if (!daySlots) return null;

          return (
            <div key={dayKey}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-8 bg-indigo-600 rounded"></div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {WEEKDAYS[dayKey]}
                </h2>
              </div>

              <div className="grid gap-4">
                {daySlots.map((slot) => {
                  const enrolled = getEnrolledCount(slot.id);
                  const isFull = enrolled >= slot.capacity;
                  const spotsLeft = slot.capacity - enrolled;

                  return (
                    <Card key={slot.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-6">
                          <div className="flex-1">
                            <div className="flex items-start gap-4 mb-3">
                              <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                  {slot.title}
                                </h3>
                                
                                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span>{slot.start_time.slice(0, 5)}</span>
                                    <span className="text-gray-400">•</span>
                                    <span>{slot.duration_minutes} min</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    <span>Ages {slot.age_min}–{slot.age_max}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              {isFull ? (
                                <Badge variant="destructive" className="text-xs">
                                  Class Full
                                </Badge>
                              ) : spotsLeft <= 3 ? (
                                <Badge variant="outline" className="text-xs border-amber-500 text-amber-700 bg-amber-50">
                                  Only {spotsLeft} spots left
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs border-green-500 text-green-700 bg-green-50">
                                  {spotsLeft} spots available
                                </Badge>
                              )}
                              
                              <span className="text-xs text-gray-500">
                                {enrolled} / {slot.capacity} enrolled
                              </span>
                            </div>
                          </div>

                          <Button
                            size="lg"
                            disabled={isFull}
                            onClick={() => handleSelectSlot(slot)}
                            className="bg-indigo-600 hover:bg-indigo-700"
                          >
                            {isFull ? 'Full' : 'Register'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {showRegisterDialog && selectedSlot && (
        <RegistrationDialog
          slot={selectedSlot}
          students={students}
          onClose={() => {
            setShowRegisterDialog(false);
            setSelectedSlot(null);
          }}
        />
      )}
    </div>
  );
}

function RegistrationDialog({ slot, students, onClose }) {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('1x');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRegister() {
    if (!selectedStudent) {
      alert('Please select a student');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const user = await api.auth.me();
      
      // Create membership
      await api.entities.Membership.create({
        student_id: selectedStudent,
        parent_id: user.id,
        location_id: slot.location_id,
        plan: selectedPlan,
        slots: [slot.id],
        status: 'active',
        start_date: new Date().toISOString().split('T')[0],
      });

      alert('Successfully registered!');
      onClose();
    } catch (error) {
      console.error('Registration error:', error);
      alert('Failed to register: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Register for {slot.title}</DialogTitle>
          <DialogDescription>
            {WEEKDAYS[slot.weekday]}s at {slot.start_time.slice(0, 5)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <label className="block text-sm font-medium mb-3">Select Student</label>
            <div className="space-y-2">
              {students.map(student => (
                <div
                  key={student.id}
                  onClick={() => setSelectedStudent(student.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedStudent === student.id
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">{student.full_name}</div>
                  <div className="text-sm text-gray-600">Age: {calculateAge(student.dob)}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">Select Plan</label>
            <div className="grid grid-cols-2 gap-3">
              {['1x', '2x'].map(plan => (
                <div
                  key={plan}
                  onClick={() => setSelectedPlan(plan)}
                  className={`p-4 border rounded-lg cursor-pointer text-center transition-all ${
                    selectedPlan === plan
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-bold text-lg">{plan}</div>
                  <div className="text-xs text-gray-600">per week</div>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={handleRegister}
            disabled={isSubmitting || !selectedStudent}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            {isSubmitting ? 'Registering...' : 'Complete Registration'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function calculateAge(dob) {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}