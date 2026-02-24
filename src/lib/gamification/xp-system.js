/**
 * Gamification points and XP calculation utilities
 */

export const XP_CONFIG = {
  // XP rewards for different activities
  LESSON_COMPLETION: {
    base: 50,
    speedBonus: 25, // Bonus for completing under time
    perfectScore: 50
  },
  PROJECT_COMPLETION: {
    base: 100,
    creativityBonus: 50,
    technicalBonus: 75
  },
  DAILY_LOGIN: {
    base: 10,
    streakMultiplier: 2
  },
  STREAK_BONUSES: {
    WEEKLY: 100, // 7 days
    MONTHLY: 500, // 30 days
    QUARTERLY: 1500 // 90 days
  },
  // Level progression (XP required per level)
  LEVEL_FORMULA: (level) => Math.floor(100 * Math.pow(1.2, level - 1))
};

export const LEVELS = [
  { level: 1, title: 'Beginner', icon: '🌱', color: '#10b981' },
  { level: 2, title: 'Explorer', icon: '🌿', color: '#06b6d4' },
  { level: 3, title: 'Apprentice', icon: '🍃', color: '#3b82f6' },
  { level: 4, title: 'Coder', icon: '💎', color: '#6366f1' },
  { level: 5, title: 'Developer', icon: '⭐', color: '#8b5cf6' },
  { level: 6, title: 'Expert', icon: '🌟', color: '#a855f7' },
  { level: 7, title: 'Master', icon: '🔥', color: '#f59e0b' },
  { level: 8, title: 'Ninja', icon: '⚡', color: '#ef4444' },
  { level: 9, title: 'Sensei', icon: '🏆', color: '#f97316' },
  { level: 10, title: 'Legend', icon: '👑', color: '#ec4899' }
];

export const calculateXPForActivity = (activity, bonusData = {}) => {
  const config = XP_CONFIG[activity];
  if (!config) return 0;

  let xp = config.base;

  switch (activity) {
    case 'LESSON_COMPLETION':
      if (bonusData.speedBonus) xp += config.speedBonus;
      if (bonusData.perfectScore) xp += config.perfectScore;
      break;
    
    case 'PROJECT_COMPLETION':
      if (bonusData.creativityBonus) xp += config.creativityBonus;
      if (bonusData.technicalBonus) xp += config.technicalBonus;
      break;
    
    case 'DAILY_LOGIN':
      if (bonusData.streakDays) {
        xp += Math.min(bonusData.streakDays * config.streakMultiplier, 50);
      }
      break;
  }

  return xp;
};

export const calculateLevel = (totalXP) => {
  let level = 1;
  let xpForNextLevel = XP_CONFIG.LEVEL_FORMULA(2);
  
  while (totalXP >= xpForNextLevel && level < 50) {
    level++;
    xpForNextLevel += XP_CONFIG.LEVEL_FORMULA(level + 1);
  }
  
  const xpForCurrentLevel = level === 1 ? 0 : 
    Array.from({ length: level - 1 }, (_, i) => XP_CONFIG.LEVEL_FORMULA(i + 1))
      .reduce((sum, xp) => sum + xp, 0);
  const xpForNextLevelTotal = xpForCurrentLevel + XP_CONFIG.LEVEL_FORMULA(level);
  const progress = ((totalXP - xpForCurrentLevel) / (XP_CONFIG.LEVEL_FORMULA(level))) * 100;
  
  return {
    level: Math.min(level, 50),
    progress: Math.min(progress, 100),
    xpForCurrentLevel,
    xpForNextLevel: xpForNextLevelTotal,
    xpNeeded: xpForNextLevelTotal - totalXP
  };
};

export const getLevelInfo = (level) => {
  return LEVELS.find(l => l.level === level) || LEVELS[0];
};

export const calculateStreakBonus = (streakDays) => {
  if (streakDays >= 90) return XP_CONFIG.STREAK_BONUSES.QUARTERLY;
  if (streakDays >= 30) return XP_CONFIG.STREAK_BONUSES.MONTHLY;
  if (streakDays >= 7) return XP_CONFIG.STREAK_BONUSES.WEEKLY;
  return 0;
};