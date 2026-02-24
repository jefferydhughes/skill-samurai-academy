import React, { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  TrendingUp,
  BookOpen,
  Target,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function LearningPaths() {
  const [user, setUser] = useState(null);
  const [studentId, setStudentId] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [generating, setGenerating] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await api.auth.me();
      setUser(userData);
      
      // If student role, use their own ID
      if (userData.role === 'student') {
        const profiles = await api.entities.StudentProfile.filter({ userId: userData.id });
        if (profiles.length > 0) {
          setStudentId(profiles[0].id);
        }
      }
    } catch (e) {
      api.auth.redirectToLogin();
    }
  };

  const { data: students = [] } = useQuery({
    queryKey: ['students', user?.id],
    queryFn: () => api.entities.StudentProfile.filter({ userId: user?.id }),
    enabled: !!user?.id && user?.role !== 'student',
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['progress', studentId],
    queryFn: () => api.entities.LessonProgress.filter({ studentId }),
    enabled: !!studentId,
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments', studentId],
    queryFn: () => api.entities.Enrollment.filter({ studentId }),
    enabled: !!studentId,
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['programs'],
    queryFn: () => api.entities.Program.list(),
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ['lessons'],
    queryFn: () => api.entities.Lesson.list(),
  });

  const generateRecommendations = async () => {
    if (!studentId) return;
    
    setGenerating(true);
    try {
      const studentProfile = await api.entities.StudentProfile.filter({ id: studentId });
      const student = studentProfile[0];

      // Prepare student data for AI
      const completedLessons = progress.filter(p => p.completed);
      const inProgressLessons = progress.filter(p => !p.completed);
      const currentPrograms = enrollments.filter(e => e.status === 'enrolled');

      const prompt = `Analyze this student's coding journey and recommend a personalized learning path.

Student Profile:
- Name: ${student.displayName}
- Age: ${student.age}
- Grade: ${student.gradeRange}
- Learning Style: ${student.learningStyle || 'Not specified'}
- Strengths: ${student.strengths?.join(', ') || 'Not specified'}
- Growth Areas: ${student.growthAreas?.join(', ') || 'Not specified'}
- Learning Goals: ${student.learningGoals?.join(', ') || 'Not specified'}

Progress:
- Completed Lessons: ${completedLessons.length}
- In Progress: ${inProgressLessons.length}
- Current Programs: ${currentPrograms.map(e => programs.find(p => p.id === e.programId)?.name).join(', ')}

Available Programs:
${programs.map(p => `- ${p.name} (Ages ${p.age_min}-${p.age_max})`).join('\n')}

Provide:
1. Overall assessment of their progress
2. 3-5 recommended next lessons/topics
3. Skill areas to focus on
4. Suggested programs they should try
5. Long-term learning path (next 3-6 months)

Make it encouraging, specific, and actionable!`;

      const aiResponse = await api.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            assessment: { type: 'string' },
            next_lessons: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  reason: { type: 'string' }
                }
              }
            },
            focus_skills: { type: 'array', items: { type: 'string' } },
            recommended_programs: { type: 'array', items: { type: 'string' } },
            learning_path: { type: 'string' }
          }
        }
      });

      setRecommendations(aiResponse);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      alert('Failed to generate recommendations. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const selectedStudent = students.find(s => s.id === studentId) || 
    (user?.role === 'student' ? students[0] : null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Personalized Learning Path</h1>
        <p className="text-slate-600 mt-1">AI-powered recommendations based on progress and interests</p>
      </div>

      {/* Student Selector for Parents */}
      {user?.role !== 'student' && students.length > 0 && (
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              {students.map(student => (
                <Button
                  key={student.id}
                  variant={studentId === student.id ? 'default' : 'outline'}
                  onClick={() => setStudentId(student.id)}
                  className={studentId === student.id ? 'bg-indigo-600' : ''}
                >
                  {student.displayName}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {studentId && (
        <>
          {/* Progress Overview */}
          <div className="grid sm:grid-cols-3 gap-4">
            <Card className="border-0 shadow-md">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{progress.filter(p => p.completed).length}</div>
                  <div className="text-sm text-slate-500">Lessons Completed</div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{progress.filter(p => !p.completed).length}</div>
                  <div className="text-sm text-slate-500">In Progress</div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{enrollments.filter(e => e.status === 'enrolled').length}</div>
                  <div className="text-sm text-slate-500">Active Programs</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Generate Recommendations */}
          {!recommendations && (
            <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Get AI-Powered Learning Recommendations
                </h3>
                <p className="text-slate-600 mb-6">
                  Our AI will analyze {selectedStudent?.displayName}'s progress and create a personalized learning path
                </p>
                <Button
                  onClick={generateRecommendations}
                  disabled={generating}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Recommendations
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {recommendations && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Assessment */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Progress Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 leading-relaxed">{recommendations.assessment}</p>
                </CardContent>
              </Card>

              {/* Next Lessons */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Recommended Next Steps</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recommendations.next_lessons.map((lesson, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900 mb-1">{lesson.title}</h4>
                            <p className="text-sm text-slate-600 mb-2">{lesson.description}</p>
                            <p className="text-xs text-indigo-600">💡 {lesson.reason}</p>
                          </div>
                          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Focus Skills */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Skills to Focus On</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {recommendations.focus_skills.map((skill, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-indigo-100 text-indigo-700 text-sm px-3 py-1">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Learning Path */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>3-6 Month Learning Path</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{recommendations.learning_path}</p>
                </CardContent>
              </Card>

              <Button
                onClick={() => setRecommendations(null)}
                variant="outline"
                className="w-full"
              >
                Generate New Recommendations
              </Button>
            </motion.div>
          )}
        </>
      )}

      {!studentId && user?.role !== 'student' && (
        <Card className="border-0 shadow-lg">
          <CardContent className="text-center py-12">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Select a student to view learning recommendations</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}