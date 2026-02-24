import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  TrendingUp,
  Target,
  Rocket,
  Clock,
  Play,
  Code,
  Lightbulb
} from 'lucide-react';
import { GamificationDashboard } from './GamificationDashboard';
import { PointsBreakdown, ActivityTracker } from './PointsSystem';
import { StreakTracker, StreakCalendar, StreakCelebration } from './Streaks';
import { LeaderboardTabs } from './Leaderboard';
import { BadgeCollection, RecentAchievements } from './BadgeSystem';
import { GamificationNotifications, FloatingNotification } from './Notifications';
import { useGamification } from '@/lib/gamification/GamificationContext';
import { cn } from '@/lib/utils';

function QuickActions({ className }) {
  const { streakDays, totalXP, level } = useGamification();
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState('');

  const handleQuickAction = async (action) => {
    setNotificationType(action);
    setShowNotification(true);
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  const quickActions = [
    {
      id: 'lesson',
      title: 'Continue Lesson',
      description: 'Pick up where you left off',
      icon: Play,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'from-blue-50 to-indigo-50',
      xp: 50
    },
    {
      id: 'project',
      title: 'Start Project',
      description: 'Build something amazing',
      icon: Code,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'from-green-50 to-emerald-50',
      xp: 100
    },
    {
      id: 'challenge',
      title: 'Daily Challenge',
      description: 'Test your skills',
      icon: Target,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'from-purple-50 to-pink-50',
      xp: 75
    },
    {
      id: 'explore',
      title: 'Explore Topics',
      description: 'Discover new content',
      icon: Lightbulb,
      color: 'from-amber-500 to-orange-600',
      bgColor: 'from-amber-50 to-orange-50',
      xp: 25
    }
  ];

  return (
    <Card className={cn("bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="w-5 h-5 text-indigo-500" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 hover:shadow-md transition-all"
                onClick={() => handleQuickAction(action.id)}
              >
                <div className={`w-10 h-10 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-slate-900 text-sm">{action.title}</p>
                  <p className="text-xs text-slate-600">{action.description}</p>
                  <Badge variant="secondary" className="mt-1 text-xs">
                    +{action.xp} XP
                  </Badge>
                </div>
              </Button>
            );
          })}
        </div>

        {/* Floating Notification */}
        <FloatingNotification
          type={notificationType === 'lesson' ? 'xp' : 'points'}
          amount={quickActions.find(a => a.id === notificationType)?.xp}
          message={`Great choice! You'll earn ${quickActions.find(a => a.id === notificationType)?.xp} XP`}
          isVisible={showNotification}
          onClose={() => setShowNotification(false)}
        />
      </CardContent>
    </Card>
  );
}

function LearningStats({ className }) {
  const { gamificationStats } = useGamification();
  
  const stats = [
    {
      label: 'Lessons Completed',
      value: gamificationStats.totalLessons || 0,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Projects Built',
      value: gamificationStats.totalProjects || 0,
      icon: Code,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Skills Learned',
      value: gamificationStats.totalSkills || 0,
      icon: Lightbulb,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      label: 'Hours Learned',
      value: Math.floor((gamificationStats.totalMinutes || 0) / 60),
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-500" />
          Learning Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center p-4 bg-slate-50 rounded-lg">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-600">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function RecommendedContent({ className }) {
  const recommendations = [
    {
      title: 'Python Basics',
      type: 'Lesson',
      difficulty: 'Beginner',
      duration: '45 min',
      xp: 50,
      progress: 75,
      icon: BookOpen,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      title: 'Build a Calculator',
      type: 'Project',
      difficulty: 'Intermediate',
      duration: '2 hours',
      xp: 100,
      progress: 30,
      icon: Code,
      color: 'from-green-500 to-emerald-600'
    },
    {
      title: 'Web Development Quiz',
      type: 'Challenge',
      difficulty: 'Advanced',
      duration: '30 min',
      xp: 75,
      progress: 0,
      icon: Target,
      color: 'from-purple-500 to-pink-600'
    }
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-500" />
          Recommended for You
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recommendations.map((item, index) => {
            const Icon = item.icon;
            const difficultyColor = {
              'Beginner': 'bg-green-100 text-green-700',
              'Intermediate': 'bg-yellow-100 text-yellow-700',
              'Advanced': 'bg-red-100 text-red-700'
            }[item.difficulty];

            return (
              <div key={index} className="p-3 border border-slate-200 rounded-lg hover:shadow-md transition-all">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 bg-gradient-to-r ${item.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-slate-900">{item.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {item.type}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-slate-600 mb-2">
                      <span className={difficultyColor}>{item.difficulty}</span>
                      <span>{item.duration}</span>
                      <span className="font-medium text-indigo-600">+{item.xp} XP</span>
                    </div>
                    
                    {item.progress > 0 && (
                      <div className="space-y-1">
                        <Progress value={item.progress} className="h-2" />
                        <p className="text-xs text-slate-600">{item.progress}% complete</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function EnhancedStudentDashboard({ studentProfile, className }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState({});
  const { streakDays, earnedBadges } = useGamification();

  // Check for special milestones
  const getSpecialMilestone = () => {
    const milestones = [7, 14, 30, 60, 100];
    if (milestones.includes(streakDays)) {
      return { days: streakDays, type: 'streak' };
    }
    return null;
  };

  const specialMilestone = getSpecialMilestone();

  const handleNotificationComplete = (notification) => {
    setNotifications(prev => {
      const updated = { ...prev };
      delete updated[notification.type];
      return updated;
    });
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Special Milestone Celebration */}
      {specialMilestone && (
        <StreakCelebration streakDays={specialMilestone.days} />
      )}

      {/* Gamification Notifications */}
      <GamificationNotifications
        achievementUnlocked={notifications.achievement}
        levelUp={notifications.levelup}
        streakBonus={notifications.streak}
        milestone={notifications.milestone}
        onNotificationComplete={handleNotificationComplete}
      />

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Main Gamification Dashboard */}
          <GamificationDashboard studentProfile={studentProfile} />
          
          {/* Quick Actions and Stats Row */}
          <div className="grid lg:grid-cols-2 gap-6">
            <QuickActions />
            <LearningStats />
          </div>

          {/* Recommended Content */}
          <RecommendedContent />
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <PointsBreakdown />
            <StreakTracker />
          </div>
          
          <div className="grid lg:grid-cols-2 gap-6">
            <ActivityTracker />
            <StreakCalendar />
          </div>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <BadgeCollection
              badges={[]} // This would come from API
              earnedBadges={earnedBadges}
              title="All Badges"
              showLocked={true}
              maxDisplay={20}
            />
            <RecentAchievements 
              achievements={earnedBadges.slice(0, 5).map(badge => ({
                badge: { name: 'Achievement', color: '#6366f1' },
                earnedAt: badge.earnedAt,
                description: 'Great accomplishment!'
              }))}
            />
          </div>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-6">
          <LeaderboardTabs
            globalLeaderboard={[]} // This would come from API
            classLeaderboard={[]} // This would come from API
            locationLeaderboard={[]} // This would come from API
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}