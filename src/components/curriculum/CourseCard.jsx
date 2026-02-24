import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Award,
  Clock,
  Users,
  BookOpen,
  CheckCircle2
} from 'lucide-react';

const difficultyColors = {
  beginner: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  intro: 'bg-blue-100 text-blue-700 border-blue-200',
  intermediate: 'bg-amber-100 text-amber-700 border-amber-200',
  advanced: 'bg-purple-100 text-purple-700 border-purple-200'
};

const technologyColors = {
  scratch: 'bg-orange-100 text-orange-700',
  voxel: 'bg-cyan-100 text-cyan-700',
  minecraft: 'bg-green-100 text-green-700',
  roblox: 'bg-red-100 text-red-700',
  python: 'bg-yellow-100 text-yellow-700',
  web: 'bg-indigo-100 text-indigo-700',
  unity: 'bg-slate-100 text-slate-700',
  other: 'bg-gray-100 text-gray-700'
};

const technologyIcons = {
  scratch: '🐱',
  voxel: '🎮',
  minecraft: '⛏️',
  roblox: '🎯',
  python: '🐍',
  web: '🌐',
  unity: '🎲',
  other: '💻'
};

export default function CourseCard({ 
  course, 
  onClick, 
  isSelected,
  selectable = false,
  onSelect,
  showCheckbox = false,
  compact = false 
}) {
  const handleCheckboxClick = (e) => {
    e.stopPropagation();
    onSelect?.(course.id);
  };

  if (compact) {
    return (
      <div 
        onClick={onClick}
        className={`
          flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer
          ${isSelected ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50'}
        `}
      >
        {showCheckbox && (
          <Checkbox 
            checked={isSelected} 
            onClick={handleCheckboxClick}
            className="data-[state=checked]:bg-indigo-600"
          />
        )}
        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
          {course.heroImage ? (
            <img src={course.heroImage} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xl">
              {technologyIcons[course.technology] || '💻'}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-slate-900 truncate">{course.name}</div>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge className={`text-xs ${technologyColors[course.technology]}`}>
              {course.technology}
            </Badge>
            <Badge className={`text-xs border ${difficultyColors[course.difficulty]}`}>
              {course.difficulty}
            </Badge>
          </div>
        </div>
        {course.badgeId && (
          <Award className="w-5 h-5 text-amber-500 flex-shrink-0" />
        )}
      </div>
    );
  }

  return (
    <Card 
      onClick={onClick}
      className={`
        overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg
        ${isSelected ? 'ring-2 ring-indigo-500 shadow-lg' : 'hover:border-indigo-200'}
      `}
    >
      {/* Hero Image */}
      <div className="aspect-video relative bg-gradient-to-br from-slate-100 to-slate-200">
        {course.heroImage ? (
          <img src={course.heroImage} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl">{technologyIcons[course.technology] || '💻'}</span>
          </div>
        )}
        
        {/* Overlay badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <Badge className={`${technologyColors[course.technology]} shadow-sm`}>
            {technologyIcons[course.technology]} {course.technology}
          </Badge>
        </div>
        
        {showCheckbox && (
          <div className="absolute top-3 right-3">
            <Checkbox 
              checked={isSelected} 
              onClick={handleCheckboxClick}
              className="bg-white data-[state=checked]:bg-indigo-600 shadow-sm"
            />
          </div>
        )}

        {/* Standards indicator */}
        {course.standards?.length > 0 && (
          <div className="absolute bottom-3 left-3">
            <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-xs">
              <CheckCircle2 className="w-3 h-3 mr-1 text-green-600" />
              CSTA Aligned
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-slate-900 line-clamp-1">{course.name}</h3>
          <Badge className={`text-xs border flex-shrink-0 ${difficultyColors[course.difficulty]}`}>
            {course.difficulty}
          </Badge>
        </div>

        {course.description && (
          <p className="text-sm text-slate-500 mt-2 line-clamp-2">{course.description}</p>
        )}

        {/* Meta info */}
        <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
          {course.ageRange && (
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4 text-slate-400" />
              Ages {course.ageRange.min}-{course.ageRange.max}
            </span>
          )}
          {course.lessonCount && (
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4 text-slate-400" />
              {course.lessonCount} lessons
            </span>
          )}
          {course.durationWeeks && (
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-slate-400" />
              {course.durationWeeks} weeks
            </span>
          )}
        </div>

        {/* Badge earned */}
        {course.badgeId && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
            <Award className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-slate-600">Badge awarded on completion</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}