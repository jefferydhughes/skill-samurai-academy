import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, AlertCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { TUNABLES } from './tunablesConfig';

export default function LiveTuningBlock({ block, onChange, onRemove, error }) {
  const tunable = TUNABLES.find(t => t.key === block.key);
  const numericTunables = TUNABLES.filter(t => t.type === 'number');
  const booleanTunables = TUNABLES.filter(t => t.type === 'boolean');

  const handleTunableChange = (key) => {
    const newTunable = TUNABLES.find(t => t.key === key);
    onChange({
      ...block,
      key,
      value: newTunable.default
    });
  };

  const handleValueChange = (value) => {
    onChange({
      ...block,
      value: tunable.type === 'number' ? Number(value) : value
    });
  };

  if (block.opcode === 'RESET_TUNABLES') {
    return (
      <Card className={`p-4 bg-slate-50 border-2 ${error ? 'border-red-300' : 'border-slate-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">Reset all tunables to defaults</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="h-6 w-6 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        {error && (
          <div className="mt-2 flex items-center gap-2 text-xs text-red-600">
            <AlertCircle className="w-3 h-3" />
            {error}
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card className={`p-4 bg-white border-2 ${error ? 'border-red-300 animate-shake' : 'border-slate-200'}`}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">SET TUNABLE</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="h-6 w-6 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-slate-700">set</span>
          
          <Select value={block.key || ''} onValueChange={handleTunableChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Choose parameter" />
            </SelectTrigger>
            <SelectContent>
              <div className="p-2 text-xs font-semibold text-slate-500">NUMBERS</div>
              {numericTunables.map(t => (
                <SelectItem key={t.key} value={t.key}>{t.label}</SelectItem>
              ))}
              <div className="p-2 text-xs font-semibold text-slate-500">SWITCHES</div>
              {booleanTunables.map(t => (
                <SelectItem key={t.key} value={t.key}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span className="text-sm text-slate-700">to</span>

          {tunable?.type === 'number' && (
            <Input
              type="number"
              value={block.value}
              onChange={(e) => handleValueChange(e.target.value)}
              min={tunable.min}
              max={tunable.max}
              step={tunable.step}
              className="w-24"
            />
          )}

          {tunable?.type === 'boolean' && (
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg">
              <Switch
                checked={block.value}
                onCheckedChange={handleValueChange}
              />
              <span className="text-sm font-medium">{block.value ? 'ON' : 'OFF'}</span>
            </div>
          )}
        </div>

        {tunable && (
          <p className="text-xs text-slate-500 italic">{tunable.description}</p>
        )}

        {error && (
          <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded">
            <AlertCircle className="w-3 h-3 flex-shrink-0" />
            {error}
          </div>
        )}
      </div>
    </Card>
  );
}