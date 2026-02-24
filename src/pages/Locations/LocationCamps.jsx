import React, { useState } from 'react';
import { api } from '@/api/apiClient';
import { supabase } from '@/lib/supabase/supabaseClient';
import { useQuery } from '@tanstack/react-query';
import { useLocationData } from '@/lib/LocationContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
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
import { List, LayoutGrid, Calendar as CalendarIcon, Search, X } from 'lucide-react';

function normalizeLocation(row) {
  const name = row.name || row.location_name || row.franchise_name || '';
  return {
    ...row,
    name,
    slug:
      row.slug ||
      row.location_slug ||
      name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    city: row.city || row.suburb || '',
  };
}

export default function LocationCamps() {
  // When rendered via /:locationSlug/camps the router provides location via context.
  // When rendered via /LocationCamps?slug=...&locationId=... it falls back to Supabase fetch.
  const contextLocation = useLocationData();

  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');
  const locationId = urlParams.get('locationId') || contextLocation?.id;

  const [viewMode, setViewMode] = useState('cards');
  const [filters, setFilters] = useState({
    age: 'all',
    category: 'all',
    dateRange: 'all',
    search: ''
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [compareList, setCompareList] = useState([]);
  const [recommendedAge, setRecommendedAge] = useState(null);
  const [reservationCamp, setReservationCamp] = useState(null);

  const { data: locations = [] } = useQuery({
    queryKey: ['location', slug],
    queryFn: async () => {
      const { data, error } = await supabase.from('franchise_locations').select('*').eq('slug', slug);
      if (error) throw error;
      return (data ?? []).map(normalizeLocation);
    },
    enabled: !!slug && !contextLocation,
  });

  const location = contextLocation ? normalizeLocation(contextLocation) : locations[0];

  const { data: camps = [], isLoading } = useQuery({
    queryKey: ['camps', locationId],
    queryFn: () => api.entities.CampEvent.filter({ 
      location_id: locationId, 
      active: true 
    }),
    enabled: !!locationId,
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

  // Filter camps
  const filteredCamps = camps.filter(camp => {
    if (filters.age !== 'all') {
      const age = parseInt(filters.age);
      if (age < camp.age_min || age > camp.age_max) return false;
    }

    if (filters.category !== 'all' && camp.category !== filters.category) {
      return false;
    }

    if (filters.dateRange !== 'all') {
      const campDate = new Date(camp.start_datetime);
      const now = new Date();
      const monthsAhead = parseInt(filters.dateRange);
      const targetDate = new Date(now.getFullYear(), now.getMonth() + monthsAhead, 1);
      if (campDate > targetDate) return false;
    }

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

  if (!location) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-emerald-500 via-cyan-500 to-indigo-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button 
            variant="ghost" 
            asChild 
            className="text-white hover:bg-white/10 mb-6"
          >
            <Link to={`${createPageUrl('LocationDetail')}?slug=${slug}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to {location.name}
            </Link>
          </Button>

          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-xl flex items-center justify-center">
                <Rocket className="w-7 h-7" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">Holiday Camps</h1>
            </div>
            
            <p className="text-xl text-indigo-100 mb-4">
              Intensive coding camps during school breaks at {location.city}
            </p>
            
            <p className="text-lg text-white/90">
              From Minecraft modding to Python programming, our holiday camps provide immersive tech experiences. 
              Students learn, create, and collaborate in a fun environment led by expert instructors.
            </p>
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden pb-20">
        {/* Category Strip */}
        <div className="sticky top-16 z-20 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 py-3">
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

        {/* Quick Age Filter (Mobile) */}
        <div className="px-4 py-2">
          <button
            onClick={() => {
              const age = prompt('Enter your child\'s age (7-17):');
              if (age && !isNaN(age)) {
                setRecommendedAge(parseInt(age));
              }
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/70 backdrop-blur border border-white/40 text-sm font-medium text-gray-700"
          >
            <Search className="w-4 h-4" />
            {recommendedAge ? `Age ${recommendedAge}` : 'Filter by Age'}
          </button>
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
            <p className="text-slate-600">Try selecting a different category!</p>
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
                <span className="hidden sm:inline">{label}</span>
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
            <p className="text-slate-600">Check back soon for upcoming holiday camps at {location.city}!</p>
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
          location={location}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}
