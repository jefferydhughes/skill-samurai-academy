import React from 'react';
import { Plus, Trash2, BookOpen, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function StepsList({
  steps,
  selectedIndex,
  onSelectStep,
  onAddStep,
  onDeleteStep,
  onReorderSteps,
}) {
  const getStepIcon = (type) => {
    return type === 'task' ? Target : BookOpen;
  };

  const hasValidators = (step) => {
    return step.completion?.validators?.length > 0;
  };

  return (
    <div className="w-64 border-r border-slate-200 bg-white flex flex-col flex-shrink-0">
      <div className="p-4 border-b border-slate-100">
        <div className="text-sm font-medium text-slate-700 mb-3">Lesson Steps</div>
        <Button 
          onClick={onAddStep} 
          size="sm" 
          className="w-full bg-slate-900 hover:bg-slate-800"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Step
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-3">
        {steps.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            No steps yet
          </div>
        ) : (
          <div className="space-y-2">
            {steps.map((step, index) => {
              const Icon = getStepIcon(step.type);
              const isSelected = index === selectedIndex;
              const isComplete = step.type === 'instruction' || hasValidators(step);
              
              return (
                <div
                  key={step.id || index}
                  onClick={() => onSelectStep(index)}
                  className={`
                    group relative flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all
                    ${isSelected 
                      ? 'bg-slate-900 text-white shadow-sm' 
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }
                  `}
                >
                  <div className={`
                    w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0
                    ${isSelected 
                      ? 'bg-white text-slate-900' 
                      : 'bg-white text-slate-600 border border-slate-200'
                    }
                  `}>
                    {index + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base flex-shrink-0">
                        {step.type === 'task' ? '🎯' : '📖'}
                      </span>
                      <span className="text-sm font-medium truncate">
                        {step.title || `Step ${index + 1}`}
                      </span>
                    </div>
                    {step.type === 'task' && (
                      <div className={`text-xs ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                        {step.completion?.validators?.length || 0} condition{step.completion?.validators?.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>

                  {!isComplete && (
                    <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-amber-400' : 'bg-amber-500'} flex-shrink-0 mt-1`} />
                  )}

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`
                          absolute right-1 top-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity
                          ${isSelected ? 'text-white hover:bg-slate-700' : 'text-slate-400 hover:bg-slate-100'}
                        `}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Step</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure? This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDeleteStep(index)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}