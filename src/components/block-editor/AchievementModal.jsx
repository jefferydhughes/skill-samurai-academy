import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Trophy, Star, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AchievementModal({ open, onClose, lesson }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      // Big celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 250);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-amber-400 via-orange-400 to-pink-400 p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.3),transparent_50%)]" />
          <div className="relative">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-lg">
              <Trophy className="w-10 h-10 text-amber-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Lesson Complete!</h2>
            <p className="text-white/90 text-sm">You're doing amazing! 🎉</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 rounded-2xl p-4 text-center">
            <div className="text-4xl mb-2">🏆</div>
            <div className="font-semibold text-slate-900 mb-1">{lesson?.title}</div>
            <div className="text-xs text-slate-500">Completed all {lesson?.steps?.length || 0} steps</div>
          </div>

          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-center w-12 h-12 bg-amber-100 rounded-full">
                <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => navigate(createPageUrl('LearningWorlds'))}
              variant="outline"
              className="flex-1 rounded-xl h-12"
            >
              Back to Worlds
            </Button>
            <Button
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl h-12"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}