import React from 'react';

export default function LessonContent({ currentStep }) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm text-[#2E3440]">
      <h3 className="font-semibold">
        Step {currentStep.id}: {currentStep.title}
      </h3>

      <p className="text-[#6B7280]">
        {currentStep.description}
      </p>

      {/* Mocked lesson body (URL-driven later) */}
      <div className="bg-white rounded-xl p-3 border border-black/5">
        <p className="text-xs leading-relaxed">
          Use the <strong>move</strong> block to make your character move.
        </p>

        <pre className="mt-3 text-xs bg-slate-100 rounded-lg p-2 font-mono">
move 10 steps
        </pre>
      </div>
    </div>
  );
}