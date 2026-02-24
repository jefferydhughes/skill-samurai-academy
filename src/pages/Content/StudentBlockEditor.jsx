import React, { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Home, Settings, RotateCcw, Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BlockPalette from '@/components/block-editor/BlockPalette';
import BlockWorkspace from '@/components/block-editor/BlockWorkspace';
import VoxelWorldView from '@/components/block-editor/VoxelWorldView';
import LessonPanel from '@/components/block-editor/LessonPanel';
import AchievementModal from '@/components/block-editor/AchievementModal';
import confetti from 'canvas-confetti';

export default function StudentBlockEditor() {
  const urlParams = new URLSearchParams(window.location.search);
  const lessonId = urlParams.get('lessonId');
  const projectId = urlParams.get('projectId');
  
  const [user, setUser] = useState(null);
  const [scripts, setScripts] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [lessonPanelOpen, setLessonPanelOpen] = useState(true);
  const [achievementOpen, setAchievementOpen] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await api.auth.me();
      setUser(userData);
    } catch (e) {
      api.auth.redirectToLogin();
    }
  };

  const { data: lesson } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      const lessons = await api.entities.Lesson.filter({ id: lessonId });
      return lessons[0];
    },
    enabled: !!lessonId,
  });

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const projects = await api.entities.Project.filter({ id: projectId });
      return projects[0];
    },
    enabled: !!projectId,
  });

  useEffect(() => {
    if (project?.blockWorkspace) {
      setScripts(project.blockWorkspace.scripts || []);
    }
  }, [project]);

  const handlePlay = () => {
    setIsPlaying(true);
    // Execute block scripts (simulated for now)
    setTimeout(() => {
      setIsPlaying(false);
      checkStepCompletion();
    }, 1000);
  };

  const handleStop = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setScripts([]);
    setIsPlaying(false);
  };

  const checkStepCompletion = () => {
    const currentStep = lesson?.steps?.[currentStepIndex];
    if (!currentStep) return;

    // Simulate step validation
    const isComplete = true; // Replace with actual validation logic
    
    if (isComplete && !completedSteps.includes(currentStepIndex)) {
      setCompletedSteps([...completedSteps, currentStepIndex]);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
      
      // Check if lesson complete
      if (currentStepIndex === (lesson?.steps?.length || 0) - 1) {
        setTimeout(() => setAchievementOpen(true), 500);
      }
    }
  };

  const handleNextStep = () => {
    if (currentStepIndex < (lesson?.steps?.length || 0) - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const currentStep = lesson?.steps?.[currentStepIndex];

  return (
    <div className="h-screen flex flex-col bg-[#F6F7F9]">
      {/* Top Game Bar */}
      <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-slate-600">
            <Home className="w-5 h-5" />
          </Button>
          <span className="text-sm font-semibold text-slate-900">
            {lesson?.title || 'Block Editor'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {!isPlaying ? (
            <Button 
              onClick={handlePlay}
              size="lg"
              className="bg-green-500 hover:bg-green-600 text-white rounded-full h-12 px-8 shadow-lg hover:shadow-xl transition-all"
            >
              <Play className="w-5 h-5 mr-2 fill-white" />
              Play
            </Button>
          ) : (
            <Button 
              onClick={handleStop}
              size="lg"
              variant="destructive"
              className="rounded-full h-12 px-8"
            >
              <Square className="w-5 h-5 mr-2" />
              Stop
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleReset} className="text-slate-600">
            <RotateCcw className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-slate-600">
            <Settings className="w-5 h-5" />
          </Button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-semibold">
            {user?.full_name?.[0]?.toUpperCase() || 'S'}
          </div>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Block Palette */}
        <BlockPalette onBlockAdd={(block) => setScripts([...scripts, block])} />

        {/* World View + Workspace */}
        <div className="flex-1 flex flex-col">
          {/* 3D Voxel World */}
          <div className="flex-1 bg-gradient-to-b from-sky-200 to-sky-100">
            <VoxelWorldView isPlaying={isPlaying} />
          </div>

          {/* Code Workspace */}
          <div className="h-80 bg-white border-t-2 border-slate-200">
            <BlockWorkspace 
              scripts={scripts} 
              onChange={setScripts}
              isPlaying={isPlaying}
            />
          </div>
        </div>

        {/* Lesson Panel */}
        {lessonPanelOpen && currentStep && (
          <LessonPanel
            step={currentStep}
            stepIndex={currentStepIndex}
            totalSteps={lesson?.steps?.length || 0}
            isComplete={completedSteps.includes(currentStepIndex)}
            onNext={handleNextStep}
            onClose={() => setLessonPanelOpen(false)}
          />
        )}
      </div>

      {/* Achievement Modal */}
      <AchievementModal
        open={achievementOpen}
        onClose={() => setAchievementOpen(false)}
        lesson={lesson}
      />
    </div>
  );
}