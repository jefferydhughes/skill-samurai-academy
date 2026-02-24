import React, { useState, useEffect } from 'react';
import OwnerLayout from '../../components/owner/OwnerLayout';
import { api } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Users, Calendar } from 'lucide-react';

export default function OwnerReports() {
  const [user, setUser] = useState(null);

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

  const { data: memberships = [] } = useQuery({
    queryKey: ['memberships'],
    queryFn: () => api.entities.Membership.list(),
  });

  const { data: campBookings = [] } = useQuery({
    queryKey: ['camp-bookings'],
    queryFn: () => api.entities.CampBooking.list(),
  });

  const activeMemberships = memberships.filter(m => m.status === 'active');
  const confirmedCampBookings = campBookings.filter(b => b.status === 'confirmed');

  // Mock revenue calculations - in production, calculate from payment records
  const membershipRevenue = activeMemberships.length * 120; // Mock $120/membership
  const campRevenue = confirmedCampBookings.reduce((sum, b) => sum + ((b.amount || 0) / 100), 0);
  const totalRevenue = membershipRevenue + campRevenue;

  const stats = [
    {
      title: 'Total Revenue (30 days)',
      value: `$${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-600',
    },
    {
      title: 'Active Memberships',
      value: activeMemberships.length,
      icon: Users,
      color: 'from-[#2A4169] to-[#3B5A8C]',
    },
    {
      title: 'Camp Bookings',
      value: confirmedCampBookings.length,
      icon: Calendar,
      color: 'from-[#EE3E86] to-[#D62D73]',
    },
    {
      title: 'Growth',
      value: '+12%',
      icon: TrendingUp,
      color: 'from-[#A3DAE8] to-[#7CC8DB]',
    },
  ];

  return (
    <OwnerLayout currentPageName="OwnerReports">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#2A4169]">Reports & Analytics</h1>
          <p className="text-slate-600 mt-1">Revenue and capacity insights</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="border-0 shadow-lg overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${stat.color}`} />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold text-[#2A4169]">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#2A4169]">Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <span className="font-medium text-[#2A4169]">Membership Revenue</span>
                <span className="text-xl font-bold text-[#2A4169]">${membershipRevenue.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <span className="font-medium text-[#2A4169]">Camp Revenue</span>
                <span className="text-xl font-bold text-[#2A4169]">${campRevenue.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#2A4169]">Detailed Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-slate-500">
              <p>Advanced analytics and export features coming soon</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </OwnerLayout>
  );
}