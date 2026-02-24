import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  Award, 
  Lock, 
  CheckCircle, 
  Star, 
  Zap, 
  Trophy,
  Rocket,
  Flame,
  Code,
  BookOpen,
  Users,
  ChevronRight,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function AchievementCard({ 
  achievement, 
  isUnlocked = false, 
  progress = 0, 
  onClick, 
  showProgress = true,
  compact = false,
  className 
}) {
  const getIcon = () => {
    switch (achievement.category) {
      case 'learning': return BookOpen;
      case 'coding': return Code;
      case 'streak': return Flame;
      case 'social': return Users;
      case 'milestone': return Trophy;
      default: return Award;
    }
  };

  const Icon = getIcon();
  const isCompleted = isUnlocked || progress >= 100;

  if (compact) {
    return (
      <div 
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md",
          isCompleted ? "bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200" : "bg-white border-slate-200 opacity-75",
          className
        )}
        onClick={onClick}
      >
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
          isCompleted ? "bg-gradient-to-r from-amber-400 to-yellow-500" : "bg-slate-200"
        )}>
          <Icon className={cn("w-5 h-5", isCompleted ? "text-white" : "text-slate-500")} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-slate-900 truncate">{achievement.name}</h4>
          <p className="text-xs text-slate-600 truncate">{achievement.description}</p>
        </div>
        
        <div className="text-right">
          {isCompleted ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <span className="text-sm font-medium text-slate-600">{progress}%</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card 
      className={cn(
        "group hover:shadow-lg transition-all cursor-pointer",
        isCompleted ? "bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200" : "opacity-75",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Achievement Icon */}
          <div className={cn(
            "w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105",
            isCompleted ? "bg-gradient-to-br from-amber-400 to-yellow-500 shadow-lg" : "bg-slate-200"
          )}>
            <Icon className={cn("w-8 h-8", isCompleted ? "text-white" : "text-slate-500")} />
          </div>
          
          {/* Achievement Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-slate-900">{achievement.name}</h3>
              {isCompleted && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
            </div>
            
            <p className="text-sm text-slate-600 mb-3">{achievement.description}</p>
            
            {/* Rewards */}
            <div className="flex flex-wrap gap-2 mb-3">
              {achievement.xpReward && (
                <Badge className="bg-indigo-100 text-indigo-700">
                  <Zap className="w-3 h-3 mr-1" />
                  +{achievement.xpReward} XP
                </Badge>
              )}
              {achievement.pointsReward && (
                <Badge className="bg-amber-100 text-amber-700">
                  <Star className="w-3 h-3 mr-1" />
                  +{achievement.pointsReward} Points
                </Badge>
              )}
              {achievement.badgeReward && (
                <Badge className="bg-purple-100 text-purple-700">
                  <Trophy className="w-3 h-3 mr-1" />
                  Badge
                </Badge>
              )}
            </div>
            
            {/* Progress */}
            {showProgress && !isCompleted && achievement.requirement && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Progress</span>
                  <span className="font-medium text-slate-900">
                    {achievement.current || 0} / {achievement.requirement}
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </div>
        </div>
        
        {/* Lock overlay for locked achievements */}
        {!isCompleted && (
          <div className="absolute inset-0 bg-black/10 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Lock className="w-8 h-8 text-white/50" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AchievementSystem({ 
  achievements = [], 
  unlockedAchievements = [], 
  onAchievementClick,
  className 
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const categories = [
    { id: 'all', label: 'All', icon: Award },
    { id: 'learning', label: 'Learning', icon: BookOpen },
    { id: 'coding', label: 'Coding', icon: Code },
    { id: 'streak', label: 'Streaks', icon: Flame },
    { id: 'social', label: 'Social', icon: Users },
    { id: 'milestone', label: 'Milestones', icon: Trophy }
  ];

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  const unlockedIds = new Set(unlockedAchievements.map(ua => ua.achievementId));

  const handleAchievementClick = (achievement) => {
    setSelectedAchievement(achievement);
    setShowDetailModal(true);
    onAchievementClick?.(achievement);
  };

  const stats = {
    total: achievements.length,
    unlocked: unlockedIds.size,
    inProgress: filteredAchievements.filter(a => !unlockedIds.has(a.id) && a.progress > 0).length,
    locked: filteredAchievements.filter(a => !unlockedIds.has(a.id) && a.progress === 0).length
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <Trophy className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-sm text-slate-600">Total</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">{stats.unlocked}</p>
            <p className="text-sm text-slate-600">Unlocked</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-4 text-center">
            <Rocket className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-amber-600">{stats.inProgress}</p>
            <p className="text-sm text-slate-600">In Progress</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200">
          <CardContent className="p-4 text-center">
            <Lock className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-600">{stats.locked}</p>
            <p className="text-sm text-slate-600">Locked</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => {
          const Icon = category.icon;
          const count = category.id === 'all' 
            ? achievements.length 
            : achievements.filter(a => a.category === category.id).length;
          
          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center gap-2"
            >
              <Icon className="w-4 h-4" />
              {category.label}
              <Badge variant="secondary">{count}</Badge>
            </Button>
          );
        })}
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map(achievement => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            isUnlocked={unlockedIds.has(achievement.id)}
            progress={achievement.progress || 0}
            onClick={() => handleAchievementClick(achievement)}
          />
        ))}
      </div>

      {/* Achievement Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              {selectedAchievement?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedAchievement && (
            <div className="space-y-6">
              {/* Achievement Header */}
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  {(() => {
                    const Icon = (() => {
                      switch (selectedAchievement.category) {
                        case 'learning': return BookOpen;
                        case 'coding': return Code;
                        case 'streak': return Flame;
                        case 'social': return Users;
                        case 'milestone': return Trophy;
                        default: return Award;
                      }
                    })();
                    return <Icon className="w-10 h-10 text-white" />;
                  })()}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{selectedAchievement.name}</h3>
                <p className="text-slate-600">{selectedAchievement.description}</p>
              </div>
              
              {/* Requirements */}
              {selectedAchievement.requirement && (
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold text-slate-900 mb-2">Requirements</h4>
                  <p className="text-sm text-slate-600 mb-2">{selectedAchievement.requirementText}</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Progress</span>
                      <span className="font-medium text-slate-900">
                        {selectedAchievement.current || 0} / {selectedAchievement.requirement}
                      </span>
                    </div>
                    <Progress value={selectedAchievement.progress || 0} className="h-3" />
                  </div>
                </div>
              )}
              
              {/* Rewards */}
              <div className="p-4 bg-amber-50 rounded-lg">
                <h4 className="font-semibold text-slate-900 mb-3">Rewards</h4>
                <div className="grid grid-cols-3 gap-3">
                  {selectedAchievement.xpReward && (
                    <div className="text-center p-3 bg-white rounded-lg border border-amber-200">
                      <Zap className="w-6 h-6 text-indigo-500 mx-auto mb-1" />
                      <p className="font-bold text-indigo-600">+{selectedAchievement.xpReward}</p>
                      <p className="text-xs text-slate-600">XP</p>
                    </div>
                  )}
                  {selectedAchievement.pointsReward && (
                    <div className="text-center p-3 bg-white rounded-lg border border-amber-200">
                      <Star className="w-6 h-6 text-amber-500 mx-auto mb-1" />
                      <p className="font-bold text-amber-600">+{selectedAchievement.pointsReward}</p>
                      <p className="text-xs text-slate-600">Points</p>
                    </div>
                  )}
                  {selectedAchievement.badgeReward && (
                    <div className="text-center p-3 bg-white rounded-lg border border-amber-200">
                      <Trophy className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                      <p className="font-bold text-purple-600">Badge</p>
                      <p className="text-xs text-slate-600">Exclusive</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Tips */}
              {selectedAchievement.tips && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-blue-500" />
                    <h4 className="font-semibold text-slate-900">Tips</h4>
                  </div>
                  <p className="text-sm text-slate-600">{selectedAchievement.tips}</p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailModal(false)}>
              Close
            </Button>
            {selectedAchievement && !unlockedIds.has(selectedAchievement.id) && (
              <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700">
                Start Working on It
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function AchievementNotification({ 
  achievement, 
  isVisible, 
  onComplete,
  className 
}) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!isVisible || !achievement) return null;

  return (
    <div className={cn(
      "fixed top-4 right-4 z-50 max-w-sm animate-in slide-in-from-right",
      className
    )}>
      <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0 ${isAnimating ? 'animate-bounce' : ''}`}>
              <Award className="w-6 h-6 text-white" />
            </div>
            
            <div className="flex-1">
              <h4 className="font-semibold text-slate-900">Achievement Unlocked!</h4>
              <p className="text-sm text-slate-600">{achievement.name}</p>
              
              <div className="flex gap-2 mt-2">
                {achievement.xpReward && (
                  <Badge className="bg-indigo-100 text-indigo-700 text-xs">
                    +{achievement.xpReward} XP
                  </Badge>
                )}
                {achievement.pointsReward && (
                  <Badge className="bg-amber-100 text-amber-700 text-xs">
                    +{achievement.pointsReward} Points
                  </Badge>
                )}
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onComplete}
            >
              ×
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}