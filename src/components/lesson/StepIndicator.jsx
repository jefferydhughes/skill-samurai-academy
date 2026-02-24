import React from 'react';

export default function StepIndicator({
  lessonSteps,
  lessonProgress,
  completedSteps
}) {
  return (
    <div className="flex gap-1 mt-2">
      {lessonSteps.map(step => (
        <span
          key={step.id}
          className={`w-2 h-2 rounded-full ${
            completedSteps.includes(step.id)
              ? 'bg-[#8ED1C6]'
              : step.id === lessonProgress
              ? 'bg-[#6B7FD7]'
              : 'bg-black/20'
          }`}
        />
      ))}
    </div>
  );
}