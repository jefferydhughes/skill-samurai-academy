import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Star, 
  Zap, 
  Target, 
  BookOpen, 
  Code,
  Flame,
  Award,
  Users
} from 'lucide-react';
import { GamificationProvider } from '@/lib/gamification/GamificationContext';
import { 
  EnhancedStudentDashboard,
  GamificationLayoutProvider,
  PointsBreakdown,
  StreakTracker,
  Leaderboard,
  BadgeCollection,
  AchievementSystem
} from '@/components/gamification';

// Mock data for demonstration
const mockUser = {
  id: 'demo-user',
  role: 'student',
  full_name: 'Demo Student'
};

const mockStudentProfile = {
  id: 'demo-profile',
  displayName: 'Demo Student',
  userId: 'demo-user'
};

const mockBadges = [
  { id: '1', name: 'First Steps', description: 'Complete your first lesson', category: 'learning', xpReward: 25, pointsReward: 10 },
  { id: '2', name: 'Code Master', description: 'Complete 10 coding projects', category: 'coding', xpReward: 100, pointsReward: 25 },
  { id: '3', name: 'Week Warrior', description: 'Maintain a 7-day streak', category: 'streak', xpReward: 50, pointsReward: 15 },
  { id: '4', name: 'Team Player', description: 'Help 5 other students', category: 'social', xpReward: 75, pointsReward: 20 },
  { id: '5', name: 'Quick Learner', description: 'Complete a lesson in under 30 minutes', category: 'learning', xpReward: 30, pointsReward: 12 },
  { id: '6', name: 'Project Pro', description: 'Complete 25 projects', category: 'milestone', xpReward: 200, pointsReward: 50 }
];

const mockLeaderboard = [
  { id: '1', fullName: 'Alex Chen', totalXP: 2850, level: 12, levelProgress: 75, streakDays: 15, locationName: 'San Francisco' },
  { id: '2', fullName: 'Sarah Johnson', totalXP: 2720, level: 11, levelProgress: 90, streakDays: 8, locationName: 'San Francisco' },
  { id: '3', fullName: 'Mike Williams', totalXP: 2540, level: 11, levelProgress: 60, streakDays: 22, locationName: 'San Francisco' },
  { id: '4', fullName: 'Emma Davis', totalXP: 2380, level: 10, levelProgress: 85, streakDays: 12, locationName: 'San Francisco' },
  { id: '5', fullName: 'Demo Student', totalXP: 1850, level: 9, levelProgress: 45, streakDays: 5, locationName: 'San Francisco' }
];

const mockAchievements = [
  {
    id: '1',
    name: 'Lesson Champion',
    description: 'Complete 50 lessons across all programs',
    category: 'learning',
    requirement: 50,
    current: 32,
    progress: 64,
    xpReward: 150,
    pointsReward: 35,
    badgeReward: true,
    tips: 'Focus on completing one lesson per day to maintain momentum'
  },
  {
    id: '2',
    name: 'Speed Demon',
    description: 'Complete 10 lessons in under 30 minutes each',
    category: 'learning',
    requirement: 10,
    current: 7,
    progress: 70,
    xpReward: 100,
    pointsReward: 25,
    tips: 'Review the lesson material beforehand to work faster'
  },
  {
    id: '3',
    name: 'Consistency King',
    description: 'Log in and complete at least one activity for 30 consecutive days',
    category: 'streak',
    requirement: 30,
    current: 15,
    progress: 50,
    xpReward: 200,
    pointsReward: 50,
    badgeReward: true,
    tips: 'Set a daily reminder to keep your streak alive'
  }
];

export default function GamificationDemo() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <GamificationLayoutProvider showProgress={true}>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              🎮 Gamification System Demo
            </h1>
            <p className="text-lg text-slate-600">
              Explore the comprehensive student gamification features for Skill Samurai
            </p>
          </div>

          {/* System Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">XP System</p>
                    <p className="text-lg font-bold text-indigo-600">10 Levels</p>
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
                    <p className="text-lg font-bold text-amber-600">Rewards</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <Flame className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Streaks</p>
                    <p className="text-lg font-bold text-green-600">Tracking</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Badges</p>
                    <p className="text-lg font-bold text-purple-600">6 Types</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Demo Content */}
          <GamificationProvider user={mockUser}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Full Dashboard</TabsTrigger>
                <TabsTrigger value="components">Individual Components</TabsTrigger>
                <TabsTrigger value="features">Feature Showcase</TabsTrigger>
                <TabsTrigger value="integration">Integration</TabsTrigger>
              </TabsList>

              {/* Full Dashboard */}
              <TabsContent value="overview">
                <EnhancedStudentDashboard studentProfile={mockStudentProfile} />
              </TabsContent>

              {/* Individual Components */}
              <TabsContent value="components" className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  <PointsBreakdown />
                  <StreakTracker />
                </div>
                
                <div className="grid lg:grid-cols-2 gap-6">
                  <Leaderboard
                    data={mockLeaderboard}
                    title="Top Performers"
                    currentUserRank={mockLeaderboard.find(entry => entry.id === '5')}
                    maxDisplay={5}
                  />
                  <BadgeCollection
                    badges={mockBadges}
                    earnedBadges={mockBadges.slice(0, 3)}
                    title="Badge Collection"
                    showLocked={true}
                  />
                </div>

                <AchievementSystem
                  achievements={mockAchievements}
                  unlockedAchievements={mockAchievements.slice(0, 1)}
                />
              </TabsContent>

              {/* Feature Showcase */}
              <TabsContent value="features" className="space-y-6">
                <div className="grid lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-indigo-500" />
                        XP Rewards
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Lesson Completion</span>
                          <Badge variant="secondary">50 XP</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Project Submission</span>
                          <Badge variant="secondary">100 XP</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Daily Login</span>
                          <Badge variant="secondary">10 XP</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Streak Bonus</span>
                          <Badge variant="secondary">5x Multiplier</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Flame className="w-5 h-5 text-orange-500" />
                        Streak Milestones
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">7 Days</span>
                          <Badge variant="secondary">100 XP Bonus</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">30 Days</span>
                          <Badge variant="secondary">500 XP Bonus</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">90 Days</span>
                          <Badge variant="secondary">1500 XP Bonus</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Legend Status</span>
                          <Badge variant="secondary">Special Badge</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-purple-500" />
                        Badge Categories
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-blue-500" />
                          <span className="text-sm">Learning Achievements</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Code className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Coding Milestones</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Flame className="w-4 h-4 text-orange-500" />
                          <span className="text-sm">Streak Rewards</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-purple-500" />
                          <span className="text-sm">Social Badges</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-red-500" />
                      Leaderboard Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-slate-50 rounded-lg">
                        <Globe className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <h4 className="font-semibold text-slate-900">Global Rankings</h4>
                        <p className="text-sm text-slate-600">Compete with all students</p>
                      </div>
                      <div className="text-center p-4 bg-slate-50 rounded-lg">
                        <MapPin className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <h4 className="font-semibold text-slate-900">Location-based</h4>
                        <p className="text-sm text-slate-600">Compare with local students</p>
                      </div>
                      <div className="text-center p-4 bg-slate-50 rounded-lg">
                        <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                        <h4 className="font-semibold text-slate-900">Class Rankings</h4>
                        <p className="text-sm text-slate-600">Track peer progress</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Integration */}
              <TabsContent value="integration" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Integration Points</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-2">Student Portal Integration</h4>
                        <p className="text-sm text-slate-600 mb-2">
                          Gamification system is integrated into the Student Portal with a dedicated "Gamification" tab.
                        </p>
                        <Badge className="bg-green-100 text-green-700">✓ Integrated</Badge>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-2">Base44 SDK Integration</h4>
                        <p className="text-sm text-slate-600 mb-2">
                          Uses existing Base44 entities for data persistence and API integration.
                        </p>
                        <Badge className="bg-green-100 text-green-700">✓ Connected</Badge>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-2">Component Library</h4>
                        <p className="text-sm text-slate-600 mb-2">
                          Modular components can be used individually or as a complete system.
                        </p>
                        <Badge className="bg-blue-100 text-blue-700">✓ Reusable</Badge>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-2">Mobile-First Design</h4>
                        <p className="text-sm text-slate-600 mb-2">
                          All components are fully responsive and optimized for mobile devices.
                        </p>
                        <Badge className="bg-blue-100 text-blue-700">✓ Responsive</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Usage Examples</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <h4 className="font-semibold text-slate-900 mb-2">Quick Integration</h4>
                        <pre className="text-xs bg-slate-800 text-slate-100 p-3 rounded overflow-x-auto">
{`import { GamificationProvider, EnhancedStudentDashboard } from '@/components/gamification';

<GamificationProvider user={user}>
  <EnhancedStudentDashboard studentProfile={studentProfile} />
</GamificationProvider>`}
                        </pre>
                      </div>
                      
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <h4 className="font-semibold text-slate-900 mb-2">Individual Components</h4>
                        <pre className="text-xs bg-slate-800 text-slate-100 p-3 rounded overflow-x-auto">
{`import { PointsBreakdown, StreakTracker, Leaderboard } from '@/components/gamification';

<PointsBreakdown />
<StreakTracker />
<Leaderboard data={leaderboardData} />`}
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </GamificationProvider>
        </div>
      </div>
    </GamificationLayoutProvider>
  );
}