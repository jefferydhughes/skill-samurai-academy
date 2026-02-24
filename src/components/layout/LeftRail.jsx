import React from 'react';
import {
  BookOpen,
  Blocks,
  Sparkles,
  Bug,
  Settings
} from 'lucide-react';

export default function LeftRail({
  active = 'lessons',
  onSelect = () => {}
}) {
  const items = [
    { id: 'lessons', icon: BookOpen, label: 'Lessons' },
    { id: 'blocks', icon: Blocks, label: 'Blocks' },
    { id: 'ai', icon: Sparkles, label: 'AI' },
    { id: 'debug', icon: Bug, label: 'Debug' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <aside className="w-14 bg-[#2E3440] flex flex-col items-center py-4 gap-3 border-r border-black/20">

      {/* Top Cap (Game Token / Brand Dot) */}
      <div className="w-8 h-8 rounded-full bg-[#6B7FD7]/20 border border-[#6B7FD7]/30 mb-2" />

      {/* Rail Items */}
      {items.map(({ id, icon: Icon }) => {
        const isActive = active === id;

        return (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={`
              w-9 h-9 rounded-xl flex items-center justify-center
              transition-all
              ${isActive
                ? 'bg-[#6B7FD7]/30 border border-[#6B7FD7]/40 shadow-inner'
                : 'bg-white/5 hover:bg-white/10'}
            `}
            title={id}
          >
            <Icon
              className={`w-4 h-4 ${
                isActive ? 'text-[#6B7FD7]' : 'text-white/60'
              }`}
            />
          </button>
        );
      })}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom Cap */}
      <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 mb-2" />
    </aside>
  );
}