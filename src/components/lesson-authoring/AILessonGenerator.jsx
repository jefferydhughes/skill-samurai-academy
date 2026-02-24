import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Loader2 } from 'lucide-react';
import { api } from '@/api/apiClient';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AILessonGenerator({ open, onClose, onLessonGenerated }) {
  const [topic, setTopic] = useState('');
  const [ageGroup, setAgeGroup] = useState('8-10');
  const [difficulty, setDifficulty] = useState('beginner');
  const [additionalContext, setAdditionalContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    try {
      const prompt = `You are an expert educator creating coding lessons for children aged ${ageGroup}.

Create a complete lesson about: "${topic}"

Difficulty Level: ${difficulty}
${additionalContext ? `Additional Context: ${additionalContext}` : ''}

The lesson should:
1. Teach core programming concepts through voxel world manipulation
2. Include 4-6 progressive steps that build on each other
3. Use age-appropriate language and clear instructions
4. Include hints for each step
5. Suggest Live Tuning parameters if the lesson involves physics or game mechanics

Generate a complete lesson with this structure. Be specific and practical.`;

      const lessonSchema = {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          difficulty: { type: "string", enum: ["beginner", "intermediate", "advanced"] },
          estimatedMinutes: { type: "number" },
          learningObjectives: {
            type: "array",
            items: { type: "string" }
          },
          steps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                title: { type: "string" },
                instruction: { type: "string" },
                hint: { type: "string" },
                type: { type: "string", enum: ["instruction", "task"] }
              }
            }
          },
          suggestedLiveTunables: {
            type: "array",
            items: {
              type: "object",
              properties: {
                key: { type: "string" },
                value: { type: "number" },
                reason: { type: "string" }
              }
            }
          }
        }
      };

      const result = await api.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: lessonSchema
      });

      onLessonGenerated(result);
      setTopic('');
      setAdditionalContext('');
      onClose();
    } catch (error) {
      console.error('Failed to generate lesson:', error);
      alert('Failed to generate lesson. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            AI Lesson Generator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Lesson Topic *
            </label>
            <Input
              placeholder="e.g., Building a jumping puzzle, Creating repeating patterns"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isGenerating}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Age Group
              </label>
              <Select value={ageGroup} onValueChange={setAgeGroup} disabled={isGenerating}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6-8">6-8 years</SelectItem>
                  <SelectItem value="8-10">8-10 years</SelectItem>
                  <SelectItem value="10-12">10-12 years</SelectItem>
                  <SelectItem value="12-14">12-14 years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Difficulty
              </label>
              <Select value={difficulty} onValueChange={setDifficulty} disabled={isGenerating}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Additional Context (optional)
            </label>
            <Textarea
              placeholder="Any specific requirements, concepts to focus on, or constraints..."
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              disabled={isGenerating}
              className="h-24"
            />
          </div>

          <Card className="border-indigo-200 bg-indigo-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-indigo-900">
                  <p className="font-medium mb-1">AI will generate:</p>
                  <ul className="space-y-1 text-indigo-800">
                    <li>• Complete lesson structure with 4-6 steps</li>
                    <li>• Clear learning objectives</li>
                    <li>• Step-by-step instructions and hints</li>
                    <li>• Suggested Live Tuning parameters (if applicable)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isGenerating}>
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={!topic.trim() || isGenerating}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Lesson
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}