import React, { useState } from 'react';
import { api } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import TrackForm from '../../components/admin/TrackForm';

export default function CurriculumBuilder() {
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [showTrackForm, setShowTrackForm] = useState(false);
  const [expandedTracks, setExpandedTracks] = useState({});

  const queryClient = useQueryClient();

  const { data: tracks = [] } = useQuery({
    queryKey: ['curriculum-tracks'],
    queryFn: () => api.entities.CurriculumTrack.list('order'),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['curriculum-projects'],
    queryFn: () => api.entities.CurriculumProject.list(),
  });

  const deleteTrackMutation = useMutation({
    mutationFn: (id) => api.entities.CurriculumTrack.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['curriculum-tracks'] });
    },
  });

  const updateTrackMutation = useMutation({
    mutationFn: ({ id, data }) => api.entities.CurriculumTrack.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['curriculum-tracks'] });
    },
  });

  const handleDragEnd = (result, trackId) => {
    if (!result.destination) return;

    const track = tracks.find(t => t.id === trackId);
    const newProjectIds = Array.from(track.project_ids || []);
    const [reorderedId] = newProjectIds.splice(result.source.index, 1);
    newProjectIds.splice(result.destination.index, 0, reorderedId);

    updateTrackMutation.mutate({
      id: trackId,
      data: { project_ids: newProjectIds }
    });
  };

  const getTrackProjects = (track) => {
    if (!track.project_ids) return [];
    return track.project_ids
      .map(id => projects.find(p => p.id === id))
      .filter(Boolean);
  };

  const toggleTrack = (trackId) => {
    setExpandedTracks(prev => ({
      ...prev,
      [trackId]: !prev[trackId]
    }));
  };

  const trackIcons = {
    '🛡️': 'Shield',
    '🎮': 'Game',
    '💻': 'Code',
    '🚀': 'Rocket',
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Curriculum Builder</h1>
          <p className="text-slate-600 mt-1">Create and organize learning tracks</p>
        </div>
        <Button
          onClick={() => {
            setSelectedTrack(null);
            setShowTrackForm(true);
          }}
          className="bg-[#EE3E86] hover:bg-[#d63577]"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Track
        </Button>
      </div>

      <Tabs defaultValue="your-curriculum" className="space-y-6">
        <TabsList className="bg-[#A3DAE8]/20">
          <TabsTrigger value="your-curriculum">Your Curriculum</TabsTrigger>
          <TabsTrigger value="project-catalog">Project Catalog</TabsTrigger>
        </TabsList>

        <TabsContent value="your-curriculum" className="space-y-4">
          {tracks.map((track) => {
            const trackProjects = getTrackProjects(track);
            const isExpanded = expandedTracks[track.id];

            return (
              <Card key={track.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleTrack(track.id)}
                      >
                        {isExpanded ? <ChevronDown /> : <ChevronRight />}
                      </Button>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: track.color || '#A3DAE8' }}>
                        {track.icon || '📚'}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{track.name}</h3>
                        <p className="text-sm text-slate-600">{trackProjects.length} projects</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {track.is_template && (
                        <Badge variant="secondary">Template</Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedTrack(track);
                          setShowTrackForm(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm('Delete this track?')) {
                            deleteTrackMutation.mutate(track.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>

                  {isExpanded && (
                    <DragDropContext onDragEnd={(result) => handleDragEnd(result, track.id)}>
                      <Droppable droppableId={track.id}>
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="space-y-2 ml-16"
                          >
                            {trackProjects.map((project, index) => (
                              <Draggable
                                key={project.id}
                                draggableId={project.id}
                                index={index}
                              >
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="bg-white border rounded-lg p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
                                  >
                                    <img
                                      src={project.provider_logo}
                                      alt={project.provider}
                                      className="w-8 h-8 object-contain"
                                    />
                                    <div className="flex-1">
                                      <div className="font-semibold">{project.title}</div>
                                      <div className="text-sm text-slate-600">
                                        {project.technology} • {project.estimated_hours}h
                                      </div>
                                    </div>
                                    <Badge>{project.difficulty}</Badge>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="project-catalog">
          <div className="text-center py-12 text-slate-500">
            Project catalog browser will be shown here
          </div>
        </TabsContent>
      </Tabs>

      {/* Track Form Dialog */}
      <Dialog open={showTrackForm} onOpenChange={setShowTrackForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedTrack ? 'Edit Track' : 'New Track'}
            </DialogTitle>
          </DialogHeader>
          <TrackForm
            track={selectedTrack}
            projects={projects}
            onSuccess={() => {
              setShowTrackForm(false);
              setSelectedTrack(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}