import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  Circle, 
  Lightbulb, 
  Sparkles,
  MessageSquare,
  ChevronRight
} from 'lucide-react';
import { api } from '@/api/apiClient';
import { motion } from 'framer-motion';

export default function GuidedProjectBuilder({ 
  templateId, 
  projectId,
  studentId,
  onMilestoneComplete 
}) {
  const [template, setTemplate] = useState(null);
  const [currentMilestone, setCurrentMilestone] = useState(0);
  const [completedMilestones, setCompletedMilestones] = useState([]);
  const [showHints, setShowHints] = useState(false);
  const [aiGuidance, setAiGuidance] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTemplate();
  }, [templateId]);

  const loadTemplate = async () => {
    try {
      const templates = await api.entities.ProjectTemplate.filter({ id: templateId });
      setTemplate(templates[0]);
    } catch (e) {
      console.error('Failed to load template:', e);
    }
  };

  const getAIGuidance = async (milestone) => {
    setLoading(true);
    try {
      const prompt = `You're guiding a student through a coding project milestone.

MILESTONE: ${milestone.title}
DESCRIPTION: ${milestone.description}
AVAILABLE HINTS: ${milestone.hints?.join(', ') || 'none'}

The student is working on this milestone. Provide encouraging guidance that:
1. Breaks down the milestone into 2-3 specific mini-steps
2. Asks a question to check their understanding
3. Encourages experimentation
4. Doesn't give away the full solution

Keep it SHORT (2-3 sentences max) and age-appropriate.`;

      const response = await api.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            guidance: { type: 'string' },
            miniSteps: {
              type: 'array',
              items: { type: 'string' }
            },
            checkQuestion: { type: 'string' }
          }
        }
      });

      setAiGuidance(response);
    } catch (e) {
      console.error('Failed to get AI guidance:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleMilestoneComplete = async () => {
    const newCompleted = [...completedMilestones, currentMilestone];
    setCompletedMilestones(newCompleted);

    // Track progress
    try {
      const project = await api.entities.Project.filter({ id: projectId });
      if (project[0]) {
        await api.entities.Project.update(projectId, {
          runtimeSettings: {
            ...project[0].runtimeSettings,
            completedMilestones: newCompleted,
            currentMilestone: currentMilestone + 1
          }
        });
      }
    } catch (e) {
      console.warn('Failed to save progress:', e);
    }

    if (onMilestoneComplete) {
      onMilestoneComplete(currentMilestone);
    }

    // Move to next milestone
    if (currentMilestone < template.milestones.length - 1) {
      setCurrentMilestone(currentMilestone + 1);
      setShowHints(false);
      setAiGuidance(null);
    }
  };

  if (!template) return null;

  const milestone = template.milestones[currentMilestone];
  const progress = (completedMilestones.length / template.milestones.length) * 100;

  return (
    <div className="space-y-4">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="text-lg">{template.title}</span>
            <Badge variant="secondary">
              {completedMilestones.length} / {template.milestones.length} Complete
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Milestone List */}
      <div className="space-y-2">
        {template.milestones.map((m, index) => {
          const isCompleted = completedMilestones.includes(index);
          const isCurrent = index === currentMilestone;
          const isLocked = index > currentMilestone;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={`cursor-pointer transition-all ${
                  isCurrent
                    ? 'border-2 border-indigo-500 shadow-lg'
                    : isCompleted
                    ? 'border-green-200 bg-green-50'
                    : 'border-slate-200 opacity-60'
                }`}
                onClick={() => !isLocked && setCurrentMilestone(index)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <Circle className={`w-5 h-5 ${isCurrent ? 'text-indigo-600' : 'text-slate-400'}`} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{m.title}</div>
                      {isCurrent && (
                        <div className="text-xs text-slate-600 mt-1">{m.description}</div>
                      )}
                    </div>
                    {isCurrent && (
                      <ChevronRight className="w-5 h-5 text-indigo-600" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Current Milestone Details */}
      {milestone && (
        <Card className="border-2 border-indigo-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              Current Milestone
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">{milestone.title}</h3>
              <p className="text-sm text-slate-600">{milestone.description}</p>
            </div>

            {/* AI Guidance */}
            {aiGuidance && (
              <div className="bg-indigo-50 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-600 mt-0.5" />
                  <p className="text-sm text-slate-700">{aiGuidance.guidance}</p>
                </div>
                
                {aiGuidance.miniSteps?.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-indigo-700 mb-2">Try these steps:</div>
                    <ol className="list-decimal list-inside space-y-1 text-xs text-slate-600">
                      {aiGuidance.miniSteps.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {aiGuidance.checkQuestion && (
                  <div className="text-xs italic text-indigo-600">
                    💭 {aiGuidance.checkQuestion}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => getAIGuidance(milestone)}
                disabled={loading}
                className="flex-1"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {loading ? 'Thinking...' : 'Get AI Help'}
              </Button>
              
              {milestone.hints?.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHints(!showHints)}
                  className="flex-1"
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  {showHints ? 'Hide' : 'Show'} Hints
                </Button>
              )}
            </div>

            {/* Hints */}
            {showHints && milestone.hints?.length > 0 && (
              <div className="bg-amber-50 rounded-lg p-4 space-y-2">
                <div className="text-xs font-medium text-amber-700">💡 Hints:</div>
                {milestone.hints.map((hint, i) => (
                  <div key={i} className="text-sm text-slate-700">
                    {i + 1}. {hint}
                  </div>
                ))}
              </div>
            )}

            <Button
              onClick={handleMilestoneComplete}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Mark Complete
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}