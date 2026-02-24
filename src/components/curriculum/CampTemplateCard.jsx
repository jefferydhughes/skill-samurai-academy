import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar,
  Clock,
  Users,
  DollarSign,
  Plus
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
  robotics: 'bg-pink-100 text-pink-700',
  mixed: 'bg-violet-100 text-violet-700'
};

const technologyIcons = {
  scratch: '🐱',
  voxel: '🎮',
  minecraft: '⛏️',
  roblox: '🎯',
  python: '🐍',
  web: '🌐',
  unity: '🎲',
  robotics: '🤖',
  mixed: '🎨'
};

const durationTypeLabels = {
  full_day: 'Full Day',
  half_day: 'Half Day',
  multi_week: 'Multi-Week'
};

export default function CampTemplateCard({ 
  template, 
  onClick, 
  onCreateInstance,
  isSelected 
}) {
  return (
    <Card 
      onClick={onClick}
      className={`
        overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg
        ${isSelected ? 'ring-2 ring-indigo-500 shadow-lg' : 'hover:border-indigo-200'}
      `}
    >
      {/* Hero Image */}
      <div className="aspect-video relative bg-gradient-to-br from-violet-100 to-indigo-200">
        {template.heroImage ? (
          <img src={template.heroImage} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl">{technologyIcons[template.technology] || '🏕️'}</span>
          </div>
        )}
        
        {/* Overlay badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <Badge className={`${technologyColors[template.technology]} shadow-sm`}>
            {technologyIcons[template.technology]} {template.technology}
          </Badge>
          {template.duration?.type && (
            <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
              {durationTypeLabels[template.duration.type]}
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-slate-900 line-clamp-1">{template.name}</h3>
          <Badge className={`text-xs border flex-shrink-0 ${difficultyColors[template.difficulty]}`}>
            {template.difficulty}
          </Badge>
        </div>

        {template.description && (
          <p className="text-sm text-slate-500 mt-2 line-clamp-2">{template.description}</p>
        )}

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-slate-600">
          {template.ageRange && (
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4 text-slate-400" />
              Ages {template.ageRange.min}-{template.ageRange.max}
            </span>
          )}
          {template.duration?.days && (
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-slate-400" />
              {template.duration.days} days
            </span>
          )}
          {template.duration?.hoursPerDay && (
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-slate-400" />
              {template.duration.hoursPerDay}h/day
            </span>
          )}
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1 text-slate-900 font-semibold">
            <DollarSign className="w-4 h-4" />
            {template.basePrice ? (template.basePrice / 100).toFixed(0) : '0'}
            <span className="text-sm font-normal text-slate-500">base</span>
          </div>
          <Button 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              onCreateInstance?.(template);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            Create Camp
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}