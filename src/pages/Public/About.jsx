import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, BookOpen, Users, Globe, Award, Heart, Lightbulb } from 'lucide-react';

const values = [
  { icon: <Lightbulb className="w-6 h-6" />, title: 'Curiosity First', description: "We foster a love of learning by making complex ideas accessible, fun, and relevant to kids' lives." },
  { icon: <Heart className="w-6 h-6" />, title: 'Character Matters', description: 'Respect, perseverance, teamwork, and responsibility are woven into every session — not just the screen.' },
  { icon: <Users className="w-6 h-6" />, title: 'Community Rooted', description: 'Programs run in local schools, churches, and community centres — building belonging alongside skills.' },
  { icon: <Globe className="w-6 h-6" />, title: 'Accessible for All', description: 'Affordable memberships, no long-term leases, and flexible scheduling remove the barriers to quality education.' },
];

const stats = [
  { value: '10,000+', label: 'Students served' },
  { value: '50+', label: 'Locations worldwide' },
  { value: '5–18', label: 'Ages we serve' },
  { value: '12-week', label: 'Terms for consistency' },
];

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 text-white py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Badge className="bg-white/20 text-white border-white/30 mb-6">Our Story</Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Building Tomorrow's Thinkers, Today</h1>
          <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
            Skill Samurai Academy exists to give every child access to world-class coding, STEM, and critical-thinking skills — taught in their own community by people who care.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-6xl mx-auto px-6 -mt-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-0 shadow-xl text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-indigo-600 mb-1">{stat.value}</div>
                <div className="text-sm text-slate-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Mission */}
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Mission</h2>
        <p className="text-lg text-slate-600 leading-relaxed mb-6">
          We believe that every child deserves access to the skills that will define the future. Coding, computational thinking, robotics, and STEM — these aren't extras. They're the new literacy.
        </p>
        <p className="text-lg text-slate-600 leading-relaxed">
          Skill Samurai Academy delivers these programs in a way that's affordable, predictable, and genuinely fun — all while building the character qualities that outlast any curriculum: respect, resilience, and a growth mindset.
        </p>
      </div>

      {/* Values */}
      <div className="bg-slate-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">What We Believe</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <Card key={value.title} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                    {value.icon}
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{value.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Programs overview */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6">What We Offer</h2>
            <ul className="space-y-4">
              {[
                { icon: '💻', label: 'Coding & Game Development', desc: 'Scratch, Python, Roblox, Unity and more' },
                { icon: '🤖', label: 'Robotics & Engineering', desc: 'Hands-on builds with real hardware' },
                { icon: '🌍', label: 'STEM Exploration', desc: 'Science, technology, engineering, and maths challenges' },
                { icon: '🏕️', label: 'Holiday Camps', desc: 'Full and half-day intensive camps during school breaks' },
                { icon: '🏢', label: 'Franchise Opportunities', desc: 'Bring Skill Samurai to your community' },
              ].map((item) => (
                <li key={item.label} className="flex items-start gap-4">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <div className="font-semibold text-slate-900">{item.label}</div>
                    <div className="text-sm text-slate-600">{item.desc}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-3xl p-10 text-white text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-6 opacity-80" />
            <h3 className="text-2xl font-bold mb-4">Ready to get started?</h3>
            <p className="text-indigo-100 mb-8">Find a Skill Samurai location near you and book a free trial class.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="bg-white text-indigo-700 hover:bg-indigo-50">
                <Link to={createPageUrl('BookTrial')}>Book a Free Trial</Link>
              </Button>
              <Button asChild variant="outline" className="border-white text-white hover:bg-white/10">
                <Link to={createPageUrl('Locations')}>Find a Location <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Franchise CTA */}
      <div className="bg-slate-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Award className="w-12 h-12 mx-auto mb-4 text-indigo-400" />
          <h2 className="text-3xl font-bold mb-4">Interested in Franchising?</h2>
          <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
            Bring Skill Samurai Academy to your city. Low overhead, high impact, full support.
          </p>
          <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
            <Link to={createPageUrl('Franchising')}>Learn About Franchising <ArrowRight className="w-4 h-4 ml-2" /></Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
