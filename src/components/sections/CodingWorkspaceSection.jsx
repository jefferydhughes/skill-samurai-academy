import React from 'react';
import { Play, Pause, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MobileCanvas from '@/components/kitsune/MobileCanvas';

export default function CodingWorkspaceSection({
  isRunning,
  onRunToggle,
  onShare,
  lessonProgress,
  totalSteps
}) {
  return (
    <main className="flex-1 flex flex-col overflow-hidden">

      {/* Top Toolbar */}
      <div className="h-14 bg-white/80 backdrop-blur-xl border-b border-black/5 flex items-center justify-between px-4">
        <div>
          <h1 className="text-sm font-semibold">Platformer Game</h1>
          <p className="text-xs text-slate-500">
            Step {lessonProgress} of {totalSteps}
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onShare}>
            <Share2 className="w-4 h-4" />
          </Button>

          <Button
            size="sm"
            onClick={onRunToggle}
            className={`${
              isRunning ? 'bg-rose-500' : 'bg-emerald-500'
            } text-white`}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50/20">
        <MobileCanvas isRunning={isRunning} onShare={onShare} />
      </div>
    </main>
  );
}