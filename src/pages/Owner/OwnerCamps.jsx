import React, { useState, useEffect } from 'react';
import OwnerLayout from '../../components/owner/OwnerLayout';
import { api } from '@/api/apiClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Users, Calendar, Share2, Zap } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import CampForm from '../../components/owner/CampForm';
import SocialMediaManager from '../../components/owner/SocialMediaManager';
import { format } from 'date-fns';
import { socialSettingsApi } from '@/lib/supabase/socialMediaApi';

export default function OwnerCamps() {
  const [user, setUser] = useState(null);
  const [showCampForm, setShowCampForm] = useState(false);
  const [editingCamp, setEditingCamp] = useState(null);
  const [socialCamp, setSocialCamp] = useState(null);
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

  const { data: camps = [] } = useQuery({
    queryKey: ['camps'],
    queryFn: () => api.entities.CampEvent.list('-start_datetime'),
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['camp-bookings'],
    queryFn: () => api.entities.CampBooking.list(),
  });

  // Load social settings to drive spaces-left badges on camp cards
  const campIds = camps.map((c) => c.id);
  const { data: allSocialSettings = [] } = useQuery({
    queryKey: ['social-settings-bulk', campIds.join(',')],
    queryFn: () => socialSettingsApi.getForCampIds(campIds),
    enabled: campIds.length > 0,
  });

  const socialSettingsMap = React.useMemo(() => {
    const map = {};
    allSocialSettings.forEach((s) => { map[s.camp_id] = s; });
    return map;
  }, [allSocialSettings]);

  const handleAddCamp = () => {
    setEditingCamp(null);
    setShowCampForm(true);
  };

  const handleEditCamp = (camp) => {
    setEditingCamp(camp);
    setShowCampForm(true);
  };

  const handleFormClose = () => {
    setShowCampForm(false);
    setEditingCamp(null);
  };

  return (
    <OwnerLayout currentPageName="OwnerCamps">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#2A4169]">School Holiday Camps</h1>
            <p className="text-slate-600 mt-1">Manage camp events and bookings</p>
          </div>
          <Button
            onClick={handleAddCamp}
            className="bg-[#EE3E86] hover:bg-[#D62D73] gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Camp
          </Button>
        </div>

        {camps.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-[#A3DAE8]/20 flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-10 h-10 text-[#A3DAE8]" />
              </div>
              <h3 className="text-xl font-semibold text-[#2A4169] mb-2">No camps yet</h3>
              <p className="text-slate-600 mb-6">Create your first school holiday camp event</p>
              <Button onClick={handleAddCamp} className="bg-[#EE3E86] hover:bg-[#D62D73]">
                <Plus className="w-5 h-5 mr-2" />
                Create First Camp
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {camps.map((camp) => {
              const campBookings = bookings.filter(b => b.camp_event_id === camp.id);
              const confirmedCount = campBookings.filter(b => b.status === 'confirmed').length;
              const percentFull = camp.capacity > 0 ? (confirmedCount / camp.capacity) * 100 : 0;

              const campSocial = socialSettingsMap[camp.id];
              const spacesRemaining = (camp.capacity || 0) - confirmedCount;
              const showSpacesBadge =
                campSocial?.show_spaces_left &&
                spacesRemaining > 0 &&
                spacesRemaining <= (campSocial.spaces_left_threshold || 5);
              const spacesCritical = spacesRemaining <= 2;

              return (
                <Card key={camp.id} className="border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden group">
                  <div className="h-2 bg-gradient-to-r from-[#EE3E86] to-[#A3DAE8]" />
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg text-[#2A4169]">{camp.title}</CardTitle>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        onClick={() => handleEditCamp(camp)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {camp.description || 'No description'}
                    </p>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="w-4 h-4" />
                        {camp.start_datetime && format(new Date(camp.start_datetime), 'MMM d, yyyy')}
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Users className="w-4 h-4" />
                        {confirmedCount} / {camp.capacity || 0} enrolled
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Capacity</span>
                        <span className="font-semibold text-[#2A4169]">{percentFull.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#EE3E86] to-[#A3DAE8] transition-all"
                          style={{ width: `${percentFull}%` }}
                        />
                      </div>
                    </div>

                    {/* Spaces left badge */}
                    {showSpacesBadge && (
                      <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full w-fit ${
                        spacesCritical
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        <Zap className="w-3 h-3" />
                        {spacesRemaining} space{spacesRemaining === 1 ? '' : 's'} left
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          className={camp.active
                            ? 'bg-green-100 text-green-700 border-0'
                            : 'bg-slate-100 text-slate-600 border-0'
                          }
                        >
                          {camp.active ? 'Active' : 'Inactive'}
                        </Badge>
                        <span className="text-lg font-bold text-[#2A4169]">
                          ${((camp.price || 0) / 100).toFixed(2)}
                        </span>
                      </div>

                      {/* Social media button */}
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-xs text-[#2A4169] border-[#2A4169]/20 hover:bg-[#2A4169]/5 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setSocialCamp(camp)}
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        Social
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Camp create / edit dialog */}
      <Dialog open={showCampForm} onOpenChange={setShowCampForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#2A4169]">
              {editingCamp ? 'Edit Camp' : 'Create New Camp'}
            </DialogTitle>
          </DialogHeader>
          <CampForm
            camp={editingCamp}
            onSuccess={handleFormClose}
          />
        </DialogContent>
      </Dialog>

      {/* Social Media Manager dialog */}
      <SocialMediaManager
        camp={socialCamp}
        open={!!socialCamp}
        onClose={() => setSocialCamp(null)}
      />
    </OwnerLayout>
  );
}