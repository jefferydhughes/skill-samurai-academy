import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

const difficultyColors = {
  beginner: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  intro: 'bg-blue-100 text-blue-700 border-blue-200',
  intermediate: 'bg-amber-100 text-amber-700 border-amber-200',
  advanced: 'bg-purple-100 text-purple-700 border-purple-200'
};

export default function LevelCard({ level, courseCount, studentCount, onClick, isSelected }) {
  return (
    <Card 
      onClick={onClick}
      className={`
        cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]
        ${isSelected ? 'ring-2 ring-indigo-500 shadow-lg' : 'hover:border-indigo-200'}
      `}
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg">
            {level.icon ? (
              <img src={level.icon} alt="" className="w-8 h-8 object-contain" />
            ) : (
              <GraduationCap className="w-7 h-7 text-white" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-slate-900 text-lg">{level.name}</h3>
                {level.description && (
                  <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{level.description}</p>
                )}
              </div>
              {level.isDefault && (
                <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-600 border-indigo-200">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Default
                </Badge>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-sm text-slate-600">
                <BookOpen className="w-4 h-4 text-slate-400" />
                <span>{courseCount || 0} courses</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-slate-600">
                <Users className="w-4 h-4 text-slate-400" />
                <span>{studentCount || 0} students</span>
              </div>
            </div>

            {/* Age & Difficulty */}
            <div className="flex items-center gap-2 mt-3">
              {level.ageRange && (
                <Badge variant="outline" className="text-xs">
                  Ages {level.ageRange.min}-{level.ageRange.max}
                </Badge>
              )}
              {level.difficultyRange && (
                <Badge className={`text-xs border ${difficultyColors[level.difficultyRange.min]}`}>
                  {level.difficultyRange.min} - {level.difficultyRange.max}
                </Badge>
              )}
            </div>
          </div>

          {/* Arrow */}
          <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0 mt-1" />
        </div>
      </CardContent>
    </Card>
  );
}