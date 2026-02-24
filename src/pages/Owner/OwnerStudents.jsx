import React, { useState, useEffect } from 'react';
import OwnerLayout from '../../components/owner/OwnerLayout';
import { api } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Users } from 'lucide-react';

export default function OwnerStudents() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await api.auth.me();
      setUser(userData);
    } catch (e) {
      api.auth.redirectToLogin();
    }
  };

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => api.entities.Student.list(),
  });

  const { data: memberships = [] } = useQuery({
    queryKey: ['memberships'],
    queryFn: () => api.entities.Membership.list(),
  });

  const filteredStudents = students.filter(student => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      student.full_name?.toLowerCase().includes(q) ||
      student.school_name?.toLowerCase().includes(q)
    );
  });

  return (
    <OwnerLayout currentPageName="OwnerStudents">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#2A4169]">Students & Memberships</h1>
            <p className="text-slate-600 mt-1">Manage student enrollments</p>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-[#A3DAE8]/20 flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-[#A3DAE8]" />
              </div>
              <h3 className="text-xl font-semibold text-[#2A4169] mb-2">No students found</h3>
              <p className="text-slate-600">Students will appear here when parents enroll</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student) => {
              const studentMemberships = memberships.filter(m => m.student_id === student.id);
              const activeMembership = studentMemberships.find(m => m.status === 'active');

              return (
                <Card key={student.id} className="border-0 shadow-lg hover:shadow-xl transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg text-[#2A4169]">
                          {student.full_name}
                        </CardTitle>
                        <p className="text-sm text-slate-500 mt-1">
                          {student.school_name || 'School not provided'}
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2A4169] to-[#A3DAE8] flex items-center justify-center text-white font-bold text-lg">
                        {student.full_name?.[0]?.toUpperCase() || 'S'}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm text-slate-600">
                      <div className="flex justify-between py-1">
                        <span>DOB:</span>
                        <span className="font-medium">{student.dob || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span>Emergency:</span>
                        <span className="font-medium">{student.emergency_contact_name || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      {activeMembership ? (
                        <Badge className="bg-green-100 text-green-700 border-0">
                          Active Membership
                        </Badge>
                      ) : studentMemberships.length > 0 ? (
                        <Badge className="bg-slate-100 text-slate-600 border-0">
                          Inactive
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          No Membership
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </OwnerLayout>
  );
}