import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { supabase } from '@/lib/supabase/supabaseClient';
import { useQuery } from '@tanstack/react-query';
import { 
  MapPin, 
  Code, 
  Rocket,
  GraduationCap,
  Trophy,
  ArrowRight,
  ArrowLeft,
  Phone
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
    country: row.country || row.country_name || '',
    state_province: row.state_province || row.state || row.region || '',
    address_line1: row.address_line1 || row.address || row.street_address || '',
    postal_code: row.postal_code || row.zip || row.postcode || '',
    phone: row.phone || row.phone_number || row.contact_phone || '',
  };
}

function getLocationCopy(location) {
  const city = location.city || location.name;
  const region = location.state_province || location.country;

  return {
    h1: `Coding Classes for Kids in ${city}, ${region}`,
    h2: `After-School Coding, Robotics & STEM Programs for Kids in ${city}`,
    p1: `Skill Samurai ${city} offers award-winning coding and STEM programs designed to help kids and teens build real-world technology skills. Our students learn programming, robotics, game development, and problem-solving in a fun, structured environment.`,
    p2: `Whether your child is brand new to coding or ready for advanced challenges, Skill Samurai helps students build confidence, creativity, and critical thinking skills. Families in ${city} choose Skill Samurai for small class sizes, expert instructors, and a future-focused curriculum.`,
  };
}

export default function LocationDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');

  const { data: locations = [], isLoading } = useQuery({
    queryKey: ['location', slug],
    queryFn: async () => {
      const { data, error } = await supabase.from('franchise_locations').select('*').eq('slug', slug);
      if (error) throw error;
      return (data ?? []).map(normalizeLocation);
    },
    enabled: !!slug,
  });

  const location = locations[0];

  const { data: programs = [] } = useQuery({
    queryKey: ['programs'],
    queryFn: () => api.entities.Program.filter({ active: true }),
  });

  const { data: slots = [] } = useQuery({
    queryKey: ['slots', location?.id],
    queryFn: () => api.entities.WeeklyClassSlot.filter({ location_id: location?.id, active: true }),
    enabled: !!location?.id,
  });

  const programCategories = [
    {
      title: 'Weekly Coding Classes',
      icon: Code,
      color: 'from-indigo-500 to-violet-600',
      description: 'Ongoing weekly programs for ages 7-17',
      programs: programs.filter(p => p.type === 'weekly'),
    },
    {
      title: 'Holiday Camps',
      icon: Rocket,
      color: 'from-emerald-500 to-cyan-600',
      description: 'Intensive coding camps during school breaks',
      programs: programs.filter(p => p.type === 'camp'),
    },
    {
      title: 'Online Programs',
      icon: GraduationCap,
      color: 'from-amber-500 to-orange-600',
      description: 'Learn from anywhere with live instruction',
      programs: programs.filter(p => p.type === 'online'),
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading location...</p>
        </div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Location not found</h2>
          <Button asChild className="mt-4">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/20">
      {/* Location Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 text-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <Button 
            variant="ghost" 
            asChild 
            className="text-white hover:bg-white/10 mb-6"
          >
            <Link to={createPageUrl('Locations')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              All Locations
            </Link>
          </Button>

          {/* Mobile Glass Hero */}
          <div className="md:hidden max-w-xl mx-auto">
            <div className="bg-white/15 backdrop-blur-xl border border-white/25 rounded-3xl p-6 shadow-2xl text-center">
              <h1 className="text-3xl font-extrabold text-white leading-tight mb-3">
                Coding, Robotics & STEM Classes in {location.city || location.name}
              </h1>

              <p className="text-lg font-semibold text-indigo-100 mb-6">
                Turn Screen Time into <span className="text-pink-300">Future-Ready Skills</span>
              </p>

              <ul className="space-y-3 text-indigo-100 text-base mb-8 text-left max-w-sm mx-auto">
                <li className="flex items-center gap-3">
                  <span className="text-green-300">✔</span>
                  <span>20,000+ students worldwide</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-300">✔</span>
                  <span>7 countries</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-300">✔</span>
                  <span>Ages 6–18</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-300">✔</span>
                  <span>In-Person Classes in {location.city}</span>
                </li>
              </ul>

              <Button
                asChild
                size="lg"
                className="w-full bg-white text-indigo-700 hover:bg-white/90 hover:text-indigo-700 font-bold shadow-lg mb-4"
              >
                <Link to={`${createPageUrl('BookTrial')}?slug=${location.slug}`}>
                  Book a FREE Trial
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                className="w-full bg-white text-indigo-700 hover:bg-white/90 hover:text-indigo-700 font-bold shadow-lg"
              >
                <Link to={createPageUrl('ProgramsBrowser')}>
                  View {location.city || location.name} Programs
                </Link>
              </Button>
            </div>
          </div>

          {/* Desktop Hero */}
          <div className="hidden md:flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1 text-left">
              <h1 className="text-5xl font-extrabold mb-4 leading-tight">
                Coding, Robotics & STEM Classes in {location.city || location.name}
              </h1>

              <p className="text-xl font-semibold text-indigo-100 mb-6">
                Turn Screen Time into <span className="text-pink-300">Future-Ready Skills</span>
              </p>

              <ul className="space-y-2 text-indigo-100 mb-8">
                <li>✔ 20,000+ students worldwide</li>
                <li>✔ 7 countries</li>
                <li>✔ Ages 6–18</li>
                <li>✔ In-Person Classes in {location.city}</li>
              </ul>

              <div className="flex flex-col gap-4 mb-8">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-indigo-700 hover:bg-white/90 hover:text-indigo-700 font-bold"
                >
                  <Link to={`${createPageUrl('BookTrial')}?slug=${location.slug}`}>
                    Book a FREE Trial
                  </Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  className="bg-white text-indigo-700 hover:bg-white/90 hover:text-indigo-700 font-bold"
                >
                  <Link to={createPageUrl('ProgramsBrowser')}>
                    View {location.city || location.name} Programs
                  </Link>
                </Button>
              </div>

              {/* Address and Phone */}
              <div className="space-y-3 text-indigo-100">
                {(location.address_line1 || location.city) && (
                  <a 
                    href={`https://maps.google.com/?q=${encodeURIComponent([location.address_line1, location.city, location.state_province, location.postal_code].filter(Boolean).join(', '))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-white transition justify-center md:justify-start"
                  >
                    <MapPin className="w-5 h-5" />
                    <span>
                      {[location.address_line1, location.city, location.state_province, location.postal_code].filter(Boolean).join(', ')}
                    </span>
                  </a>
                )}
                {location.phone && (
                  <a 
                    href={`tel:${location.phone}`}
                    className="flex items-center gap-2 hover:text-white transition justify-center md:justify-start"
                  >
                    <Phone className="w-5 h-5" />
                    <span>{location.phone}</span>
                  </a>
                )}
              </div>
            </div>

            <div className="w-full md:w-64 bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <h3 className="font-semibold text-lg mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-indigo-100">Programs</span>
                  <span className="font-bold">{programs.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-indigo-100">Weekly Slots</span>
                  <span className="font-bold">{slots.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-indigo-100">Status</span>
                  <Badge className="bg-green-500 text-white border-0">Active</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Localized Intro Section */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {(() => {
          const copy = getLocationCopy(location);

          return (
            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                {copy.h1}
              </h1>

              <h2 className="text-xl md:text-2xl font-semibold text-slate-700 mb-6">
                {copy.h2}
              </h2>

              <div className="space-y-4 text-slate-600 text-lg">
                <p>{copy.p1}</p>
                <p>{copy.p2}</p>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <Button asChild size="lg">
                  <Link to={`${createPageUrl('BookTrial')}?slug=${location.slug}`}>
                    Book a Free Trial
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>

                <Button asChild size="lg" variant="outline">
                  <Link to={createPageUrl('ProgramsBrowser')}>
                    View Programs
                  </Link>
                </Button>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Why Parents Choose Section */}
      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl p-6 shadow-xl">
          <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">
            Why Parents in {location.city} Choose Skill Samurai
          </h3>
          <ul className="space-y-4 text-slate-700 text-base">
            <li className="flex gap-3">
              <span className="text-green-600">✔</span>
              <span>Real coding languages (not just games)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-600">✔</span>
              <span>Small class sizes & expert instructors</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-600">✔</span>
              <span>Confidence, creativity & problem-solving skills</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-600">✔</span>
              <span>Personalized learning paths</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Program Categories */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-slate-900 mb-8">Available Programs</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {programCategories.map((category, index) => {
            const Icon = category.icon;
            const hasPrograms = category.programs.length > 0;

            return (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                <div className={`h-32 bg-gradient-to-br ${category.color} relative`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Icon className="w-16 h-16 text-white opacity-40" />
                  </div>
                </div>

                <CardHeader>
                  <CardTitle className="text-xl">{category.title}</CardTitle>
                  <p className="text-sm text-slate-600">{category.description}</p>
                </CardHeader>

                <CardContent>
                  {hasPrograms ? (
                    <>
                      <div className="mb-4">
                        <div className="text-sm text-slate-600 mb-2">
                          {category.programs.length} program{category.programs.length !== 1 ? 's' : ''} available
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {category.programs.slice(0, 3).map(prog => (
                            <Badge key={prog.id} variant="secondary" className="text-xs">
                              Ages {prog.age_min}-{prog.age_max}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button 
                        asChild
                        className="w-full bg-slate-900 hover:bg-slate-800"
                      >
                        <Link to={category.title === 'Holiday Camps' 
                          ? `${createPageUrl('LocationCamps')}?slug=${location.slug}&locationId=${location.id}`
                          : `${createPageUrl('BookTrial')}?slug=${location.slug}`
                        }>
                          View Schedule
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-slate-500 mb-3">Coming soon to this location</p>
                      <Button variant="outline" className="w-full" disabled>
                        Notify Me
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white overflow-hidden">
          <CardContent className="p-12 text-center relative">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl" />
            </div>
            
            <div className="relative z-10">
              <Trophy className="w-16 h-16 mx-auto mb-6 opacity-90" />
              <h2 className="text-3xl font-bold mb-4">Ready to Start Your Coding Journey?</h2>
              <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
                Join thousands of students learning to code, build robots, and create amazing projects
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  asChild
                  size="lg"
                  className="bg-white text-indigo-600 hover:bg-slate-50"
                >
                  <Link to={`${createPageUrl('BookTrial')}?slug=${location.slug}`}>
                    Enroll Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button 
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                >
                  <Link to={createPageUrl('ProgramsBrowser')}>
                    Browse All Programs
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sticky Bottom Bar - Mobile Only */}
      <div className="fixed bottom-0 inset-x-0 z-50 md:hidden">
        <div className="bg-white/80 backdrop-blur-xl border-t border-white/40 p-4 shadow-lg">
          <Button
            asChild
            size="lg"
            className="w-full bg-indigo-600 text-white font-bold"
          >
            <Link to={`${createPageUrl('BookTrial')}?slug=${location.slug}`}>
              Book Free Trial
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
