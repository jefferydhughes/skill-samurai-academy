import { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from 'date-fns';
import {
  BookOpen,
  TrendingUp,
  Star,
  CheckCircle,
  Calendar,
  Award,
  Target,
  Plus,
  Rocket,
  Code,
  Trophy
} from "lucide-react";
import { GamificationProvider } from '@/lib/gamification/GamificationContext';
import { EnhancedStudentDashboard } from '@/components/gamification/EnhancedStudentDashboard';

function UpcomingSessions({ sessions }) {
  if (!sessions || sessions.length === 0) {
    return (
      <Card className="glass-card hover-lift rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Calendar className="w-5 h-5 text-indigo-500" />
            Upcoming Classes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-slate-600 py-4">No upcoming classes.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card hover-lift rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <Calendar className="w-5 h-5 text-indigo-500" />
          Upcoming Classes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sessions.map(session => (
          <div key={session.id} className="p-3 rounded-lg bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100">
            <p className="font-semibold text-slate-900">{session.programName}</p>
            <p className="text-sm text-slate-600">
              {format(new Date(session.startDate), 'MMM d, yyyy')} at {session.schedule?.startTime || 'TBD'}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function LearningProgress({ progress }) {
  const completedLessons = progress.filter(p => p.completed).length;
  const totalMinutes = progress.reduce((sum, p) => sum + (p.timeSpentMinutes || 0), 0);

  return (
    <Card className="glass-card hover-lift rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <TrendingUp className="w-5 h-5 text-emerald-500" />
          Learning Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Lessons Completed</span>
            <span className="text-2xl font-bold text-indigo-600">{completedLessons}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Learning Time</span>
            <span className="text-2xl font-bold text-emerald-600">{totalMinutes} min</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function StudentPortal() {
  const [user, setUser] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await api.auth.me();
      setUser(userData);
      
      // For student role, find their profile
      if (userData.role === 'student') {
        const profiles = await api.entities.StudentProfile.filter({ userId: userData.id });
        if (profiles.length > 0) {
          setStudentProfile(profiles[0]);
        }
      }
    } catch (e) {
      api.auth.redirectToLogin();
    }
  };

  const { data: enrollments = [] } = useQuery({
    queryKey: ['studentEnrollments', studentProfile?.id],
    queryFn: () => api.entities.Enrollment.filter({ studentId: studentProfile?.id }),
    enabled: !!studentProfile?.id,
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['programs'],
    queryFn: () => api.entities.Program.list(),
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['studentSessions', enrollments],
    queryFn: async () => {
      if (enrollments.length === 0) return [];
      const allSessions = await api.entities.ClassSession.list();
      const enrolledSessionIds = enrollments.map(e => e.classSessionId);
      return allSessions
        .filter(s => enrolledSessionIds.includes(s.id) && new Date(s.startDate) >= new Date())
        .map(s => ({
          ...s,
          programName: programs.find(p => p.id === s.programId)?.name || 'Program'
        }))
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    },
    enabled: enrollments.length > 0,
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['studentProgress', studentProfile?.id],
    queryFn: () => api.entities.LessonProgress.filter({ studentId: studentProfile?.id }),
    enabled: !!studentProfile?.id,
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ['lessons'],
    queryFn: () => api.entities.Lesson.list(),
  });

  if (!user || (user.role === 'student' && !studentProfile)) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-64 mx-auto"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const completedLessons = progress.filter(p => p.completed).length;
  const activeEnrollments = enrollments.filter(e => e.status === 'enrolled');

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <style>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(226, 232, 240, 0.5);
        }
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(99, 102, 241, 0.15);
        }
      `}</style>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Welcome back, {studentProfile?.displayName || user?.full_name}! 🚀
            </h1>
            <p className="text-slate-600 text-lg">
              Ready to continue your coding adventure?
            </p>
          </div>
          <div className="flex gap-3">
            <Link to={createPageUrl("ProgramsBrowser")}>
              <Button className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold hover-lift rounded-xl">
                <Plus className="w-4 h-4 mr-2" />
                Explore Programs
              </Button>
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: "overview", label: "Overview", icon: Target },
            { id: "learning", label: "My Learning", icon: BookOpen },
            { id: "progress", label: "Progress", icon: TrendingUp },
            { id: "gamification", label: "Gamification", icon: Trophy }
          ].map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === tab.id 
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="glass-card hover-lift rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Active Programs</p>
                      <p className="text-2xl font-bold text-slate-900">{activeEnrollments.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card hover-lift rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Lessons Done</p>
                      <p className="text-2xl font-bold text-slate-900">{completedLessons}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card hover-lift rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Upcoming Classes</p>
                      <p className="text-2xl font-bold text-slate-900">{sessions.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card hover-lift rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Learning Time</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {progress.reduce((sum, p) => sum + (p.timeSpentMinutes || 0), 0)} min
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Active Programs */}
                <Card className="glass-card hover-lift rounded-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl text-slate-900">
                      <Rocket className="w-6 h-6 text-indigo-600" />
                      My Active Programs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {activeEnrollments.length > 0 ? (
                      <div className="space-y-4">
                        {activeEnrollments.slice(0, 3).map((enrollment) => {
                          const program = programs.find(p => p.id === enrollment.programId);
                          const programProgress = progress.filter(p => 
                            lessons.find(l => l.id === p.lessonId && l.programId === program?.id)
                          );
                          const completedCount = programProgress.filter(p => p.completed).length;
                          const totalCount = programProgress.length || 1;
                          const progressPercent = Math.round((completedCount / totalCount) * 100);

                          return program ? (
                            <div key={enrollment.id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl border border-indigo-100">
                              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center">
                                <Code className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-slate-900">{program.name}</h3>
                                <p className="text-sm text-slate-600">Ages {program.age_min}-{program.age_max}</p>
                                <Progress value={progressPercent} className="w-full mt-2" />
                              </div>
                              <div className="text-center">
                                <p className="text-2xl font-bold text-indigo-600">{progressPercent}%</p>
                                <p className="text-xs text-slate-600">Complete</p>
                              </div>
                            </div>
                          ) : null;
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Rocket className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">Start Your Coding Journey!</h3>
                        <p className="text-slate-600 mb-6">Explore programs and start learning today</p>
                        <Link to={createPageUrl("ProgramsBrowser")}>
                          <Button className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold hover-lift rounded-xl">
                            <Plus className="w-4 h-4 mr-2" />
                            Browse Programs
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Achievements */}
                <Card className="glass-card hover-lift rounded-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl text-slate-900">
                      <Award className="w-6 h-6 text-amber-500" />
                      Achievements & Milestones
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                        <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Star className="w-6 h-6 text-white" />
                        </div>
                        <p className="font-semibold text-slate-900">Total Lessons</p>
                        <p className="text-2xl font-bold text-amber-600">{progress.length}</p>
                      </div>
                      <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                        <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-3">
                          <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                        <p className="font-semibold text-slate-900">Completed</p>
                        <p className="text-2xl font-bold text-emerald-600">{completedLessons}</p>
                      </div>
                      <div className="text-center p-6 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl border border-indigo-100">
                        <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Trophy className="w-6 h-6 text-white" />
                        </div>
                        <p className="font-semibold text-slate-900">Programs Joined</p>
                        <p className="text-2xl font-bold text-indigo-600">{enrollments.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <UpcomingSessions sessions={sessions.slice(0, 3)} />
                <LearningProgress progress={progress} />
              </div>
            </div>
          </div>
        )}

        {/* Learning Tab */}
        {activeTab === "learning" && (
          <div>
            <Card className="glass-card hover-lift rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl text-slate-900">
                  <BookOpen className="w-6 h-6 text-indigo-600" />
                  My Learning Programs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {enrollments.map(enrollment => {
                    const program = programs.find(p => p.id === enrollment.programId);
                    return program ? (
                      <div key={enrollment.id} className="p-6 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-slate-900">{program.name}</h3>
                            <p className="text-sm text-slate-600 mt-1">
                              Ages {program.age_min}-{program.age_max} • {program.type}
                            </p>
                          </div>
                          <Badge className={
                            enrollment.status === 'enrolled' ? 'bg-green-100 text-green-700' :
                            enrollment.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                            'bg-slate-100 text-slate-700'
                          }>
                            {enrollment.status}
                          </Badge>
                        </div>
                        <Link to={createPageUrl("LearningWorlds")}>
                          <Button className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover-lift">
                            Continue Learning
                          </Button>
                        </Link>
                      </div>
                    ) : null;
                  })}
                  {enrollments.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-slate-600 mb-4">No enrolled programs yet</p>
                      <Link to={createPageUrl("ProgramsBrowser")}>
                        <Button className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
                          Explore Programs
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === "progress" && (
          <div>
            <Card className="glass-card hover-lift rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl text-slate-900">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                  Learning Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {progress.length > 0 ? (
                    progress.map(p => {
                      const lesson = lessons.find(l => l.id === p.lessonId);
                      return lesson ? (
                        <div key={p.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-slate-900">{lesson.title}</h4>
                            {p.completed && <CheckCircle className="w-5 h-5 text-green-500" />}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            <span>{p.timeSpentMinutes || 0} min</span>
                            <span>•</span>
                            <span>Step {p.currentStepIndex + 1} of {p.totalSteps || 1}</span>
                          </div>
                          <Progress value={(p.currentStepIndex / (p.totalSteps || 1)) * 100} className="mt-3" />
                        </div>
                      ) : null;
                    })
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-slate-600">No progress data yet. Start learning to see your progress!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Gamification Tab */}
        {activeTab === "gamification" && (
          <GamificationProvider user={user}>
            <EnhancedStudentDashboard studentProfile={studentProfile} />
          </GamificationProvider>
        )}
      </div>
    </div>
  );
}