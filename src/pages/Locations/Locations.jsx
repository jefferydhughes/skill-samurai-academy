import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { supabase } from '@/lib/supabase/supabaseClient';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, Globe, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

function normalizeLocation(row) {
  const name = row.name || row.location_name || row.franchise_name || '';
  const slug =
    row.slug ||
    row.location_slug ||
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  return {
    ...row,
    name,
    slug,
    city: row.city || row.suburb || '',
    country: row.country || row.country_name || '',
    location_photo_url: row.location_photo_url || row.photo_url || '',
    delivery_mode: row.delivery_mode || '',
    is_active: row.is_active ?? row.active ?? true,
  };
}

export default function Locations() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: locations = [] } = useQuery({
    queryKey: ['franchise_locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('franchise_locations')
        .select('*');
      if (error) throw error;
      return (data ?? [])
        .map(normalizeLocation)
        .filter((loc) => loc.is_active && loc.slug);
    },
  });

  const filteredLocations = locations.filter(loc => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      loc.name?.toLowerCase().includes(q) ||
      loc.city?.toLowerCase().includes(q) ||
      loc.country?.toLowerCase().includes(q) ||
      loc.slug?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/20">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 text-white py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Your Local Skill Samurai</h1>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Discover coding, STEM, and robotics programs at a location near you
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Enter city or postal code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg bg-white/95 backdrop-blur-xl border-0 shadow-xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Locations Grid */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {filteredLocations.length} Location{filteredLocations.length !== 1 ? 's' : ''} Available
            </h2>
            <p className="text-slate-600 mt-1">Select a center to view programs and enroll</p>
          </div>
          <Badge variant="outline" className="text-sm">
            <Globe className="w-4 h-4 mr-2" />
            Worldwide
          </Badge>
        </div>

        {filteredLocations.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="text-center py-16">
              <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No locations found</h3>
              <p className="text-slate-600 mb-6">Try searching with a different city or postal code</p>
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                Clear Search
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLocations.map((location) => (
              <Card key={location.id} className="group border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                <div className="aspect-video relative overflow-hidden">
                  {location.location_photo_url ? (
                    <>
                      <img
                        src={location.location_photo_url}
                        alt={location.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </>
                  ) : (
                    <>
                      <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <MapPin className="w-16 h-16 text-white opacity-40" />
                      </div>
                    </>
                  )}
                  <Badge className="absolute top-4 right-4 bg-white/90 text-indigo-700 border-0 capitalize">
                    {location.delivery_mode?.replace('_', ' ') || 'In Person'}
                  </Badge>
                </div>

                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                    {location.name}
                  </h3>
                  <div className="flex items-center text-slate-600 text-sm mb-4">
                    <MapPin className="w-4 h-4 mr-2" />
                    {location.country}
                  </div>

                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
                  >
                    <Link to={`${createPageUrl('LocationDetail')}?slug=${location.slug}`}>
                      View Programs
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
