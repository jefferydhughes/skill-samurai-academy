import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import CodeEditor from '@/components/epic-editor/CodeEditor';
import CodeToolbar from '@/components/epic-editor/CodeToolbar';
import VoxelWorldView from '@/components/block-editor/VoxelWorldView';
import LessonPanel from '@/components/block-editor/LessonPanel';
import AchievementModal from '@/components/block-editor/AchievementModal';
import confetti from 'canvas-confetti';
import { parseEpicCode, validateAST, compileToOpcodes } from '@/components/epic-editor/EpicParser';

export default function EpicModeEditor() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const urlParams = new URLSearchParams(window.location.search);
  const lessonId = urlParams.get('lessonId');
  const projectId = urlParams.get('projectId');
  const studentId = urlParams.get('studentId');

  const [user, setUser] = useState(null);
  const [code, setCode] = useState(`// Epic Mode - Text-based coding
when play clicked
  repeat 3 times
    move forward
    place grass block
  end
end`);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showLessonPanel, setShowLessonPanel] = useState(true);
  const [showAchievement, setShowAchievement] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [ast, setAst] = useState(null);
  const [opcodes, setOpcodes] = useState([]);
  const [parseError, setParseError] = useState(null);

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
    queryFn: () => api.entities.Lesson.filter({ id: lessonId })[0],
    enabled: !!lessonId,
  });

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => api.entities.Project.filter({ id: projectId })[0],
    enabled: !!projectId,
  });

  useEffect(() => {
    if (project?.ast) {
      // Convert AST to text code (simplified for demo)
      setCode(project.ast.code || code);
    }
  }, [project]);

  const saveProjectMutation = useMutation({
    mutationFn: async (data) => {
      if (projectId) {
        return api.entities.Project.update(projectId, data);
      } else {
        return api.entities.Project.create({
          studentId,
          lessonId,
          mode: 'epic',
          ast: { code: data.code },
          ...data
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project'] });
    },
  });

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    
    try {
      const parsedAST = parseEpicCode(newCode);
      const validation = validateAST(parsedAST);
      
      if (validation.valid) {
        setAst(parsedAST);
        const compiledOpcodes = compileToOpcodes(parsedAST);
        setOpcodes(compiledOpcodes);
        setParseError(null);
      } else {
        setParseError(validation.errors.join(', '));
      }
    } catch (error) {
      setParseError(error.message);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    await saveProjectMutation.mutateAsync({ 
      mode: 'epic',
      ast,
      blockWorkspace: null
    });
    setTimeout(() => setIsSaving(false), 1000);
  };

  const handlePlay = () => {
    if (!ast || parseError) {
      alert('Fix code errors before running');
      return;
    }
    
    setIsPlaying(true);
    console.log('Executing opcodes:', opcodes);
    
    // Simulate execution with the compiled opcodes
    setTimeout(() => {
      setIsPlaying(false);
      // Check step completion based on AST
      const hasRepeat = ast.scripts.some(s => 
        s.children?.some(c => c.type === 'control' && c.control === 'repeat')
      );
      const hasPlace = ast.scripts.some(s =>
        JSON.stringify(s).includes('place_block')
      );
      
      if (hasRepeat && hasPlace) {
        confetti({ particleCount: 50, spread: 60 });
      }
    }, 2000);
  };

  const handleStop = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setCode(`// Epic Mode - Text-based coding
when play clicked
  repeat 3 times
    move forward
    place grass block
  end
end`);
  };

  const handleToggleMode = () => {
    // Switch to block mode
    const params = new URLSearchParams();
    if (lessonId) params.append('lessonId', lessonId);
    if (studentId) params.append('studentId', studentId);
    if (projectId) params.append('projectId', projectId);
    navigate(`${createPageUrl('StudentBlockEditor')}?${params.toString()}`);
  };

  const handleNextStep = () => {
    if (lesson?.steps && currentStepIndex < lesson.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      confetti({ particleCount: 30, spread: 50 });
    } else {
      setShowAchievement(true);
    }
  };

  const currentStep = lesson?.steps?.[currentStepIndex];
  const isStepComplete = code.includes('repeat') && code.includes('place');

  return (
    <div className="h-screen flex flex-col bg-slate-950">
      {/* Top Bar */}
      <div className="h-14 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(createPageUrl('LearningWorlds'))}
            className="text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-sm font-semibold text-white">
              {lesson?.title || 'Epic Mode Editor'}
            </h1>
            {lesson && (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Step {currentStepIndex + 1} of {lesson.steps?.length || 0}</span>
                <Progress 
                  value={((currentStepIndex + 1) / (lesson.steps?.length || 1)) * 100} 
                  className="w-24 h-1"
                />
              </div>
            )}
          </div>
        </div>

        <Button
          onClick={() => setShowLessonPanel(!showLessonPanel)}
          variant="ghost"
          size="sm"
          className="text-slate-300 hover:bg-slate-800"
        >
          <Target className="w-4 h-4 mr-2" />
          {showLessonPanel ? 'Hide' : 'Show'} Instructions
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Lesson Panel */}
        {showLessonPanel && currentStep && (
          <div className="w-80 border-r border-slate-800 bg-slate-900 flex-shrink-0 overflow-auto">
            <LessonPanel
              step={currentStep}
              stepIndex={currentStepIndex}
              totalSteps={lesson?.steps?.length || 0}
              isComplete={isStepComplete}
              onNext={handleNextStep}
              onClose={() => setShowLessonPanel(false)}
            />
          </div>
        )}

        {/* Code Editor */}
        <div className="flex-1 flex flex-col">
          <CodeToolbar
            isPlaying={isPlaying}
            onPlay={handlePlay}
            onStop={handleStop}
            onReset={handleReset}
            onToggleMode={handleToggleMode}
            mode="epic"
            onSave={handleSave}
            isSaving={isSaving}
          />
          
          <div className="flex-1 p-4 overflow-auto">
            <CodeEditor
              code={code}
              onChange={handleCodeChange}
              isPlaying={isPlaying}
            />
            
            {parseError && (
              <div className="mx-4 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <span className="font-semibold">Parse Error:</span> {parseError}
              </div>
            )}
            
            {ast && !parseError && (
              <div className="mx-4 mt-2 p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700">
                <span className="font-semibold">✓ AST Valid</span> · {opcodes.length} opcodes generated
              </div>
            )}
          </div>
        </div>

        {/* 3D World View */}
        <div className="w-1/2 border-l border-slate-800 bg-slate-950 flex-shrink-0">
          <VoxelWorldView isPlaying={isPlaying} />
        </div>
      </div>

      {/* Achievement Modal */}
      <AchievementModal
        open={showAchievement}
        onClose={() => setShowAchievement(false)}
        lesson={lesson}
      />
    </div>
  );
}