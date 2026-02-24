import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus,
  Edit2,
  Copy,
  BookOpen,
  Trash2,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CollectionDetail from '@/components/layouts/CollectionDetail';
import AILessonGenerator from '@/components/lesson-authoring/AILessonGenerator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const statusColors = {
  draft: 'bg-amber-100 text-amber-700',
  published: 'bg-green-100 text-green-700',
  archived: 'bg-slate-100 text-slate-600'
};

const difficultyColors = {
  beginner: 'bg-blue-100 text-blue-700',
  intermediate: 'bg-violet-100 text-violet-700',
  advanced: 'bg-red-100 text-red-700'
};

export default function LessonsManager() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState(null);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleCreateLesson = () => {
    navigate(createPageUrl('LessonEditor') + '?mode=create');
  };

  const { data: lessons = [] } = useQuery({
    queryKey: ['lessons'],
    queryFn: () => api.entities.Lesson.list('-updated_date'),
  });

  const { data: worldTemplates = [] } = useQuery({
    queryKey: ['worldTemplates'],
    queryFn: () => api.entities.WorldTemplate.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.entities.Lesson.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['lessons']);
      setDeleteDialogOpen(false);
      setLessonToDelete(null);
      if (selectedLessonId === lessonToDelete?.id) {
        setSelectedLessonId(null);
      }
    }
  });

  const duplicateMutation = useMutation({
    mutationFn: async (lesson) => {
      const newLesson = {
        ...lesson,
        title: `${lesson.title} (Copy)`,
        status: 'draft'
      };
      delete newLesson.id;
      delete newLesson.created_date;
      delete newLesson.updated_date;
      return api.entities.Lesson.create(newLesson);
    },
    onSuccess: (newLesson) => {
      queryClient.invalidateQueries(['lessons']);
      setSelectedLessonId(newLesson.id);
    }
  });

  const createLessonMutation = useMutation({
    mutationFn: (lessonData) => api.entities.Lesson.create(lessonData),
    onSuccess: (newLesson) => {
      queryClient.invalidateQueries(['lessons']);
      setSelectedLessonId(newLesson.id);
    }
  });

  const handleAILessonGenerated = async (generatedLesson) => {
    await createLessonMutation.mutateAsync({
      ...generatedLesson,
      status: 'draft',
      ageRange: { min: 8, max: 12 }
    });
  };

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = !searchQuery || 
      lesson.title?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const selectedLesson = lessons.find(l => l.id === selectedLessonId);
  const getWorldTemplate = (id) => worldTemplates.find(w => w.id === id);

  const handleEditLesson = (lessonId) => {
    navigate(createPageUrl('LessonEditor') + `?lessonId=${lessonId}`);
  };

  return (
    <>
      <CollectionDetail
        items={filteredLessons}
        selectedId={selectedLessonId}
        onSelectItem={(lesson) => setSelectedLessonId(lesson.id)}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search lessons..."
        collectionEmpty="No lessons found"
        renderCollectionItem={(lesson, isSelected) => (
          <div className="flex items-start gap-3">
            <div className="text-2xl flex-shrink-0 mt-0.5">📘</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-semibold truncate text-sm">{lesson.title}</span>
                <Badge className={`text-xs ${statusColors[lesson.status] || statusColors.draft}`}>
                  {lesson.status || 'draft'}
                </Badge>
              </div>
              <div className={`text-xs ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                Ages {lesson.ageRange?.min || 8}-{lesson.ageRange?.max || 12}
              </div>
            </div>
          </div>
        )}
        renderDetail={() => selectedLesson && (
          <div className="p-6 space-y-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-3">{selectedLesson.title}</h2>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <span>{getWorldTemplate(selectedLesson.worldTemplateId)?.name || 'No world'}</span>
                  <span>•</span>
                  <span>Ages {selectedLesson.ageRange?.min || 8}-{selectedLesson.ageRange?.max || 12}</span>
                  <span>•</span>
                  <span className="capitalize">{selectedLesson.difficulty || 'beginner'}</span>
                  <Badge className={statusColors[selectedLesson.status] || statusColors.draft}>
                    {selectedLesson.status || 'draft'}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleEditLesson(selectedLesson.id)} className="bg-slate-900">
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Lesson
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => duplicateMutation.mutate(selectedLesson)}
                  disabled={duplicateMutation.isPending}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setLessonToDelete(selectedLesson);
                    setDeleteDialogOpen(true);
                  }}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="text-xs text-slate-500 mb-1">Steps</div>
                <div className="text-2xl font-semibold text-slate-900">
                  {selectedLesson.steps?.length || 0}
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <div className="text-xs text-slate-500 mb-1">Time</div>
                <div className="text-2xl font-semibold text-slate-900">
                  {selectedLesson.estimatedMinutes || 0}m
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <div className="text-xs text-slate-500 mb-1">Difficulty</div>
                <div className="text-base font-semibold text-slate-900 capitalize">
                  {selectedLesson.difficulty || 'beginner'}
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <div className="text-xs text-slate-500 mb-1">Version</div>
                <div className="text-2xl font-semibold text-slate-900">
                  {selectedLesson.version || '1.0'}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-3">Details</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <dt className="text-slate-500">World Template</dt>
                  <dd className="font-medium">{getWorldTemplate(selectedLesson.worldTemplateId)?.name || 'None'}</dd>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <dt className="text-slate-500">Status</dt>
                  <dd className="font-medium capitalize">{selectedLesson.status || 'draft'}</dd>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <dt className="text-slate-500">Order Index</dt>
                  <dd className="font-medium">{selectedLesson.orderIndex || 0}</dd>
                </div>
              </dl>
            </div>

            {selectedLesson.learningObjectives?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-2">Learning Objectives</h3>
                <ul className="space-y-1 text-sm text-slate-700">
                  {selectedLesson.learningObjectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedLesson.steps?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-3">Lesson Steps</h3>
                <div className="space-y-2">
                  {selectedLesson.steps.map((step, index) => (
                    <div key={step.id || index} className="flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
                      <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="text-lg flex-shrink-0">
                        {step.type === 'task' ? '🎯' : '📖'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900 mb-0.5">
                          {step.title || `Step ${index + 1}`}
                        </div>
                        {step.instruction && (
                          <div className="text-sm text-slate-500 line-clamp-2">
                            {step.instruction}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        detailEmpty={
          <div className="text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500 mb-4">Select a lesson to view details</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={handleCreateLesson} size="sm" className="bg-slate-900">
                <Plus className="w-4 h-4 mr-2" />
                Create Lesson
              </Button>
              <Button onClick={() => setShowAIGenerator(true)} size="sm" variant="outline" className="border-indigo-300 text-indigo-700 hover:bg-indigo-50">
                <Sparkles className="w-4 h-4 mr-2" />
                Generate with AI
              </Button>
            </div>
          </div>
        }
      />

      {/* AI Lesson Generator */}
      <AILessonGenerator
        open={showAIGenerator}
        onClose={() => setShowAIGenerator(false)}
        onLessonGenerated={handleAILessonGenerated}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lesson</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{lessonToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(lessonToDelete?.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}