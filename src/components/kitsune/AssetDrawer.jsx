import React, { useState } from 'react';
import { X, Image, Music, Wand2 } from 'lucide-react';

const assetCategories = [
  { id: 'sprites', label: 'Sprites', icon: Image },
  { id: 'backgrounds', label: 'Backgrounds', icon: Image },
  { id: 'sounds', label: 'Sounds', icon: Music },
  { id: 'ai-generate', label: 'AI Generate', icon: Wand2 },
];

const sampleAssets = {
  sprites: [
    { id: 1, name: 'Player', preview: '🦊' },
    { id: 2, name: 'Enemy', preview: '👾' },
    { id: 3, name: 'Coin', preview: '🪙' },
    { id: 4, name: 'Heart', preview: '❤️' },
  ],
  backgrounds: [
    { id: 1, name: 'Forest', preview: '🌲' },
    { id: 2, name: 'City', preview: '🏙️' },
    { id: 3, name: 'Space', preview: '🌌' },
    { id: 4, name: 'Beach', preview: '🏖️' },
  ],
  sounds: [
    { id: 1, name: 'Jump', preview: '🎵' },
    { id: 2, name: 'Coin', preview: '🔔' },
    { id: 3, name: 'Music', preview: '🎼' },
    { id: 4, name: 'Win', preview: '🎉' },
  ],
};

export default function AssetDrawer({ onClose }) {
  const [activeTab, setActiveTab] = useState('sprites');

  const assets = sampleAssets[activeTab] || [];

  return (
    <div className="bg-white/70 backdrop-blur-xl border-t border-white/40 lg:hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/50">
        <h3 className="font-semibold text-slate-900 text-sm">Assets</h3>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 px-4 py-2 overflow-x-auto">
        {assetCategories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeTab === cat.id;
          
          return (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                isActive 
                  ? 'bg-indigo-500 text-white shadow-lg' 
                  : 'bg-white/50 text-slate-600 hover:bg-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Asset Grid */}
      <div className="p-4 overflow-auto max-h-64">
        {activeTab === 'ai-generate' ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <Wand2 className="w-8 h-8 text-white" />
            </div>
            <h4 className="font-semibold text-slate-900 mb-2">AI Asset Generator</h4>
            <p className="text-sm text-slate-600 mb-4">Describe what you want and AI will create it!</p>
            <button className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl text-sm font-medium shadow-lg hover:scale-105 transition-transform">
              Generate with AI
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {assets.map((asset) => (
              <button
                key={asset.id}
                className="aspect-square bg-white/80 backdrop-blur-xl border border-white/40 rounded-xl p-2 hover:scale-105 hover:shadow-lg transition-all flex flex-col items-center justify-center gap-1"
              >
                <span className="text-3xl">{asset.preview}</span>
                <span className="text-[10px] font-medium text-slate-600 truncate w-full text-center">
                  {asset.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}