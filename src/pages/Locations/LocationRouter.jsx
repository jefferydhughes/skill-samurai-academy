import React from 'react';
import { useParams, Routes, Route } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/supabaseClient';
import { LocationContext } from '@/lib/LocationContext';
import { createPageUrl } from '@/utils';
import { MapPin, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

import LocationDetail from './LocationDetail';
import LocationCamps from './LocationCamps';
import BookTrial from '../Public/BookTrial';
import ProgramsBrowser from '../Public/ProgramsBrowser';

/**
 * Extracts the last path segment from a URL.
 * e.g. "https://skillsamurai.com/mb-winnipeg" → "mb-winnipeg"
 */
function extractUrlSlug(websiteUrl) {
  if (!websiteUrl) return '';
  try {
    const url = new URL(websiteUrl);
    const parts = url.pathname.split('/').filter(Boolean);
    return parts[parts.length - 1] || '';
  } catch {
    return websiteUrl.split('/').filter(Boolean).pop() || '';
  }
}

export default function LocationRouter() {
  const { locationSlug } = useParams();

  const { data: location, isLoading, error } = useQuery({
    queryKey: ['location_by_url_slug', locationSlug],
    queryFn: async () => {
      // Try matching by website_url path segment first
      const { data: byUrl, error: urlError } = await supabase
        .from('franchise_locations')
        .select('*')
        .ilike('website_url', `%/${locationSlug}`);

      if (!urlError && byUrl?.length > 0) return byUrl[0];

      // Fallback: match by slug column
      const { data: bySlug, error: slugError } = await supabase
        .from('franchise_locations')
        .select('*')
        .eq('slug', locationSlug);

      if (!slugError && bySlug?.length > 0) return bySlug[0];

      return null;
    },
    enabled: !!locationSlug,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Location not found</h2>
          <p className="text-slate-500 mb-6">
            No location matched "{locationSlug}"
            {error && <span className="block text-sm text-red-600 mt-1">{error.message}</span>}
          </p>
          <Button asChild variant="outline">
            <Link to={createPageUrl('Locations')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              View All Locations
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <LocationContext.Provider value={location}>
      <Routes>
        {/* /:locationSlug  →  location landing page */}
        <Route index element={<LocationDetail />} />

        {/* /:locationSlug/free-trial-class  →  book a free trial */}
        <Route path="free-trial-class" element={<BookTrial />} />

        {/* /:locationSlug/camps  →  holiday camps for this location */}
        <Route path="camps" element={<LocationCamps />} />

        {/* /:locationSlug/programs  →  all programs */}
        <Route path="programs" element={<ProgramsBrowser />} />
      </Routes>
    </LocationContext.Provider>
  );
}
