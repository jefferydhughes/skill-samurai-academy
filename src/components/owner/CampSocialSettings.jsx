import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Hash, AtSign, Facebook, Instagram, Globe } from 'lucide-react';

/**
 * CampSocialSettings
 * Settings panel for social media configuration per camp.
 * Used inside SocialMediaManager's Settings tab.
 *
 * Props:
 *   data     – current settings object
 *   onChange – callback(updatedData)
 */
export default function CampSocialSettings({ data, onChange }) {
  const [newHashtag, setNewHashtag] = useState('');
  const [newMention, setNewMention] = useState('');

  const addHashtag = () => {
    const tag = newHashtag.replace(/^#+/, '').trim();
    if (tag && !data.hashtags.includes(tag)) {
      onChange({ ...data, hashtags: [...data.hashtags, tag] });
    }
    setNewHashtag('');
  };

  const removeHashtag = (tag) =>
    onChange({ ...data, hashtags: data.hashtags.filter((t) => t !== tag) });

  const addMention = () => {
    const mention = newMention.replace(/^@+/, '').trim();
    if (mention && !data.mentions.includes(mention)) {
      onChange({ ...data, mentions: [...data.mentions, mention] });
    }
    setNewMention('');
  };

  const removeMention = (mention) =>
    onChange({ ...data, mentions: data.mentions.filter((m) => m !== mention) });

  return (
    <div className="space-y-6 pb-4">
      {/* ── Platforms ──────────────────────────────────────────── */}
      <section>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Platforms
        </p>
        <div className="grid grid-cols-3 gap-3">
          <PlatformCard
            label="Facebook"
            enabled={data.facebook_enabled}
            onToggle={() => onChange({ ...data, facebook_enabled: !data.facebook_enabled })}
            icon={<Facebook className="w-4 h-4 text-white" />}
            bg="bg-blue-600"
            activeBorder="border-blue-500"
            activeBg="bg-blue-50"
          />
          <PlatformCard
            label="Instagram"
            enabled={data.instagram_enabled}
            onToggle={() => onChange({ ...data, instagram_enabled: !data.instagram_enabled })}
            icon={<Instagram className="w-4 h-4 text-white" />}
            bg="bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400"
            activeBorder="border-pink-500"
            activeBg="bg-pink-50"
          />
          <PlatformCard
            label="Google"
            enabled={data.google_business_enabled}
            onToggle={() =>
              onChange({ ...data, google_business_enabled: !data.google_business_enabled })
            }
            icon={<Globe className="w-4 h-4 text-green-600" />}
            bg="bg-white border border-slate-200"
            activeBorder="border-green-500"
            activeBg="bg-green-50"
          />
        </div>
      </section>

      <hr className="border-slate-100" />

      {/* ── Hashtags ───────────────────────────────────────────── */}
      <section>
        <Label className="text-[#2A4169] font-medium flex items-center gap-1.5 mb-2">
          <Hash className="w-4 h-4" /> Hashtags
        </Label>
        <div className="flex flex-wrap gap-2 mb-2 min-h-[28px]">
          {data.hashtags.map((tag) => (
            <Badge
              key={tag}
              className="bg-slate-100 text-slate-700 border-0 pr-1 font-normal"
            >
              #{tag}
              <button
                type="button"
                onClick={() => removeHashtag(tag)}
                className="ml-1 hover:text-red-500 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newHashtag}
            onChange={(e) => setNewHashtag(e.target.value)}
            placeholder="#SkillSamurai"
            onKeyDown={(e) =>
              e.key === 'Enter' && (e.preventDefault(), addHashtag())
            }
          />
          <Button type="button" variant="outline" onClick={addHashtag}>
            Add
          </Button>
        </div>
      </section>

      {/* ── Mentions ───────────────────────────────────────────── */}
      <section>
        <Label className="text-[#2A4169] font-medium flex items-center gap-1.5 mb-2">
          <AtSign className="w-4 h-4" /> Mentions
        </Label>
        <div className="flex flex-wrap gap-2 mb-2 min-h-[28px]">
          {data.mentions.map((mention) => (
            <Badge
              key={mention}
              className="bg-slate-100 text-slate-700 border-0 pr-1 font-normal"
            >
              @{mention}
              <button
                type="button"
                onClick={() => removeMention(mention)}
                className="ml-1 hover:text-red-500 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newMention}
            onChange={(e) => setNewMention(e.target.value)}
            placeholder="@SkillSamuraiAcademy"
            onKeyDown={(e) =>
              e.key === 'Enter' && (e.preventDefault(), addMention())
            }
          />
          <Button type="button" variant="outline" onClick={addMention}>
            Add
          </Button>
        </div>
      </section>

      <hr className="border-slate-100" />

      {/* ── Signup link ────────────────────────────────────────── */}
      <section>
        <Label className="text-[#2A4169] font-medium mb-1 block">
          Custom Signup Link
        </Label>
        <Input
          value={data.custom_signup_link || ''}
          onChange={(e) => onChange({ ...data, custom_signup_link: e.target.value })}
          placeholder="https://skillsamurai.com/camps/..."
        />
        <p className="text-xs text-slate-400 mt-1">
          Leave blank to use the auto-generated camp URL
        </p>
      </section>

      <hr className="border-slate-100" />

      {/* ── Automated post triggers ────────────────────────────── */}
      <section>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Automated Posts
        </p>
        <div className="space-y-4">
          <ToggleRow
            title="Post when camp is published"
            description="Announce across all enabled platforms when camp goes active"
            checked={data.auto_post_on_publish}
            onCheckedChange={(v) => onChange({ ...data, auto_post_on_publish: v })}
          />
          <ToggleRow
            title="30-day reminder"
            description='Schedule a "Camp starts soon!" post 30 days before the start date'
            checked={data.auto_post_30_days}
            onCheckedChange={(v) => onChange({ ...data, auto_post_30_days: v })}
          />
        </div>
      </section>

      <hr className="border-slate-100" />

      {/* ── Spaces left ────────────────────────────────────────── */}
      <section>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Spaces Remaining
        </p>
        <div className="space-y-4">
          <ToggleRow
            title="Show spaces left badge"
            description='Display "X spaces left" on the camp card when enrollment is low'
            checked={data.show_spaces_left}
            onCheckedChange={(v) => onChange({ ...data, show_spaces_left: v })}
          />

          {data.show_spaces_left && (
            <div className="ml-0 pl-0">
              <Label className="text-sm text-[#2A4169]">
                Show badge when spaces remaining ≤
              </Label>
              <div className="flex items-center gap-3 mt-1">
                <Input
                  type="number"
                  min="1"
                  max="50"
                  value={data.spaces_left_threshold}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      spaces_left_threshold: Math.max(1, parseInt(e.target.value) || 5),
                    })
                  }
                  className="w-24"
                />
                <span className="text-sm text-slate-500">spaces</span>
              </div>
            </div>
          )}

          <ToggleRow
            title='Auto-post "Spaces filling up"'
            description={`Post urgency message when ${data.spaces_left_threshold || 5} or fewer spaces remain`}
            checked={data.auto_post_spaces_trigger}
            onCheckedChange={(v) => onChange({ ...data, auto_post_spaces_trigger: v })}
          />
        </div>
      </section>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PlatformCard({ label, enabled, onToggle, icon, bg, activeBorder, activeBg }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`border-2 rounded-lg p-3 w-full text-left transition-all ${
        enabled ? `${activeBorder} ${activeBg}` : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
        <div>
          <div className="text-sm font-medium text-[#2A4169]">{label}</div>
          <div className="text-xs text-slate-400">{enabled ? 'On' : 'Off'}</div>
        </div>
      </div>
    </button>
  );
}

function ToggleRow({ title, description, checked, onCheckedChange }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <div className="text-sm font-medium text-[#2A4169]">{title}</div>
        <div className="text-xs text-slate-400 mt-0.5">{description}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} className="flex-shrink-0 mt-0.5" />
    </div>
  );
}
