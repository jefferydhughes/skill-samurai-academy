import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  Zap, 
  Star, 
  Award, 
  Gift,
  Rocket,
  Target,
  CheckCircle,
  Flame,
  Crown,
  BookOpen,
  Code,
  Calendar
} from 'lucide-react';
import { calculateXPForActivity } from '@/lib/gamification/xp-system';
import { useGamification } from '@/lib/gamification/GamificationContext';
import { cn } from '@/lib/utils';

export function PointsBreakdown({ className }) {
  const { gamificationStats, totalXP, points } = useGamification();
  const [showDetails, setShowDetails] = useState(false);

  const breakdown = [
    {
      category: 'Lessons',
      xp: gamificationStats.lessonXP || 0,
      points: Math.floor((gamificationStats.lessonXP || 0) / 10),
      icon: BookOpen,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'from-blue-50 to-indigo-50'
    },
    {
      category: 'Projects',
      xp: gamificationStats.projectXP || 0,
      points: Math.floor((gamificationStats.projectXP || 0) / 10),
      icon: Code,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'from-green-50 to-emerald-50'
    },
    {
      category: 'Daily Login',
      xp: gamificationStats.loginXP || 0,
      points: Math.floor((gamificationStats.loginXP || 0) / 10),
      icon: Calendar,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'from-purple-50 to-pink-50'
    },
    {
      category: 'Streak Bonuses',
      xp: gamificationStats.streakXP || 0,
      points: Math.floor((gamificationStats.streakXP || 0) / 10),
      icon: Flame,
      color: 'from-orange-500 to-red-600',
      bgColor: 'from-orange-50 to-red-50'
    },
    {
      category: 'Achievements',
      xp: gamificationStats.achievementXP || 0,
      points: Math.floor((gamificationStats.achievementXP || 0) / 10),
      icon: Award,
      color: 'from-amber-500 to-yellow-600',
      bgColor: 'from-amber-50 to-yellow-50'
    }
  ];

  return (
    <Card className={cn("bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-indigo-900">
          <Star className="w-5 h-5" />
          Points & XP Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Total Display */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 bg-white rounded-lg border border-indigo-200">
              <Zap className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-indigo-600">{totalXP.toLocaleString()}</p>
              <p className="text-sm text-slate-600">Total XP</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-amber-200">
              <Star className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-amber-600">{points.toLocaleString()}</p>
              <p className="text-sm text-slate-600">Total Points</p>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="space-y-3">
            {breakdown.map((item, index) => {
              const Icon = item.icon;
              const percentage = totalXP > 0 ? (item.xp / totalXP) * 100 : 0;
              
              return (
                <div key={index} className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 bg-gradient-to-r ${item.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium text-slate-900">{item.category}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">{item.xp.toLocaleString()} XP</p>
                      <p className="text-xs text-slate-600">{item.points} points</p>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>

          {/* View Details Button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowDetails(true)}
          >
            View Reward Catalog
          </Button>
        </div>
      </CardContent>

      {/* Reward Catalog Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-amber-500" />
              Points Reward Catalog
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Code className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900">Code Themes</h3>
              </div>
              <p className="text-sm text-slate-600 mb-2">Unlock custom editor themes</p>
              <Badge className="bg-blue-100 text-blue-700">500 points</Badge>
            </div>

            <div className="p-4 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Crown className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-slate-900">Profile Badge</h3>
              </div>
              <p className="text-sm text-slate-600 mb-2">Exclusive profile customization</p>
              <Badge className="bg-purple-100 text-purple-700">750 points</Badge>
            </div>

            <div className="p-4 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-slate-900">Fast Track</h3>
              </div>
              <p className="text-sm text-slate-600 mb-2">Skip ahead in learning path</p>
              <Badge className="bg-green-100 text-green-700">1000 points</Badge>
            </div>

            <div className="p-4 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="font-semibold text-slate-900">Mentor Session</h3>
              </div>
              <p className="text-sm text-slate-600 mb-2">1-on-1 coding session</p>
              <Badge className="bg-amber-100 text-amber-700">2000 points</Badge>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetails(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export function XPActivityCard({ activity, completed, xpEarned, className }) {
  const getXPForActivity = () => {
    return calculateXPForActivity(activity.type, activity.bonusData);
  };

  const getActivityIcon = () => {
    switch (activity.type) {
      case 'LESSON_COMPLETION': return BookOpen;
      case 'PROJECT_COMPLETION': return Code;
      case 'DAILY_LOGIN': return Calendar;
      default: return Target;
    }
  };

  const Icon = getActivityIcon();
  const baseXP = getXPForActivity();
  const bonusXP = xpEarned - baseXP;

  return (
    <Card className={cn(
      "transition-all",
      completed ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200" : "opacity-60",
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            completed ? 'bg-green-500' : 'bg-slate-400'
          }`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          
          <div className="flex-1">
            <h4 className="font-medium text-slate-900">{activity.title}</h4>
            {activity.description && (
              <p className="text-sm text-slate-600">{activity.description}</p>
            )}
            {bonusXP > 0 && (
              <div className="flex gap-2 mt-1">
                <Badge variant="secondary">+{baseXP} XP</Badge>
                <Badge className="bg-amber-100 text-amber-700">+{bonusXP} Bonus</Badge>
              </div>
            )}
          </div>
          
          <div className="text-right">
            <p className="text-lg font-bold text-indigo-600">+{xpEarned}</p>
            <p className="text-xs text-slate-600">XP</p>
            {completed && (
              <CheckCircle className="w-4 h-4 text-green-500 ml-auto mt-1" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ActivityTracker({ activities = [], className }) {
  const { awardXP, totalXP } = useGamification();
  const [completingActivity, setCompletingActivity] = useState(null);

  const handleCompleteActivity = async (activity) => {
    setCompletingActivity(activity.id);
    
    try {
      const xpEarned = calculateXPForActivity(activity.type, activity.bonusData);
      await awardXP({
        studentId: activity.studentId,
        amount: xpEarned,
        source: activity.type,
        description: activity.title
      });
    } catch (error) {
      console.error('Failed to award XP:', error);
    } finally {
      setCompletingActivity(null);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-500" />
          Today's Activities
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity) => (
            <XPActivityCard
              key={activity.id}
              activity={activity}
              completed={activity.completed}
              xpEarned={activity.xpEarned || 0}
            />
          ))}
        </div>
        
        {activities.length === 0 && (
          <div className="text-center py-8">
            <Target className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-600">No activities available today</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}