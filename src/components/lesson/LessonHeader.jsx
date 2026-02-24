import React from 'react';
import StepIndicator from './StepIndicator';

export default function LessonHeader({
  title,
  lessonSteps,
  lessonProgress,
  completedSteps
}) {
  return (
    <div className="sticky top-0 z-10 bg-[#F4F1EC] border-b border-black/5 p-4">
      <h2 className="text-[#2E3440] font-semibold text-sm">{title}</h2>

      <StepIndicator
        lessonSteps={lessonSteps}
        lessonProgress={lessonProgress}
        completedSteps={completedSteps}
      />
    </div>
  );
}