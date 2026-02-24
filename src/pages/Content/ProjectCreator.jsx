import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  BookTemplate,
  Clock,
  Target,
  ChevronRight
} from 'lucide-react';
import AITemplateGenerator from '../../components/ai-templates/AITemplateGenerator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ProjectCreator() {
  const [user, setUser] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const navigate = useNavigate();

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

  const { data: templates = [] } = useQuery({
    queryKey: ['templates', selectedStudent],
    queryFn: () => api.entities.ProjectTemplate.filter({ 
      studentId: selectedStudent,
      status: 'ready'
    }),
    enabled: !!selectedStudent,
  });

  const { data: allTemplates = [] } = useQuery({
    queryKey: ['all-templates'],
    queryFn: () => api.entities.ProjectTemplate.filter({ status: 'ready' }),
  });

  useEffect(() => {
    if (students.length > 0 && !selectedStudent) {
      setSelectedStudent(students[0].id);
    }
  }, [students, selectedStudent]);

  const handleCreateFromTemplate = async (template) => {
    try {
      const project = await api.entities.Project.create({
        studentId: selectedStudent,
        name: template.title,
        blockWorkspace: template.starterCode,
        runtimeSettings: {
          templateId: template.id,
          completedMilestones: [],
          currentMilestone: 0
        }
      });

      navigate(`${createPageUrl('LessonPlayer')}?projectId=${project.id}&guided=true`);
    } catch (e) {
      console.error('Failed to create project:', e);
    }
  };

  const handleTemplateCreated = async (template) => {
    handleCreateFromTemplate(template);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Create New Project</h1>
          <p className="text-slate-600 mt-1">Start from a template or get AI help</p>
        </div>

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

      <Tabs defaultValue="ai-generate" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ai-generate" className="gap-2">
            <Sparkles className="w-4 h-4" />
            AI Generate
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <BookTemplate className="w-4 h-4" />
            Templates ({templates.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai-generate" className="mt-6">
          <AITemplateGenerator 
            studentId={selectedStudent}
            onTemplateCreated={handleTemplateCreated}
          />
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <div className="space-y-4">
            {templates.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <BookTemplate className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No templates yet</h3>
                  <p className="text-slate-600 mb-4">Generate your first project using AI!</p>
                  <Button
                    onClick={() => document.querySelector('[value="ai-generate"]')?.click()}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Template
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-slate-900">Your Templates</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {templates.map((template) => (
                    <Card key={template.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between text-base">
                          <span>{template.title}</span>
                          <Badge variant="secondary" className="capitalize">
                            {template.difficulty}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-slate-600 line-clamp-2">
                          {template.description}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {template.estimatedMinutes} min
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            {template.milestones?.length || 0} milestones
                          </span>
                        </div>

                        <Button
                          onClick={() => handleCreateFromTemplate(template)}
                          className="w-full bg-indigo-600 hover:bg-indigo-700"
                          size="sm"
                        >
                          Start Project
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}

            {allTemplates.filter(t => !t.studentId).length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Starter Templates</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {allTemplates.filter(t => !t.studentId).map((template) => (
                    <Card key={template.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between text-base">
                          <span>{template.title}</span>
                          <Badge variant="secondary" className="capitalize">
                            {template.difficulty}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-slate-600 line-clamp-2">
                          {template.description}
                        </p>

                        <Button
                          onClick={() => handleCreateFromTemplate(template)}
                          variant="outline"
                          className="w-full"
                          size="sm"
                        >
                          Use Template
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}