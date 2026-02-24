import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Check } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

// Friendly condition templates
const conditionTemplates = [
  { type: 'block_count', label: 'Place blocks', icon: '🧱' },
  { type: 'player_in_region', label: 'Move to location', icon: '📍' },
  { type: 'used_block_type', label: 'Use coding block', icon: '⚡' },
  { type: 'run_started', label: 'Run program', icon: '▶️' },
];

const blockTypes = ['grass', 'dirt', 'stone', 'wood', 'glass', 'water'];
const codingBlocks = ['repeat', 'forever', 'if', 'move_forward', 'turn_left', 'turn_right', 'place_block'];

export default function ConditionBuilder({ step, onUpdateStep }) {
  const completion = step.completion || { mode: 'all', validators: [] };
  const validators = completion.validators || [];

  const addCondition = (type) => {
    let newValidator = { type };
    
    // Set sensible defaults
    if (type === 'block_count') {
      newValidator.params = { block: 'grass', count: 3, operation: 'place' };
    } else if (type === 'used_block_type') {
      newValidator.params = { blockType: 'repeat' };
    } else if (type === 'player_in_region') {
      newValidator.params = { 
        region: { 
          x: [10, 12], 
          y: [1, 2], 
          z: [10, 12] 
        } 
      };
    }
    
    const newValidators = [...validators, newValidator];
    onUpdateStep({ 
      completion: { ...completion, validators: newValidators } 
    });
  };

  const updateCondition = (index, updates) => {
    const newValidators = [...validators];
    newValidators[index] = { 
      ...newValidators[index], 
      ...updates,
      params: { ...newValidators[index].params, ...updates.params }
    };
    onUpdateStep({ 
      completion: { ...completion, validators: newValidators } 
    });
  };

  const removeCondition = (index) => {
    const newValidators = validators.filter((_, i) => i !== index);
    onUpdateStep({ 
      completion: { ...completion, validators: newValidators } 
    });
  };

  const toggleCompletionMode = () => {
    onUpdateStep({ 
      completion: { 
        ...completion, 
        mode: completion.mode === 'all' ? 'any' : 'all' 
      } 
    });
  };

  return (
    <div className="space-y-3">
      {/* Completion Mode */}
      {validators.length > 1 && (
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
          <div>
            <Label className="text-sm font-medium">Completion Mode</Label>
            <p className="text-xs text-slate-500 mt-0.5">
              {completion.mode === 'all' 
                ? 'All conditions required' 
                : 'Any condition is enough'
              }
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${completion.mode === 'all' ? 'text-slate-900' : 'text-slate-400'}`}>
              All
            </span>
            <Switch
              checked={completion.mode === 'any'}
              onCheckedChange={toggleCompletionMode}
            />
            <span className={`text-xs font-medium ${completion.mode === 'any' ? 'text-slate-900' : 'text-slate-400'}`}>
              Any
            </span>
          </div>
        </div>
      )}

      {/* Conditions List */}
      {validators.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-sm">
          No conditions yet
        </div>
      ) : (
        <div className="space-y-2">
          {validators.map((validator, index) => (
            <ConditionCard
              key={index}
              validator={validator}
              index={index}
              onUpdate={(updates) => updateCondition(index, updates)}
              onRemove={() => removeCondition(index)}
            />
          ))}
        </div>
      )}

      {/* Add Condition */}
      <div className="pt-2">
        <div className="grid grid-cols-2 gap-2">
          {conditionTemplates.map((template) => (
            <Button
              key={template.type}
              variant="outline"
              size="sm"
              onClick={() => addCondition(template.type)}
              className="justify-start h-auto py-3 border-2 border-dashed hover:border-slate-400 hover:bg-slate-50"
            >
              <span className="mr-2 text-lg">{template.icon}</span>
              <span className="text-sm font-medium">{template.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ConditionCard({ validator, index, onUpdate, onRemove }) {
  const template = conditionTemplates.find(t => t.type === validator.type);
  
  return (
    <div className="border-2 border-slate-200 rounded-xl p-4 bg-slate-50 hover:border-slate-300 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{template?.icon}</span>
          <span className="text-sm font-semibold">The student must {template?.label.toLowerCase()}</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7 -mt-1 -mr-1 text-slate-400 hover:text-red-600"
          onClick={onRemove}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Block Count */}
      {validator.type === 'block_count' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Block Type</Label>
              <Select 
                value={validator.params?.block || 'grass'} 
                onValueChange={(value) => onUpdate({ params: { block: value } })}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {blockTypes.map(type => (
                    <SelectItem key={type} value={type} className="capitalize">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1">
              <Label className="text-xs">How Many</Label>
              <Input
                type="number"
                min="1"
                value={validator.params?.count || 3}
                onChange={(e) => onUpdate({ params: { count: parseInt(e.target.value) } })}
                className="h-8"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
            <Label className="text-xs font-medium">Using code blocks</Label>
            <Switch
              checked={validator.requiresCode || false}
              onCheckedChange={(checked) => onUpdate({ requiresCode: checked })}
            />
          </div>
        </div>
      )}

      {/* Used Block Type */}
      {validator.type === 'used_block_type' && (
        <div className="space-y-1">
          <Label className="text-xs">Which Coding Block</Label>
          <Select 
            value={validator.params?.blockType || 'repeat'} 
            onValueChange={(value) => onUpdate({ params: { blockType: value } })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {codingBlocks.map(type => (
                <SelectItem key={type} value={type}>
                  {type.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-500 mt-1">
            Student must use this block in their code (even if they don't run it)
          </p>
        </div>
      )}

      {/* Player in Region */}
      {validator.type === 'player_in_region' && (
        <div className="space-y-2">
          <Label className="text-xs">Target Location</Label>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-xs text-slate-500">X</Label>
              <Input
                type="number"
                value={validator.params?.region?.x?.[0] || 10}
                onChange={(e) => onUpdate({ 
                  params: { 
                    region: { 
                      ...validator.params?.region, 
                      x: [parseInt(e.target.value), validator.params?.region?.x?.[1] || 12] 
                    } 
                  } 
                })}
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs text-slate-500">Y</Label>
              <Input
                type="number"
                value={validator.params?.region?.y?.[0] || 1}
                onChange={(e) => onUpdate({ 
                  params: { 
                    region: { 
                      ...validator.params?.region, 
                      y: [parseInt(e.target.value), validator.params?.region?.y?.[1] || 2] 
                    } 
                  } 
                })}
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs text-slate-500">Z</Label>
              <Input
                type="number"
                value={validator.params?.region?.z?.[0] || 10}
                onChange={(e) => onUpdate({ 
                  params: { 
                    region: { 
                      ...validator.params?.region, 
                      z: [parseInt(e.target.value), validator.params?.region?.z?.[1] || 12] 
                    } 
                  } 
                })}
                className="h-8"
              />
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Student must walk to this area in the world
          </p>
        </div>
      )}

      {/* Run Started */}
      {validator.type === 'run_started' && (
        <div className="flex items-center gap-2 p-3 bg-green-50 rounded text-sm">
          <Check className="w-4 h-4 text-green-600" />
          <span className="text-green-700">Student must press ▶ Play to run their program</span>
        </div>
      )}
    </div>
  );
}