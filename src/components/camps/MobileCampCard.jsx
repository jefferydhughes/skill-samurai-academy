import React from 'react';
import { Calendar, Clock, Users } from 'lucide-react';
import { format } from 'date-fns';
import { CAMP_CATEGORIES } from './campCategories';

export default function MobileCampCard({ camp, onView, onReserve, isRecommended }) {
  const getCategoryIcon = (category) => {
    const cat = CAMP_CATEGORIES.find(c => c.key === category);
    return cat ? { icon: cat.icon, color: cat.color } : { icon: '✨', color: 'from-indigo-400 to-purple-500' };
  };

  const categoryData = getCategoryIcon(camp.category);
  const spotsLeft = camp.capacity - (camp.enrolled_count || 0);
  const isAlmostFull = spotsLeft <= 3 && spotsLeft > 0;
  const isFull = spotsLeft === 0;

  return (
    <div className="rounded-2xl bg-white shadow-lg overflow-hidden">
      {/* Hero Image with Compare Checkbox */}
      <div className="relative aspect-[16/9] bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50">
        {camp.thumbnail_url ? (
          <img 
            src={camp.thumbnail_url} 
            alt={camp.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl">{categoryData.icon}</span>
          </div>
        )}
        
        {/* Compare Checkbox - Top Left */}
        <div className="absolute top-3 left-3">
          <label className="flex items-center gap-2 px-3 py-2 bg-white/95 backdrop-blur rounded-lg shadow-lg cursor-pointer hover:bg-white transition-all">
            <input 
              type="checkbox" 
              className="w-4 h-4 rounded border-gray-300"
              onChange={(e) => e.stopPropagation()}
            />
            <span className="text-sm font-medium text-gray-900">Compare</span>
          </label>
        </div>

        {/* Category Badge - Bottom Left */}
        <div className="absolute bottom-3 left-3">
          <div className="px-3 py-1.5 bg-gray-900/80 backdrop-blur rounded-lg text-white text-sm font-medium">
            {camp.category}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {camp.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {camp.description || 'Build epic games and learn fundamental coding concepts...'}
        </p>

        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-gray-700">
            <Calendar size={18} className="text-indigo-600 flex-shrink-0" />
            <span className="text-sm">{format(new Date(camp.start_datetime), 'MMM d')} - {format(new Date(camp.end_datetime), 'MMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Clock size={18} className="text-indigo-600 flex-shrink-0" />
            <span className="text-sm">
              {camp.daily_schedule?.drop_off || '9:00 AM'} - {camp.daily_schedule?.pickup || '3:00 PM'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Users size={18} className="text-indigo-600 flex-shrink-0" />
            <span className="text-sm">Ages {camp.age_min}–{camp.age_max}</span>
          </div>
        </div>

        {/* Price & Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            <div className="text-xs text-gray-500">Price</div>
            <div className="text-2xl font-bold text-gray-900">
              ${(camp.price / 100).toFixed(0)}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onView(camp)}
              className="px-4 py-2 rounded-xl bg-white border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-all"
            >
              Details
            </button>
            <button
              onClick={() => onReserve(camp)}
              disabled={isFull}
              className={`px-5 py-2 rounded-xl text-sm font-semibold shadow transition-all ${
                isFull 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {isFull ? 'Full' : 'Book'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}