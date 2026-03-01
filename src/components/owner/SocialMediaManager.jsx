import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Facebook,
  Instagram,
  Globe,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  AlertTriangle,
  Share2,
  Zap,
  Plus,
  Loader2,
} from 'lucide-react';

import {
  socialSettingsApi,
  socialPostsApi,
  platformConnectionsApi,
  buildLaunchPosts,
  buildReminderPosts,
  buildSpacesFillingPosts,
} from '@/lib/supabase/socialMediaApi';
import CampSocialSettings from './CampSocialSettings';
import SocialPostComposer from './SocialPostComposer';

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS = {
  facebook_enabled: false,
  instagram_enabled: false,
  google_business_enabled: false,
  hashtags: [],
  mentions: [],
  custom_signup_link: '',
  auto_post_on_publish: true,
  auto_post_30_days: true,
  show_spaces_left: false,
  spaces_left_threshold: 5,
  auto_post_spaces_trigger: true,
  spaces_trigger_fired: false,
};

const PLATFORM_CONFIG = {
  facebook: {
    label: 'Facebook',
    icon: Facebook,
    iconColor: 'text-blue-600',
    bg: 'bg-blue-100',
    instructions:
      'Requires a Facebook Business Page. You will need a long-lived Page Access Token from the Facebook Developer Console.',
    docsUrl: 'https://developers.facebook.com/docs/pages/access-tokens',
  },
  instagram: {
    label: 'Instagram',
    icon: Instagram,
    iconColor: 'text-pink-600',
    bg: 'bg-pink-100',
    instructions:
      'Requires an Instagram Business Account linked to a Facebook Page. Uses the same access token as Facebook.',
    docsUrl: 'https://developers.facebook.com/docs/instagram-api',
  },
  google_business: {
    label: 'Google Business',
    icon: Globe,
    iconColor: 'text-green-600',
    bg: 'bg-green-100',
    instructions:
      'Requires a verified Google Business Profile and a Google OAuth 2.0 client configured in your Google Cloud project.',
    docsUrl: 'https://developers.google.com/my-business/reference/rest',
  },
};

const STATUS_CONFIG = {
  draft: { label: 'Draft', classes: 'bg-slate-100 text-slate-600', Icon: FileText },
  scheduled: { label: 'Scheduled', classes: 'bg-blue-100 text-blue-700', Icon: Clock },
  sent: { label: 'Sent', classes: 'bg-green-100 text-green-700', Icon: CheckCircle2 },
  failed: { label: 'Failed', classes: 'bg-red-100 text-red-700', Icon: XCircle },
};

const POST_TYPE_LABELS = {
  launch: '🎉 Launch Announcement',
  reminder_30_days: '⏰ 30-Day Reminder',
  spaces_filling: '🔥 Spaces Filling Up',
  custom: '✏️ Custom Post',
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * SocialMediaManager
 * Full social media management dialog for a single camp.
 *
 * Props:
 *   camp    – camp object (with id, title, capacity, enrolled_count, location_id, etc.)
 *   open    – boolean
 *   onClose – () => void
 */
export default function SocialMediaManager({ camp, open, onClose }) {
  const queryClient = useQueryClient();
  const [settingsDraft, setSettingsDraft] = useState(null);
  const [composerType, setComposerType] = useState('launch');
  const [activeTab, setActiveTab] = useState('posts');

  // ── Queries ──────────────────────────────────────────────────
  const { data: savedSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['social-settings', camp?.id],
    queryFn: () => socialSettingsApi.getByCampId(camp.id),
    enabled: !!camp?.id && open,
    onSuccess: (data) => {
      setSettingsDraft(data ?? DEFAULT_SETTINGS);
    },
  });

  const settings = settingsDraft ?? savedSettings ?? DEFAULT_SETTINGS;

  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['social-posts', camp?.id],
    queryFn: () => socialPostsApi.getByCampId(camp.id),
    enabled: !!camp?.id && open,
  });

  const { data: connections = [] } = useQuery({
    queryKey: ['platform-connections', camp?.location_id],
    queryFn: () => platformConnectionsApi.getByLocationId(camp.location_id),
    enabled: !!camp?.location_id && open,
  });

  // ── Enabled platforms derived from settings ───────────────────
  const enabledPlatforms = [
    settings.facebook_enabled && 'facebook',
    settings.instagram_enabled && 'instagram',
    settings.google_business_enabled && 'google_business',
  ].filter(Boolean);

  const pendingCount = posts.filter(
    (p) => p.status === 'draft' || p.status === 'scheduled'
  ).length;

  // Spaces alert
  const spacesRemaining = (camp?.capacity || 0) - (camp?.enrolled_count || 0);
  const spacesAlertActive =
    settings.show_spaces_left &&
    spacesRemaining <= (settings.spaces_left_threshold || 5) &&
    !settings.spaces_trigger_fired;

  // ── Mutations ────────────────────────────────────────────────

  const saveSettingsMutation = useMutation({
    mutationFn: async () => {
      const saved = await socialSettingsApi.upsert(camp.id, settingsDraft);

      // Queue 30-day reminder if enabled and not already queued
      if (settingsDraft.auto_post_30_days) {
        const reminderExists = posts.some((p) => p.post_type === 'reminder_30_days');
        if (!reminderExists) {
          const reminderPosts = buildReminderPosts(camp, settingsDraft);
          if (reminderPosts.length) await socialPostsApi.bulkCreate(reminderPosts);
        }
      }
      return saved;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-settings', camp?.id] });
      queryClient.invalidateQueries({ queryKey: ['social-posts', camp?.id] });
      queryClient.invalidateQueries({ queryKey: ['social-settings-bulk'] });
    },
  });

  const createPostsMutation = useMutation({
    mutationFn: async ({ content, postType }) => {
      const postsToCreate = enabledPlatforms.map((platform) => ({
        camp_id: camp.id,
        post_type: postType,
        platform,
        post_content: content,
        image_url: camp.thumbnail || null,
        signup_link: settings.custom_signup_link || null,
        hashtags: settings.hashtags || [],
        mentions: settings.mentions || [],
        status: 'draft',
        spaces_remaining:
          postType === 'spaces_filling' ? spacesRemaining : null,
      }));
      return socialPostsApi.bulkCreate(postsToCreate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-posts', camp?.id] });
      setActiveTab('posts');
    },
  });

  const createSpacePostsMutation = useMutation({
    mutationFn: async () => {
      const urgencyPosts = buildSpacesFillingPosts(camp, settings);
      const created = await socialPostsApi.bulkCreate(urgencyPosts);
      // Mark trigger as fired so we don't spam
      await socialSettingsApi.upsert(camp.id, {
        ...settings,
        spaces_trigger_fired: true,
      });
      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-posts', camp?.id] });
      queryClient.invalidateQueries({ queryKey: ['social-settings', camp?.id] });
      setActiveTab('posts');
    },
  });

  const sendPostMutation = useMutation({
    mutationFn: async (post) => {
      // Invoke the Vercel postToSocial function with the post details
      const response = await fetch('/api/functions/postToSocial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post.id,
          platform: post.platform,
          content: post.post_content,
          imageUrl: post.image_url,
          campId: post.camp_id,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        // Mark as failed in DB
        await socialPostsApi.update(post.id, {
          status: 'failed',
          error_message: err.message || 'Posting failed. Check platform connection.',
        });
        throw new Error(err.message || 'Posting failed');
      }

      const result = await response.json();
      return socialPostsApi.update(post.id, {
        status: 'sent',
        sent_at: new Date().toISOString(),
        external_post_id: result.postId || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-posts', camp?.id] });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: (postId) => socialPostsApi.delete(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-posts', camp?.id] });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: (connectionId) => platformConnectionsApi.disconnect(connectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-connections', camp?.location_id] });
    },
  });

  // ── Render ───────────────────────────────────────────────────

  if (!camp) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b flex-shrink-0">
          <DialogTitle className="text-[#2A4169] flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[#EE3E86]" />
            Social Media
            <span className="text-slate-400 font-normal">—</span>
            <span className="truncate">{camp.title}</span>
          </DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex-1 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="w-full rounded-none border-b bg-slate-50 h-11 px-4 justify-start gap-0">
              <TabsTrigger value="posts" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#EE3E86] data-[state=active]:bg-transparent">
                Posts
                {pendingCount > 0 && (
                  <Badge className="ml-2 bg-[#EE3E86] text-white text-xs h-5 min-w-5 flex items-center justify-center rounded-full">
                    {pendingCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="compose" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#EE3E86] data-[state=active]:bg-transparent">
                Compose
              </TabsTrigger>
              <TabsTrigger value="settings" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#EE3E86] data-[state=active]:bg-transparent">
                Settings
              </TabsTrigger>
              <TabsTrigger value="connections" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#EE3E86] data-[state=active]:bg-transparent">
                Connections
              </TabsTrigger>
            </TabsList>

            {/* ── POSTS TAB ─────────────────────────────────────────── */}
            <TabsContent value="posts" className="p-5 space-y-4 mt-0">
              {/* Spaces alert */}
              {spacesAlertActive && (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-amber-800">
                      Only {spacesRemaining} space{spacesRemaining === 1 ? '' : 's'} remaining!
                    </p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Create an urgency post to drive last-minute registrations.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700 text-white flex-shrink-0"
                    onClick={() => createSpacePostsMutation.mutate()}
                    disabled={createSpacePostsMutation.isPending || enabledPlatforms.length === 0}
                  >
                    {createSpacePostsMutation.isPending ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Zap className="w-3 h-3 mr-1" />
                    )}
                    Create Urgency Post
                  </Button>
                </div>
              )}

              {/* Quick-create buttons */}
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs"
                  onClick={() => { setComposerType('launch'); setActiveTab('compose'); }}
                >
                  <Plus className="w-3 h-3" /> Launch Post
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs"
                  onClick={() => { setComposerType('reminder_30_days'); setActiveTab('compose'); }}
                >
                  <Plus className="w-3 h-3" /> 30-Day Reminder
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs"
                  onClick={() => { setComposerType('spaces_filling'); setActiveTab('compose'); }}
                >
                  <Plus className="w-3 h-3" /> Spaces Filling
                </Button>
              </div>

              {/* Post list */}
              {postsLoading ? (
                <div className="flex items-center justify-center py-12 text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading posts…
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-14">
                  <Send className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">No posts yet.</p>
                  <p className="text-slate-400 text-xs mt-1">
                    Use the Compose tab to create your first post.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {posts.map((post) => (
                    <PostRow
                      key={post.id}
                      post={post}
                      onSend={() => sendPostMutation.mutate(post)}
                      onDelete={() => deletePostMutation.mutate(post.id)}
                      isSending={sendPostMutation.isPending && sendPostMutation.variables?.id === post.id}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ── COMPOSE TAB ───────────────────────────────────────── */}
            <TabsContent value="compose" className="p-5 mt-0 space-y-4">
              <div>
                <label className="text-sm font-medium text-[#2A4169] block mb-1.5">
                  Post Type
                </label>
                <Select value={composerType} onValueChange={setComposerType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="launch">🎉 Launch Announcement</SelectItem>
                    <SelectItem value="reminder_30_days">⏰ 30-Day Reminder</SelectItem>
                    <SelectItem value="spaces_filling">🔥 Spaces Filling Up</SelectItem>
                    <SelectItem value="custom">✏️ Custom Post</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <SocialPostComposer
                camp={camp}
                postType={composerType}
                socialSettings={settings}
                enabledPlatforms={enabledPlatforms}
                onSend={(content) =>
                  createPostsMutation.mutateAsync({ content, postType: composerType })
                }
                onDraft={(content) =>
                  createPostsMutation.mutateAsync({ content, postType: composerType })
                }
                isSending={createPostsMutation.isPending}
              />
            </TabsContent>

            {/* ── SETTINGS TAB ──────────────────────────────────────── */}
            <TabsContent value="settings" className="p-5 mt-0">
              {settingsLoading ? (
                <div className="flex items-center justify-center py-12 text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading…
                </div>
              ) : (
                <>
                  <CampSocialSettings
                    data={settings}
                    onChange={setSettingsDraft}
                  />
                  <div className="flex justify-end pt-4 border-t mt-4">
                    <Button
                      className="bg-[#EE3E86] hover:bg-[#D62D73] gap-2"
                      onClick={() => saveSettingsMutation.mutate()}
                      disabled={saveSettingsMutation.isPending}
                    >
                      {saveSettingsMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Saving…
                        </>
                      ) : (
                        'Save Settings'
                      )}
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>

            {/* ── CONNECTIONS TAB ───────────────────────────────────── */}
            <TabsContent value="connections" className="p-5 mt-0 space-y-4">
              <p className="text-sm text-slate-600">
                Connect your social accounts for this location. Each franchise location can
                have its own Facebook Page, Instagram account, and Google Business Profile.
              </p>

              {Object.entries(PLATFORM_CONFIG).map(
                ([key, { label, icon: Icon, iconColor, bg, instructions, docsUrl }]) => {
                  const connection = connections.find((c) => c.platform === key);
                  return (
                    <Card key={key} className="border shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center`}
                            >
                              <Icon className={`w-5 h-5 ${iconColor}`} />
                            </div>
                            <div>
                              <div className="font-medium text-[#2A4169]">{label}</div>
                              {connection?.is_connected ? (
                                <div className="text-xs text-green-600">
                                  ✓ Connected
                                  {connection.page_name ? ` — ${connection.page_name}` : ''}
                                </div>
                              ) : (
                                <div className="text-xs text-slate-400">Not connected</div>
                              )}
                            </div>
                          </div>
                          <div>
                            {connection?.is_connected ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-500 border-red-200 hover:bg-red-50"
                                onClick={() => disconnectMutation.mutate(connection.id)}
                                disabled={disconnectMutation.isPending}
                              >
                                Disconnect
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                className="bg-[#2A4169] hover:bg-[#1e3055]"
                                onClick={() =>
                                  window.open(docsUrl, '_blank', 'noopener')
                                }
                              >
                                Connect
                              </Button>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                          {instructions}
                        </p>
                      </CardContent>
                    </Card>
                  );
                }
              )}

              {/* Developer note */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">
                      API Credentials Required
                    </p>
                    <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                      Live posting requires environment variables to be set in your Vercel project.
                      See{' '}
                      <code className="bg-amber-100 px-1 rounded text-amber-900">
                        functions/postToSocial.ts
                      </code>{' '}
                      for the full list of required variables and setup instructions.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── PostRow ──────────────────────────────────────────────────────────────────

function PostRow({ post, onSend, onDelete, isSending }) {
  const platformCfg = PLATFORM_CONFIG[post.platform] || {};
  const PlatformIcon = platformCfg.icon;
  const statusCfg = STATUS_CONFIG[post.status] || STATUS_CONFIG.draft;
  const StatusIcon = statusCfg.Icon;

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Platform icon */}
          <div
            className={`w-9 h-9 rounded-full ${platformCfg.bg || 'bg-slate-100'} flex items-center justify-center flex-shrink-0`}
          >
            {PlatformIcon && (
              <PlatformIcon className={`w-4 h-4 ${platformCfg.iconColor}`} />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="text-xs font-medium text-[#2A4169]">
                {POST_TYPE_LABELS[post.post_type] || post.post_type}
              </span>
              <Badge
                className={`text-xs border-0 flex items-center gap-1 ${statusCfg.classes}`}
              >
                <StatusIcon className="w-3 h-3" />
                {statusCfg.label}
              </Badge>
              {post.status === 'scheduled' && post.scheduled_at && (
                <span className="text-xs text-slate-400">
                  {format(new Date(post.scheduled_at), 'MMM d, h:mm a')}
                </span>
              )}
              {post.status === 'sent' && post.sent_at && (
                <span className="text-xs text-slate-400">
                  {format(new Date(post.sent_at), 'MMM d, h:mm a')}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
              {post.post_content}
            </p>
            {post.error_message && (
              <p className="text-xs text-red-500 mt-1">{post.error_message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {(post.status === 'draft' || post.status === 'failed') && (
              <Button
                size="sm"
                className="bg-[#EE3E86] hover:bg-[#D62D73] h-8 text-xs gap-1"
                onClick={onSend}
                disabled={isSending}
              >
                {isSending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Send className="w-3 h-3" />
                )}
                {isSending ? '' : 'Send'}
              </Button>
            )}
            {post.status !== 'sent' && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 text-xs text-red-400 hover:text-red-600 hover:bg-red-50"
                onClick={onDelete}
              >
                Remove
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
