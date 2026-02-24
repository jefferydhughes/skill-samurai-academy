import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Zap, 
  Star, 
  TrendingUp, 
  Award, 
  Trophy, 
  Target,
  Calendar,
  Gift,
  Rocket,
  Crown
} from 'lucide-react';
import { XPProgressBar, StreakIndicator, PointsDisplay } from './ProgressIndicators';
import { BadgeCollection, RecentAchievements } from './BadgeSystem';
import { Leaderboard } from './Leaderboard';
import { useGamification } from '@/lib/gamification/GamificationContext';
import { cn } from '@/lib/utils';

export function GamificationDashboard({ studentProfile, className }) {
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const {
    gamificationStats,
    earnedBadges,
    availableBadges,
    currentLevel,
    levelInfo,
    totalXP,
    points,
    streakDays,
    levelProgress,
    xpNeeded,
    isLoading
  } = useGamification();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-slate-200 rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const handleAchievementClick = (achievement) => {
    setSelectedAchievement(achievement);
    setShowAchievementModal(true);
  };

  // Mock data for demonstration
  const recentAchievements = earnedBadges.slice(0, 3).map(badge => ({
    badge: availableBadges.find(b => b.id === badge.badgeId),
    earnedAt: badge.earnedAt,
    description: `Completed ${badge.badgeId} challenge`
  }));

  const mockLeaderboard = [
    { id: '1', fullName: 'Alex Chen', totalXP: 2850, level: 12, levelProgress: 75, streakDays: 15, locationName: 'San Francisco' },
    { id: '2', fullName: 'Sarah Johnson', totalXP: 2720, level: 11, levelProgress: 90, streakDays: 8, locationName: 'San Francisco' },
    { id: '3', fullName: 'Mike Williams', totalXP: 2540, level: 11, levelProgress: 60, streakDays: 22, locationName: 'San Francisco' },
    { id: '4', fullName: 'Emma Davis', totalXP: 2380, level: 10, levelProgress: 85, streakDays: 12, locationName: 'San Francisco' },
    { id: '5', fullName: 'Current User', totalXP: totalXP, level: currentLevel.level, levelProgress: levelProgress, streakDays: streakDays, locationName: 'San Francisco' }
  ];

  const currentUserRank = mockLeaderboard.find(entry => entry.id === '5');

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total XP</p>
                <p className="text-2xl font-bold text-indigo-600">{totalXP.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Points</p>
                <p className="text-2xl font-bold text-amber-600">{points.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Level</p>
                <p className="text-2xl font-bold text-green-600">{currentLevel.level}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Streak</p>
                <p className="text-2xl font-bold text-red-600">{streakDays} days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* XP Progress */}
          <XPProgressBar
            currentXP={totalXP}
            level={currentLevel.level}
            progress={levelProgress}
            xpNeeded={xpNeeded}
          />

          {/* Streak Indicator */}
          <StreakIndicator streakDays={streakDays} />

          {/* Recent Achievements */}
          <RecentAchievements achievements={recentAchievements} />

          {/* Badge Collection */}
          <BadgeCollection
            badges={availableBadges}
            earnedBadges={earnedBadges}
            title="My Badges"
            showLocked={true}
            maxDisplay={12}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Leaderboard */}
          <Leaderboard
            data={mockLeaderboard}
            title="Top Performers"
            currentUserRank={currentUserRank}
            maxDisplay={5}
          />

          {/* Next Goals */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-900">
                <Target className="w-5 h-5" />
                Next Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Rocket className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">Complete 5 Lessons</p>
                  <Progress value={60} className="h-2 mt-1" />
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Crown className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">Reach Level {currentLevel.level + 1}</p>
                  <Progress value={levelProgress} className="h-2 mt-1" />
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Gift className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">Earn 3 More Badges</p>
                  <Progress 
                    value={(earnedBadges.length / (earnedBadges.length + 3)) * 100} 
                    className="h-2 mt-1" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rewards Preview */}
          <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-900">
                <Trophy className="w-5 h-5" />
                Rewards
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-white rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">100 Point Bonus</span>
                  <Badge className="bg-yellow-100 text-yellow-700">7 Day Streak</Badge>
                </div>
              </div>
              
              <div className="p-3 bg-white rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">500 Point Bonus</span>
                  <Badge className="bg-yellow-100 text-yellow-700">30 Day Streak</Badge>
                </div>
              </div>
              
              <div className="p-3 bg-white rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">Special Badge</span>
                  <Badge className="bg-yellow-100 text-yellow-700">Level 10</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Achievement Detail Modal */}
      <Dialog open={showAchievementModal} onOpenChange={setShowAchievementModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              {selectedAchievement?.badge?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedAchievement && (
            <div className="space-y-4">
              <div className="text-center">
                <div 
                  className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: selectedAchievement.badge.color || '#6366f1' }}
                >
                  {selectedAchievement.badge.icon ? (
                    <img src={selectedAchievement.badge.icon} alt="" className="w-12 h-12 object-contain" />
                  ) : (
                    <Award className="w-10 h-10 text-white" />
                  )}
                </div>
                <p className="text-slate-600">{selectedAchievement.description}</p>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600">Earned on</span>
                <span className="text-sm font-medium text-slate-900">
                  {new Date(selectedAchievement.earnedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function StudentProgressOverview({ compact = false, className }) {
  const {
    totalXP,
    points,
    streakDays,
    currentLevel,
    levelProgress,
    xpNeeded
  } = useGamification();

  if (compact) {
    return (
      <div className={cn("flex items-center gap-4", className)}>
        <XPProgressBar
          currentXP={totalXP}
          level={currentLevel.level}
          progress={levelProgress}
          xpNeeded={xpNeeded}
          compact={true}
        />
        <StreakIndicator streakDays={streakDays} showBonus={false} />
        <PointsDisplay points={points} size="sm" showLabel={false} />
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-slate-600 mb-1">Level</p>
            <p className="text-2xl font-bold text-indigo-600">{currentLevel.level}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-600 mb-1">Total XP</p>
            <p className="text-2xl font-bold text-green-600">{totalXP}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-600 mb-1">Points</p>
            <p className="text-2xl font-bold text-amber-600">{points}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-600 mb-1">Streak</p>
            <p className="text-2xl font-bold text-red-600">{streakDays}d</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}