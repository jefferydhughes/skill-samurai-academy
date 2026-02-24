import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const companions = [
  {
    id: 'tracy',
    name: 'Tracy the Explorer',
    emoji: '🦖',
    description: 'Enthusiastic and adventurous. Loves trying new things and celebrates every discovery!',
    personality: 'Energetic',
    color: 'from-green-400 to-emerald-500'
  },
  {
    id: 'leo',
    name: 'Leo the Wise',
    emoji: '🦁',
    description: 'Patient and thoughtful. Asks great questions to help you think through problems.',
    personality: 'Thoughtful',
    color: 'from-amber-400 to-orange-500'
  },
  {
    id: 'beakly',
    name: 'Beakly the Builder',
    emoji: '🦉',
    description: 'Playful and creative. Sees coding as play and loves making things together!',
    personality: 'Playful',
    color: 'from-blue-400 to-indigo-500'
  }
];

export default function CompanionSelector({ onSelect, currentCompanion }) {
  const [selected, setSelected] = useState(currentCompanion || null);

  const handleSelect = (companionId) => {
    setSelected(companionId);
    onSelect(companionId);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Choose Your Coding Companion</h2>
        <p className="text-slate-600">Pick a friend to help you on your coding journey!</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {companions.map((companion, index) => {
          const isSelected = selected === companion.id;
          
          return (
            <motion.div
              key={companion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  isSelected ? 'ring-2 ring-indigo-500 shadow-lg' : ''
                }`}
                onClick={() => handleSelect(companion.id)}
              >
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${companion.color} flex items-center justify-center text-5xl mb-3`}>
                      {companion.emoji}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{companion.name}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {companion.personality}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-slate-600 text-center mb-4">
                    {companion.description}
                  </p>

                  {isSelected && (
                    <div className="flex items-center justify-center gap-2 text-indigo-600 text-sm font-medium">
                      <Check className="w-4 h-4" />
                      Selected
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Card className="border-2 border-dashed border-slate-300 bg-slate-50">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-slate-200 flex items-center justify-center mb-4">
            <Plus className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Create Your Own</h3>
          <p className="text-sm text-slate-600 mb-4">Design a custom companion (coming soon!)</p>
          <Badge variant="secondary">Coming Soon</Badge>
        </CardContent>
      </Card>
    </div>
  );
}