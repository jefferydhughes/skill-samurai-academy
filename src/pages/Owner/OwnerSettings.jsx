import React, { useState, useEffect } from 'react';
import OwnerLayout from '../../components/owner/OwnerLayout';
import { api } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function OwnerSettings() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

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

  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: () => api.entities.Location.list(),
  });

  const location = locations[0]; // For MVP, assume single location

  const { data: openHours = [] } = useQuery({
    queryKey: ['open-hours', location?.id],
    queryFn: () => api.entities.OpenHours.filter({ location_id: location?.id }),
    enabled: !!location?.id,
  });

  const updateHoursMutation = useMutation({
    mutationFn: async (hourData) => {
      const existing = openHours.find(h => h.weekday === hourData.weekday);
      if (existing) {
        return api.entities.OpenHours.update(existing.id, hourData);
      } else {
        return api.entities.OpenHours.create({ ...hourData, location_id: location.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['open-hours'] });
    },
  });

  const handleToggleDay = (dayIndex, isOpen) => {
    updateHoursMutation.mutate({
      weekday: dayIndex,
      is_open: isOpen,
      open_time: isOpen ? '09:00' : null,
      close_time: isOpen ? '17:00' : null,
    });
  };

  return (
    <OwnerLayout currentPageName="OwnerSettings">
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold text-[#2A4169]">Settings</h1>
          <p className="text-slate-600 mt-1">Manage location settings and hours</p>
        </div>

        {/* Location Details */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#2A4169]">Location Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-[#2A4169]">Location Name</Label>
              <Input value={location?.name || ''} className="mt-1" readOnly />
            </div>
            <div>
              <Label className="text-[#2A4169]">Country</Label>
              <Input value={location?.country || ''} className="mt-1" readOnly />
            </div>
          </CardContent>
        </Card>

        {/* Open Hours */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#2A4169]">Open Hours</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {weekdays.map((day, index) => {
              const hours = openHours.find(h => h.weekday === index);
              const isOpen = hours?.is_open || false;

              return (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-4 flex-1">
                    <Switch
                      checked={isOpen}
                      onCheckedChange={(checked) => handleToggleDay(index, checked)}
                    />
                    <span className="font-medium text-[#2A4169] w-24">{day}</span>
                    {isOpen && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span>{hours?.open_time || '09:00'}</span>
                        <span>-</span>
                        <span>{hours?.close_time || '17:00'}</span>
                      </div>
                    )}
                    {!isOpen && (
                      <Badge variant="secondary">Closed</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Fee Configuration */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#2A4169]">Fee Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <span className="font-medium text-[#2A4169]">Royalty Rate</span>
              <span className="text-lg font-bold">7%</span>
            </div>
            <p className="text-sm text-slate-500">
              Fee configuration is managed by corporate. Contact support for changes.
            </p>
          </CardContent>
        </Card>
      </div>
    </OwnerLayout>
  );
}