import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Plus, RotateCcw, Play, AlertCircle } from 'lucide-react';
import LiveTuningBlock from './LiveTuningBlock';
import { validateLiveTuning, compileToPatch } from './liveTuningValidator';
import { getDefaultValues } from './tunablesConfig';

export default function LiveTuningOverlay({ open, onClose, onApply, worldAdapter }) {
  const [blocks, setBlocks] = useState([]);
  const [validation, setValidation] = useState({ valid: true, errors: [] });

  useEffect(() => {
    if (blocks.length > 0) {
      const result = validateLiveTuning(blocks);
      setValidation(result);
    } else {
      setValidation({ valid: true, errors: [] });
    }
  }, [blocks]);

  const handleAddBlock = () => {
    setBlocks([...blocks, {
      id: Date.now(),
      opcode: 'SET_TUNABLE',
      key: 'world.gravity',
      value: 9.8
    }]);
  };

  const handleAddReset = () => {
    setBlocks([...blocks, {
      id: Date.now(),
      opcode: 'RESET_TUNABLES'
    }]);
  };

  const handleUpdateBlock = (id, updatedBlock) => {
    setBlocks(blocks.map(b => b.id === id ? { ...updatedBlock, id } : b));
  };

  const handleRemoveBlock = (id) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  const handleApply = () => {
    if (!validation.valid) return;

    const patch = compileToPatch(blocks);
    onApply(patch);
    onClose();
  };

  const handleReset = () => {
    const defaults = getDefaultValues();
    onApply(defaults);
    setBlocks([]);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Dark scrim */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Left Panel - Editor */}
      <div className="relative w-[500px] bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Live Tuning</h2>
              <p className="text-sm text-slate-600 mt-1">Change the rules to solve the challenge</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              onClick={handleAddBlock}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Tunable
            </Button>
            <Button
              onClick={handleAddReset}
              size="sm"
              variant="outline"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Block
            </Button>
          </div>
        </div>

        {/* Blocks Area */}
        <div className="flex-1 overflow-auto p-6 space-y-3">
          {blocks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-indigo-100 rounded-2xl flex items-center justify-center">
                <Play className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No tuning blocks yet</h3>
              <p className="text-sm text-slate-600 mb-4">Add blocks to adjust world parameters</p>
            </div>
          ) : (
            blocks.map((block, index) => {
              const blockError = validation.errors.find(e => e.startsWith(`Block ${index + 1}`));
              return (
                <div key={block.id}>
                  <LiveTuningBlock
                    block={block}
                    onChange={(updated) => handleUpdateBlock(block.id, updated)}
                    onRemove={() => handleRemoveBlock(block.id)}
                    error={blockError}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-200 space-y-3">
          {!validation.valid && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-700">
                  <div className="font-semibold mb-1">Cannot apply changes:</div>
                  <ul className="space-y-1 text-xs">
                    {validation.errors.map((error, i) => (
                      <li key={i}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex-1"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset All
            </Button>
            <Button
              onClick={handleApply}
              disabled={!validation.valid || blocks.length === 0}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-slate-300"
            >
              <Play className="w-4 h-4 mr-2" />
              Apply Changes
            </Button>
          </div>
        </div>
      </div>

      {/* Right Panel - World View (Paused) */}
      <div className="flex-1 relative flex items-center justify-center">
        <div className="absolute top-8 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-slate-700">PAUSED</span>
          </div>
        </div>
      </div>
    </div>
  );
}