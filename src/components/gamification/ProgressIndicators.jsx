import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Zap, TrendingUp, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function XPProgressBar({ 
  currentXP, 
  level, 
  progress, 
  xpNeeded, 
  showLabel = true,
  compact = false,
  className 
}) {
  if (compact) {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          <span className="font-semibold text-slate-900">Level {level}</span>
        </div>
        <div className="flex-1">
          <Progress value={progress} className="h-2" />
        </div>
        <span className="text-xs text-slate-600">{xpNeeded} XP</span>
      </div>
    );
  }

  return (
    <Card className={cn("bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200", className)}>
      <CardContent className="p-4">
        {showLabel && (
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-slate-900">Level Progress</h3>
            </div>
            <Badge className="bg-amber-100 text-amber-700">
              Level {level}
            </Badge>
          </div>
        )}
        
        <div className="space-y-3">
          <Progress 
            value={progress} 
            className="h-3 bg-amber-100"
          />
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Current XP: {currentXP}</span>
            <span className="font-medium text-amber-600">{xpNeeded} XP to next level</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function StreakIndicator({ 
  streakDays, 
  className,
  showBonus = true 
}) {
  const getStreakLevel = (days) => {
    if (days >= 90) return { level: 'Legend', color: 'text-purple-600', bg: 'bg-purple-100' };
    if (days >= 30) return { level: 'Master', color: 'text-red-600', bg: 'bg-red-100' };
    if (days >= 14) return { level: 'Expert', color: 'text-orange-600', bg: 'bg-orange-100' };
    if (days >= 7) return { level: 'Pro', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (days >= 3) return { level: 'Rising', color: 'text-blue-600', bg: 'bg-blue-100' };
    return { level: 'New', color: 'text-gray-600', bg: 'bg-gray-100' };
  };

  const streakInfo = getStreakLevel(streakDays);
  const bonusDays = [7, 30, 90].find(days => streakDays === days);

  return (
    <Card className={cn("bg-gradient-to-r from-orange-50 to-red-50 border-orange-200", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${streakInfo.bg} flex items-center justify-center`}>
              <TrendingUp className={`w-5 h-5 ${streakInfo.color}`} />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Daily Streak</h4>
              <p className="text-sm text-slate-600">{streakDays} days</p>
            </div>
          </div>
          
          <div className="text-right">
            <Badge className={streakInfo.bg}>
              {streakInfo.level}
            </Badge>
            {showBonus && bonusDays && (
              <p className="text-xs text-green-600 mt-1">
                Bonus unlocked! 🎉
              </p>
            )}
          </div>
        </div>
        
        {/* Streak visual indicator */}
        <div className="mt-3 flex gap-1">
          {Array.from({ length: Math.min(streakDays, 30) }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-2 w-1 rounded-full",
                i < Math.min(streakDays, 7) ? "bg-orange-400" :
                i < Math.min(streakDays, 14) ? "bg-orange-500" :
                i < Math.min(streakDays, 30) ? "bg-orange-600" :
                "bg-orange-300"
              )}
            />
          ))}
          {streakDays > 30 && (
            <span className="text-xs text-slate-500 ml-2">+{streakDays - 30}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function PointsDisplay({ points, showLabel = true, size = 'md', className }) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Star className="w-5 h-5 text-yellow-500 fill-current" />
      {showLabel && <span className="text-slate-600">Points:</span>}
      <span className={cn("font-bold text-slate-900", sizeClasses[size])}>
        {points?.toLocaleString() || 0}
      </span>
    </div>
  );
}