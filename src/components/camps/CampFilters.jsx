import React from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

export default function CampFilters({ filters, setFilters, camps }) {
  // Extract unique categories from camps
  const categories = [...new Set(camps.map(c => c.category).filter(Boolean))];

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-semibold text-slate-900">Filter Camps</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search camps..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="pl-10"
          />
        </div>

        {/* Age Filter */}
        <Select 
          value={filters.age} 
          onValueChange={(val) => setFilters({ ...filters, age: val })}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Ages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ages</SelectItem>
            {[7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map(age => (
              <SelectItem key={age} value={age.toString()}>
                Age {age}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Category Filter */}
        <Select 
          value={filters.category} 
          onValueChange={(val) => setFilters({ ...filters, category: val })}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date Range Filter */}
        <Select 
          value={filters.dateRange} 
          onValueChange={(val) => setFilters({ ...filters, dateRange: val })}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Dates" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Dates</SelectItem>
            <SelectItem value="1">Next Month</SelectItem>
            <SelectItem value="2">Next 2 Months</SelectItem>
            <SelectItem value="3">Next 3 Months</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}