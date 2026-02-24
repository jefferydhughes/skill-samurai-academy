import React, { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle,
  Circle,
  BookOpen,
  ListTodo,
  Calendar,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const priorityColors = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-blue-100 text-blue-700'
};

const statusColors = {
  not_started: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700'
};

export default function InstructorOnboarding() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

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

  const { data: onboarding, isLoading } = useQuery({
    queryKey: ['onboarding', user?.id],
    queryFn: async () => {
      const records = await api.entities.InstructorOnboarding.filter({ userId: user?.id });
      return records[0];
    },
    enabled: !!user?.id,
  });

  const updateModuleMutation = useMutation({
    mutationFn: ({ moduleId, status }) => {
      const updatedModules = onboarding.training_modules.map(m =>
        m.id === moduleId ? { ...m, status } : m
      );
      const completedModules = updatedModules.filter(m => m.status === 'completed').length;
      const completedTasks = onboarding.tasks.filter(t => t.completed).length;
      const totalItems = updatedModules.length + onboarding.tasks.length;
      const progress = Math.round(((completedModules + completedTasks) / totalItems) * 100);

      return api.entities.InstructorOnboarding.update(onboarding.id, {
        training_modules: updatedModules,
        progress_percentage: progress,
        status: progress === 100 ? 'completed' : 'in_progress',
        completed_at: progress === 100 ? new Date().toISOString() : null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, completed }) => {
      const updatedTasks = onboarding.tasks.map(t =>
        t.id === taskId ? { ...t, completed } : t
      );
      const completedModules = onboarding.training_modules.filter(m => m.status === 'completed').length;
      const completedTasks = updatedTasks.filter(t => t.completed).length;
      const totalItems = onboarding.training_modules.length + updatedTasks.length;
      const progress = Math.round(((completedModules + completedTasks) / totalItems) * 100);

      return api.entities.InstructorOnboarding.update(onboarding.id, {
        tasks: updatedTasks,
        progress_percentage: progress,
        status: progress === 100 ? 'completed' : 'in_progress',
        completed_at: progress === 100 ? new Date().toISOString() : null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!onboarding) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="text-center py-16">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No onboarding record found</h3>
          <p className="text-slate-600">Contact your administrator to set up your onboarding.</p>
        </CardContent>
      </Card>
    );
  }

  const upcomingTasks = onboarding.tasks.filter(t => !t.completed);
  const completedTasks = onboarding.tasks.filter(t => t.completed);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome, {user?.full_name}! 👋</h1>
          <p className="text-slate-600 mt-1">Complete your onboarding to get started</p>
        </div>
        {onboarding.status === 'completed' && (
          <Badge className="bg-green-100 text-green-700 text-base px-4 py-2">
            <CheckCircle className="w-4 h-4 mr-2" />
            Onboarding Complete
          </Badge>
        )}
      </div>

      {/* Progress Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {onboarding.progress_percentage}% Complete
              </h2>
              <p className="text-slate-600">
                {onboarding.training_modules.filter(m => m.status === 'completed').length} of {onboarding.training_modules.length} modules • 
                {' '}{completedTasks.length} of {onboarding.tasks.length} tasks
              </p>
            </div>
            <div className="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center">
              <TrendingUp className="w-10 h-10 text-indigo-600" />
            </div>
          </div>
          <Progress value={onboarding.progress_percentage} className="h-3" />
        </CardContent>
      </Card>

      <Tabs defaultValue="tasks" className="space-y-6">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="tasks">
            <ListTodo className="w-4 h-4 mr-2" />
            Tasks ({upcomingTasks.length})
          </TabsTrigger>
          <TabsTrigger value="training">
            <BookOpen className="w-4 h-4 mr-2" />
            Training Modules
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          {upcomingTasks.length === 0 ? (
            <Card className="border-0 shadow-md">
              <CardContent className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-slate-900">All tasks completed!</h3>
                <p className="text-slate-600">Great job on finishing your onboarding tasks.</p>
              </CardContent>
            </Card>
          ) : (
            upcomingTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => updateTaskMutation.mutate({ taskId: task.id, completed: true })}
                        className="mt-1"
                      >
                        <Circle className="w-6 h-6 text-slate-400 hover:text-indigo-600 transition-colors" />
                      </button>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-slate-900">{task.title}</h3>
                          <Badge className={priorityColors[task.priority]}>
                            {task.priority}
                          </Badge>
                        </div>
                        <p className="text-slate-600 mt-1">{task.description}</p>
                        <div className="flex items-center gap-2 mt-3 text-sm text-slate-500">
                          <Calendar className="w-4 h-4" />
                          Due {format(new Date(task.due_date), 'MMM d, yyyy')}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}

          {completedTasks.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-slate-500 uppercase mb-4">Completed</h3>
              <div className="space-y-3">
                {completedTasks.map(task => (
                  <Card key={task.id} className="border-0 shadow-sm opacity-75">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-slate-600 line-through">{task.title}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          {onboarding.training_modules.map((module, index) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{module.title}</CardTitle>
                        <p className="text-slate-600 text-sm mt-1">{module.description}</p>
                      </div>
                    </div>
                    <Badge className={statusColors[module.status]}>
                      {module.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Calendar className="w-4 h-4" />
                      Complete by {format(new Date(module.due_date), 'MMM d, yyyy')}
                    </div>

                    {module.resources && module.resources.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-slate-700 mb-2">Resources</h4>
                        <div className="flex flex-wrap gap-2">
                          {module.resources.map((resource, i) => (
                            <Badge key={i} variant="secondary" className="bg-slate-100">
                              {resource}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      {module.status === 'not_started' && (
                        <Button
                          onClick={() => updateModuleMutation.mutate({ moduleId: module.id, status: 'in_progress' })}
                          className="bg-indigo-600 hover:bg-indigo-700"
                        >
                          Start Module
                        </Button>
                      )}
                      {module.status === 'in_progress' && (
                        <Button
                          onClick={() => updateModuleMutation.mutate({ moduleId: module.id, status: 'completed' })}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Mark as Complete
                        </Button>
                      )}
                      {module.status === 'completed' && (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-medium">Completed</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}