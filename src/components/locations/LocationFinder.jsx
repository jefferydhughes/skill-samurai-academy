import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { supabase } from '@/lib/supabase/supabaseClient';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function LocationFinder() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('is_active', true);
      if (error) throw error;
      return data ?? [];
    },
  });

  const filteredLocations = searchQuery
    ? locations.filter(loc => {
        const q = searchQuery.toLowerCase();
        return (
          loc.name?.toLowerCase().includes(q) ||
          loc.country?.toLowerCase().includes(q) ||
          loc.slug?.toLowerCase().includes(q)
        );
      }).slice(0, 5)
    : [];

  const handleLocationSelect = (slug) => {
    navigate(`${createPageUrl('LocationDetail')}?slug=${slug}`);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          Find Your Local Skill Samurai
        </h2>
        <p className="text-lg text-slate-600">
          Enter your city or postal code to discover programs near you
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
        <Input
          type="text"
          placeholder="Enter city or postal code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-14 text-lg bg-white border-slate-200 shadow-lg"
        />
      </div>

      {searchQuery && (
        <Card className="mt-4 border-0 shadow-xl">
          <CardContent className="p-0">
            {filteredLocations.length > 0 ? (
              <div className="divide-y">
                {filteredLocations.map((location) => (
                  <button
                    key={location.id}
                    onClick={() => handleLocationSelect(location.slug)}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{location.name}</div>
                        <div className="text-sm text-slate-600">{location.country}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">No locations found</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="text-center mt-6">
        <Button
          onClick={() => navigate(createPageUrl('Locations'))}
          variant="outline"
          size="lg"
        >
          View All Locations
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
