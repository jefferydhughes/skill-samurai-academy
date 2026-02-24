import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { calculateLevel, getLevelInfo, calculateStreakBonus } from './xp-system';

const GamificationContext = createContext();

export const GamificationProvider = ({ children, user }) => {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(user || null);

  useEffect(() => {
    setCurrentUser(user || null);
  }, [user]);

  // Track student gamification data
  const { data: studentProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['studentProfile', currentUser?.id],
    queryFn: async () => {
      if (!currentUser || currentUser.role !== 'student') return null;
      const profiles = await api.entities.StudentProfile.filter({ userId: currentUser.id });
      return profiles[0] || null;
    },
    enabled: !!currentUser
  });

  // Get student's gamification stats
  const { data: gamificationStats = {}, isLoading: isLoadingStats } = useQuery({
    queryKey: ['gamificationStats', studentProfile?.id],
    queryFn: () => {
      if (!studentProfile) return {};
      return api.entities.GamificationStats.filter({ studentId: studentProfile.id })
        .then(stats => stats[0] || {});
    },
    enabled: !!studentProfile
  });

  // Get student's badges
  const { data: earnedBadges = [], isLoading: isLoadingBadges } = useQuery({
    queryKey: ['studentBadges', studentProfile?.id],
    queryFn: () => {
      if (!studentProfile) return [];
      return api.entities.StudentBadge.filter({ studentId: studentProfile.id });
    },
    enabled: !!studentProfile
  });

  // Get available badges
  const { data: availableBadges = [] } = useQuery({
    queryKey: ['badges'],
    queryFn: () => api.entities.Badge.list()
  });

  // Award XP mutation
  const awardXPMutation = useMutation({
    mutationFn: ({ studentId, amount, source, description }) => {
      // Create or update gamification stats
      return api.entities.GamificationStats.upsert({
        studentId,
        totalXP: (gamificationStats.totalXP || 0) + amount,
        points: (gamificationStats.points || 0) + Math.floor(amount / 10),
        level: calculateLevel((gamificationStats.totalXP || 0) + amount).level
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['gamificationStats']);
    }
  });

  // Award badge mutation
  const awardBadgeMutation = useMutation({
    mutationFn: ({ studentId, badgeId }) => {
      return api.entities.StudentBadge.create({
        studentId,
        badgeId,
        earnedAt: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['studentBadges']);
    }
  });

  // Update streak mutation
  const updateStreakMutation = useMutation({
    mutationFn: ({ studentId }) => {
      const lastLogin = gamificationStats.lastLoginDate;
      const today = new Date().toDateString();
      const lastLoginDate = lastLogin ? new Date(lastLogin).toDateString() : null;
      
      let streakDays = gamificationStats.streakDays || 0;
      let streakBonus = 0;
      
      if (lastLoginDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastLoginDate === yesterday.toDateString()) {
          // Continue streak
          streakDays += 1;
        } else {
          // Reset streak
          streakDays = 1;
        }
        
        streakBonus = calculateStreakBonus(streakDays);
      }
      
      return api.entities.GamificationStats.upsert({
        studentId,
        streakDays,
        lastLoginDate: new Date().toISOString(),
        ...(streakBonus > 0 && { totalXP: (gamificationStats.totalXP || 0) + streakBonus })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['gamificationStats']);
    }
  });

  // Check and unlock badges based on achievements
  const checkBadgeUnlocks = async (studentId, achievement) => {
    if (!studentProfile) return;
    
    const newBadges = [];
    const stats = gamificationStats;
    
    // Milestone badges
    if (achievement === 'lesson_completed' && (stats.totalLessons || 0) + 1 >= 10) {
      const badge = availableBadges.find(b => b.name === 'First 10 Lessons');
      if (badge && !earnedBadges.find(eb => eb.badgeId === badge.id)) {
        await awardBadgeMutation.mutateAsync({ studentId, badgeId: badge.id });
        newBadges.push(badge);
      }
    }
    
    if (achievement === 'program_completed' && (stats.totalPrograms || 0) + 1 >= 3) {
      const badge = availableBadges.find(b => b.name === 'Program Pro');
      if (badge && !earnedBadges.find(eb => eb.badgeId === badge.id)) {
        await awardBadgeMutation.mutateAsync({ studentId, badgeId: badge.id });
        newBadges.push(badge);
      }
    }
    
    return newBadges;
  };

  const currentLevel = calculateLevel(gamificationStats.totalXP || 0);
  const levelInfo = getLevelInfo(currentLevel.level);

  const value = {
    studentProfile,
    gamificationStats,
    earnedBadges,
    availableBadges,
    currentLevel,
    levelInfo,
    isLoading: isLoadingProfile || isLoadingStats || isLoadingBadges,
    
    // Actions
    awardXP: awardXPMutation.mutateAsync,
    awardBadge: awardBadgeMutation.mutateAsync,
    updateStreak: updateStreakMutation.mutateAsync,
    checkBadgeUnlocks,
    
    // Computed values
    totalXP: gamificationStats.totalXP || 0,
    points: gamificationStats.points || 0,
    streakDays: gamificationStats.streakDays || 0,
    level: currentLevel.level,
    levelProgress: currentLevel.progress,
    xpNeeded: currentLevel.xpNeeded
  };

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within GamificationProvider');
  }
  return context;
};