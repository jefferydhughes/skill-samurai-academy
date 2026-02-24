import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, Star, Target, ArrowRight } from 'lucide-react';
import { api } from '@/api/apiClient';
import confetti from 'canvas-confetti';

export default function SessionAssessmentModal({ 
  open, 
  onClose, 
  sessionId, 
  studentId,
  onComplete 
}) {
  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState(null);
  const [studentReflection, setStudentReflection] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && sessionId) {
      generateAssessment();
    }
  }, [open, sessionId]);

  const generateAssessment = async () => {
    setLoading(true);
    try {
      // Get session data
      const sessions = await api.entities.CompanionSession.filter({ id: sessionId });
      const session = sessions[0];

      const interactions = await api.entities.CompanionInteraction.filter({ 
        sessionId 
      });

      // Get student profile
      const students = await api.entities.StudentProfile.filter({ id: studentId });
      const student = students[0];

      // Generate AI assessment
      const prompt = `Generate a supportive end-of-session assessment for a young coding student.

SESSION DATA:
- Duration: ${calculateDuration(session.startTime, new Date())} minutes
- Total Interactions: ${interactions.length}
- Concepts Touched: ${session.conceptsTouched?.join(', ') || 'exploration'}
- Mode: ${session.lessonId ? 'Guided Lesson' : 'Free Exploration'}
- Struggles: ${session.strugglesIdentified?.join(', ') || 'none noted'}
- Successes: ${session.successMoments?.join(', ') || 'steady progress'}

STUDENT PROFILE:
- Age: ${student?.age || 10}
- Learning Goals: ${student?.learningGoals?.join(', ') || 'exploring'}
- Strengths: ${student?.strengths?.join(', ') || 'developing'}

Generate an encouraging assessment that:
1. Celebrates what they accomplished today
2. Identifies 2-3 specific strengths shown
3. Suggests 1-2 growth opportunities (framed positively)
4. Recommends 2-3 concrete next steps
5. Assesses each concept touched (demonstrated: true/false, confidence: low/medium/high)

Keep language age-appropriate and encouraging. Focus on effort and thinking, not just results.`;

      const response = await api.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            aiSummary: { type: 'string' },
            conceptsAssessed: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  concept: { type: 'string' },
                  demonstrated: { type: 'boolean' },
                  confidence: { 
                    type: 'string',
                    enum: ['low', 'medium', 'high']
                  },
                  notes: { type: 'string' }
                }
              }
            },
            strengths: {
              type: 'array',
              items: { type: 'string' }
            },
            growthOpportunities: {
              type: 'array',
              items: { type: 'string' }
            },
            nextSteps: {
              type: 'array',
              items: { type: 'string' }
            },
            overallScore: { type: 'number' }
          }
        }
      });

      setAssessment(response);
      
      if (response.overallScore >= 4) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      }
    } catch (e) {
      console.error('Failed to generate assessment:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      await api.entities.SessionAssessment.create({
        sessionId,
        studentId,
        assessmentType: 'session_review',
        conceptsAssessed: assessment.conceptsAssessed,
        strengths: assessment.strengths,
        growthOpportunities: assessment.growthOpportunities,
        nextSteps: assessment.nextSteps,
        studentFeedback: studentReflection,
        overallScore: assessment.overallScore,
        aiSummary: assessment.aiSummary
      });

      // Update session with end time
      await api.entities.CompanionSession.update(sessionId, {
        endTime: new Date().toISOString()
      });

      if (onComplete) onComplete(assessment);
      onClose();
    } catch (e) {
      console.error('Failed to save assessment:', e);
    } finally {
      setSaving(false);
    }
  };

  const calculateDuration = (start, end) => {
    return Math.floor((new Date(end) - new Date(start)) / 60000);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Session Complete!
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
            <p className="text-slate-600">Reviewing your session...</p>
          </div>
        ) : assessment ? (
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Session Rating</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= assessment.overallScore
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-slate-600 text-sm">{assessment.aiSummary}</p>
            </div>

            {/* Concepts Assessed */}
            {assessment.conceptsAssessed?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-semibold">Concepts You Practiced</h3>
                </div>
                <div className="space-y-2">
                  {assessment.conceptsAssessed.map((concept, i) => (
                    <div key={i} className="bg-slate-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm capitalize">
                          {concept.concept.replace(/_/g, ' ')}
                        </span>
                        <Badge
                          className={
                            concept.confidence === 'high'
                              ? 'bg-green-100 text-green-700'
                              : concept.confidence === 'medium'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-amber-100 text-amber-700'
                          }
                        >
                          {concept.confidence}
                        </Badge>
                      </div>
                      {concept.notes && (
                        <p className="text-xs text-slate-600">{concept.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths */}
            {assessment.strengths?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <h3 className="font-semibold">What You Did Great</h3>
                </div>
                <ul className="space-y-2">
                  {assessment.strengths.map((strength, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-green-500 mt-1">✓</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Next Steps */}
            {assessment.nextSteps?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ArrowRight className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-semibold">Try Next Time</h3>
                </div>
                <ul className="space-y-2">
                  {assessment.nextSteps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-indigo-500 mt-1">→</span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Student Reflection */}
            <div>
              <Label htmlFor="reflection" className="mb-2 block">
                How do you feel about this session? (optional)
              </Label>
              <Textarea
                id="reflection"
                value={studentReflection}
                onChange={(e) => setStudentReflection(e.target.value)}
                placeholder="What did you enjoy? What was challenging?"
                className="h-20"
              />
            </div>

            <Button
              onClick={handleComplete}
              disabled={saving}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Complete Session'
              )}
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}