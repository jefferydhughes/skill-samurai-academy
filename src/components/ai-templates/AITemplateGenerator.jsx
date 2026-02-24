import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Lightbulb, Target } from 'lucide-react';
import { api } from '@/api/apiClient';
import { buildCompanionContext } from '../companion/learningContextManager';

export default function AITemplateGenerator({ studentId, onTemplateCreated }) {
  const [loading, setLoading] = useState(false);
  const [idea, setIdea] = useState('');
  const [generated, setGenerated] = useState(null);

  const generateTemplate = async () => {
    if (!idea.trim()) return;
    setLoading(true);

    try {
      // Get student context
      const student = await api.entities.StudentProfile.filter({ id: studentId });
      const studentProfile = student[0];
      const learningContext = await buildCompanionContext(studentId, 'explore', null);

      const prompt = `Generate a coding project template for a student learning to code in a 3D voxel game world.

STUDENT PROFILE:
- Age: ${studentProfile?.age || 10}
- Learning Goals: ${studentProfile?.learningGoals?.join(', ') || 'exploring coding'}
- Strengths: ${studentProfile?.strengths?.join(', ') || 'developing'}
- Mastered Concepts: ${learningContext.summary.masteredConcepts.join(', ') || 'basics'}
- Currently Practicing: ${learningContext.summary.conceptsInProgress.join(', ') || 'fundamentals'}

STUDENT'S PROJECT IDEA:
"${idea}"

Generate a structured project template that:
1. Matches their skill level and builds on mastered concepts
2. Introduces 1-2 new concepts from what they're currently practicing
3. Breaks the project into 3-5 achievable milestones
4. Includes starter code with TODOs and helpful comments
5. Provides hints for each milestone

Return detailed project template with milestones and starter code structure.`;

      const response = await api.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            difficulty: { 
              type: 'string',
              enum: ['beginner', 'intermediate', 'advanced']
            },
            requiredConcepts: {
              type: 'array',
              items: { type: 'string' }
            },
            estimatedMinutes: { type: 'number' },
            milestones: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  hints: {
                    type: 'array',
                    items: { type: 'string' }
                  }
                }
              }
            },
            starterCodeSummary: { type: 'string' }
          }
        }
      });

      // Create starter code structure
      const starterCode = {
        blocks: [
          {
            type: 'event',
            name: 'when_game_starts',
            children: [
              { type: 'comment', text: 'TODO: Initialize your project here' }
            ]
          }
        ]
      };

      setGenerated({ ...response, starterCode });
    } catch (e) {
      console.error('Failed to generate template:', e);
    } finally {
      setLoading(false);
    }
  };

  const saveTemplate = async () => {
    if (!generated) return;

    try {
      const template = await api.entities.ProjectTemplate.create({
        studentId,
        title: generated.title,
        description: generated.description,
        difficulty: generated.difficulty,
        requiredConcepts: generated.requiredConcepts,
        starterCode: generated.starterCode,
        milestones: generated.milestones,
        estimatedMinutes: generated.estimatedMinutes,
        generatedBy: 'ai',
        basedOnGoals: [idea],
        status: 'ready'
      });

      if (onTemplateCreated) onTemplateCreated(template);
      setIdea('');
      setGenerated(null);
    } catch (e) {
      console.error('Failed to save template:', e);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <CardTitle>AI Project Generator</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="idea">What do you want to build?</Label>
            <Textarea
              id="idea"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="E.g., A maze game where you collect coins, or a town builder with moving NPCs..."
              className="h-24"
              disabled={loading}
            />
          </div>

          <Button
            onClick={generateTemplate}
            disabled={loading || !idea.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Project...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Project Template
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generated && (
        <Card className="border-2 border-indigo-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{generated.title}</span>
              <Badge className="bg-indigo-100 text-indigo-700">
                {generated.difficulty}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-600">{generated.description}</p>

            <div>
              <div className="flex items-center gap-2 text-sm font-medium mb-2">
                <Target className="w-4 h-4" />
                Required Concepts
              </div>
              <div className="flex flex-wrap gap-2">
                {generated.requiredConcepts.map((concept, i) => (
                  <Badge key={i} variant="secondary">
                    {concept}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm font-medium mb-2">
                <Lightbulb className="w-4 h-4" />
                Project Milestones ({generated.milestones.length})
              </div>
              <div className="space-y-2">
                {generated.milestones.map((milestone, i) => (
                  <div key={i} className="bg-slate-50 rounded-lg p-3">
                    <div className="font-medium text-sm">
                      {i + 1}. {milestone.title}
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      {milestone.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-sm text-slate-600">
              ⏱️ Estimated time: {generated.estimatedMinutes} minutes
            </div>

            <Button
              onClick={saveTemplate}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Start This Project
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}