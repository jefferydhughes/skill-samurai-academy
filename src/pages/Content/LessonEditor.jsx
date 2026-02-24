import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft,
  Plus,
  Save,
  Rocket
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import StepsList from '@/components/lesson-authoring/StepsList';
import StepEditor from '@/components/lesson-authoring/StepEditor';

const defaultLesson = {
  title: 'New Lesson',
  worldTemplateId: '',
  ageRange: { min: 8, max: 12 },
  difficulty: 'beginner',
  estimatedMinutes: 15,
  learningObjectives: [],
  steps: [],
  status: 'draft'
};

export default function LessonEditor() {
  const urlParams = new URLSearchParams(window.location.search);
  const lessonId = urlParams.get('lessonId');
  const mode = urlParams.get('mode');
  
  const [lesson, setLesson] = useState(defaultLesson);
  const [selectedStepIndex, setSelectedStepIndex] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: existingLesson } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      const lessons = await api.entities.Lesson.filter({ id: lessonId });
      return lessons[0];
    },
    enabled: !!lessonId && mode !== 'create',
  });

  const { data: worldTemplates = [] } = useQuery({
    queryKey: ['worldTemplates'],
    queryFn: () => api.entities.WorldTemplate.filter({ status: 'published' }),
  });

  useEffect(() => {
    if (existingLesson) {
      setLesson(existingLesson);
    }
  }, [existingLesson]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (lessonId && mode !== 'create') {
        return api.entities.Lesson.update(lessonId, data);
      } else {
        return api.entities.Lesson.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['lessons']);
      setHasChanges(false);
    }
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      const data = { ...lesson, status: 'published' };
      if (lessonId && mode !== 'create') {
        return api.entities.Lesson.update(lessonId, data);
      } else {
        return api.entities.Lesson.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['lessons']);
      navigate(createPageUrl('LessonsManager'));
    }
  });

  const updateLesson = (updates) => {
    setLesson(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  const updateStep = (stepIndex, updates) => {
    const newSteps = [...lesson.steps];
    newSteps[stepIndex] = { ...newSteps[stepIndex], ...updates };
    updateLesson({ steps: newSteps });
  };

  const addStep = () => {
    const newStep = {
      id: `step_${Date.now()}`,
      type: 'instruction',
      title: `Step ${lesson.steps.length + 1}`,
      instruction: '',
      completion: {
        mode: 'all',
        validators: []
      },
      hints: []
    };
    updateLesson({ steps: [...lesson.steps, newStep] });
    setSelectedStepIndex(lesson.steps.length);
  };

  const deleteStep = (index) => {
    const newSteps = lesson.steps.filter((_, i) => i !== index);
    updateLesson({ steps: newSteps });
    if (selectedStepIndex >= newSteps.length) {
      setSelectedStepIndex(Math.max(0, newSteps.length - 1));
    }
  };

  const reorderSteps = (fromIndex, toIndex) => {
    const newSteps = [...lesson.steps];
    const [moved] = newSteps.splice(fromIndex, 1);
    newSteps.splice(toIndex, 0, moved);
    updateLesson({ steps: newSteps });
  };

  const handleSave = () => {
    saveMutation.mutate(lesson);
  };

  const handlePublish = () => {
    publishMutation.mutate();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-slate-200 bg-white">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" asChild>
                <Link to={createPageUrl('LessonsManager')}>
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </Button>
              <div className="flex items-center gap-3">
                <Input
                  value={lesson.title}
                  onChange={(e) => updateLesson({ title: e.target.value })}
                  className="text-lg font-semibold border-0 shadow-none px-0 focus-visible:ring-0"
                />
                <Badge className={lesson.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                  {lesson.status || 'draft'}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {hasChanges && (
                <span className="text-xs text-amber-600">Unsaved changes</span>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSave}
                disabled={saveMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button 
                size="sm"
                onClick={handlePublish}
                disabled={publishMutation.isPending || lesson.steps.length === 0}
                className="bg-green-600 hover:bg-green-700"
              >
                <Rocket className="w-4 h-4 mr-2" />
                Publish
              </Button>
            </div>
          </div>

          {/* Metadata Row */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Label className="text-slate-500">World:</Label>
              <Select 
                value={lesson.worldTemplateId} 
                onValueChange={(value) => updateLesson({ worldTemplateId: value })}
                disabled={lesson.status === 'published'}
              >
                <SelectTrigger className="h-8 w-48">
                  <SelectValue placeholder="Select world" />
                </SelectTrigger>
                <SelectContent>
                  {worldTemplates.map(world => (
                    <SelectItem key={world.id} value={world.id}>
                      {world.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-slate-500">Difficulty:</Label>
              <Select 
                value={lesson.difficulty} 
                onValueChange={(value) => updateLesson({ difficulty: value })}
              >
                <SelectTrigger className="h-8 w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-slate-500">Time:</Label>
              <Input
                type="number"
                value={lesson.estimatedMinutes}
                onChange={(e) => updateLesson({ estimatedMinutes: parseInt(e.target.value) })}
                className="h-8 w-20"
                min="1"
              />
              <span className="text-slate-500">min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Steps List */}
        <StepsList
          steps={lesson.steps}
          selectedIndex={selectedStepIndex}
          onSelectStep={setSelectedStepIndex}
          onAddStep={addStep}
          onDeleteStep={deleteStep}
          onReorderSteps={reorderSteps}
        />

        {/* Step Editor */}
        {lesson.steps.length > 0 && selectedStepIndex < lesson.steps.length ? (
          <StepEditor
            step={lesson.steps[selectedStepIndex]}
            stepIndex={selectedStepIndex}
            onUpdateStep={(updates) => updateStep(selectedStepIndex, updates)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-50 text-slate-400">
            <div className="text-center">
              <Plus className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-sm">Add a step to get started</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}