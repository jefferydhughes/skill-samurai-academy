import React, { createContext, useContext, useState } from 'react';
import { GamificationProvider } from '@/lib/gamification/GamificationContext';
import { StudentProgressOverview } from './GamificationDashboard';
import { useGamification } from '@/lib/gamification/GamificationContext';
import { cn } from '@/lib/utils';

// Create a layout context for gamification features
const GamificationLayoutContext = createContext();

export const GamificationLayoutProvider = ({ children, showProgress = true }) => {
  const [showFloatingProgress, setShowFloatingProgress] = useState(showProgress);
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    setNotifications(prev => [...prev, { ...notification, id: Date.now() }]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <GamificationLayoutContext.Provider value={{
      showFloatingProgress,
      setShowFloatingProgress,
      notifications,
      addNotification,
      removeNotification
    }}>
      <GamificationProvider>
        {children}
      </GamificationProvider>
    </GamificationLayoutContext.Provider>
  );
};

export const useGamificationLayout = () => {
  const context = useContext(GamificationLayoutContext);
  if (!context) {
    throw new Error('useGamificationLayout must be used within GamificationLayoutProvider');
  }
  return context;
};

// Floating Progress Bar Component
export function FloatingProgressBar({ className }) {
  const { totalXP, level, levelProgress, xpNeeded } = useGamification();

  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm",
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">L{level}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-slate-900">Level {level}</span>
                <span className="text-xs text-slate-600">{xpNeeded} XP to next level</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${levelProgress}%` }}
                />
              </div>
            </div>
          </div>
          <div className="text-sm font-medium text-slate-900">
            {totalXP.toLocaleString()} XP
          </div>
        </div>
      </div>
    </div>
  );
}

// Gamification-enhanced page wrapper
export function GamificationPage({ 
  children, 
  showFloatingProgress = true,
  showCompactProgress = false,
  className 
}) {
  const { showFloatingProgress: layoutShowProgress } = useGamificationLayout();
  const { streakDays, points } = useGamification();

  return (
    <div className={cn("relative", className)}>
      {/* Floating Progress Bar */}
      {showFloatingProgress && layoutShowProgress && (
        <FloatingProgressBar />
      )}
      
      {/* Main Content with top padding for floating bar */}
      <div className={showFloatingProgress && layoutShowProgress ? "pt-16" : ""}>
        {/* Compact Progress (optional) */}
        {showCompactProgress && (
          <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-slate-200 px-4 py-2">
            <div className="max-w-7xl mx-auto">
              <StudentProgressOverview compact={true} />
            </div>
          </div>
        )}
        
        {/* Page Content */}
        <main>
          {children}
        </main>
      </div>
      
      {/* Streak Indicator (bottom right) */}
      {streakDays > 0 && (
        <div className="fixed bottom-4 right-4 z-30">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-3 py-2 rounded-full shadow-lg flex items-center gap-2 animate-pulse">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <span className="text-sm font-semibold">{streakDays} Day Streak!</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Learning Activity Tracker Component
export function LearningActivityTracker({ lessonId, activityType, onXPChange }) {
  const { awardXP, updateStreak } = useGamification();
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState(null);

  const startTracking = () => {
    setIsTracking(true);
    setStartTime(Date.now());
    
    // Award daily login XP if not already awarded today
    updateStreak({ studentId: 'current-user' });
  };

  const completeActivity = async () => {
    if (!isTracking) return;
    
    const timeSpent = startTime ? Math.floor((Date.now() - startTime) / 1000 / 60) : 0;
    
    try {
      let xpAmount = 0;
      let bonusData = {};
      
      switch (activityType) {
        case 'lesson':
          xpAmount = 50; // Base XP for lesson completion
          if (timeSpent < 30) {
            xpAmount += 25; // Speed bonus
            bonusData.speedBonus = true;
          }
          break;
          
        case 'project':
          xpAmount = 100; // Base XP for project completion
          break;
          
        case 'quiz':
          xpAmount = 30; // Base XP for quiz completion
          break;
          
        default:
          xpAmount = 25;
      }
      
      await awardXP({
        studentId: 'current-user',
        amount: xpAmount,
        source: activityType.toUpperCase() + '_COMPLETION',
        description: `Completed ${activityType}`,
        bonusData
      });
      
      onXPChange?.(xpAmount);
    } catch (error) {
      console.error('Failed to award XP:', error);
    } finally {
      setIsTracking(false);
      setStartTime(null);
    }
  };

  return {
    startTracking,
    completeActivity,
    isTracking,
    timeSpent: startTime ? Math.floor((Date.now() - startTime) / 1000 / 60) : 0
  };
}

// Gamification-enhanced button component
export function GamifiedButton({ 
  children, 
  xpReward, 
  onClick, 
  disabled = false,
  showXPIcon = true,
  className,
  ...props 
}) {
  const { awardXP } = useGamification();
  const [isAwardingXP, setIsAwardingXP] = useState(false);

  const handleClick = async (e) => {
    if (disabled || isAwardingXP) return;
    
    setIsAwardingXP(true);
    
    try {
      await onClick?.(e);
      
      if (xpReward && !disabled) {
        await awardXP({
          studentId: 'current-user',
          amount: xpReward,
          source: 'INTERACTION',
          description: 'User action completed'
        });
      }
    } catch (error) {
      console.error('Error in gamified button:', error);
    } finally {
      setIsAwardingXP(false);
    }
  };

  return (
    <button
      className={cn(
        "relative transition-all duration-200",
        isAwardingXP && "animate-pulse",
        className
      )}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {children}
      
      {showXPIcon && xpReward && (
        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-md">
          +{xpReward} XP
        </div>
      )}
      
      {isAwardingXP && (
        <div className="absolute inset-0 bg-white/20 rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </button>
  );
}

export default GamificationLayoutProvider;