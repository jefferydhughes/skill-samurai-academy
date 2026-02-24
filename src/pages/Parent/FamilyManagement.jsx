import React, { useState } from 'react';
import { api } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Users, Phone, Mail, Plus, Edit, Trash2, UserCheck, BookOpen, Calendar, Award } from 'lucide-react';
import FamilyForm from '../../components/admin/FamilyForm';

export default function FamilyManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const queryClient = useQueryClient();

  const { data: families = [], isLoading } = useQuery({
    queryKey: ['families'],
    queryFn: () => api.entities.Family.list('-created_date'),
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => api.entities.Student.list(),
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => api.entities.Booking.list(),
  });

  const { data: trialBookings = [] } = useQuery({
    queryKey: ['trialBookings'],
    queryFn: () => api.entities.TrialBooking.list(),
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['progress'],
    queryFn: () => api.entities.LessonProgress.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.entities.Family.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['families'] });
    },
  });

  const filteredFamilies = families.filter(family => {
    const search = searchTerm.toLowerCase();
    return (
      family.primary_contact_name?.toLowerCase().includes(search) ||
      family.primary_contact_email?.toLowerCase().includes(search) ||
      family.primary_contact_phone?.includes(search)
    );
  });

  const getFamilyStudents = (familyId) => {
    return students.filter(s => s.parent_id === familyId);
  };

  const getFamilyStats = (familyId) => {
    const familyStudents = getFamilyStudents(familyId);
    const studentIds = familyStudents.map(s => s.id);
    
    const familyBookings = bookings.filter(b => 
      b.userId === familyId || studentIds.includes(b.studentId)
    );
    
    const familyTrials = trialBookings.filter(t => 
      t.parent_id === familyId
    );
    
    const familyProgress = progress.filter(p => 
      studentIds.includes(p.studentId)
    );
    
    const completedLessons = familyProgress.filter(p => p.completed).length;
    
    return {
      totalBookings: familyBookings.length + familyTrials.length,
      activeBookings: familyBookings.filter(b => b.bookingStatus === 'confirmed').length,
      completedLessons,
    };
  };

  const handleEdit = (family) => {
    setSelectedFamily(family);
    setShowForm(true);
  };

  const handleViewDetails = (family) => {
    setSelectedFamily(family);
    setShowDetails(true);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Family Management</h1>
          <p className="text-slate-600 mt-1">View and manage student families</p>
        </div>
        <Button
          onClick={() => {
            setSelectedFamily(null);
            setShowForm(true);
          }}
          className="bg-[#EE3E86] hover:bg-[#d63577]"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Family
        </Button>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      {/* Families Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500">Loading families...</div>
          ) : filteredFamilies.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No families found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Parent
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Students
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Activity
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredFamilies.map((family) => {
                    const familyStudents = getFamilyStudents(family.id);
                    const stats = getFamilyStats(family.id);
                    
                    return (
                      <tr key={family.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-slate-900">
                              {family.primary_contact_name}
                            </div>
                            {family.secondary_contact_name && (
                              <div className="text-sm text-slate-500">
                                {family.secondary_contact_name}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="text-sm text-slate-600 flex items-center gap-2">
                              <Mail className="w-3 h-3" />
                              {family.primary_contact_email}
                            </div>
                            {family.primary_contact_phone && (
                              <div className="text-sm text-slate-500 flex items-center gap-2">
                                <Phone className="w-3 h-3" />
                                {family.primary_contact_phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-medium text-slate-900">
                              {familyStudents.length}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1 text-slate-600">
                              <Calendar className="w-3 h-3" />
                              <span>{stats.activeBookings}</span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-600">
                              <BookOpen className="w-3 h-3" />
                              <span>{stats.completedLessons}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={family.status === 'active' ? 'default' : 'secondary'}
                            className={family.status === 'active' ? 'bg-cyan-500' : ''}
                          >
                            {family.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(family)}
                            >
                              <UserCheck className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(family)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (confirm('Delete this family?')) {
                                  deleteMutation.mutate(family.id);
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Family Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedFamily ? 'Edit Family' : 'New Family'}
            </DialogTitle>
          </DialogHeader>
          <FamilyForm
            family={selectedFamily}
            onSuccess={() => {
              setShowForm(false);
              setSelectedFamily(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Family Details Dialog */}
      {selectedFamily && (
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Family Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Parents</h3>
                <div className="space-y-3">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="font-medium">{selectedFamily.primary_contact_name}</div>
                    <div className="text-sm text-slate-600 mt-1">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {selectedFamily.primary_contact_email}
                      </div>
                      {selectedFamily.primary_contact_phone && (
                        <div className="flex items-center gap-2 mt-1">
                          <Phone className="w-4 h-4" />
                          {selectedFamily.primary_contact_phone}
                        </div>
                      )}
                    </div>
                  </div>
                  {selectedFamily.secondary_contact_name && (
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="font-medium">{selectedFamily.secondary_contact_name}</div>
                      <div className="text-sm text-slate-600 mt-1">
                        {selectedFamily.secondary_contact_email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {selectedFamily.secondary_contact_email}
                          </div>
                        )}
                        {selectedFamily.secondary_contact_phone && (
                          <div className="flex items-center gap-2 mt-1">
                            <Phone className="w-4 h-4" />
                            {selectedFamily.secondary_contact_phone}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Students</h3>
                <div className="space-y-2">
                  {getFamilyStudents(selectedFamily.id).map(student => {
                    const studentProgress = progress.filter(p => p.studentId === student.id);
                    const completedCount = studentProgress.filter(p => p.completed).length;
                    
                    return (
                      <div key={student.id} className="bg-slate-50 rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium">{student.full_name}</div>
                            <div className="text-sm text-slate-600">
                              DOB: {student.dob ? new Date(student.dob).toLocaleDateString() : '-'}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <div className="flex items-center gap-1 text-green-600">
                              <Award className="w-4 h-4" />
                              <span className="font-medium">{completedCount}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Activity Summary</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                    <div className="text-2xl font-bold text-blue-900">
                      {getFamilyStats(selectedFamily.id).totalBookings}
                    </div>
                    <div className="text-xs text-blue-700">Total Bookings</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <BookOpen className="w-6 h-6 text-green-600 mx-auto mb-1" />
                    <div className="text-2xl font-bold text-green-900">
                      {getFamilyStats(selectedFamily.id).activeBookings}
                    </div>
                    <div className="text-xs text-green-700">Active</div>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3 text-center">
                    <Award className="w-6 h-6 text-amber-600 mx-auto mb-1" />
                    <div className="text-2xl font-bold text-amber-900">
                      {getFamilyStats(selectedFamily.id).completedLessons}
                    </div>
                    <div className="text-xs text-amber-700">Lessons Done</div>
                  </div>
                </div>
              </div>

              {selectedFamily.checkin_code && (
                <div>
                  <h3 className="font-semibold mb-2">Check-in Code</h3>
                  <div className="text-2xl font-mono font-bold text-indigo-600">
                    {selectedFamily.checkin_code}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}