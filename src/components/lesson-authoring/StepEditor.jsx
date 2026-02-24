import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Plus, Lightbulb } from 'lucide-react';
import ConditionBuilder from './ConditionBuilder';

export default function StepEditor({ step, stepIndex, onUpdateStep }) {
  const addHint = () => {
    const newHints = [...(step.hints || []), ''];
    onUpdateStep({ hints: newHints });
  };

  const updateHint = (index, value) => {
    const newHints = [...(step.hints || [])];
    newHints[index] = value;
    onUpdateStep({ hints: newHints });
  };

  const removeHint = (index) => {
    const newHints = (step.hints || []).filter((_, i) => i !== index);
    onUpdateStep({ hints: newHints });
  };

  return (
    <div className="flex-1 overflow-auto bg-[#F6F7F9]">
      <div className="max-w-3xl mx-auto p-6 space-y-4">
        {/* Step Type */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="text-sm font-medium text-slate-700 mb-4">Step Type</div>
          <RadioGroup 
            value={step.type || 'instruction'} 
            onValueChange={(value) => onUpdateStep({ type: value })}
            className="grid grid-cols-2 gap-3"
          >
            <div>
              <RadioGroupItem value="instruction" id="type-instruction" className="peer sr-only" />
              <Label 
                htmlFor="type-instruction" 
                className="flex flex-col items-start p-4 border-2 border-slate-200 rounded-xl cursor-pointer peer-checked:border-slate-900 peer-checked:bg-slate-50 hover:border-slate-300 transition-all"
              >
                <span className="text-lg mb-1">📖</span>
                <span className="font-medium text-sm">Instruction</span>
                <span className="text-xs text-slate-500">Just reads and clicks next</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="task" id="type-task" className="peer sr-only" />
              <Label 
                htmlFor="type-task" 
                className="flex flex-col items-start p-4 border-2 border-slate-200 rounded-xl cursor-pointer peer-checked:border-slate-900 peer-checked:bg-slate-50 hover:border-slate-300 transition-all"
              >
                <span className="text-lg mb-1">🎯</span>
                <span className="font-medium text-sm">Task</span>
                <span className="text-xs text-slate-500">Must complete actions</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="text-sm font-medium text-slate-700 mb-4">
            {step.type === 'task' ? 'Task Description' : 'Instruction Content'}
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm">Title</Label>
              <Input
                id="title"
                value={step.title || ''}
                onChange={(e) => onUpdateStep({ title: e.target.value })}
                placeholder="e.g., Place your first block"
                className="border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instruction" className="text-sm">
                {step.type === 'task' ? 'What should the student do?' : 'Instruction'}
              </Label>
              <Textarea
                id="instruction"
                value={step.instruction || ''}
                onChange={(e) => onUpdateStep({ instruction: e.target.value })}
                placeholder={step.type === 'task' 
                  ? 'Place 3 grass blocks using code.' 
                  : 'Click Play to run your program.'
                }
                rows={3}
                className="resize-none border-slate-200"
              />
              <p className="text-xs text-slate-500">
                Be clear and encouraging!
              </p>
            </div>
          </div>
        </div>

        {/* Completion Rules (Task Type Only) */}
        {step.type === 'task' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <div className="text-sm font-medium text-slate-700 mb-1">🎯 How do we know they finished?</div>
            <p className="text-xs text-slate-500 mb-4">Add conditions the student must meet to complete this step</p>
            <ConditionBuilder
              step={step}
              onUpdateStep={onUpdateStep}
            />
          </div>
        )}

        {/* Instruction Completion (Instruction Type Only) */}
        {step.type === 'instruction' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <div className="text-sm font-medium text-slate-700 mb-4">Completion Rule</div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <input 
                  type="checkbox" 
                  checked={true} 
                  readOnly
                  className="w-4 h-4 rounded border-slate-300"
                />
                <Label className="text-sm cursor-default">Student clicks "Next"</Label>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    checked={step.requiresPlay || false}
                    onChange={(e) => onUpdateStep({ requiresPlay: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300"
                  />
                  <Label className="text-sm cursor-pointer" onClick={() => onUpdateStep({ requiresPlay: !step.requiresPlay })}>
                    Student presses ▶ Play
                  </Label>
                </div>
              </div>
              {!step.requiresPlay && (
                <p className="text-xs text-slate-500">
                  Student can simply click next without running code
                </p>
              )}
            </div>
          </div>
        )}

        {/* Hints */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-slate-700">Hints & Feedback</span>
            </div>
            <Button variant="ghost" size="sm" onClick={addHint} className="text-slate-600">
              <Plus className="w-4 h-4 mr-1" />
              Add Hint
            </Button>
          </div>
          <div className="space-y-3">
            {(!step.hints || step.hints.length === 0) ? (
              <p className="text-sm text-slate-500">No hints yet. Add hints to help stuck students.</p>
            ) : (
              step.hints.map((hint, index) => (
                <div key={index} className="flex gap-2">
                  <Textarea
                    value={hint}
                    onChange={(e) => updateHint(index, e.target.value)}
                    placeholder="Try using a repeat block..."
                    rows={2}
                    className="resize-none text-sm border-slate-200"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => removeHint(index)}
                    className="flex-shrink-0 text-slate-400 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}