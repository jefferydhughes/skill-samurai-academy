import React, { useState } from 'react';
import Block from './Block';

export default function BlockWorkspace({ scripts, onChange, isPlaying }) {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const blockData = e.dataTransfer.getData('block');
    if (blockData) {
      const block = JSON.parse(blockData);
      onChange([...scripts, { ...block, id: `${block.id}_${Date.now()}` }]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  return (
    <div 
      className={`
        h-full p-6 overflow-auto transition-colors
        ${dragOver ? 'bg-blue-50' : 'bg-white'}
        ${isPlaying ? 'pointer-events-none opacity-75' : ''}
      `}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      style={{
        backgroundImage: dragOver ? 'none' : 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }}
    >
      {scripts.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🧩</div>
            <p className="text-slate-400 text-sm font-medium">Drag blocks here to start coding!</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3 max-w-md">
          {scripts.map((block, index) => (
            <div key={block.id} className="relative">
              <Block block={block} isDragging={false} />
              {index < scripts.length - 1 && (
                <div className="absolute left-1/2 -translate-x-1/2 w-0.5 h-3 bg-slate-300" />
              )}
            </div>
          ))}
        </div>
      )}

      {dragOver && (
        <div className="absolute inset-0 border-4 border-dashed border-blue-400 rounded-2xl pointer-events-none" />
      )}
    </div>
  );
}