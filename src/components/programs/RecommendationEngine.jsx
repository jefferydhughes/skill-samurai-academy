import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Sparkles, TrendingUp, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RecommendationEngine({ programs, currentUser }) {
  const { data: bookings = [] } = useQuery({
    queryKey: ['userBookings', currentUser?.id],
    queryFn: () => currentUser ? api.entities.Booking.filter({ userId: currentUser.id }) : [],
    enabled: !!currentUser,
  });

  const { data: students = [] } = useQuery({
    queryKey: ['userStudents', currentUser?.id],
    queryFn: () => currentUser ? api.entities.Student.filter({ parent_id: currentUser.id }) : [],
    enabled: !!currentUser,
  });

  const getRecommendations = () => {
    if (!programs.length) return [];

    // Get user's previously booked program types and skills
    const bookedProgramIds = bookings.map(b => b.programId);
    const bookedPrograms = programs.filter(p => bookedProgramIds.includes(p.id));
    const bookedTypes = [...new Set(bookedPrograms.map(p => p.type))];
    const bookedSkills = bookedPrograms.flatMap(p => p.skills || []);

    // Get student ages for age-appropriate recommendations
    const studentAges = students.map(s => {
      if (s.dob) {
        const birthDate = new Date(s.dob);
        const today = new Date();
        return Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
      }
      return null;
    }).filter(age => age !== null);

    // Score programs
    const scoredPrograms = programs
      .filter(p => p.active && !bookedProgramIds.includes(p.id))
      .map(program => {
        let score = 0;

        // Age matching (highest priority)
        if (studentAges.length > 0) {
          const matchesAge = studentAges.some(age => 
            age >= (program.ageRange?.min || program.age_min || 0) && 
            age <= (program.ageRange?.max || program.age_max || 18)
          );
          if (matchesAge) score += 50;
        }

        // Similar type to previously booked programs
        if (bookedTypes.includes(program.type)) {
          score += 30;
        }

        // Skill overlap
        const programSkills = program.skills || [];
        const skillOverlap = programSkills.filter(skill => bookedSkills.includes(skill)).length;
        score += skillOverlap * 10;

        // Progressive difficulty
        if (bookedPrograms.length > 0) {
          const lastBookedDifficulty = bookedPrograms[bookedPrograms.length - 1].difficulty;
          if (lastBookedDifficulty === 'beginner' && program.difficulty === 'intermediate') {
            score += 25;
          } else if (lastBookedDifficulty === 'intermediate' && program.difficulty === 'advanced') {
            score += 25;
          }
        }

        // Boost newer programs slightly
        const createdDate = new Date(program.created_date);
        const daysOld = (new Date() - createdDate) / (1000 * 60 * 60 * 24);
        if (daysOld < 30) score += 10;

        return { ...program, recommendationScore: score };
      })
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 3);

    return scoredPrograms.filter(p => p.recommendationScore > 0);
  };

  const recommendations = getRecommendations();

  if (!currentUser || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Recommended For You</h2>
          <p className="text-sm text-slate-600">Based on your interests and previous bookings</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {recommendations.map((program, index) => (
          <motion.div
            key={program.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="group h-full rounded-2xl bg-gradient-to-br from-white/80 to-indigo-50/50 backdrop-blur-xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-5">
                <Badge className="mb-3 bg-indigo-100 text-indigo-700 border-0 rounded-lg">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Top Pick
                </Badge>
                <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-2">
                  {program.name}
                </h3>
                <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                  {program.description || 'Enhance your coding skills with this program'}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {program.difficulty && (
                    <Badge variant="secondary" className="text-xs capitalize bg-slate-100 text-slate-700">
                      {program.difficulty}
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-700">
                    Ages {program.ageRange?.min || program.age_min || 8}-{program.ageRange?.max || program.age_max || 12}
                  </Badge>
                </div>
                <Button asChild size="sm" className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl">
                  <Link to={`${createPageUrl('LocationSelector')}?programId=${program.id}`}>
                    Learn More
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}