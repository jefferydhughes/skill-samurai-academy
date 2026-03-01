import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Facebook, Instagram, Globe, Send, Eye, FileText } from 'lucide-react';
import { generatePostContent } from '@/lib/supabase/socialMediaApi';

const PLATFORMS = {
  facebook: {
    label: 'Facebook',
    icon: Facebook,
    iconColor: 'text-blue-600',
    avatarBg: 'bg-blue-600',
    charLimit: 63206,
  },
  instagram: {
    label: 'Instagram',
    icon: Instagram,
    iconColor: 'text-pink-500',
    avatarBg: 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400',
    charLimit: 2200,
  },
  google_business: {
    label: 'Google',
    icon: Globe,
    iconColor: 'text-green-600',
    avatarBg: 'bg-white border-2 border-slate-200',
    charLimit: 1500,
  },
};

/**
 * SocialPostComposer
 * Editable post textarea + platform-specific preview.
 *
 * Props:
 *   camp             – camp object
 *   postType         – 'launch' | 'reminder_30_days' | 'spaces_filling' | 'custom'
 *   socialSettings   – social settings object
 *   enabledPlatforms – string[] of enabled platform keys
 *   onSend           – async (content: string) => void  (queues posts)
 *   onDraft          – async (content: string) => void  (saves as draft)
 *   isSending        – boolean
 */
export default function SocialPostComposer({
  camp,
  postType,
  socialSettings,
  enabledPlatforms,
  onSend,
  onDraft,
  isSending,
}) {
  const [content, setContent] = useState('');
  const [preview, setPreview] = useState(enabledPlatforms[0] || 'facebook');

  // Regenerate default content when type or settings change
  useEffect(() => {
    setContent(generatePostContent(camp, postType, socialSettings));
  }, [camp?.id, postType, socialSettings]);

  // Ensure preview tab stays on an enabled platform
  useEffect(() => {
    if (!enabledPlatforms.includes(preview) && enabledPlatforms.length > 0) {
      setPreview(enabledPlatforms[0]);
    }
  }, [enabledPlatforms]);

  const charLimit = PLATFORMS[preview]?.charLimit ?? 2200;
  const overLimit = content.length > charLimit;
  const noEnabled = enabledPlatforms.length === 0;

  return (
    <div className="space-y-5">
      {/* ── Editable content ─────────────────────────────────── */}
      <div>
        <label className="text-sm font-medium text-[#2A4169] block mb-1">
          Post Content
        </label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={9}
          className="font-mono text-sm resize-none"
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-slate-400">
            Customise the copy before posting
          </span>
          <span className={`text-xs tabular-nums ${overLimit ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
            {content.length.toLocaleString()} / {charLimit.toLocaleString()}
          </span>
        </div>
      </div>

      {/* ── Preview ──────────────────────────────────────────── */}
      {enabledPlatforms.length > 0 && (
        <div>
          <label className="text-sm font-medium text-[#2A4169] flex items-center gap-1.5 mb-2">
            <Eye className="w-4 h-4" /> Preview
          </label>

          {/* Platform selector pills */}
          <div className="flex gap-2 mb-3">
            {enabledPlatforms.map((p) => {
              const { label, icon: Icon, iconColor } = PLATFORMS[p] || {};
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPreview(p)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    preview === p
                      ? 'border-[#2A4169] bg-[#2A4169] text-white'
                      : 'border-slate-200 text-slate-600 hover:border-slate-400'
                  }`}
                >
                  {Icon && <Icon className={`w-3 h-3 ${preview === p ? 'text-white' : iconColor}`} />}
                  {label}
                </button>
              );
            })}
          </div>

          {/* Preview card */}
          <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
            {preview === 'facebook' && (
              <FacebookPreview camp={camp} content={content} />
            )}
            {preview === 'instagram' && (
              <InstagramPreview camp={camp} content={content} />
            )}
            {preview === 'google_business' && (
              <GooglePreview camp={camp} content={content} />
            )}
          </div>
        </div>
      )}

      {/* ── Actions ──────────────────────────────────────────── */}
      <div className="flex gap-3">
        <Button
          type="button"
          className="flex-1 bg-[#EE3E86] hover:bg-[#D62D73] gap-2"
          onClick={() => onSend(content)}
          disabled={isSending || noEnabled || overLimit}
        >
          <Send className="w-4 h-4" />
          {isSending
            ? 'Queuing...'
            : `Queue for ${enabledPlatforms.length} Platform${enabledPlatforms.length !== 1 ? 's' : ''}`}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          onClick={() => onDraft(content)}
          disabled={noEnabled}
        >
          <FileText className="w-4 h-4" />
          Save Draft
        </Button>
      </div>

      {noEnabled && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
          No platforms enabled. Toggle on at least one platform in the{' '}
          <strong>Settings</strong> tab.
        </p>
      )}
    </div>
  );
}

// ─── Platform Preview Cards ───────────────────────────────────────────────────

function FacebookPreview({ camp, content }) {
  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-10 h-10 rounded-full bg-[#EE3E86] flex items-center justify-center text-white font-bold text-sm select-none">
          SS
        </div>
        <div>
          <div className="font-semibold text-sm text-slate-900">Skill Samurai Academy</div>
          <div className="text-xs text-slate-400">Just now · 🌍</div>
        </div>
      </div>
      {camp?.thumbnail && (
        <img
          src={camp.thumbnail}
          alt=""
          className="w-full h-44 object-cover rounded-lg mb-3"
        />
      )}
      <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
        {content}
      </p>
      <div className="mt-3 pt-3 border-t flex gap-4 text-xs text-slate-400">
        <span>👍 Like</span>
        <span>💬 Comment</span>
        <span>↗ Share</span>
      </div>
    </div>
  );
}

function InstagramPreview({ camp, content }) {
  return (
    <div>
      <div className="flex items-center gap-2 p-3 border-b">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center text-white font-bold text-xs select-none">
          SS
        </div>
        <span className="font-semibold text-sm">skillsamurai_academy</span>
      </div>
      {camp?.thumbnail ? (
        <img
          src={camp.thumbnail}
          alt=""
          className="w-full aspect-square object-cover"
        />
      ) : (
        <div className="w-full aspect-square bg-gradient-to-br from-[#2A4169] to-[#EE3E86] flex items-center justify-center text-white text-xl font-bold px-8 text-center">
          {camp?.title}
        </div>
      )}
      <div className="p-3">
        <div className="flex gap-3 mb-2 text-xl">❤️ 💬 ✈️</div>
        <p className="text-sm whitespace-pre-wrap leading-relaxed">
          <strong>skillsamurai_academy</strong>{' '}
          <span className="text-slate-800">{content}</span>
        </p>
      </div>
    </div>
  );
}

function GooglePreview({ camp, content }) {
  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-lg bg-[#2A4169] flex items-center justify-center text-white font-bold select-none">
          SS
        </div>
        <div>
          <div className="font-semibold text-slate-900">Skill Samurai Academy</div>
          <div className="text-xs text-slate-400">Google Business Post</div>
        </div>
      </div>
      {camp?.thumbnail && (
        <img
          src={camp.thumbnail}
          alt=""
          className="w-full h-36 object-cover rounded-lg mb-3"
        />
      )}
      <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed mb-3">
        {content}
      </p>
      <button
        type="button"
        className="text-sm text-blue-600 font-medium border border-blue-600 px-3 py-1 rounded-md"
      >
        Learn more
      </button>
    </div>
  );
}
