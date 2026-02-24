import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark, Lightbulb, HelpCircle, Trophy } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { flagIdea } from './learningContextManager';

const FLAG_TYPES = [
  { value: 'creative_idea', label: 'Creative Idea', icon: Lightbulb, color: 'text-yellow-600' },
  { value: 'problem_to_solve', label: 'Problem to Solve', icon: HelpCircle, color: 'text-blue-600' },
  { value: 'question', label: 'Question', icon: HelpCircle, color: 'text-purple-600' },
  { value: 'achievement', label: 'Achievement', icon: Trophy, color: 'text-green-600' },
];

export default function IdeaFlagButton({ studentId, sourceContext, relatedConcepts = [], onFlagged }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    flagType: 'creative_idea'
  });

  const handleSave = async () => {
    if (!formData.title.trim()) return;

    setSaving(true);
    try {
      await flagIdea(studentId, {
        ...formData,
        sourceContext,
        relatedConcepts,
        aiSuggested: false
      });

      setOpen(false);
      setFormData({ title: '', description: '', flagType: 'creative_idea' });
      if (onFlagged) onFlagged();
    } catch (e) {
      console.error('Failed to flag idea:', e);
    } finally {
      setSaving(false);
    }
  };

  const selectedType = FLAG_TYPES.find(t => t.value === formData.flagType);
  const Icon = selectedType?.icon || Bookmark;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <Bookmark className="w-4 h-4" />
        Save Idea
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Flag This Idea</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>What kind of idea is this?</Label>
              <Select 
                value={formData.flagType} 
                onValueChange={(value) => setFormData({ ...formData, flagType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FLAG_TYPES.map(type => {
                    const TypeIcon = type.icon;
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <TypeIcon className={`w-4 h-4 ${type.color}`} />
                          {type.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Brief description of your idea"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Details (optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What do you want to remember or explore later?"
                className="h-24"
              />
            </div>

            {relatedConcepts.length > 0 && (
              <div className="text-sm text-slate-600">
                <div className="font-medium mb-1">Related concepts:</div>
                <div className="flex flex-wrap gap-1">
                  {relatedConcepts.map((concept, i) => (
                    <span key={i} className="px-2 py-1 bg-slate-100 rounded text-xs">
                      {concept.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={saving || !formData.title.trim()}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {saving ? 'Saving...' : 'Save Idea'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}