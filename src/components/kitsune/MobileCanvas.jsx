import React, { useState } from 'react';
import { QrCode } from 'lucide-react';

export default function MobileCanvas({ isRunning, onShare }) {
  const [showQRHint, setShowQRHint] = useState(false);

  return (
    <div className="relative w-full max-w-[360px]">
      {/* Phone Frame */}
      <div className="relative aspect-[9/16] w-full bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border-[8px] border-slate-900">
        {/* Screen */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 overflow-hidden">
          {/* Placeholder game content */}
          <div className="absolute inset-0 flex items-center justify-center">
            {isRunning ? (
              <div className="text-center px-6">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <div className="w-16 h-16 bg-amber-400 rounded-full animate-bounce" />
                </div>
                <div className="text-white font-semibold text-sm">Game Running...</div>
                <div className="text-white/70 text-xs mt-1">Your code is executing!</div>
              </div>
            ) : (
              <div className="text-center px-6">
                <div className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-2xl mx-auto mb-4 flex items-center justify-center border border-white/20">
                  <div className="w-16 h-16 bg-white/20 rounded-full" />
                </div>
                <div className="text-white/90 font-semibold text-sm">Press Run to Start</div>
                <div className="text-white/60 text-xs mt-1">Build your game with blocks</div>
              </div>
            )}
          </div>

          {/* Grid overlay for depth hint */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="w-full h-full" style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '32px 32px'
            }} />
          </div>
        </div>

        {/* QR Share Hint Overlay */}
        <div 
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center transition-opacity duration-300 ${
            showQRHint ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onMouseLeave={() => setShowQRHint(false)}
        >
          <div className="p-6 bg-white rounded-2xl shadow-2xl max-w-[280px] text-center">
            <div className="w-48 h-48 bg-slate-100 rounded-xl mx-auto mb-4 flex items-center justify-center border-4 border-dashed border-slate-300">
              <QrCode className="w-20 h-20 text-slate-400" />
            </div>
            <p className="font-bold text-slate-900 mb-1">Scan to Play</p>
            <p className="text-xs text-slate-600">Friends can play instantly on mobile</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex items-center justify-center gap-3">
        <button
          onMouseEnter={() => setShowQRHint(true)}
          onClick={onShare}
          className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-xl border border-white/40 rounded-xl text-sm font-medium text-slate-700 hover:bg-white transition-all shadow-sm"
        >
          <QrCode className="w-4 h-4" />
          Generate Share Code
        </button>
      </div>

      {/* Hint Badge */}
      <div className="mt-3 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-xs text-indigo-700">
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
          16:9 Portrait • Mobile-First Design
        </div>
      </div>
    </div>
  );
}