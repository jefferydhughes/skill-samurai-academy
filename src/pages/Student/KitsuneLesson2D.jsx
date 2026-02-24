import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Share2, 
  ChevronLeft,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import BlockPalettePanel from '../../components/kitsune/BlockPalettePanel';
import MobileCanvas from '../../components/kitsune/MobileCanvas';
import AssetDrawer from '../../components/kitsune/AssetDrawer';
import QRShareModal from '../../components/kitsune/QRShareModal';

export default function KitsuneLesson2D() {
  const [isRunning, setIsRunning] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('motion');
  const [showAssets, setShowAssets] = useState(true);
  const [lessonProgress, setLessonProgress] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);

  const lessonSteps = [
    { id: 1, title: 'Add Movement', description: 'Make your character move forward' },
    { id: 2, title: 'Add a Turn', description: 'Add a turn left or right action' },
    { id: 3, title: 'Use a Loop', description: 'Wrap your code in a repeat block' },
    { id: 4, title: 'Share Your Game', description: 'Generate a QR code to share' },
  ];

  const currentStep = lessonSteps[lessonProgress - 1];

  const handleRun = () => {
    setIsRunning(!isRunning);
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleStepComplete = (stepId) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
      if (stepId === lessonProgress) {
        setLessonProgress(Math.min(lessonProgress + 1, lessonSteps.length));
      }
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Left Sidebar - Block Palette */}
      <div className="hidden lg:flex w-80 bg-slate-800 flex-col border-r border-slate-700">
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-white font-semibold text-lg">Block Palette</h2>
          <p className="text-slate-400 text-xs mt-1">Drag blocks to build your game</p>
        </div>
        
        <BlockPalettePanel 
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </div>

      {/* Center Area - Canvas + Workspace */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Toolbar */}
        <div className="h-14 bg-white/80 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-sm font-semibold text-slate-900">Platformer Game</h1>
              <p className="text-xs text-slate-500">Step {lessonProgress} of {lessonSteps.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
            
            <Button
              onClick={handleRun}
              size="sm"
              className={`gap-2 ${isRunning 
                ? 'bg-rose-500 hover:bg-rose-600' 
                : 'bg-emerald-500 hover:bg-emerald-600'} text-white`}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span className="hidden sm:inline">{isRunning ? 'Stop' : 'Run'}</span>
            </Button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Canvas Area */}
          <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 via-white to-indigo-50/20">
            <div className="flex flex-col items-center gap-6 w-full max-w-md">
              {/* Lesson Step Card */}
              <div className="w-full bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl p-4 shadow-lg">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    completedSteps.includes(currentStep.id)
                      ? 'bg-emerald-500'
                      : 'bg-indigo-500'
                  }`}>
                    {completedSteps.includes(currentStep.id) ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : (
                      <Sparkles className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">{currentStep.title}</h3>
                    <p className="text-sm text-slate-600">{currentStep.description}</p>
                    {!completedSteps.includes(currentStep.id) && (
                      <button
                        onClick={() => handleStepComplete(currentStep.id)}
                        className="mt-3 text-xs font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        Mark as Complete →
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile Canvas */}
              <MobileCanvas isRunning={isRunning} onShare={handleShare} />
            </div>
          </div>

          {/* Right Panel - Block Workspace */}
          <div className="hidden xl:flex w-96 bg-white border-l border-slate-200 flex-col">
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900">Code Workspace</h3>
              <p className="text-xs text-slate-500 mt-1">Build your game logic here</p>
            </div>

            <div className="flex-1 overflow-auto p-4">
              {/* Block workspace placeholder */}
              <div className="space-y-2">
                {/* Sample blocks for demo */}
                <div className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm">
                  when ▶ clicked
                </div>
                
                <div className="ml-4 space-y-1">
                  <div className="bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm shadow-sm">
                    move 10 steps
                  </div>
                  <div className="bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm shadow-sm">
                    turn ↻ 15 degrees
                  </div>
                </div>

                <div className="mt-4 p-4 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300 text-center text-slate-400 text-sm">
                  Drag blocks here to start coding
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Asset Drawer (Mobile) */}
        {showAssets && (
          <AssetDrawer onClose={() => setShowAssets(false)} />
        )}
      </div>

      {/* QR Share Modal */}
      {showShareModal && (
        <QRShareModal onClose={() => setShowShareModal(false)} />
      )}
    </div>
  );
}