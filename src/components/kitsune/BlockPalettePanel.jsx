import React from 'react';
import { 
  Zap, 
  Play, 
  GitBranch, 
  Radio, 
  Database, 
  Sparkles 
} from 'lucide-react';

const categories = [
  { id: 'motion', label: 'Motion', icon: Zap, color: 'bg-blue-500', hoverColor: 'hover:bg-blue-600' },
  { id: 'events', label: 'Events', icon: Play, color: 'bg-amber-500', hoverColor: 'hover:bg-amber-600' },
  { id: 'control', label: 'Control', icon: GitBranch, color: 'bg-rose-500', hoverColor: 'hover:bg-rose-600' },
  { id: 'sensing', label: 'Sensing', icon: Radio, color: 'bg-cyan-500', hoverColor: 'hover:bg-cyan-600' },
  { id: 'variables', label: 'Variables', icon: Database, color: 'bg-violet-500', hoverColor: 'hover:bg-violet-600' },
  { id: 'ai', label: 'AI & ML', icon: Sparkles, color: 'bg-emerald-500', hoverColor: 'hover:bg-emerald-600' },
];

const blocksByCategory = {
  motion: [
    'move 10 steps',
    'turn ↻ 15 degrees',
    'turn ↺ 15 degrees',
    'go to x: 0 y: 0',
    'glide 1 sec to x: 0 y: 0',
    'point in direction 90',
    'change x by 10',
    'change y by 10',
  ],
  events: [
    'when ▶ clicked',
    'when space key pressed',
    'when this sprite clicked',
    'when backdrop switches to',
    'broadcast message',
    'when I receive message',
  ],
  control: [
    'wait 1 seconds',
    'repeat 10',
    'forever',
    'if <> then',
    'if <> then else',
    'wait until <>',
    'repeat until <>',
    'stop all',
  ],
  sensing: [
    'touching <?> ?',
    'touching color #?',
    'color # is touching #?',
    'distance to <?> ',
    'ask [What\'s your name?] and wait',
    'answer',
    'key <space> pressed?',
    'mouse down?',
  ],
  variables: [
    'set my variable to 0',
    'change my variable by 1',
    'show variable',
    'hide variable',
    'add [thing] to list',
    'delete 1 of list',
    'insert [thing] at 1 of list',
  ],
  ai: [
    'train model with images',
    'when image recognized as [label]',
    'train text model with [data]',
    'ask AI [prompt] and wait',
    'AI confidence for [label]',
    'generate sprite with [description]',
  ],
};

export default function BlockPalettePanel({ selectedCategory, onCategoryChange }) {
  const blocks = blocksByCategory[selectedCategory] || [];
  const activeCat = categories.find(c => c.id === selectedCategory);

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Category Rail */}
      <div className="w-20 bg-slate-900 border-r border-slate-700 flex flex-col py-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`flex flex-col items-center justify-center py-4 gap-1 transition-all ${
                isActive 
                  ? 'text-white bg-slate-800' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium text-center leading-tight">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Blocks List */}
      <div className="flex-1 overflow-auto">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            {activeCat && (
              <>
                <div className={`w-8 h-8 rounded-lg ${activeCat.color} flex items-center justify-center`}>
                  <activeCat.icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">{activeCat.label}</h3>
                  <p className="text-slate-400 text-xs">{blocks.length} blocks</p>
                </div>
              </>
            )}
          </div>

          <div className="space-y-2">
            {blocks.map((block, idx) => (
              <div
                key={idx}
                className={`${activeCat?.color} ${activeCat?.hoverColor} text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm cursor-grab active:scale-95 transition-all`}
                draggable
              >
                {block}
              </div>
            ))}
          </div>

          {selectedCategory === 'ai' && (
            <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <div className="flex items-start gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-emerald-100 font-semibold text-sm mb-1">AI-Powered Blocks</h4>
                  <p className="text-emerald-200/70 text-xs leading-relaxed">
                    Train simple models or generate content using AI. Perfect for adding smart behaviors to your game!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}