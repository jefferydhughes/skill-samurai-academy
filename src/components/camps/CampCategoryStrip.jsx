import React from 'react';
import { CAMP_CATEGORIES } from './campCategories';

export default function CampCategoryStrip({ active, onChange }) {
  return (
    <div className="flex gap-3 overflow-x-auto px-4 pb-3 no-scrollbar snap-x snap-mandatory">
      {CAMP_CATEGORIES.map(cat => {
        const isActive = active === cat.key;

        return (
          <button
            key={cat.key}
            onClick={() => onChange(cat.key)}
            className={`
              flex flex-col items-center justify-center
              min-w-[72px] h-[72px] rounded-2xl
              transition-all snap-start
              ${isActive
                ? `bg-gradient-to-br ${cat.color} text-white shadow-lg scale-105`
                : 'bg-white/70 backdrop-blur border border-white/40 text-gray-700 hover:bg-white/90'}
            `}
          >
            <span className="text-2xl mb-1">{cat.icon}</span>
            <span className="text-xs font-medium">{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}