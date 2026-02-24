import React, { useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';

export default function CodeEditor({ code, onChange, isPlaying, onError }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [code]);

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newValue = code.substring(0, start) + '  ' + code.substring(end);
      onChange(newValue);
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2;
      }, 0);
    }
  };

  const highlightSyntax = (text) => {
    const keywords = ['when', 'clicked', 'repeat', 'times', 'forever', 'if', 'move', 'forward', 'turn', 'left', 'right', 'place', 'block', 'break'];
    const numbers = /\b\d+\b/g;
    
    let highlighted = text;
    
    // Highlight keywords
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      highlighted = highlighted.replace(regex, `<span class="text-blue-600 font-semibold">${keyword}</span>`);
    });
    
    // Highlight numbers
    highlighted = highlighted.replace(numbers, '<span class="text-purple-600 font-semibold">$&</span>');
    
    return highlighted;
  };

  return (
    <Card className="relative bg-slate-900 border-0 shadow-2xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
      
      {/* Line numbers */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-slate-950/50 border-r border-slate-700 flex flex-col pt-4 pb-4 z-10">
        {code.split('\n').map((_, i) => (
          <div
            key={i}
            className="h-6 flex items-center justify-end px-2 text-xs text-slate-500 font-mono"
          >
            {i + 1}
          </div>
        ))}
      </div>

      {/* Editor */}
      <div className="relative pl-12">
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isPlaying}
          className={`
            w-full min-h-[400px] p-4 bg-transparent text-white font-mono text-sm leading-6
            resize-none outline-none z-20 relative
            ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          placeholder="// Start coding in Epic Mode...
// Example:
when play clicked
  repeat 3 times
    move forward
    place grass block
  end
end"
          spellCheck={false}
        />
      </div>

      {isPlaying && (
        <div className="absolute inset-0 bg-blue-500/5 pointer-events-none z-30" />
      )}
    </Card>
  );
}