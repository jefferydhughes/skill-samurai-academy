import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChildPicker({ children = [], selectedChild, onSelect, onAddNew }) {
  const [showNewForm, setShowNewForm] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddNew = async () => {
    if (newChildName.trim() && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await onAddNew({ name: newChildName.trim() });
        setNewChildName('');
        setShowNewForm(false);
      } catch (error) {
        console.error('Error adding child:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory">
        {children.map((child) => (
          <motion.button
            key={child.id}
            onClick={() => onSelect(child.id)}
            whileTap={{ scale: 0.95 }}
            className={`
              flex-shrink-0 w-20 h-20 rounded-2xl border-2 transition-all snap-start
              flex flex-col items-center justify-center gap-1
              ${selectedChild === child.id 
                ? 'border-indigo-600 bg-gradient-to-br from-indigo-50 to-violet-50 shadow-lg' 
                : 'border-slate-200 bg-white/80 hover:border-indigo-300'
              }
            `}
          >
            <User className={`w-6 h-6 ${selectedChild === child.id ? 'text-indigo-600' : 'text-slate-400'}`} />
            <p className={`text-[10px] font-bold px-1 truncate max-w-full ${selectedChild === child.id ? 'text-indigo-700' : 'text-slate-700'}`}>
              {child.displayName || child.full_name || child.name}
            </p>
          </motion.button>
        ))}
        
        <motion.button
          onClick={() => setShowNewForm(true)}
          whileTap={{ scale: 0.95 }}
          className="flex-shrink-0 w-20 h-20 rounded-2xl border-2 border-dashed border-slate-300 bg-white/50 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all snap-start flex flex-col items-center justify-center gap-1"
        >
          <Plus className="w-6 h-6 text-slate-400" />
          <p className="text-[10px] font-bold text-slate-500">New</p>
        </motion.button>
      </div>

      <AnimatePresence>
        {showNewForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-2xl bg-white/80 border border-white/50 shadow-lg space-y-3">
              <Input
                placeholder="Child's name"
                value={newChildName}
                onChange={(e) => setNewChildName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddNew()}
                className="h-12 bg-white/80 border-white/50"
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleAddNew}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
                  disabled={!newChildName.trim() || isSubmitting}
                >
                  {isSubmitting ? 'Adding...' : 'Add Child'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowNewForm(false);
                    setNewChildName('');
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}