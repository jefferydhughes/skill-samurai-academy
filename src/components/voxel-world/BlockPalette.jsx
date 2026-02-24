import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export default function BlockPalette({ blocks, selectedBlock, onBlockSelect, onClose }) {
  const blockColors = {
    grass: 'bg-green-400',
    dirt: 'bg-amber-700',
    stone: 'bg-gray-500',
    wood: 'bg-amber-300',
    brick: 'bg-red-700',
    sand: 'bg-yellow-400',
  };

  return (
    <Card className="absolute top-20 left-4 w-64 shadow-xl border-slate-200 bg-white/95 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Block Palette</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-6 w-6 text-slate-500 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        {Object.entries(blocks).map(([type, { name }]) => (
          <button
            key={type}
            onClick={() => onBlockSelect(type)}
            className={`
              flex flex-col items-center gap-2 p-3 rounded-lg transition-all
              ${selectedBlock === type 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }
            `}
          >
            <div className={`w-12 h-12 rounded ${blockColors[type]} shadow-sm`} />
            <span className="text-xs font-medium">{name}</span>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}