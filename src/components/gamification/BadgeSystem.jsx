import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Award, Lock, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BadgeDisplay({ badge, earned = false, className, onClick }) {
  return (
    <Card 
      className={cn(
        "group hover:shadow-lg transition-all cursor-pointer",
        earned ? "bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200" : "opacity-60",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4 text-center relative">
        {/* Badge visual */}
        <div 
          className={cn(
            "w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg transition-transform group-hover:scale-105",
            earned ? "" : "grayscale"
          )}
          style={{ backgroundColor: badge.color || '#6366f1' }}
        >
          {badge.icon ? (
            <img src={badge.icon} alt="" className="w-10 h-10 object-contain" />
          ) : (
            <Award className="w-8 h-8 text-white" />
          )}
        </div>
        
        <h3 className="font-medium text-slate-900 text-sm line-clamp-1 mb-1">
          {badge.name}
        </h3>
        
        <div className="flex items-center justify-center gap-1">
          <Badge variant={earned ? "default" : "secondary"} className="text-xs">
            Level {badge.level || 1}
          </Badge>
          {earned && (
            <CheckCircle className="w-3 h-3 text-green-500" />
          )}
        </div>
        
        {/* Technology indicator */}
        {badge.technology && (
          <Badge variant="outline" className="text-xs mt-2">
            {badge.technology}
          </Badge>
        )}
        
        {/* Lock overlay for unearned badges */}
        {!earned && (
          <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Lock className="w-6 h-6 text-white" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function BadgeCollection({ 
  badges, 
  earnedBadges = [], 
  title = "Badges",
  showLocked = true,
  maxDisplay = null,
  className 
}) {
  const earnedBadgeIds = new Set(earnedBadges.map(eb => eb.badgeId));
  
  // Separate earned and unearned badges
  const earned = badges.filter(badge => earnedBadgeIds.has(badge.id));
  const unearned = badges.filter(badge => !earnedBadgeIds.has(badge.id));
  
  const displayBadges = maxDisplay ? 
    [...earned, ...unearned].slice(0, maxDisplay) : 
    [...earned, ...(showLocked ? unearned : [])];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          {title}
          <Badge variant="secondary">
            {earned.length} / {badges.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {displayBadges.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {displayBadges.map(badge => (
              <BadgeDisplay
                key={badge.id}
                badge={badge}
                earned={earnedBadgeIds.has(badge.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Award className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-600">No badges available</p>
          </div>
        )}
        
        {maxDisplay && badges.length > maxDisplay && (
          <div className="mt-4 text-center">
            <Button variant="outline" size="sm">
              View All {badges.length} Badges
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function RecentAchievements({ achievements, className }) {
  if (!achievements || achievements.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-slate-600 py-4">
            Keep learning to unlock your first achievement!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          Recent Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {achievements.map((achievement, index) => (
            <div 
              key={index}
              className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200"
            >
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: achievement.badge?.color || '#6366f1' }}
              >
                {achievement.badge?.icon ? (
                  <img src={achievement.badge.icon} alt="" className="w-6 h-6 object-contain" />
                ) : (
                  <Award className="w-5 h-5 text-white" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-slate-900 text-sm">
                  {achievement.badge?.name || 'Achievement Unlocked'}
                </h4>
                <p className="text-xs text-slate-600">
                  {achievement.description || 'Great job!'}
                </p>
              </div>
              
              <div className="text-right">
                <p className="text-xs text-slate-500">
                  {new Date(achievement.earnedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}