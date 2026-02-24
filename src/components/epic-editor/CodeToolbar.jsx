import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Square, RotateCcw, Code2, Blocks, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function CodeToolbar({ 
  isPlaying, 
  onPlay, 
  onStop, 
  onReset,
  onToggleMode,
  mode,
  onSave,
  isSaving
}) {
  return (
    <div className="h-14 border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <Button
          onClick={isPlaying ? onStop : onPlay}
          className={`
            ${isPlaying 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
            }
            text-white font-semibold shadow-lg
          `}
          size="sm"
        >
          {isPlaying ? (
            <>
              <Square className="w-4 h-4 mr-2 fill-white" />
              Stop
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2 fill-white" />
              Run Code
            </>
          )}
        </Button>

        <Button
          onClick={onReset}
          variant="outline"
          size="sm"
          disabled={isPlaying}
          className="border-slate-600 text-slate-300 hover:bg-slate-800"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>

        <div className="h-6 w-px bg-slate-700 mx-2" />

        <Button
          onClick={onToggleMode}
          variant="ghost"
          size="sm"
          className="text-slate-300 hover:bg-slate-800"
        >
          {mode === 'epic' ? (
            <>
              <Blocks className="w-4 h-4 mr-2" />
              Switch to Blocks
            </>
          ) : (
            <>
              <Code2 className="w-4 h-4 mr-2" />
              Switch to Epic
            </>
          )}
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant="secondary" className="bg-slate-800 text-slate-300 border-slate-700">
          Epic Mode
        </Badge>

        <Button
          onClick={onSave}
          variant="ghost"
          size="sm"
          disabled={isSaving}
          className="text-slate-300 hover:bg-slate-800"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
}