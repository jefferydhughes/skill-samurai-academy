import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, SlidersHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * Cards Workspace Layout
 * Used for: Program browsing, World selection, Achievements
 * 
 * Pattern: Header with filters + Grid of cards
 * Clean, spacious, visual-first
 */
export default function CardsWorkspace({
  // Header
  title,
  subtitle,
  actions,
  
  // Search & Filter
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filterContent,
  showFilter = false,
  
  // Cards
  items = [],
  renderCard,
  emptyState,
  
  // Grid
  columns = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  gap = 'gap-6',
  
  // Loading
  isLoading = false,
  loadingCount = 6,
}) {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-slate-200 bg-white">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
              {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
          
          {/* Search & Filter Bar */}
          {(onSearchChange || showFilter) && (
            <div className="flex items-center gap-3">
              {onSearchChange && (
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="pl-9 h-10 bg-slate-50 border-slate-200"
                  />
                </div>
              )}
              
              {showFilter && filterContent && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-10 w-10">
                      <SlidersHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {filterContent}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {isLoading ? (
            <div className={`grid ${columns} ${gap}`}>
              {Array(loadingCount).fill(0).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-video bg-slate-200 rounded-t-lg" />
                  <CardContent className="p-4 space-y-3">
                    <div className="h-5 bg-slate-200 rounded w-3/4" />
                    <div className="h-4 bg-slate-100 rounded w-full" />
                    <div className="h-4 bg-slate-100 rounded w-5/6" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              {emptyState || (
                <div className="text-center text-slate-400">
                  <p>No items found</p>
                </div>
              )}
            </div>
          ) : (
            <div className={`grid ${columns} ${gap}`}>
              {items.map((item) => renderCard(item))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}