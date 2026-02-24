import React, { useState } from 'react';
import { api } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Target, 
  Calendar,
  Download,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import SnapReportCard from '../../components/dashboard/SnapReportCard';
import RevenueGrowthCard from '../../components/dashboard/RevenueGrowthCard';
import CustomerMetricsCard from '../../components/dashboard/CustomerMetricsCard';
import OperationsCard from '../../components/dashboard/OperationsCard';
import MarketingROICard from '../../components/dashboard/MarketingROICard';
import EOSScorecard from '../../components/dashboard/EOSScorecard';
import WeeklyMeetingAgenda from '../../components/dashboard/WeeklyMeetingAgenda';

export default function OwnerDashboard() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [timeRange, setTimeRange] = useState('week'); // week, month, quarter, year
  const [showTrackingSettings, setShowTrackingSettings] = useState(false);
  const [trackingConfig, setTrackingConfig] = useState({
    google_analytics_id: '',
    facebook_pixel_id: '',
    google_ads_account_id: ''
  });
  const queryClient = useQueryClient();

  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: () => api.entities.Location.list(),
  });

  const { data: currentSnapshot } = useQuery({
    queryKey: ['current-snapshot', selectedLocation?.id],
    queryFn: async () => {
      if (!selectedLocation) return null;
      const snapshots = await api.entities.WeeklySnapshot.filter(
        { location_id: selectedLocation.id },
        '-snapshot_date',
        1
      );
      return snapshots[0];
    },
    enabled: !!selectedLocation
  });

  const { data: historicalSnapshots = [] } = useQuery({
    queryKey: ['historical-snapshots', selectedLocation?.id, timeRange],
    queryFn: async () => {
      if (!selectedLocation) return [];
      const limit = timeRange === 'week' ? 4 : timeRange === 'month' ? 4 : timeRange === 'quarter' ? 13 : 52;
      return await api.entities.WeeklySnapshot.filter(
        { location_id: selectedLocation.id },
        '-snapshot_date',
        limit
      );
    },
    enabled: !!selectedLocation
  });

  const { data: rocks = [] } = useQuery({
    queryKey: ['rocks', selectedLocation?.id],
    queryFn: async () => {
      if (!selectedLocation) return [];
      const currentQuarter = `Q${Math.floor((new Date().getMonth() / 3)) + 1} ${new Date().getFullYear()}`;
      return await api.entities.Rock.filter(
        { location_id: selectedLocation.id, quarter: currentQuarter }
      );
    },
    enabled: !!selectedLocation
  });

  React.useEffect(() => {
    if (locations.length > 0 && !selectedLocation) {
      setSelectedLocation(locations[0]);
    }
  }, [locations, selectedLocation]);

  React.useEffect(() => {
    if (selectedLocation) {
      setTrackingConfig({
        google_analytics_id: selectedLocation.google_analytics_id || '',
        facebook_pixel_id: selectedLocation.facebook_pixel_id || '',
        google_ads_account_id: selectedLocation.google_ads_account_id || ''
      });
    }
  }, [selectedLocation]);

  const updateTrackingMutation = useMutation({
    mutationFn: async (data) => {
      if (selectedLocation) {
        return await api.entities.Location.update(selectedLocation.id, data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['locations']);
      setShowTrackingSettings(false);
    },
  });

  const handleSaveTracking = () => {
    updateTrackingMutation.mutate(trackingConfig);
  };

  const handleExportReport = async () => {
    // Export current snapshot as PDF
    alert('Export functionality - would generate PDF report');
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Executive Dashboard</h1>
          <p className="text-slate-600 mt-1">EOS Framework - Vision • Rocks • Weekly Scorecard</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowTrackingSettings(!showTrackingSettings)} variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Ad Tracking
          </Button>
          <Button onClick={handleExportReport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Location Selector */}
      {locations.length > 1 && (
        <div className="mb-6">
          <select
            value={selectedLocation?.id || ''}
            onChange={(e) => setSelectedLocation(locations.find(l => l.id === e.target.value))}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">All Locations</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Tracking Configuration */}
      {showTrackingSettings && selectedLocation && (
        <Card className="border-0 shadow-lg mb-6">
          <CardHeader>
            <CardTitle>Advertising Tracking Configuration</CardTitle>
            <p className="text-sm text-slate-600">Connect your ad accounts to track spend and cost per acquisition for {selectedLocation.name}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Google Analytics ID
              </label>
              <Input
                placeholder="G-XXXXXXXXXX or UA-XXXXXXXXX-X"
                value={trackingConfig.google_analytics_id}
                onChange={(e) => setTrackingConfig({...trackingConfig, google_analytics_id: e.target.value})}
              />
              <p className="text-xs text-slate-500 mt-1">Find this in your Google Analytics property settings</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Facebook Meta Pixel ID
              </label>
              <Input
                placeholder="1234567890123456"
                value={trackingConfig.facebook_pixel_id}
                onChange={(e) => setTrackingConfig({...trackingConfig, facebook_pixel_id: e.target.value})}
              />
              <p className="text-xs text-slate-500 mt-1">Find this in your Meta Events Manager</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Google Ads Account ID
              </label>
              <Input
                placeholder="123-456-7890"
                value={trackingConfig.google_ads_account_id}
                onChange={(e) => setTrackingConfig({...trackingConfig, google_ads_account_id: e.target.value})}
              />
              <p className="text-xs text-slate-500 mt-1">10-digit account number from Google Ads</p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSaveTracking}
                disabled={updateTrackingMutation.isPending}
                className="bg-gradient-to-r from-indigo-600 to-violet-600"
              >
                {updateTrackingMutation.isPending ? 'Saving...' : 'Save Configuration'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowTrackingSettings(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="snap">
            <Calendar className="w-4 h-4 mr-2" />
            SNAP Report
          </TabsTrigger>
          <TabsTrigger value="rocks">
            <Target className="w-4 h-4 mr-2" />
            Rocks & Goals
          </TabsTrigger>
          <TabsTrigger value="meeting">
            <TrendingUp className="w-4 h-4 mr-2" />
            Weekly Meeting
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Time Range Selector */}
          <div className="flex gap-2">
            {['week', 'month', 'quarter', 'year'].map(range => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'outline'}
                onClick={() => setTimeRange(range)}
                size="sm"
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Button>
            ))}
          </div>

          {/* Dashboard Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueGrowthCard 
              snapshot={currentSnapshot} 
              historical={historicalSnapshots}
            />
            <CustomerMetricsCard 
              snapshot={currentSnapshot}
              historical={historicalSnapshots}
            />
            <MarketingROICard 
              snapshot={currentSnapshot}
              historical={historicalSnapshots}
            />
            <OperationsCard 
              snapshot={currentSnapshot}
              historical={historicalSnapshots}
            />
          </div>

          {/* Health Score & Red Flags */}
          {currentSnapshot && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border-0">
                <h3 className="text-lg font-semibold mb-4">Business Health Score</h3>
                <div className="flex items-center gap-4">
                  <div className="text-5xl font-bold" style={{
                    color: currentSnapshot.health_score >= 80 ? '#10b981' :
                           currentSnapshot.health_score >= 60 ? '#f59e0b' : '#ef4444'
                  }}>
                    {currentSnapshot.health_score || 0}
                  </div>
                  <div className="flex-1">
                    <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all"
                        style={{
                          width: `${currentSnapshot.health_score || 0}%`,
                          backgroundColor: currentSnapshot.health_score >= 80 ? '#10b981' :
                                         currentSnapshot.health_score >= 60 ? '#f59e0b' : '#ef4444'
                        }}
                      />
                    </div>
                    <p className="text-sm text-slate-600 mt-2">
                      {currentSnapshot.health_score >= 80 ? 'Excellent' :
                       currentSnapshot.health_score >= 60 ? 'Good' : 'Needs Attention'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-0">
                <h3 className="text-lg font-semibold mb-4 text-red-600">🚨 Red Flags</h3>
                {currentSnapshot.red_flags?.length > 0 ? (
                  <ul className="space-y-2">
                    {currentSnapshot.red_flags.map((flag, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-red-500">•</span>
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-600 text-sm">No red flags - looking good! 🎉</p>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        {/* SNAP Report Tab */}
        <TabsContent value="snap">
          <SnapReportCard 
            snapshot={currentSnapshot}
            location={selectedLocation}
          />
        </TabsContent>

        {/* Rocks Tab */}
        <TabsContent value="rocks">
          <EOSScorecard 
            rocks={rocks}
            location={selectedLocation}
          />
        </TabsContent>

        {/* Weekly Meeting Tab */}
        <TabsContent value="meeting">
          <WeeklyMeetingAgenda 
            snapshot={currentSnapshot}
            rocks={rocks}
            location={selectedLocation}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}