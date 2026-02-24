import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/api/apiClient';
import { useMutation } from '@tanstack/react-query';
import { Sparkles, Loader2, Download } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

export default function PersonalizedFeedback({ student, sessions, conceptAnalysis }) {
  const [feedback, setFeedback] = useState(null);
  const [customNotes, setCustomNotes] = useState('');

  const generateFeedbackMutation = useMutation({
    mutationFn: async () => {
      // Prepare student data summary
      const totalSessions = sessions.length;
      const totalMinutes = sessions.reduce((acc, s) => {
        return acc + Math.floor((new Date(s.endTime) - new Date(s.startTime)) / 60000);
      }, 0);
      
      const recentSessions = sessions.slice(0, 5);
      const allConcepts = [...new Set(sessions.flatMap(s => s.conceptsTouched || []))];
      
      const explorationSessions = sessions.filter(s => s.explorationMode).length;
      const guidedSessions = totalSessions - explorationSessions;

      const prompt = `Generate a comprehensive, encouraging progress report for ${student.displayName}, a ${student.age}-year-old student learning to code.

Learning Data:
- Total Sessions: ${totalSessions}
- Total Learning Time: ${totalMinutes} minutes
- Guided Sessions: ${guidedSessions}
- Free Exploration Sessions: ${explorationSessions}
- Concepts Explored: ${allConcepts.length} (${allConcepts.slice(0, 10).join(', ')})
- Learning Style: ${student.learningStyle || 'mixed'}
- Strengths: ${student.strengths?.join(', ') || 'developing'}

Recent Activity:
${recentSessions.map((s, i) => `Session ${i + 1}: ${s.conceptsTouched?.join(', ') || 'exploration'} (${Math.floor((new Date(s.endTime) - new Date(s.startTime)) / 60000)} min)`).join('\n')}

${customNotes ? `Parent/Teacher Notes: ${customNotes}` : ''}

Please create a warm, detailed progress report that:
1. Celebrates specific achievements and progress
2. Highlights emerging strengths
3. Suggests 2-3 specific next steps
4. Maintains an encouraging, growth-mindset tone
5. Is written for parents to understand (avoid overly technical terms)

Format as a narrative letter (300-400 words).`;

      const result = await api.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      return result;
    },
    onSuccess: (data) => {
      setFeedback(data);
    }
  });

  const sendEmailMutation = useMutation({
    mutationFn: async (parentEmail) => {
      await api.integrations.Core.SendEmail({
        to: parentEmail,
        subject: `Progress Report for ${student.displayName}`,
        body: feedback
      });
    }
  });

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          Personalized Progress Report
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!feedback ? (
          <div className="space-y-4">
            <p className="text-slate-600">
              Generate an AI-powered, personalized progress report highlighting {student.displayName}'s achievements, 
              growth areas, and recommended next steps.
            </p>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Additional Notes (Optional)
              </label>
              <Textarea
                placeholder="Add any specific observations or context you'd like included..."
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                rows={3}
              />
            </div>

            <Button
              onClick={() => generateFeedbackMutation.mutate()}
              disabled={generateFeedbackMutation.isPending}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              {generateFeedbackMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Progress Report
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl p-6 border border-indigo-200">
              <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
                {feedback}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  const blob = new Blob([feedback], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `progress-report-${student.displayName}-${new Date().toISOString().split('T')[0]}.txt`;
                  a.click();
                }}
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(feedback);
                }}
                className="flex-1"
              >
                Copy to Clipboard
              </Button>

              <Button
                onClick={() => {
                  setFeedback(null);
                  setCustomNotes('');
                }}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              >
                Generate New
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}