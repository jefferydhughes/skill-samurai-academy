import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { 
  BookOpen, 
  Search,
  Users,
  MapPin,
  ChevronRight,
  Sparkles,
  Monitor,
  Laptop,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { motion } from 'framer-motion';
import RecommendationEngine from '@/components/programs/RecommendationEngine';

const typeColors = {
  camp: 'bg-amber-100 text-amber-700',
  course: 'bg-blue-100 text-blue-700',
  club: 'bg-green-100 text-green-700',
  workshop: 'bg-purple-100 text-purple-700'
};

const deliveryIcons = {
  in_person: MapPin,
  online: Monitor,
  hybrid: Laptop
};

export default function ProgramsBrowser() {
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [deliveryFilter, setDeliveryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [outcomeFilter, setOutcomeFilter] = useState('all');

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await api.auth.me();
      setCurrentUser(userData);
    } catch (e) {
      // User not logged in
    }
  };

  const { data: programs = [], isLoading } = useQuery({
    queryKey: ['programs'],
    queryFn: () => api.entities.Program.filter({ active: true }, '-created_date'),
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['classSessions'],
    queryFn: () => api.entities.ClassSession.filter({ status: 'scheduled' }),
  });

  const getSessionsForProgram = (programId) => {
    return sessions.filter(s => s.programId === programId);
  };

  // Get unique learning outcomes for filter
  const allOutcomes = [...new Set(programs.flatMap(p => p.learningOutcomes || []))];

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = !searchQuery || 
      program.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || program.type === typeFilter;
    const matchesDelivery = deliveryFilter === 'all' || program.deliveryMode === deliveryFilter;
    const matchesDifficulty = difficultyFilter === 'all' || program.difficulty === difficultyFilter;
    const matchesOutcome = outcomeFilter === 'all' || (program.learningOutcomes || []).includes(outcomeFilter);
    return matchesSearch && matchesType && matchesDelivery && matchesDifficulty && matchesOutcome;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Badge className="mb-4 px-4 py-2 bg-indigo-100 text-indigo-700 border-0 rounded-xl">
          <Sparkles className="w-4 h-4 mr-2" />
          Programs & Courses
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
          Explore Our Programs
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          From coding camps to year-round courses, find the perfect program for your child's learning journey
        </p>
      </motion.div>

      {/* Recommendations */}
      <RecommendationEngine programs={programs} currentUser={currentUser} />

      {/* Filters */}
      <motion.div 
        className="flex flex-col md:flex-row gap-4 p-6 bg-white/60 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Search programs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 bg-white/80 backdrop-blur-xl border-white/50 rounded-xl shadow-sm focus:shadow-lg transition-shadow"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full md:w-48 h-12 bg-white/80 backdrop-blur-xl border-white/50 rounded-xl shadow-sm">
            <SelectValue placeholder="Program Type" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl bg-white/95 backdrop-blur-xl border-white/50 shadow-xl">
            <SelectItem value="all" className="rounded-xl">All Types</SelectItem>
            <SelectItem value="camp" className="rounded-xl">Camps</SelectItem>
            <SelectItem value="course" className="rounded-xl">Courses</SelectItem>
            <SelectItem value="club" className="rounded-xl">Clubs</SelectItem>
            <SelectItem value="workshop" className="rounded-xl">Workshops</SelectItem>
          </SelectContent>
        </Select>
        <Select value={deliveryFilter} onValueChange={setDeliveryFilter}>
          <SelectTrigger className="w-full md:w-48 h-12 bg-white/80 backdrop-blur-xl border-white/50 rounded-xl shadow-sm">
            <SelectValue placeholder="Delivery Mode" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl bg-white/95 backdrop-blur-xl border-white/50 shadow-xl">
            <SelectItem value="all" className="rounded-xl">All Modes</SelectItem>
            <SelectItem value="in_person" className="rounded-xl">In Person</SelectItem>
            <SelectItem value="online" className="rounded-xl">Online</SelectItem>
            <SelectItem value="hybrid" className="rounded-xl">Hybrid</SelectItem>
          </SelectContent>
        </Select>
        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-full md:w-48 h-12 bg-white/80 backdrop-blur-xl border-white/50 rounded-xl shadow-sm">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl bg-white/95 backdrop-blur-xl border-white/50 shadow-xl">
            <SelectItem value="all" className="rounded-xl">All Levels</SelectItem>
            <SelectItem value="beginner" className="rounded-xl">Beginner</SelectItem>
            <SelectItem value="intermediate" className="rounded-xl">Intermediate</SelectItem>
            <SelectItem value="advanced" className="rounded-xl">Advanced</SelectItem>
          </SelectContent>
        </Select>
        {allOutcomes.length > 0 && (
          <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
            <SelectTrigger className="w-full md:w-48 h-12 bg-white/80 backdrop-blur-xl border-white/50 rounded-xl shadow-sm">
              <SelectValue placeholder="Learning Outcome" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl bg-white/95 backdrop-blur-xl border-white/50 shadow-xl max-h-72">
              <SelectItem value="all" className="rounded-xl">All Outcomes</SelectItem>
              {allOutcomes.map(outcome => (
                <SelectItem key={outcome} value={outcome} className="rounded-xl">
                  {outcome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        </motion.div>

      {/* Programs Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="overflow-hidden rounded-3xl bg-white/60 backdrop-blur-xl border border-white/50 shadow-xl animate-pulse">
              <div className="aspect-video bg-slate-200" />
              <div className="p-6 space-y-4">
                <div className="h-6 bg-slate-200 rounded-xl w-3/4" />
                <div className="h-4 bg-slate-100 rounded-xl w-full" />
                <div className="h-4 bg-slate-100 rounded-xl w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredPrograms.length === 0 ? (
        <motion.div 
          className="text-center py-20 rounded-3xl bg-white/60 backdrop-blur-xl border border-white/50 shadow-xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-2xl font-bold text-slate-700 mb-3">No programs found</h3>
          <p className="text-lg text-slate-500">Try adjusting your search or filters</p>
        </motion.div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPrograms.map((program, index) => {
            const programSessions = getSessionsForProgram(program.id);
            const DeliveryIcon = deliveryIcons[program.deliveryMode] || MapPin;
            
            return (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <div className="group h-full rounded-3xl bg-white/60 backdrop-blur-xl border border-white/50 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-500 overflow-hidden">
                  <div className="aspect-video relative overflow-hidden">
                    {program.name === "Free Trial Session" ? (
                      <img 
                        src="https://res2.weblium.site/res/625d58fa02e0480022e0f211/680a36d8ef8bd06783b6ebe5_optimized" 
                        alt={program.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : program.thumbnail ? (
                      <img 
                        src={program.thumbnail} 
                        alt={program.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600">
                        <Sparkles className="w-16 h-16 text-white/80" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <Badge className={`${typeColors[program.type] || 'bg-slate-100 text-slate-700'} border-0 rounded-xl px-3 py-1 shadow-lg backdrop-blur-xl`}>
                        {program.type}
                      </Badge>
                    </div>
                    {programSessions.length > 0 && (
                      <Badge className="absolute top-4 right-4 bg-green-500 text-white border-0 rounded-xl px-3 py-1 shadow-lg">
                        {programSessions.length} session{programSessions.length > 1 ? 's' : ''} available
                      </Badge>
                    )}
                  </div>
                  
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                      {program.name}
                    </h3>
                    <p className="text-slate-600 mb-4 line-clamp-2 leading-relaxed">
                      {program.description || 'An exciting coding adventure awaits!'}
                    </p>
                    
                    <div className="flex flex-wrap gap-3 mb-4 text-sm font-medium text-slate-500">
                      <span className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Ages {program.ageRange?.min || 8}-{program.ageRange?.max || 12}
                      </span>
                      <span className="flex items-center gap-2">
                        <DeliveryIcon className="w-4 h-4" />
                        {program.deliveryMode?.replace('_', ' ') || 'In person'}
                      </span>
                      {program.difficulty && (
                        <span className="flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          {program.difficulty}
                        </span>
                      )}
                    </div>

                    {(program.skills?.length > 0 || program.learningOutcomes?.length > 0) && (
                      <div className="space-y-2 mb-4">
                        {program.skills?.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {program.skills.slice(0, 3).map((skill) => (
                              <Badge key={skill} variant="secondary" className="text-xs bg-indigo-50 text-indigo-700 border-0 rounded-lg px-3 py-1">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {program.learningOutcomes?.length > 0 && (
                          <div className="text-xs text-slate-500">
                            <span className="font-semibold">Outcomes:</span> {program.learningOutcomes[0]}
                            {program.learningOutcomes.length > 1 && ` +${program.learningOutcomes.length - 1} more`}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div>
                        {program.price ? (
                          <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                            ${(program.price / 100).toFixed(0)}
                          </span>
                        ) : (
                          <span className="text-xl font-bold text-green-600">Free</span>
                        )}
                      </div>
                      <Button asChild className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all">
                        <Link to={`${createPageUrl('LocationSelector')}?programId=${program.id}`}>
                          Book Now
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}