import React from 'react';
import { Button } from '@/components/ui/button';

export default function LessonFooter({
  lessonProgress,
  onPrev,
  onNext
}) {
  return (
    <div className="sticky bottom-0 bg-[#F4F1EC] border-t border-black/5 p-3 flex items-center justify-between">
      <span className="text-xs text-[#6B7280]">Progress saved</span>

      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={onPrev}>
          Previous
        </Button>
        <Button
          size="sm"
          className="bg-[#6B7FD7] hover:bg-[#5A6ACF] text-white"
          onClick={onNext}
        >
          Mark Complete
        </Button>
      </div>
    </div>
  );
}