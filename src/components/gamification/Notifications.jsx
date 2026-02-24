import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Confetti } from './Confetti';
import { 
  Trophy, 
  Star, 
  Zap, 
  Target,
  Gift,
  Crown,
  Rocket,
  ChevronRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export function AchievementUnlock({ 
  achievement, 
  isOpen, 
  onClose,
  onComplete 
}) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <>
      {showConfetti && <Confetti />}
      
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <DialogHeader>
            <DialogTitle className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-amber-900">Achievement Unlocked!</h2>
            </DialogTitle>
          </DialogHeader>
          
          <div className="text-center space-y-4">
            <div className="p-4 bg-white rounded-lg border border-amber-200">
              <h3 className="text-xl font-bold text-slate-900 mb-2">{achievement.name}</h3>
              <p className="text-slate-600">{achievement.description}</p>
            </div>
            
            {achievement.rewards && (
              <div className="space-y-2">
                <p className="font-semibold text-slate-900">Rewards Earned:</p>
                <div className="flex justify-center gap-3">
                  {achievement.rewards.xp && (
                    <Badge className="bg-indigo-100 text-indigo-700">
                      <Zap className="w-3 h-3 mr-1" />
                      +{achievement.rewards.xp} XP
                    </Badge>
                  )}
                  {achievement.rewards.points && (
                    <Badge className="bg-amber-100 text-amber-700">
                      <Star className="w-3 h-3 mr-1" />
                      +{achievement.rewards.points} Points
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              onClick={() => {
                onComplete?.();
                onClose();
              }}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
            >
              Awesome! Keep Going
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function LevelUpNotification({ 
  newLevel, 
  isOpen, 
  onClose 
}) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <>
      {showConfetti && <Confetti />}
      
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <DialogHeader>
            <DialogTitle className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <Rocket className="w-10 h-10 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-purple-900">Level Up!</h2>
            </DialogTitle>
          </DialogHeader>
          
          <div className="text-center space-y-4">
            <div className="p-4 bg-white rounded-lg border border-purple-200">
              <p className="text-4xl font-bold text-purple-600 mb-2">Level {newLevel}</p>
              <p className="text-slate-600">You've reached a new milestone!</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <Crown className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-900">New Title</p>
                <p className="text-xs text-slate-600">Unlocked</p>
              </div>
              <div className="p-3 bg-pink-50 rounded-lg">
                <Gift className="w-8 h-8 text-pink-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-900">Bonus Rewards</p>
                <p className="text-xs text-slate-600">+50 Points</p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              onClick={onClose}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            >
              Continue Learning
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function StreakBonusNotification({ 
  streakDays, 
  bonus, 
  isOpen, 
  onClose 
}) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <>
      {showConfetti && <Confetti />}
      
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <DialogHeader>
            <DialogTitle className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-orange-900">Streak Bonus!</h2>
            </DialogTitle>
          </DialogHeader>
          
          <div className="text-center space-y-4">
            <div className="p-4 bg-white rounded-lg border border-orange-200">
              <p className="text-lg text-slate-600 mb-2">{streakDays} Day Streak!</p>
              <p className="text-3xl font-bold text-orange-600">+{bonus} XP</p>
            </div>
            
            <div className="flex items-center justify-center gap-2">
              {[...Array(Math.min(streakDays, 7))].map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-3 bg-orange-400 rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              onClick={onClose}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            >
              Keep the Streak Going!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function MilestoneCelebration({ 
  milestone, 
  isOpen, 
  onClose 
}) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <>
      {showConfetti && <Confetti />}
      
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200">
          <DialogHeader>
            <DialogTitle className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <Target className="w-10 h-10 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-indigo-900">Milestone Reached!</h2>
            </DialogTitle>
          </DialogHeader>
          
          <div className="text-center space-y-4">
            <div className="p-4 bg-white rounded-lg border border-indigo-200">
              <h3 className="text-xl font-bold text-slate-900 mb-2">{milestone.title}</h3>
              <p className="text-slate-600 mb-4">{milestone.description}</p>
              
              <div className="flex justify-center">
                <CheckCircle2 className="w-16 h-16 text-green-500" />
              </div>
            </div>
            
            {milestone.reward && (
              <div className="flex justify-center">
                <Badge className="bg-indigo-100 text-indigo-700 text-lg px-4 py-2">
                  {milestone.reward}
                </Badge>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              onClick={onClose}
              className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700"
            >
              Celebrate & Continue
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function GamificationNotifications({ 
  achievementUnlocked,
  levelUp,
  streakBonus,
  milestone,
  onNotificationComplete
}) {
  const [activeNotification, setActiveNotification] = useState(null);

  const handleClose = () => {
    setActiveNotification(null);
    onNotificationComplete?.(activeNotification);
  };

  return (
    <>
      {achievementUnlocked && (
        <AchievementUnlock
          achievement={achievementUnlocked}
          isOpen={activeNotification === 'achievement'}
          onClose={handleClose}
          onComplete={() => onNotificationComplete?.(achievementUnlocked)}
        />
      )}
      
      {levelUp && (
        <LevelUpNotification
          newLevel={levelUp}
          isOpen={activeNotification === 'levelup'}
          onClose={handleClose}
        />
      )}
      
      {streakBonus && (
        <StreakBonusNotification
          streakDays={streakBonus.days}
          bonus={streakBonus.bonus}
          isOpen={activeNotification === 'streak'}
          onClose={handleClose}
        />
      )}
      
      {milestone && (
        <MilestoneCelebration
          milestone={milestone}
          isOpen={activeNotification === 'milestone'}
          onClose={handleClose}
        />
      )}
    </>
  );
}

// Floating notifications for smaller updates
export function FloatingNotification({ 
  type = 'xp', 
  amount, 
  message,
  isVisible,
  onClose
}) {
  if (!isVisible) return null;

  const getTypeConfig = () => {
    switch (type) {
      case 'xp':
        return { icon: Zap, color: 'from-indigo-500 to-purple-600', bgColor: 'from-indigo-50 to-purple-50' };
      case 'points':
        return { icon: Star, color: 'from-amber-500 to-orange-600', bgColor: 'from-amber-50 to-orange-50' };
      case 'badge':
        return { icon: Trophy, color: 'from-amber-500 to-yellow-600', bgColor: 'from-amber-50 to-yellow-50' };
      default:
        return { icon: CheckCircle2, color: 'from-green-500 to-emerald-600', bgColor: 'from-green-50 to-emerald-50' };
    }
  };

  const config = getTypeConfig();
  const Icon = config.icon;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right">
      <Card className={`bg-gradient-to-r ${config.bgColor} border-opacity-50 shadow-lg`}>
        <CardContent className="p-4 flex items-center gap-3">
          <div className={`w-10 h-10 bg-gradient-to-r ${config.color} rounded-full flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-slate-900">{message}</p>
            {amount && (
              <p className="text-sm text-slate-600">+{amount}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 ml-2"
            onClick={onClose}
          >
            ×
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}