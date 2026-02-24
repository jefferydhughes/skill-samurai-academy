import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Monitor, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function LocationSelector() {
  const [searchParams] = useSearchParams();
  const programId = searchParams.get('programId');

  const { data: locations = [], isLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: () => api.entities.Academy.filter({ active: true }),
  });

  const { data: program } = useQuery({
    queryKey: ['program', programId],
    queryFn: () => programId ? api.entities.Program.list().then(programs => 
      programs.find(p => p.id === programId)
    ) : null,
    enabled: !!programId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Choose Your Location
        </h1>
        {program && (
          <p className="text-xl text-slate-600">
            Select a location to book <span className="font-semibold text-indigo-600">{program.name}</span>
          </p>
        )}
      </div>

      {/* Online Option */}
      <Card className="p-6 border-2 border-indigo-500 bg-gradient-to-br from-indigo-50 to-violet-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center">
              <Monitor className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Online Sessions</h3>
              <p className="text-slate-600">Join from anywhere in the world</p>
            </div>
          </div>
          <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
            <Link to={createPageUrl('BookTrial') + `?mode=online${programId ? '&programId=' + programId : ''}`}>
              Select
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </Card>

      {/* In-Person Locations */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">In-Person Locations</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {locations.map((location) => (
            <Card key={location.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{location.name}</h3>
                    <p className="text-sm text-slate-500">{location.city}, {location.country}</p>
                  </div>
                </div>
              </div>
              {location.address && (
                <p className="text-sm text-slate-600 mb-4">{location.address}</p>
              )}
              <Button asChild variant="outline" className="w-full">
                <Link to={createPageUrl('BookTrial') + `?slug=${location.slug}${programId ? '&programId=' + programId : ''}`}>
                  Select Location
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {locations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500">No in-person locations available at this time.</p>
        </div>
      )}
    </div>
  );
}