import React, { useState } from 'react';
import Block from './Block';

const blockCategories = [
  {
    id: 'events',
    name: 'Events',
    emoji: '🟡',
    color: 'bg-amber-400',
    blocks: [
      { id: 'when_clicked', type: 'event', text: 'when ▶ clicked', color: 'bg-amber-400' },
      { id: 'when_key_pressed', type: 'event', text: 'when [space] key pressed', color: 'bg-amber-400' },
    ]
  },
  {
    id: 'control',
    name: 'Control',
    emoji: '🔵',
    color: 'bg-blue-400',
    blocks: [
      { id: 'repeat', type: 'control', text: 'repeat [3] times', color: 'bg-blue-400' },
      { id: 'forever', type: 'control', text: 'forever', color: 'bg-blue-400' },
      { id: 'if', type: 'control', text: 'if [condition]', color: 'bg-blue-400' },
    ]
  },
  {
    id: 'player',
    name: 'Player',
    emoji: '🟢',
    color: 'bg-green-400',
    blocks: [
      { id: 'move_forward', type: 'action', text: 'move forward', color: 'bg-green-400' },
      { id: 'turn_left', type: 'action', text: 'turn left', color: 'bg-green-400' },
      { id: 'turn_right', type: 'action', text: 'turn right', color: 'bg-green-400' },
    ]
  },
  {
    id: 'building',
    name: 'Building',
    emoji: '🟣',
    color: 'bg-purple-400',
    blocks: [
      { id: 'place_block', type: 'action', text: 'place [grass] block', color: 'bg-purple-400' },
      { id: 'break_block', type: 'action', text: 'break block', color: 'bg-purple-400' },
    ]
  },
];

export default function BlockPalette({ onBlockAdd }) {
  const [selectedCategory, setSelectedCategory] = useState('events');

  const category = blockCategories.find(c => c.id === selectedCategory);

  return (
    <div className="w-60 bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
      {/* Category Tabs */}
      <div className="p-3 border-b border-slate-100">
        <div className="text-xs font-semibold text-slate-500 mb-2">BLOCKS</div>
        <div className="space-y-1">
          {blockCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all text-sm font-medium
                ${selectedCategory === cat.id 
                  ? 'bg-slate-900 text-white' 
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }
              `}
            >
              <span className="text-lg">{cat.emoji}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Blocks List */}
      <div className="flex-1 overflow-auto p-3 space-y-2">
        {category?.blocks.map((block) => (
          <div
            key={block.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('block', JSON.stringify(block));
            }}
            className="cursor-move"
          >
            <Block block={block} isDragging={false} />
          </div>
        ))}
      </div>
    </div>
  );
}