import React from 'react';

export default function Block({ block, isDragging }) {
  const getBlockStyle = () => {
    const baseStyle = `
      px-4 py-3 rounded-2xl text-white font-medium text-sm shadow-md
      transition-all select-none
      ${isDragging ? 'opacity-50 scale-95' : 'hover:shadow-lg hover:-translate-y-0.5'}
    `;

    if (block.type === 'event') {
      return `${baseStyle} ${block.color} rounded-t-2xl`;
    }
    
    if (block.type === 'control') {
      return `${baseStyle} ${block.color}`;
    }
    
    return `${baseStyle} ${block.color}`;
  };

  const formatBlockText = (text) => {
    // Replace [value] with inline input-style spans
    return text.split(/(\[.*?\])/).map((part, i) => {
      if (part.match(/\[.*?\]/)) {
        const value = part.replace(/[\[\]]/g, '');
        return (
          <span 
            key={i} 
            className="inline-flex items-center gap-1 px-2 py-0.5 mx-1 bg-white/20 rounded-lg text-xs font-semibold"
          >
            {value}
            {value === '3' && (
              <span className="flex flex-col text-[8px] leading-none">
                <span>▲</span>
                <span>▼</span>
              </span>
            )}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className={getBlockStyle()}>
      {formatBlockText(block.text)}
    </div>
  );
}