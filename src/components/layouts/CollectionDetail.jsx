import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

/**
 * Collection → Detail Layout (Finder-style)
 * Used for: Programs, Students, Lessons, Worlds
 * 
 * Pattern: List on left, detail on right
 * No navigation jumps - feels native
 */
export default function CollectionDetail({
  // Collection props
  items = [],
  selectedId,
  onSelectItem,
  renderCollectionItem,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  collectionEmpty,
  
  // Detail props
  renderDetail,
  detailEmpty,
  
  // Layout
  collectionWidth = 'w-80',
  showSearch = true,
}) {
  return (
    <div className="h-full flex">
      {/* Collection Pane */}
      <div className={`${collectionWidth} border-r border-slate-200 bg-white flex flex-col flex-shrink-0`}>
        {showSearch && (
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-9 h-9 bg-slate-50 border-slate-200"
              />
            </div>
          </div>
        )}
        
        <ScrollArea className="flex-1">
          {items.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              {collectionEmpty || 'No items'}
            </div>
          ) : (
            <div className="p-2 space-y-0.5">
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectItem?.(item)}
                  className={`
                    p-3 rounded-lg cursor-pointer transition-all
                    ${selectedId === item.id 
                      ? 'bg-slate-900 text-white' 
                      : 'hover:bg-slate-50 text-slate-700'
                    }
                  `}
                >
                  {renderCollectionItem(item, selectedId === item.id)}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Detail Pane */}
      <div className="flex-1 bg-slate-50 overflow-auto">
        {selectedId ? (
          renderDetail()
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm">
            {detailEmpty || 'Select an item to view details'}
          </div>
        )}
      </div>
    </div>
  );
}