import React from 'react';
import { Button } from '@/components/ui/button';
import { Square, Eraser, Paintbrush, Palette } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function WorldToolbar({ 
  selectedTool, 
  onToolChange, 
  onToggleBlockPalette,
  selectedBlock 
}) {
  const tools = [
    { id: 'place', icon: Square, label: 'Place', color: 'bg-green-500' },
    { id: 'break', icon: Eraser, label: 'Break', color: 'bg-red-500' },
    { id: 'paint', icon: Paintbrush, label: 'Paint', color: 'bg-blue-500' },
  ];

  const blockColors = {
    grass: 'bg-green-400',
    dirt: 'bg-amber-700',
    stone: 'bg-gray-500',
    wood: 'bg-amber-300',
    brick: 'bg-red-700',
    sand: 'bg-yellow-400',
  };

  return (
    <Card className="absolute top-4 left-4 p-2 shadow-xl border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="flex flex-col gap-2">
        <div className="text-xs font-semibold text-slate-600 px-2">TOOLS</div>
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isSelected = selectedTool === tool.id;
          
          return (
            <Button
              key={tool.id}
              onClick={() => onToolChange(tool.id)}
              variant={isSelected ? 'default' : 'ghost'}
              size="sm"
              className={`
                justify-start gap-2 h-9
                ${isSelected ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'}
              `}
            >
              <div className={`w-2 h-2 rounded-full ${tool.color}`} />
              <Icon className="w-4 h-4" />
              <span className="text-xs font-medium">{tool.label}</span>
            </Button>
          );
        })}

        <div className="h-px bg-slate-200 my-1" />

        <Button
          onClick={onToggleBlockPalette}
          variant="ghost"
          size="sm"
          className="justify-start gap-2 h-9 text-slate-700 hover:bg-slate-100"
        >
          <div className={`w-4 h-4 rounded ${blockColors[selectedBlock]}`} />
          <Palette className="w-4 h-4" />
          <span className="text-xs font-medium capitalize">{selectedBlock}</span>
        </Button>
      </div>
    </Card>
  );
}