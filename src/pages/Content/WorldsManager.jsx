import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus,
  Copy,
  Globe,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CollectionDetail from '@/components/layouts/CollectionDetail';
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

export default function WorldsManager() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorldId, setSelectedWorldId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [worldToDelete, setWorldToDelete] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: worlds = [] } = useQuery({
    queryKey: ['worldTemplates'],
    queryFn: () => api.entities.WorldTemplate.list('-updated_date'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.entities.WorldTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['worldTemplates']);
      setDeleteDialogOpen(false);
      setWorldToDelete(null);
      if (selectedWorldId === worldToDelete?.id) {
        setSelectedWorldId(null);
      }
    }
  });

  const duplicateMutation = useMutation({
    mutationFn: async (world) => {
      const newWorld = {
        ...world,
        name: `${world.name} (Copy)`,
        status: 'draft'
      };
      delete newWorld.id;
      delete newWorld.created_date;
      delete newWorld.updated_date;
      return api.entities.WorldTemplate.create(newWorld);
    },
    onSuccess: (newWorld) => {
      queryClient.invalidateQueries(['worldTemplates']);
      setSelectedWorldId(newWorld.id);
    }
  });

  const filteredWorlds = worlds.filter(world => {
    const matchesSearch = !searchQuery || 
      world.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const selectedWorld = worlds.find(w => w.id === selectedWorldId);

  const handleCreateWorld = () => {
    // Navigate to world editor or open creation dialog
    console.log('Create world');
  };

  return (
    <>
      <CollectionDetail
        items={filteredWorlds}
        selectedId={selectedWorldId}
        onSelectItem={(world) => setSelectedWorldId(world.id)}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search worlds..."
        collectionEmpty="No worlds found"
        renderCollectionItem={(world, isSelected) => (
          <div className="flex items-start gap-3">
            <div className="text-2xl flex-shrink-0 mt-0.5">🌍</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-semibold truncate text-sm">{world.name}</span>
                <Badge className={`text-xs ${statusColors[world.status] || statusColors.draft}`}>
                  {world.status || 'draft'}
                </Badge>
              </div>
              <div className={`text-xs ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                {world.category || 'General'}
              </div>
            </div>
          </div>
        )}
        renderDetail={() => selectedWorld && (
          <div className="p-6 space-y-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-3">{selectedWorld.name}</h2>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <span className="capitalize">{selectedWorld.category || 'general'}</span>
                  <span>•</span>
                  <span>v{selectedWorld.version || '1.0'}</span>
                  <Badge className={statusColors[selectedWorld.status] || statusColors.draft}>
                    {selectedWorld.status || 'draft'}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => duplicateMutation.mutate(selectedWorld)}
                  disabled={duplicateMutation.isPending}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setWorldToDelete(selectedWorld);
                    setDeleteDialogOpen(true);
                  }}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {selectedWorld.description && (
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-2">Description</h3>
                <p className="text-sm text-slate-700">{selectedWorld.description}</p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="text-xs text-slate-500 mb-1">Version</div>
                <div className="text-2xl font-semibold text-slate-900">
                  {selectedWorld.version || '1.0'}
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <div className="text-xs text-slate-500 mb-1">Engine</div>
                <div className="text-base font-semibold text-slate-900">
                  {selectedWorld.engineVersion || 'Latest'}
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <div className="text-xs text-slate-500 mb-1">Blocks</div>
                <div className="text-2xl font-semibold text-slate-900">
                  {selectedWorld.allowedBlocks?.length || 0}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-3">Details</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <dt className="text-slate-500">Category</dt>
                  <dd className="font-medium capitalize">{selectedWorld.category || 'general'}</dd>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <dt className="text-slate-500">Status</dt>
                  <dd className="font-medium capitalize">{selectedWorld.status || 'draft'}</dd>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <dt className="text-slate-500">Engine Version</dt>
                  <dd className="font-medium">{selectedWorld.engineVersion || 'Latest'}</dd>
                </div>
              </dl>
            </div>

            {selectedWorld.allowedBlocks?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-2">Allowed Blocks</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedWorld.allowedBlocks.map((block, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {block}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        detailEmpty={
          <div className="text-center">
            <Globe className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500 mb-4">Select a world to view details</p>
            <Button onClick={handleCreateWorld} size="sm" className="bg-slate-900">
              <Plus className="w-4 h-4 mr-2" />
              Create World
            </Button>
          </div>
        }
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete World Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{worldToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(worldToDelete?.id)}
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