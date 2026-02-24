import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Flame, 
  Calendar,
  TrendingUp,
  Clock,
  Award,
  Target,
  Zap,
  CheckCircle,
  Star,
  Crown,
  Gift
} from 'lucide-react';
import { useGamification } from '@/lib/gamification/GamificationContext';
import { cn } from '@/lib/utils';

export function StreakCalendar({ className }) {
  const { streakDays, updateStreak } = useGamification();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  const getStreakStatus = (day) => {
    // Mock streak data - in real implementation, this would come from the API
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonthIndex = today.getMonth();
    const selectedMonthIndex = currentMonth.getMonth();
    
    if (selectedMonthIndex > currentMonthIndex) return 'future';
    if (selectedMonthIndex < currentMonthIndex) {
      // Past month - determine based on historical data
      return Math.random() > 0.3 ? 'completed' : 'missed';
    }
    
    // Current month
    if (day > currentDay) return 'future';
    if (day === currentDay) return 'today';
    
    // Past days in current month
    const daysAgo = currentDay - day;
    if (daysAgo < streakDays) return 'completed';
    return 'missed';
  };

  const getDayColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'today': return 'bg-blue-500 animate-pulse';
      case 'missed': return 'bg-red-500';
      case 'future': return 'bg-slate-200';
      default: return 'bg-slate-200';
    }
  };

  const days = getDaysInMonth(currentMonth);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <Card className={cn("bg-gradient-to-br from-orange-50 to-red-50 border-orange-200", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-orange-500" />
          Learning Calendar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            >
              ←
            </Button>
            <h3 className="font-semibold text-slate-900">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            >
              →
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Week day headers */}
            {weekDays.map(day => (
              <div key={day} className="text-center text-xs font-medium text-slate-600 p-2">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {days.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="p-2"></div>;
              }
              
              const status = getStreakStatus(day);
              return (
                <div
                  key={day}
                  className={cn(
                    "aspect-square rounded-lg flex items-center justify-center text-xs font-medium cursor-pointer transition-all hover:scale-105",
                    getDayColor(status),
                    status === 'completed' ? 'text-white' : 'text-slate-600'
                  )}
                  onClick={() => setSelectedDate(day)}
                >
                  {day}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-slate-600">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded animate-pulse"></div>
              <span className="text-slate-600">Today</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-slate-600">Missed</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function StreakTracker({ className }) {
  const { streakDays, updateStreak } = useGamification();
  const [isUpdating, setIsUpdating] = useState(false);

  const getStreakLevel = (days) => {
    if (days >= 100) return { level: 'Legendary', color: 'text-purple-600', bg: 'bg-purple-100', icon: Crown };
    if (days >= 60) return { level: 'Master', color: 'text-red-600', bg: 'bg-red-100', icon: Flame };
    if (days >= 30) return { level: 'Expert', color: 'text-orange-600', bg: 'bg-orange-100', icon: TrendingUp };
    if (days >= 14) return { level: 'Pro', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: Star };
    if (days >= 7) return { level: 'Rising', color: 'text-blue-600', bg: 'bg-blue-100', icon: Zap };
    if (days >= 3) return { level: 'Growing', color: 'text-green-600', bg: 'bg-green-100', icon: Award };
    return { level: 'New', color: 'text-gray-600', bg: 'bg-gray-100', icon: Target };
  };

  const getNextMilestone = () => {
    if (streakDays < 7) return { days: 7, reward: '100 XP Bonus' };
    if (streakDays < 14) return { days: 14, reward: 'Special Badge' };
    if (streakDays < 30) return { days: 30, reward: '500 XP Bonus' };
    if (streakDays < 60) return { days: 60, reward: 'Exclusive Theme' };
    if (streakDays < 100) return { days: 100, reward: 'Legendary Status' };
    return null;
  };

  const streakInfo = getStreakLevel(streakDays);
  const Icon = streakInfo.icon;
  const nextMilestone = getNextMilestone();
  const progressToNext = nextMilestone ? ((streakDays % nextMilestone.days) / nextMilestone.days) * 100 : 100;

  const handleCheckIn = async () => {
    setIsUpdating(true);
    try {
      await updateStreak({ studentId: 'current-user' }); // This would come from context
    } catch (error) {
      console.error('Failed to update streak:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className={cn("bg-gradient-to-br from-orange-50 to-red-50 border-orange-200", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          Learning Streak
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Main Streak Display */}
          <div className="text-center">
            <div className={`w-20 h-20 ${streakInfo.bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <Icon className={`w-10 h-10 ${streakInfo.color}`} />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">{streakDays} Days</h2>
            <Badge className={`${streakInfo.bg} ${streakInfo.color}`}>
              {streakInfo.level} Level
            </Badge>
          </div>

          {/* Daily Check-in */}
          <div className="flex justify-center">
            <Button
              onClick={handleCheckIn}
              disabled={isUpdating}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            >
              {isUpdating ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Daily Check-in
                </>
              )}
            </Button>
          </div>

          {/* Next Milestone */}
          {nextMilestone && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-900">
                  Next: {nextMilestone.days} days
                </span>
                <span className="text-sm text-slate-600">{nextMilestone.reward}</span>
              </div>
              <Progress value={progressToNext} className="h-2" />
              <p className="text-xs text-center text-slate-600">
                {nextMilestone.days - (streakDays % nextMilestone.days)} days to go!
              </p>
            </div>
          )}

          {/* Streak Bonuses */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 mb-1">
                <Gift className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-slate-900">Week Bonus</span>
              </div>
              <p className="text-xs text-slate-600">7 days → 100 XP</p>
              {streakDays >= 7 && <CheckCircle className="w-3 h-3 text-green-500" />}
            </div>
            
            <div className="p-3 bg-white rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium text-slate-900">Month Bonus</span>
              </div>
              <p className="text-xs text-slate-600">30 days → 500 XP</p>
              {streakDays >= 30 && <CheckCircle className="w-3 h-3 text-green-500" />}
            </div>
          </div>

          {/* Streak Visualization */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-900">Recent Activity</p>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(streakDays, 30) }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-2 w-1 rounded-full transition-all",
                    i < Math.min(streakDays, 7) ? "bg-orange-400" :
                    i < Math.min(streakDays, 14) ? "bg-orange-500" :
                    i < Math.min(streakDays, 30) ? "bg-orange-600" :
                    "bg-orange-300"
                  )}
                  style={{ animationDelay: `${i * 0.05}s` }}
                />
              ))}
              {streakDays > 30 && (
                <span className="text-xs text-slate-500 ml-2">+{streakDays - 30}</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function StreakCelebration({ streakDays, className }) {
  const getSpecialMilestone = () => {
    if (streakDays === 7) return { title: "Week Warrior!", bonus: "100 XP", color: "from-blue-500 to-indigo-600" };
    if (streakDays === 14) return { title: "Fortnight Fighter!", bonus: "Special Badge", color: "from-green-500 to-emerald-600" };
    if (streakDays === 30) return { title: "Monthly Master!", bonus: "500 XP", color: "from-orange-500 to-red-600" };
    if (streakDays === 60) return { title: "Double Diamond!", bonus: "Exclusive Theme", color: "from-purple-500 to-pink-600" };
    if (streakDays === 100) return { title: "Centurion!", bonus: "Legendary Status", color: "from-yellow-500 to-amber-600" };
    return null;
  };

  const milestone = getSpecialMilestone();
  if (!milestone) return null;

  return (
    <Card className={cn(`bg-gradient-to-br ${milestone.color} text-white border-0`, className)}>
      <CardContent className="p-6 text-center">
        <Flame className="w-12 h-12 mx-auto mb-4 animate-bounce" />
        <h3 className="text-2xl font-bold mb-2">{milestone.title}</h3>
        <p className="text-lg mb-4">{streakDays} Day Streak!</p>
        <div className="inline-block px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm">
          <p className="font-semibold">{milestone.bonus}</p>
        </div>
      </CardContent>
    </Card>
  );
}