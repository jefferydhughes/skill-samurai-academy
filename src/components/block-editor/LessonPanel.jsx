import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Lightbulb, CheckCircle2, ChevronRight } from 'lucide-react';

export default function LessonPanel({ step, stepIndex, totalSteps, isComplete, onNext, onClose }) {
  return (
    <div className="w-80 bg-white border-l-2 border-slate-200 flex flex-col shadow-xl">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{step.type === 'task' ? '🎯' : '📖'}</span>
          <span className="text-xs font-semibold text-slate-500">
            Step {stepIndex + 1} of {totalSteps}
          </span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Step Title */}
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
          <p className="text-sm text-slate-600 leading-relaxed">{step.instruction}</p>
        </div>

        {/* Progress indicator */}
        <div className="flex gap-1">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < stepIndex 
                  ? 'bg-green-500' 
                  : i === stepIndex 
                  ? 'bg-blue-500' 
                  : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Completion status */}
        {isComplete && (
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div>
              <div className="font-semibold text-green-900 text-sm">Step Complete!</div>
              <div className="text-xs text-green-700">Great job! Ready for the next step?</div>
            </div>
          </div>
        )}

        {/* Hints */}
        {step.hints?.length > 0 && (
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-semibold text-amber-900">Need a hint?</span>
            </div>
            <ul className="space-y-1">
              {step.hints.map((hint, i) => (
                <li key={i} className="text-xs text-amber-800 leading-relaxed">
                  • {hint}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Footer */}
      {isComplete && (
        <div className="p-4 border-t border-slate-100">
          <Button 
            onClick={onNext}
            className="w-full bg-green-500 hover:bg-green-600 text-white rounded-xl h-12 text-sm font-semibold"
          >
            Next Step
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}