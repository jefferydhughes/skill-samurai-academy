import React, { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { 
  List, 
  LayoutGrid, 
  Calendar as CalendarIcon,
  Search,
  X
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import CampFilters from '../../components/camps/CampFilters';
import CampListView from '../../components/camps/CampListView';
import CampCardView from '../../components/camps/CampCardView';
import CampCalendarView from '../../components/camps/CampCalendarView';
import CampEventModal from '../../components/camps/CampEventModal';
import CompareDrawer from '../../components/camps/CompareDrawer';
import AgeRecommendationBar from '../../components/camps/AgeRecommendationBar';
import SpotReservation from '../../components/camps/SpotReservation';
import CampCategoryStrip from '../../components/camps/CampCategoryStrip';
import MobileCampCard from '../../components/camps/MobileCampCard';

export default function CampBrowser() {
  const [viewMode, setViewMode] = useState('cards'); // 'list', 'cards', 'calendar'
  const [filters, setFilters] = useState({
    age: 'all',
    category: 'all',
    dateRange: 'all',
    search: ''
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [compareList, setCompareList] = useState([]);
  const [recommendedAge, setRecommendedAge] = useState(null);
  const [reservationCamp, setReservationCamp] = useState(null);

  // Get location from URL if coming from location page
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const locationId = params.get('locationId');
    if (locationId) {
      setSelectedLocation(locationId);
    }
  }, []);

  const { data: camps = [], isLoading } = useQuery({
    queryKey: ['camps', selectedLocation],
    queryFn: () => {
      if (selectedLocation) {
        return api.entities.CampEvent.filter({ 
          location_id: selectedLocation, 
          active: true 
        });
      }
      return api.entities.CampEvent.filter({ active: true });
    },
  });

  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: () => api.entities.Location.filter({ active: true }),
  });

  const handleCompareToggle = (camp) => {
    if (compareList.find(c => c.id === camp.id)) {
      setCompareList(compareList.filter(c => c.id !== camp.id));
    } else if (compareList.length < 3) {
      setCompareList([...compareList, camp]);
    }
  };

  const handleReservationContinue = () => {
    setReservationCamp(null);
    setSelectedEvent(reservationCamp);
  };

  const isRecommended = (camp) => {
    if (!recommendedAge) return false;
    return recommendedAge >= camp.age_min && recommendedAge <= camp.age_max;
  };

  // Filter camps based on selected filters
  const filteredCamps = camps.filter(camp => {
    // Age filter
    if (filters.age !== 'all') {
      const age = parseInt(filters.age);
      if (age < camp.age_min || age > camp.age_max) return false;
    }

    // Category filter
    if (filters.category !== 'all' && camp.category !== filters.category) {
      return false;
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const campDate = new Date(camp.start_datetime);
      const now = new Date();
      const monthsAhead = parseInt(filters.dateRange);
      const targetDate = new Date(now.getFullYear(), now.getMonth() + monthsAhead, 1);
      if (campDate > targetDate) return false;
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        camp.title.toLowerCase().includes(searchLower) ||
        camp.description?.toLowerCase().includes(searchLower) ||
        camp.category?.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  // Sort: recommended camps first
  const sortedCamps = [...filteredCamps].sort((a, b) => {
    const aRecommended = isRecommended(a);
    const bRecommended = isRecommended(b);
    if (aRecommended && !bRecommended) return -1;
    if (!aRecommended && bRecommended) return 1;
    return 0;
  });

  const viewButtons = [
    { mode: 'list', icon: List, label: 'List View' },
    { mode: 'cards', icon: LayoutGrid, label: 'Card View' },
    { mode: 'calendar', icon: CalendarIcon, label: 'Calendar View' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Mobile View */}
      <div className="lg:hidden pb-20">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-white/40 sticky top-16 z-30 px-4 py-4">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Holiday Camps</h1>
          <p className="text-sm text-slate-600">
            Find the perfect camp for your child
          </p>
        </div>

        {/* Category Strip */}
        <div className="sticky top-[132px] z-20 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 py-3">
          <CampCategoryStrip 
            active={filters.category} 
            onChange={(cat) => setFilters({...filters, category: cat})} 
          />
        </div>

        {/* Age Recommendation (Mobile) */}
        {recommendedAge && (
          <div className="px-4 py-3">
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⭐</span>
                <div>
                  <div className="text-xs text-amber-700 font-medium">Showing matches for</div>
                  <div className="text-sm font-semibold text-amber-900">Age {recommendedAge}</div>
                </div>
              </div>
              <button
                onClick={() => setRecommendedAge(null)}
                className="text-amber-600 hover:text-amber-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Quick Filters (Mobile) */}
        <div className="px-4 py-2 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setRecommendedAge(null)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/70 backdrop-blur border border-white/40 text-sm font-medium text-gray-700 whitespace-nowrap"
          >
            <Search className="w-4 h-4" />
            {recommendedAge ? `Age ${recommendedAge}` : 'Set Age'}
          </button>
          
          <Select value={selectedLocation || 'all'} onValueChange={(val) => setSelectedLocation(val === 'all' ? null : val)}>
            <SelectTrigger className="bg-white/70 backdrop-blur border-white/40 text-sm whitespace-nowrap w-auto min-w-[140px]">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map(loc => (
                <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results Count */}
        <div className="px-4 py-2">
          <p className="text-sm text-slate-600">
            {filteredCamps.length} {filteredCamps.length === 1 ? 'camp' : 'camps'} found
          </p>
        </div>

        {/* Mobile Camp List */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading camps...</p>
          </div>
        ) : filteredCamps.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No camps found</h3>
            <p className="text-slate-600">Try selecting a different category or location!</p>
          </div>
        ) : (
          <div className="px-4 space-y-4">
            {sortedCamps.map(camp => (
              <MobileCampCard
                key={camp.id}
                camp={camp}
                onView={setSelectedEvent}
                onReserve={setReservationCamp}
                isRecommended={isRecommended(camp)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">School Holiday Camps</h1>
          <p className="text-lg text-slate-600">
            Tech camps, coding adventures, and creative workshops for ages 7-17
          </p>
        </div>

        {/* Location Selector */}
        {locations.length > 1 && (
          <div className="mb-6">
            <Select value={selectedLocation || 'all'} onValueChange={(val) => setSelectedLocation(val === 'all' ? null : val)}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map(loc => (
                  <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Age Recommendation */}
        <div className="mb-6">
          <AgeRecommendationBar 
            onAgeChange={setRecommendedAge}
            currentAge={recommendedAge}
            onClear={() => setRecommendedAge(null)}
          />
        </div>

        {/* Filters */}
        <CampFilters filters={filters} setFilters={setFilters} camps={camps} />

        {/* View Switcher */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-600">
              Showing {filteredCamps.length} {filteredCamps.length === 1 ? 'camp' : 'camps'}
            </div>
            {compareList.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCompareList([])}
                className="gap-2"
              >
                Comparing {compareList.length}
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {viewButtons.map(({ mode, icon: Icon, label }) => (
              <Button
                key={mode}
                variant={viewMode === mode ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode(mode)}
                className={viewMode === mode ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Views */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading camps...</p>
          </div>
        ) : filteredCamps.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No camps found</h3>
            <p className="text-slate-600">Try adjusting your filters or check back soon for new camps!</p>
          </div>
        ) : (
          <>
            {viewMode === 'list' && (
              <CampListView 
                camps={sortedCamps} 
                onEventClick={setSelectedEvent}
                onReserveClick={setReservationCamp}
                compareList={compareList}
                onCompareToggle={handleCompareToggle}
                isRecommended={isRecommended}
              />
            )}
            {viewMode === 'cards' && (
              <CampCardView 
                camps={sortedCamps} 
                onEventClick={setSelectedEvent}
                onReserveClick={setReservationCamp}
                compareList={compareList}
                onCompareToggle={handleCompareToggle}
                isRecommended={isRecommended}
              />
            )}
            {viewMode === 'calendar' && (
              <CampCalendarView 
                camps={sortedCamps} 
                onEventClick={setSelectedEvent}
              />
            )}
          </>
        )}
      </div>

      {/* Compare Drawer */}
      <CompareDrawer
        camps={compareList}
        onClose={() => setCompareList([])}
        onRemove={(id) => setCompareList(compareList.filter(c => c.id !== id))}
        onEventClick={setSelectedEvent}
      />

      {/* Spot Reservation */}
      <SpotReservation
        camp={reservationCamp}
        onClose={() => setReservationCamp(null)}
        onContinue={handleReservationContinue}
      />

      {/* Event Modal */}
      {selectedEvent && (
        <CampEventModal 
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}