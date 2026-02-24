// Core Gamification Components
export { GamificationProvider, useGamification } from '@/lib/gamification/GamificationContext';

// Dashboard and Overview
export { 
  GamificationDashboard, 
  StudentProgressOverview 
} from './GamificationDashboard';

// Points and XP System
export { 
  PointsBreakdown, 
  XPActivityCard, 
  ActivityTracker 
} from './PointsSystem';

// Streak System
export { 
  StreakTracker, 
  StreakCalendar, 
  StreakCelebration 
} from './Streaks';

// Achievement System
export { 
  AchievementCard, 
  AchievementSystem, 
  AchievementNotification 
} from './AchievementSystem';

// Leaderboard
export { 
  Leaderboard, 
  LeaderboardTabs, 
  LeaderboardCard 
} from './Leaderboard';

// Badges
export { 
  BadgeDisplay, 
  BadgeCollection, 
  RecentAchievements 
} from './BadgeSystem';

// Notifications
export {
  AchievementUnlock,
  LevelUpNotification,
  StreakBonusNotification,
  MilestoneCelebration,
  GamificationNotifications,
  FloatingNotification
} from './Notifications';

// Progress Indicators
export {
  XPProgressBar,
  StreakIndicator,
  PointsDisplay
} from './ProgressIndicators';

// Layout and Integration
export {
  GamificationLayoutProvider,
  useGamificationLayout,
  FloatingProgressBar,
  GamificationPage,
  LearningActivityTracker,
  GamifiedButton
} from './GamificationLayout';

// Enhanced Dashboard
export { EnhancedStudentDashboard } from './EnhancedStudentDashboard';

// Utility
export { Confetti } from './Confetti';

// Re-export from lib
export { 
  XP_CONFIG, 
  LEVELS, 
  calculateXPForActivity, 
  calculateLevel, 
  getLevelInfo, 
  calculateStreakBonus 
} from '@/lib/gamification/xp-system';