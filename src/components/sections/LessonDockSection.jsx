import React from 'react';
import LessonHeader from '@/components/lesson/LessonHeader';
import LessonContent from '@/components/lesson/LessonContent';
import LessonFooter from '@/components/lesson/LessonFooter';

export default function LessonDockSection({
  lessonSteps,
  currentStep,
  lessonProgress,
  completedSteps,
  onStepComplete,
  onPrev,
  onNext
}) {
  return (
    <aside className="hidden lg:flex w-[340px] flex-col bg-[#F4F1EC] border-r border-black/5">

      <LessonHeader
        title="Platformer Basics"
        lessonSteps={lessonSteps}
        lessonProgress={lessonProgress}
        completedSteps={completedSteps}
      />

      <LessonContent currentStep={currentStep} />

      <LessonFooter
        lessonProgress={lessonProgress}
        onPrev={onPrev}
        onNext={onNext}
      />

    </aside>
  );
}