import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Inspector Panel (Slide-in from right)
 * Used for: Editing details, viewing metadata, settings
 * 
 * Pattern: Sheet-style overlay
 * OS-like drawer behavior
 */
export default function InspectorPanel({
  open,
  onClose,
  title,
  subtitle,
  children,
  width = 'max-w-lg',
  actions,
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          
          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed right-0 top-0 bottom-0 ${width} w-full bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col`}
          >
            {/* Header */}
            <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200">
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
                  {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onClose}
                  className="flex-shrink-0 -mt-1 -mr-2"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1">
              <div className="p-6">
                {children}
              </div>
            </ScrollArea>

            {/* Actions */}
            {actions && (
              <div className="flex-shrink-0 px-6 py-4 border-t border-slate-200 bg-slate-50">
                {actions}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}