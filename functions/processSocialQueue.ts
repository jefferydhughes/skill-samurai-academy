/**
 * processSocialQueue.ts
 * Vercel Cron Function — runs daily at 9:00 AM UTC
 *
 * Add to vercel.json:
 * {
 *   "crons": [
 *     { "path": "/api/processSocialQueue", "schedule": "0 9 * * *" }
 *   ]
 * }
 *
 * What this function does:
 *   1. Sends all scheduled posts whose scheduled_at <= NOW()
 *   2. Checks camps with show_spaces_left=true for threshold breaches
 *      and auto-creates urgency posts when triggered
 *
 * Required env vars (same as postToSocial.ts):
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, FACEBOOK_API_VERSION
 *   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
 *   CRON_SECRET   – Set this in Vercel and pass it as Authorization header
 *                   to prevent unauthorized triggering
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SELF_BASE_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Validate cron secret so this endpoint cannot be called by anyone
  const auth = req.headers.authorization;
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const results = {
    scheduledProcessed: 0,
    scheduledFailed: 0,
    urgencyPostsCreated: 0,
    errors: [] as string[],
  };

  try {
    // ── 1. Process due scheduled posts ───────────────────────────
    const { data: duePosts, error: postsErr } = await supabase
      .from('social_posts')
      .select('*')
      .eq('status', 'scheduled')
      .lte('scheduled_at', new Date().toISOString());

    if (postsErr) throw postsErr;

    for (const post of duePosts ?? []) {
      try {
        const response = await fetch(`${SELF_BASE_URL}/api/postToSocial`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.CRON_SECRET || ''}`,
          },
          body: JSON.stringify({
            postId: post.id,
            platform: post.platform,
            content: post.post_content,
            imageUrl: post.image_url,
            campId: post.camp_id,
          }),
        });

        if (response.ok) {
          results.scheduledProcessed++;
        } else {
          results.scheduledFailed++;
          const err = await response.json().catch(() => ({}));
          results.errors.push(`Post ${post.id}: ${err.error || 'unknown error'}`);
        }
      } catch (err: any) {
        results.scheduledFailed++;
        results.errors.push(`Post ${post.id}: ${err.message}`);
      }
    }

    // ── 2. Check spaces triggers ──────────────────────────────────
    // Find all camps that have social settings with spaces trigger enabled
    // and where the trigger hasn't fired yet
    const { data: socialSettings, error: settingsErr } = await supabase
      .from('camp_social_settings')
      .select('*')
      .eq('show_spaces_left', true)
      .eq('auto_post_spaces_trigger', true)
      .eq('spaces_trigger_fired', false);

    if (settingsErr) throw settingsErr;

    for (const settings of socialSettings ?? []) {
      try {
        // Get the camp's current enrollment
        const { data: camp } = await supabase
          .from('camps')
          .select('id, title, capacity, enrolled_count, thumbnail, short_description, description, start_datetime, price, location_id')
          .eq('id', settings.camp_id)
          .eq('active', true)
          .single();

        if (!camp) continue;

        const spacesRemaining = (camp.capacity || 0) - (camp.enrolled_count || 0);

        if (spacesRemaining > 0 && spacesRemaining <= settings.spaces_left_threshold) {
          // Determine enabled platforms
          const platforms: string[] = [
            settings.facebook_enabled && 'facebook',
            settings.instagram_enabled && 'instagram',
            settings.google_business_enabled && 'google_business',
          ].filter(Boolean) as string[];

          if (platforms.length === 0) continue;

          // Build urgency posts
          const urgencyPosts = platforms.map((platform) => ({
            camp_id: camp.id,
            post_type: 'spaces_filling',
            platform,
            post_content: buildSpacesFillingContent(camp, spacesRemaining, settings),
            image_url: camp.thumbnail || null,
            signup_link: settings.custom_signup_link || null,
            hashtags: settings.hashtags || [],
            mentions: settings.mentions || [],
            spaces_remaining: spacesRemaining,
            status: 'draft', // Admin reviews before final send
          }));

          await supabase.from('social_posts').insert(urgencyPosts);

          // Mark trigger as fired
          await supabase
            .from('camp_social_settings')
            .update({ spaces_trigger_fired: true })
            .eq('camp_id', camp.id);

          results.urgencyPostsCreated += urgencyPosts.length;
        }
      } catch (err: any) {
        results.errors.push(`Spaces check for camp ${settings.camp_id}: ${err.message}`);
      }
    }

    console.log('[processSocialQueue] completed', results);
    return res.status(200).json({ success: true, ...results });
  } catch (err: any) {
    console.error('[processSocialQueue] fatal error:', err);
    return res.status(500).json({ error: err.message, ...results });
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildSpacesFillingContent(
  camp: Record<string, any>,
  spacesRemaining: number,
  settings: Record<string, any>
): string {
  const startDate = camp.start_datetime
    ? new Date(camp.start_datetime).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'TBD';
  const hashtags = ((settings.hashtags || []) as string[]).map((t) => `#${t}`).join(' ');
  const mentions = ((settings.mentions || []) as string[]).map((m) => `@${m}`).join(' ');
  const tagLine = [hashtags, mentions].filter(Boolean).join(' ');
  const signupLink = settings.custom_signup_link || '';

  return [
    `🔥 Spaces filling up FAST for "${camp.title}"!`,
    '',
    `Only ${spacesRemaining} spot${spacesRemaining === 1 ? '' : 's'} remaining — don't miss out!`,
    '',
    `📅 Starting: ${startDate}`,
    signupLink ? `👉 Register NOW before it's too late: ${signupLink}` : null,
    '',
    tagLine,
  ]
    .filter((l) => l !== null && l !== undefined)
    .join('\n')
    .trim();
}
