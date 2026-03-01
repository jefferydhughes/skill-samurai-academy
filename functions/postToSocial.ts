/**
 * postToSocial.ts
 * Vercel Serverless Function
 *
 * Posts content to a single social media platform.
 * Called by SocialMediaManager when admin clicks "Send Now".
 *
 * ──────────────────────────────────────────────────────────────
 * REQUIRED ENVIRONMENT VARIABLES (set in Vercel Dashboard)
 * ──────────────────────────────────────────────────────────────
 *
 * Facebook / Instagram (via Facebook Graph API):
 *   FACEBOOK_APP_ID             – Your Facebook App ID
 *   FACEBOOK_APP_SECRET         – Your Facebook App Secret
 *   FACEBOOK_API_VERSION        – Graph API version, e.g. "v19.0"
 *
 * Google Business Profile:
 *   GOOGLE_CLIENT_ID            – OAuth 2.0 client ID
 *   GOOGLE_CLIENT_SECRET        – OAuth 2.0 client secret
 *
 * Supabase (to update post status):
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   – Service role key (bypasses RLS)
 *
 * ──────────────────────────────────────────────────────────────
 * SETUP GUIDES
 * ──────────────────────────────────────────────────────────────
 *
 * Facebook Page posting:
 *   1. Create a Facebook App at https://developers.facebook.com/
 *   2. Add the "Pages" product and request `pages_manage_posts` permission
 *   3. Generate a long-lived Page Access Token for each location's Page
 *   4. Store each token in social_platform_connections.access_token
 *
 * Instagram Business posting:
 *   1. The Instagram Business account must be linked to a Facebook Page
 *   2. Use the same Page Access Token — Instagram posts via the Facebook Graph API
 *   3. Store the Instagram Business Account ID in social_platform_connections.instagram_account_id
 *   Docs: https://developers.facebook.com/docs/instagram-api/reference/ig-user/media
 *
 * Google Business Profile posting:
 *   1. Enable the "My Business API" in Google Cloud Console
 *   2. Set up OAuth 2.0 credentials (Web application type)
 *   3. Use the OAuth flow to get access + refresh tokens per location
 *   4. Store tokens in social_platform_connections
 *   Docs: https://developers.google.com/my-business/reference/rest/v4/accounts.locations.localPosts
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const FB_API_VERSION = process.env.FACEBOOK_API_VERSION || 'v19.0';
const GRAPH_BASE = `https://graph.facebook.com/${FB_API_VERSION}`;
const GOOGLE_MB_BASE = 'https://mybusinessbusinessinformation.googleapis.com/v1';
const GOOGLE_POSTS_BASE = 'https://mybusiness.googleapis.com/v4';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { postId, platform, content, imageUrl, campId } = req.body as {
    postId: string;
    platform: 'facebook' | 'instagram' | 'google_business';
    content: string;
    imageUrl?: string;
    campId: string;
  };

  if (!postId || !platform || !content) {
    return res.status(400).json({ error: 'postId, platform, and content are required' });
  }

  try {
    // Fetch the post to get camp_id → location_id → platform connection
    const { data: post, error: postErr } = await supabase
      .from('social_posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (postErr || !post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Fetch camp to get location_id
    const { data: camp } = await supabase
      .from('camps')
      .select('location_id')
      .eq('id', campId)
      .single();

    // Fetch platform connection credentials for this location
    const { data: connection } = await supabase
      .from('social_platform_connections')
      .select('*')
      .eq('location_id', camp?.location_id)
      .eq('platform', platform)
      .eq('is_connected', true)
      .single();

    if (!connection) {
      await markFailed(postId, `No active ${platform} connection found for this location.`);
      return res.status(422).json({
        error: `No connected ${platform} account. Connect your account in the Social → Connections tab.`,
      });
    }

    let externalPostId: string | null = null;

    switch (platform) {
      case 'facebook':
        externalPostId = await postToFacebook(connection, content, imageUrl);
        break;
      case 'instagram':
        externalPostId = await postToInstagram(connection, content, imageUrl);
        break;
      case 'google_business':
        externalPostId = await postToGoogleBusiness(connection, content, imageUrl);
        break;
      default:
        throw new Error(`Unknown platform: ${platform}`);
    }

    // Mark as sent
    await supabase
      .from('social_posts')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        external_post_id: externalPostId,
      })
      .eq('id', postId);

    return res.status(200).json({ success: true, postId: externalPostId });
  } catch (err: any) {
    console.error('[postToSocial] error:', err);
    await markFailed(postId, err.message || 'Unknown error');
    return res.status(500).json({ error: err.message || 'Posting failed' });
  }
}

// ─── Platform Implementations ─────────────────────────────────────────────────

async function postToFacebook(
  connection: Record<string, string>,
  content: string,
  imageUrl?: string
): Promise<string> {
  const { page_id: pageId, access_token: accessToken } = connection;

  if (!pageId || !accessToken) {
    throw new Error('Facebook Page ID or access token missing from connection settings.');
  }

  let endpoint = `${GRAPH_BASE}/${pageId}/feed`;
  let body: Record<string, string> = { message: content, access_token: accessToken };

  // If there's an image, create a photo post instead
  if (imageUrl) {
    endpoint = `${GRAPH_BASE}/${pageId}/photos`;
    body = { caption: content, url: imageUrl, access_token: accessToken };
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(
      data.error?.message || `Facebook API error: ${response.status}`
    );
  }

  return data.id || data.post_id || 'unknown';
}

async function postToInstagram(
  connection: Record<string, string>,
  content: string,
  imageUrl?: string
): Promise<string> {
  const { instagram_account_id: igAccountId, access_token: accessToken } = connection;

  if (!igAccountId || !accessToken) {
    throw new Error('Instagram Account ID or access token missing from connection settings.');
  }

  if (!imageUrl) {
    throw new Error('Instagram requires an image. Add a thumbnail to this camp.');
  }

  // Step 1: Create media container
  const containerResponse = await fetch(
    `${GRAPH_BASE}/${igAccountId}/media`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: imageUrl,
        caption: content,
        access_token: accessToken,
      }),
    }
  );

  const containerData = await containerResponse.json();

  if (!containerResponse.ok || containerData.error) {
    throw new Error(
      containerData.error?.message || `Instagram media creation error: ${containerResponse.status}`
    );
  }

  const creationId = containerData.id;

  // Step 2: Publish the container
  const publishResponse = await fetch(
    `${GRAPH_BASE}/${igAccountId}/media_publish`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: creationId,
        access_token: accessToken,
      }),
    }
  );

  const publishData = await publishResponse.json();

  if (!publishResponse.ok || publishData.error) {
    throw new Error(
      publishData.error?.message || `Instagram publish error: ${publishResponse.status}`
    );
  }

  return publishData.id || 'unknown';
}

async function postToGoogleBusiness(
  connection: Record<string, string>,
  content: string,
  imageUrl?: string
): Promise<string> {
  const {
    google_business_account_id: accountId,
    google_access_token: accessToken,
    google_refresh_token: refreshToken,
  } = connection;

  if (!accountId || !accessToken) {
    throw new Error(
      'Google Business Account ID or access token missing from connection settings.'
    );
  }

  // Refresh token if needed (simplified — production should check expiry)
  const validToken = await refreshGoogleToken(refreshToken, accessToken);

  // Google Business Profile Local Post structure
  const localPost: Record<string, unknown> = {
    languageCode: 'en',
    summary: content,
    topicType: 'STANDARD',
  };

  if (imageUrl) {
    localPost.media = [{ mediaFormat: 'PHOTO', sourceUrl: imageUrl }];
  }

  // Note: The location name format is "accounts/{accountId}/locations/{locationId}"
  // The location ID is stored separately in social_platform_connections
  const locationName = `accounts/${accountId}/locations/${connection.location_id || accountId}`;

  const response = await fetch(
    `${GOOGLE_POSTS_BASE}/${locationName}/localPosts`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${validToken}`,
      },
      body: JSON.stringify(localPost),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error?.message || `Google Business API error: ${response.status}`
    );
  }

  return data.name || 'unknown';
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function refreshGoogleToken(
  refreshToken: string,
  existingToken: string
): Promise<string> {
  if (!refreshToken) return existingToken;

  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    const data = await response.json();
    if (data.access_token) return data.access_token;
  } catch {
    // Fall back to existing token
  }

  return existingToken;
}

async function markFailed(postId: string, errorMessage: string) {
  await supabase
    .from('social_posts')
    .update({ status: 'failed', error_message: errorMessage })
    .eq('id', postId);
}
