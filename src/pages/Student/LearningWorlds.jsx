import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { 
  Rocket,
  Play,
  BookOpen,
  Trophy,
  Clock,
  Sparkles,
  Star,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { motion } from 'framer-motion';

const difficultyColors = {
  beginner: 'from-green-400 to-emerald-500',
  intermediate: 'from-blue-400 to-indigo-500',
  advanced: 'from-purple-400 to-violet-500'
};

const categoryIcons = {
  basics: '🧱',
  logic: '🧠',
  loops: '🔄',
  functions: '⚡',
  advanced: '🚀'
};

export default function LearningWorlds() {
  const [user, setUser] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

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

  const { data: students = [] } = useQuery({
    queryKey: ['students', user?.id],
    queryFn: () => api.entities.StudentProfile.filter({ userId: user?.id }),
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (students.length > 0 && !selectedStudent) {
      setSelectedStudent(students[0].id);
    }
  }, [students, selectedStudent]);

  const { data: lessons = [], isLoading: lessonsLoading } = useQuery({
    queryKey: ['lessons'],
    queryFn: () => api.entities.Lesson.filter({ status: 'published' }),
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['progress', selectedStudent],
    queryFn: () => api.entities.LessonProgress.filter({ studentId: selectedStudent }),
    enabled: !!selectedStudent,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects', selectedStudent],
    queryFn: () => api.entities.Project.filter({ studentId: selectedStudent }),
    enabled: !!selectedStudent,
  });

  const getProgressForLesson = (lessonId) => progress.find(p => p.lessonId === lessonId);
  const getProjectForLesson = (lessonId) => projects.find(p => p.lessonId === lessonId);

  const currentStudent = students.find(s => s.id === selectedStudent);

  // Group lessons by category
  const lessonsByCategory = lessons.reduce((acc, lesson) => {
    const category = lesson.category || 'basics';
    if (!acc[category]) acc[category] = [];
    acc[category].push(lesson);
    return acc;
  }, {});

  const completedCount = progress.filter(p => p.completed).length;
  const inProgressCount = progress.filter(p => !p.completed && p.currentStepIndex > 0).length;

  // Mock badges data - will be replaced with real uploaded badges
  const badges = [
    { id: 1, name: 'First Steps', description: 'Completed your first lesson', earned: completedCount >= 1, icon: '🎯', color: 'from-blue-400 to-cyan-500' },
    { id: 2, name: 'Code Explorer', description: 'Started 3 different projects', earned: projects.length >= 3, icon: '🚀', color: 'from-purple-400 to-violet-500' },
    { id: 3, name: 'Quick Learner', description: 'Completed 5 lessons', earned: completedCount >= 5, icon: '⚡', color: 'from-amber-400 to-orange-500' },
    { id: 4, name: 'Master Builder', description: 'Completed 10 lessons', earned: completedCount >= 10, icon: '🏆', color: 'from-green-400 to-emerald-500' },
    { id: 5, name: 'Logic Ninja', description: 'Completed all logic lessons', earned: false, icon: '🧠', color: 'from-indigo-400 to-blue-500' },
    { id: 6, name: 'Loop Master', description: 'Completed all loop lessons', earned: false, icon: '🔄', color: 'from-pink-400 to-rose-500' },
  ];

  const earnedBadges = badges.filter(b => b.earned);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Learning Worlds</h1>
          <p className="text-slate-600 mt-1">Explore coding adventures and build amazing projects</p>
        </div>
        <Button
          asChild
          className="bg-indigo-600 hover:bg-indigo-700 gap-2"
        >
          <Link to={createPageUrl('ProjectCreator')}>
            <Sparkles className="w-4 h-4" />
            Create Project
          </Link>
        </Button>
        {students.length > 1 && (
          <Select value={selectedStudent || ''} onValueChange={setSelectedStudent}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select student" />
            </SelectTrigger>
            <SelectContent>
              {students.map(student => (
                <SelectItem key={student.id} value={student.id}>
                  {student.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Stats Overview */}
      {currentStudent && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
            <CardContent className="p-6">
              <Rocket className="w-8 h-8 mb-3 opacity-80" />
              <div className="text-3xl font-bold">{projects.length}</div>
              <div className="text-indigo-100 text-sm">Projects</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <Trophy className="w-8 h-8 mb-3 opacity-80" />
              <div className="text-3xl font-bold">{completedCount}</div>
              <div className="text-green-100 text-sm">Completed</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <Clock className="w-8 h-8 mb-3 opacity-80" />
              <div className="text-3xl font-bold">{inProgressCount}</div>
              <div className="text-amber-100 text-sm">In Progress</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
            <CardContent className="p-6">
              <Star className="w-8 h-8 mb-3 opacity-80" />
              <div className="text-3xl font-bold">0</div>
              <div className="text-blue-100 text-sm">Stars Earned</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Badges Section */}
      {currentStudent && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Achievements</h2>
                <p className="text-sm text-slate-600">{earnedBadges.length} of {badges.length} earned</p>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 px-4 py-2 rounded-xl shadow-lg">
              <Trophy className="w-4 h-4 mr-2" />
              {earnedBadges.length} Badges
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {badges.map((badge, index) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: badge.earned ? 1.05 : 1, y: badge.earned ? -5 : 0 }}
              >
                <div className={`relative rounded-2xl p-4 text-center transition-all ${
                  badge.earned 
                    ? 'bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl hover:shadow-2xl' 
                    : 'bg-slate-100/50 border border-slate-200/50 opacity-50'
                }`}>
                  {badge.earned && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
                      <Star className="w-3 h-3 text-white fill-white" />
                    </div>
                  )}
                  <div className={`w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br ${badge.color} flex items-center justify-center text-3xl shadow-lg ${
                    badge.earned ? '' : 'grayscale'
                  }`}>
                    {badge.earned ? badge.icon : '🔒'}
                  </div>
                  <h3 className={`text-sm font-bold mb-1 ${badge.earned ? 'text-slate-900' : 'text-slate-500'}`}>
                    {badge.name}
                  </h3>
                  <p className={`text-xs ${badge.earned ? 'text-slate-600' : 'text-slate-400'}`}>
                    {badge.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Continue Learning */}
      {projects.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Continue Learning</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {projects.slice(0, 2).map((project) => {
              const lesson = lessons.find(l => l.id === project.lessonId);
              const lessonProgress = getProgressForLesson(project.lessonId);
              const progressPercent = lessonProgress 
                ? ((lessonProgress.completedSteps?.length || 0) / (lessonProgress.totalSteps || 1)) * 100
                : 0;

              return (
                <Card key={project.id} className="group border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex">
                      <div className={`w-32 h-full bg-gradient-to-br ${difficultyColors[lesson?.difficulty || 'beginner']} flex items-center justify-center`}>
                        <Sparkles className="w-12 h-12 text-white opacity-80" />
                      </div>
                      <div className="flex-1 p-5">
                        <h3 className="font-semibold text-slate-900 mb-1">{lesson?.title || project.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                          <Badge variant="secondary" className="text-xs">
                            {lesson?.difficulty || 'beginner'}
                          </Badge>
                          <span>{progressPercent.toFixed(0)}% complete</span>
                        </div>
                        <Progress value={progressPercent} className="h-2 mb-3" />
                        <Button size="sm" asChild className="bg-indigo-600 hover:bg-indigo-700">
                          <Link to={`${createPageUrl('LessonPlayer')}?projectId=${project.id}`}>
                            <Play className="w-4 h-4 mr-2" />
                            Continue
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* All Lessons */}
      {lessonsLoading ? (
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-0 shadow-lg animate-pulse">
              <div className="aspect-[4/3] bg-slate-200" />
              <CardContent className="p-5 space-y-3">
                <div className="h-5 w-3/4 bg-slate-200 rounded" />
                <div className="h-4 w-1/2 bg-slate-100 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : lessons.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-indigo-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">No lessons available yet</h2>
            <p className="text-slate-600">Check back soon for new coding adventures!</p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(lessonsByCategory).map(([category, categoryLessons]) => (
          <section key={category}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{categoryIcons[category] || '📚'}</span>
              <h2 className="text-xl font-bold text-slate-900 capitalize">{category}</h2>
              <Badge variant="secondary">{categoryLessons.length} lessons</Badge>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryLessons.map((lesson, index) => {
                const lessonProgress = getProgressForLesson(lesson.id);
                const project = getProjectForLesson(lesson.id);
                const isCompleted = lessonProgress?.completed;
                const isStarted = !!project;
                const progressPercent = lessonProgress 
                  ? ((lessonProgress.completedSteps?.length || 0) / (lesson.steps?.length || 1)) * 100
                  : 0;

                return (
                  <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="group border-0 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden">
                      <div className={`aspect-video bg-gradient-to-br ${difficultyColors[lesson.difficulty || 'beginner']} relative overflow-hidden`}>
                        {lesson.thumbnail ? (
                          <img src={lesson.thumbnail} alt={lesson.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Sparkles className="w-16 h-16 text-white opacity-40" />
                          </div>
                        )}
                        
                        {isCompleted && (
                          <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                            <Trophy className="w-5 h-5 text-white" />
                          </div>
                        )}
                        
                        <div className="absolute bottom-3 left-3">
                          <Badge className="bg-black/50 text-white border-0 backdrop-blur-sm">
                            {lesson.difficulty || 'beginner'}
                          </Badge>
                        </div>
                      </div>
                      
                      <CardContent className="p-5">
                        <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                          {lesson.title}
                        </h3>
                        
                        <div className="flex items-center gap-3 text-sm text-slate-500 mb-4">
                          {lesson.estimatedMinutes && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {lesson.estimatedMinutes} min
                            </span>
                          )}
                          {lesson.steps && (
                            <span>{lesson.steps.length} steps</span>
                          )}
                        </div>

                        {isStarted && !isCompleted && (
                          <Progress value={progressPercent} className="h-2 mb-4" />
                        )}

                        <Button 
                          className={`w-full ${isCompleted ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                          asChild
                        >
                          <Link to={`${createPageUrl('LessonPlayer')}?lessonId=${lesson.id}&studentId=${selectedStudent}`}>
                            {isCompleted ? (
                              <>
                                <Star className="w-4 h-4 mr-2" />
                                Play Again
                              </>
                            ) : isStarted ? (
                              <>
                                <Play className="w-4 h-4 mr-2" />
                                Continue
                              </>
                            ) : (
                              <>
                                <Rocket className="w-4 h-4 mr-2" />
                                Start Lesson
                              </>
                            )}
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </section>
        ))
      )}
    </div>
  );
}