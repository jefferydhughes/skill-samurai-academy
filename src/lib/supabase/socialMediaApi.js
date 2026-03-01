/**
 * socialMediaApi.js
 *
 * Supabase query helpers for the social media marketing system.
 * Covers: camp_social_settings, social_posts, social_platform_connections
 */
import { supabase } from '@/lib/supabase/supabaseClient';
import { format } from 'date-fns';

// ─── Social Settings ─────────────────────────────────────────────────────────

export const socialSettingsApi = {
  /** Returns null when no settings exist yet (PGRST116 = no rows). */
  getByCampId: async (campId) => {
    const { data, error } = await supabase
      .from('camp_social_settings')
      .select('*')
      .eq('camp_id', campId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ?? null;
  },

  /** Create or update settings for a camp. */
  upsert: async (campId, settings) => {
    const { data, error } = await supabase
      .from('camp_social_settings')
      .upsert({ camp_id: campId, ...settings }, { onConflict: 'camp_id' })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /** Fetch settings for multiple camps at once (used in OwnerCamps list). */
  getForCampIds: async (campIds) => {
    if (!campIds || campIds.length === 0) return [];
    const { data, error } = await supabase
      .from('camp_social_settings')
      .select('*')
      .in('camp_id', campIds);
    if (error) throw error;
    return data ?? [];
  },
};

// ─── Social Posts ─────────────────────────────────────────────────────────────

export const socialPostsApi = {
  /** All posts for a camp, newest first. */
  getByCampId: async (campId) => {
    const { data, error } = await supabase
      .from('social_posts')
      .select('*')
      .eq('camp_id', campId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  create: async (post) => {
    const { data, error } = await supabase
      .from('social_posts')
      .insert(post)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  bulkCreate: async (posts) => {
    if (!posts || posts.length === 0) return [];
    const { data, error } = await supabase
      .from('social_posts')
      .insert(posts)
      .select();
    if (error) throw error;
    return data ?? [];
  },

  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('social_posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  delete: async (id) => {
    const { error } = await supabase
      .from('social_posts')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  /** Posts that are scheduled and due to be sent (used by cron). */
  getPendingDue: async () => {
    const { data, error } = await supabase
      .from('social_posts')
      .select('*')
      .eq('status', 'scheduled')
      .lte('scheduled_at', new Date().toISOString());
    if (error) throw error;
    return data ?? [];
  },
};

// ─── Platform Connections ─────────────────────────────────────────────────────

export const platformConnectionsApi = {
  getByLocationId: async (locationId) => {
    if (!locationId) return [];
    const { data, error } = await supabase
      .from('social_platform_connections')
      .select('*')
      .eq('location_id', locationId);
    if (error) throw error;
    return data ?? [];
  },

  upsert: async (locationId, platform, connectionData) => {
    const { data, error } = await supabase
      .from('social_platform_connections')
      .upsert(
        {
          location_id: locationId,
          platform,
          ...connectionData,
          is_connected: true,
          connected_at: new Date().toISOString(),
        },
        { onConflict: 'location_id,platform' }
      )
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  disconnect: async (id) => {
    const { data, error } = await supabase
      .from('social_platform_connections')
      .update({
        is_connected: false,
        access_token: null,
        google_access_token: null,
        google_refresh_token: null,
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// ─── Post Content Generator ───────────────────────────────────────────────────

/**
 * Generates default post copy for a given type.
 * The admin can edit this in the Composer before queuing.
 */
export function generatePostContent(camp, postType, socialSettings) {
  const spacesRemaining = (camp.capacity || 0) - (camp.enrolled_count || 0);
  const startDate = camp.start_datetime
    ? format(new Date(camp.start_datetime), 'MMMM d, yyyy')
    : 'TBD';
  const price = camp.price ? `$${(camp.price / 100).toFixed(2)}` : '';
  const hashtags = (socialSettings?.hashtags || []).map((t) => `#${t}`).join(' ');
  const mentions = (socialSettings?.mentions || []).map((m) => `@${m}`).join(' ');
  const tagLine = [hashtags, mentions].filter(Boolean).join(' ');
  const signupLink =
    socialSettings?.custom_signup_link || '[Add your signup link in Social Settings]';

  const lines = (parts) =>
    parts
      .filter((l) => l !== false && l !== undefined && l !== null && l !== '')
      .join('\n')
      .trim();

  switch (postType) {
    case 'launch':
      return lines([
        `🎉 NEW CAMP ALERT! "${camp.title}" is now open for registration!`,
        '',
        camp.short_description || camp.description || '',
        '',
        `📅 Starts: ${startDate}`,
        price && `💰 Price: ${price}`,
        `👉 Register now: ${signupLink}`,
        '',
        tagLine,
      ]);

    case 'reminder_30_days':
      return lines([
        `⏰ Camp starts in 30 days! Don't miss "${camp.title}"!`,
        '',
        camp.short_description || '',
        '',
        `📅 Starting: ${startDate}`,
        price && `💰 Price: ${price}`,
        `👉 Secure your spot: ${signupLink}`,
        '',
        tagLine,
      ]);

    case 'spaces_filling':
      return lines([
        `🔥 Spaces filling up FAST for "${camp.title}"!`,
        '',
        `Only ${spacesRemaining} spot${spacesRemaining === 1 ? '' : 's'} remaining — don't miss out!`,
        '',
        `📅 Starting: ${startDate}`,
        `👉 Register NOW before it's too late: ${signupLink}`,
        '',
        tagLine,
      ]);

    default:
      return lines([camp.title, '', camp.description || '', '', tagLine]);
  }
}

/**
 * Builds a list of social_posts rows to queue when a camp is published.
 * Called from OwnerCamps after a successful save when active=true.
 */
export function buildLaunchPosts(camp, socialSettings) {
  const platforms = [
    socialSettings.facebook_enabled && 'facebook',
    socialSettings.instagram_enabled && 'instagram',
    socialSettings.google_business_enabled && 'google_business',
  ].filter(Boolean);

  if (platforms.length === 0) return [];

  return platforms.map((platform) => ({
    camp_id: camp.id,
    post_type: 'launch',
    platform,
    post_content: generatePostContent(camp, 'launch', socialSettings),
    image_url: camp.thumbnail || null,
    signup_link: socialSettings.custom_signup_link || null,
    hashtags: socialSettings.hashtags || [],
    mentions: socialSettings.mentions || [],
    status: 'draft', // Admin reviews before sending
  }));
}

/**
 * Builds 30-day reminder posts, scheduled for 30 days before camp start.
 * Returns [] if start is less than 30 days away.
 */
export function buildReminderPosts(camp, socialSettings) {
  if (!camp.start_datetime) return [];

  const startDate = new Date(camp.start_datetime);
  const reminderDate = new Date(startDate.getTime() - 30 * 24 * 60 * 60 * 1000);

  if (reminderDate <= new Date()) return []; // Already past

  const platforms = [
    socialSettings.facebook_enabled && 'facebook',
    socialSettings.instagram_enabled && 'instagram',
    socialSettings.google_business_enabled && 'google_business',
  ].filter(Boolean);

  if (platforms.length === 0) return [];

  return platforms.map((platform) => ({
    camp_id: camp.id,
    post_type: 'reminder_30_days',
    platform,
    post_content: generatePostContent(camp, 'reminder_30_days', socialSettings),
    image_url: camp.thumbnail || null,
    signup_link: socialSettings.custom_signup_link || null,
    hashtags: socialSettings.hashtags || [],
    mentions: socialSettings.mentions || [],
    status: 'scheduled',
    scheduled_at: reminderDate.toISOString(),
  }));
}

/**
 * Builds spaces-filling urgency posts (status: draft for admin review).
 */
export function buildSpacesFillingPosts(camp, socialSettings) {
  const platforms = [
    socialSettings.facebook_enabled && 'facebook',
    socialSettings.instagram_enabled && 'instagram',
    socialSettings.google_business_enabled && 'google_business',
  ].filter(Boolean);

  if (platforms.length === 0) return [];

  const spacesRemaining = (camp.capacity || 0) - (camp.enrolled_count || 0);

  return platforms.map((platform) => ({
    camp_id: camp.id,
    post_type: 'spaces_filling',
    platform,
    post_content: generatePostContent(camp, 'spaces_filling', socialSettings),
    image_url: camp.thumbnail || null,
    signup_link: socialSettings.custom_signup_link || null,
    hashtags: socialSettings.hashtags || [],
    mentions: socialSettings.mentions || [],
    spaces_remaining: spacesRemaining,
    status: 'draft',
  }));
}
