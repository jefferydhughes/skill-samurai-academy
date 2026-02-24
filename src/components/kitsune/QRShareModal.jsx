import React, { useState } from 'react';
import { X, Copy, Download, QrCode, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function QRShareModal({ onClose }) {
  const [copied, setCopied] = useState(false);
  
  // Mock share URL (in production, this would be generated)
  const shareUrl = 'https://play.kitsune.app/g/abc123';

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl" />
          </div>
          
          <div className="relative">
            <button
              onClick={onClose}
              className="absolute top-0 right-0 text-white/80 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                <QrCode className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Share Your Game</h2>
                <p className="text-indigo-100 text-sm">Play instantly on mobile</p>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="p-8 text-center">
          <div className="inline-block p-6 bg-white rounded-3xl shadow-xl border-4 border-slate-100">
            {/* Placeholder QR code - replace with actual QR generation */}
            <div className="w-48 h-48 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl flex items-center justify-center">
              <div className="grid grid-cols-8 gap-1 p-4">
                {Array.from({ length: 64 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-sm ${
                      Math.random() > 0.5 ? 'bg-white' : 'bg-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <p className="text-sm text-slate-600">
              Scan with any phone camera to play instantly
            </p>

            {/* Share Link */}
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 bg-transparent text-sm text-slate-600 outline-none"
              />
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => {
              // Download QR code functionality
              alert('QR code download would happen here');
            }}
          >
            <Download className="w-4 h-4" />
            Download QR
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white"
            onClick={onClose}
          >
            Done
          </Button>
        </div>

        {/* Info Badge */}
        <div className="px-6 pb-6">
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
            <p className="text-xs text-indigo-700 text-center leading-relaxed">
              ✨ No login required • Friends can play immediately • Works on all devices
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}