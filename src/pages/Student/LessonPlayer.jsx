import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Check,
  Lightbulb,
  BookOpen,
  Trophy,
  Play,
  RotateCcw,
  Maximize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import SessionAssessmentModal from '../../components/ai-assessment/SessionAssessmentModal';
import GuidedProjectBuilder from '../../components/guided-project/GuidedProjectBuilder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import LiveTuningOverlay from '@/components/live-tuning/LiveTuningOverlay';
import { getDefaultValues } from '@/components/live-tuning/tunablesConfig';
import toast from 'react-hot-toast';

export default function LessonPlayer() {
  const [showHint, setShowHint] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [showLiveTuning, setShowLiveTuning] = useState(false);
  const [worldTunables, setWorldTunables] = useState(getDefaultValues());
  const [showSessionAssessment, setShowSessionAssessment] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const queryClient = useQueryClient();

  const urlParams = new URLSearchParams(window.location.search);
  const lessonId = urlParams.get('lessonId');
  const projectId = urlParams.get('projectId');
  const studentId = urlParams.get('studentId');
  const isGuidedProject = urlParams.get('guided') === 'true';

  useEffect(() => {
    window.setCompanionSessionId = (id) => setSessionId(id);
    return () => {
      delete window.setCompanionSessionId;
    };
  }, []);

  const [user, setUser] = useState(null);
  useEffect(() => {
    api.auth.me().then(setUser).catch(() => {});
  }, []);

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
      if (projectId) {
        const projects = await api.entities.Project.filter({ id: projectId });
        return projects[0];
      }
      return null;
    },
    enabled: !!projectId,
  });

  const { data: progress, refetch: refetchProgress } = useQuery({
    queryKey: ['lessonProgress', lessonId, studentId],
    queryFn: async () => {
      const progressList = await api.entities.LessonProgress.filter({ 
        lessonId, 
        studentId 
      });
      return progressList[0] || null;
    },
    enabled: !!lessonId && !!studentId,
  });

  const currentStepIndex = progress?.currentStepIndex || 0;
  const currentStep = lesson?.steps?.[currentStepIndex];
  const totalSteps = lesson?.steps?.length || 0;
  const progressPercent = totalSteps > 0 ? ((currentStepIndex + 1) / totalSteps) * 100 : 0;

  const updateProgressMutation = useMutation({
    mutationFn: async (newIndex) => {
      const completedSteps = lesson.steps.slice(0, newIndex).map(s => s.id);
      const isComplete = newIndex >= totalSteps;

      if (progress) {
        await api.entities.LessonProgress.update(progress.id, {
          currentStepIndex: Math.min(newIndex, totalSteps - 1),
          completedSteps,
          completed: isComplete,
          totalSteps,
          ...(isComplete ? { completedAt: new Date().toISOString() } : {})
        });
      } else {
        await api.entities.LessonProgress.create({
          studentId,
          lessonId,
          currentStepIndex: Math.min(newIndex, totalSteps - 1),
          completedSteps,
          completed: isComplete,
          totalSteps,
          ...(isComplete ? { completedAt: new Date().toISOString() } : {})
        });
      }

      if (isComplete) {
        setShowComplete(true);
        setTimeout(() => {
          setShowSessionAssessment(true);
        }, 2000);
      }
    },
    onSuccess: () => {
      refetchProgress();
      queryClient.invalidateQueries(['progress']);
    }
  });

  const goToStep = (index) => {
    if (index >= 0 && index < totalSteps) {
      updateProgressMutation.mutate(index);
    }
  };

  const completeCurrentStep = () => {
    updateProgressMutation.mutate(currentStepIndex + 1);
  };

  const handleApplyTunables = (patch) => {
    setWorldTunables({ ...worldTunables, ...patch });
    toast.success('Changes applied to the world!');
    console.log('World tunables updated:', { ...worldTunables, ...patch });
  };

  const handleOpenLiveTuning = () => {
    setShowLiveTuning(true);
  };

  if (!lessonId || !studentId) {
    return (
      <div className="text-center py-16">
        <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-700">Invalid lesson link</h2>
        <Button asChild className="mt-4">
          <Link to={createPageUrl('LearningWorlds')}>Back to Learning</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          asChild 
          className="text-slate-600 hover:text-slate-900"
        >
          <Link to={createPageUrl('LearningWorlds')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Lessons
          </Link>
        </Button>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500">
            <span>Step {currentStepIndex + 1} of {totalSteps}</span>
          </div>
          <div className="w-32">
            <Progress value={progressPercent} className="h-2" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Lesson Instructions */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <Badge className="w-fit bg-indigo-100 text-indigo-700 mb-2">
                {lesson?.difficulty || 'beginner'}
              </Badge>
              <CardTitle className="text-xl">{lesson?.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {lesson?.learningObjectives?.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-slate-500 mb-2">What you'll learn:</h4>
                  <ul className="space-y-1 text-sm text-slate-600">
                    {lesson.learningObjectives.map((obj, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {obj}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current Step */}
          <AnimatePresence mode="wait">
            {currentStep && (
              <motion.div
                key={currentStepIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <Card className="border-0 shadow-lg border-l-4 border-l-indigo-500">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm flex-shrink-0">
                        {currentStepIndex + 1}
                      </div>
                      <h3 className="font-semibold text-lg text-slate-900">
                        {currentStep.title || `Step ${currentStepIndex + 1}`}
                      </h3>
                    </div>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      {currentStep.instruction}
                    </p>
                    
                    {currentStep.hint && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowHint(!showHint)}
                        className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                      >
                        <Lightbulb className="w-4 h-4 mr-2" />
                        {showHint ? 'Hide Hint' : 'Need a hint?'}
                      </Button>
                    )}
                    
                    <AnimatePresence>
                      {showHint && currentStep.hint && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 p-3 bg-amber-50 rounded-lg text-amber-800 text-sm"
                        >
                          💡 {currentStep.hint}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={() => goToStep(currentStepIndex - 1)}
              disabled={currentStepIndex === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            
            {currentStepIndex < totalSteps - 1 ? (
              <Button
                onClick={completeCurrentStep}
                className="bg-indigo-600 hover:bg-indigo-700 flex-1"
              >
                Complete Step
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={completeCurrentStep}
                className="bg-green-600 hover:bg-green-700 flex-1"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Finish Lesson
              </Button>
            )}
          </div>

          {/* Steps Progress */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <h4 className="text-sm font-medium text-slate-500 mb-3">Lesson Progress</h4>
              <div className="flex flex-wrap gap-2">
                {lesson?.steps?.map((step, index) => (
                  <button
                    key={step.id || index}
                    onClick={() => goToStep(index)}
                    className={`w-8 h-8 rounded-full text-sm font-medium transition-all
                      ${index < currentStepIndex 
                        ? 'bg-green-500 text-white' 
                        : index === currentStepIndex 
                          ? 'bg-indigo-600 text-white ring-2 ring-indigo-300' 
                          : 'bg-slate-100 text-slate-400'
                      }`}
                  >
                    {index < currentStepIndex ? <Check className="w-4 h-4 mx-auto" /> : index + 1}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Voxel World Placeholder */}
        <Card className="lg:col-span-2 border-0 shadow-lg overflow-hidden">
          <div className="aspect-[16/10] bg-gradient-to-br from-slate-800 to-slate-900 relative">
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <div className="w-24 h-24 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-lg animate-pulse" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Voxel World</h3>
              <p className="text-slate-400 text-sm text-center max-w-md px-4">
                The 3D voxel coding environment loads here. 
                This is rendered by the external voxel engine, not Base44.
              </p>
              <div className="flex gap-3 mt-6">
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <Play className="w-4 h-4 mr-2" />
                  Run Code
                </Button>
                <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleOpenLiveTuning}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  🧠 Edit Rules
                </Button>
                <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Decorative voxel blocks */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900/80 to-transparent" />
            <div className="absolute bottom-4 left-4 flex gap-1">
              {[...Array(8)].map((_, i) => (
                <div 
                  key={i}
                  className="w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded-sm opacity-60"
                  style={{ marginTop: `${Math.sin(i) * 10}px` }}
                />
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Live Tuning Overlay */}
      <LiveTuningOverlay
        open={showLiveTuning}
        onClose={() => setShowLiveTuning(false)}
        onApply={handleApplyTunables}
      />

      {/* Completion Dialog */}
      <Dialog open={showComplete} onOpenChange={setShowComplete}>
        <DialogContent className="text-center">
          <div className="py-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <DialogTitle className="text-2xl mb-2">🎉 Lesson Complete!</DialogTitle>
            <p className="text-slate-600 mb-6">
              Great job! You've finished "{lesson?.title}". Ready for your next adventure?
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="outline">
                <Link to={createPageUrl('LearningWorlds')}>Back to Lessons</Link>
              </Button>
              <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
                <Link to={createPageUrl('LearningWorlds')}>Next Lesson</Link>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Session Assessment Modal */}
      {showSessionAssessment && sessionId && (
        <SessionAssessmentModal
          open={showSessionAssessment}
          onClose={() => setShowSessionAssessment(false)}
          sessionId={sessionId}
          studentId={studentId}
          onComplete={() => setShowSessionAssessment(false)}
        />
      )}

      {/* Guided Project Builder */}
      {isGuidedProject && project?.runtimeSettings?.templateId && (
        <div className="fixed right-4 top-20 w-80 max-h-[calc(100vh-6rem)] overflow-auto z-30">
          <GuidedProjectBuilder
            templateId={project.runtimeSettings.templateId}
            projectId={project.id}
            studentId={studentId}
            onMilestoneComplete={(index) => {
              console.log('Milestone completed:', index);
            }}
          />
        </div>
      )}
    </div>
  );
}