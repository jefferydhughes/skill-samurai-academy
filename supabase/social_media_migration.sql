-- ================================================================
-- Skill Samurai Academy – Social Media Marketing Tables
-- ================================================================
-- Run this in the Supabase SQL Editor AFTER setup.sql
-- ================================================================

-- ----------------------------------------------------------------
-- 1. camp_social_settings
--    One row per camp. Stores platform toggles, hashtags,
--    mentions, and trigger configuration.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.camp_social_settings (
  id                        UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  camp_id                   UUID        NOT NULL,

  -- Platform toggles
  facebook_enabled          BOOLEAN     NOT NULL DEFAULT false,
  instagram_enabled         BOOLEAN     NOT NULL DEFAULT false,
  google_business_enabled   BOOLEAN     NOT NULL DEFAULT false,

  -- Post content customization
  hashtags                  TEXT[]      NOT NULL DEFAULT '{}',
  mentions                  TEXT[]      NOT NULL DEFAULT '{}',
  custom_signup_link        TEXT,

  -- Date-based triggers
  auto_post_on_publish      BOOLEAN     NOT NULL DEFAULT true,
  auto_post_30_days         BOOLEAN     NOT NULL DEFAULT true,

  -- Spaces-based display & trigger
  show_spaces_left          BOOLEAN     NOT NULL DEFAULT false,
  spaces_left_threshold     INTEGER     NOT NULL DEFAULT 5,
  auto_post_spaces_trigger  BOOLEAN     NOT NULL DEFAULT true,
  spaces_trigger_fired      BOOLEAN     NOT NULL DEFAULT false,

  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (camp_id)
);

-- ----------------------------------------------------------------
-- 2. social_posts
--    Queue and history of all social media posts.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.social_posts (
  id                UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  camp_id           UUID        NOT NULL,

  -- Classification
  post_type         TEXT        NOT NULL CHECK (post_type IN ('launch', 'reminder_30_days', 'spaces_filling', 'custom')),
  platform          TEXT        NOT NULL CHECK (platform IN ('facebook', 'instagram', 'google_business')),

  -- Content
  post_content      TEXT,
  image_url         TEXT,
  signup_link       TEXT,
  spaces_remaining  INTEGER,
  hashtags          TEXT[]      NOT NULL DEFAULT '{}',
  mentions          TEXT[]      NOT NULL DEFAULT '{}',

  -- Lifecycle
  status            TEXT        NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft', 'scheduled', 'sent', 'failed')),
  scheduled_at      TIMESTAMPTZ,
  sent_at           TIMESTAMPTZ,
  error_message     TEXT,
  external_post_id  TEXT,        -- ID returned by the platform after successful post

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- 3. social_platform_connections
--    OAuth credentials per location per platform.
--    In production, tokens should be encrypted at rest.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.social_platform_connections (
  id                            UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  location_id                   UUID,

  platform                      TEXT        NOT NULL
                                CHECK (platform IN ('facebook', 'instagram', 'google_business')),

  -- Facebook / Instagram (via Facebook Business)
  page_id                       TEXT,
  page_name                     TEXT,
  access_token                  TEXT,        -- Long-lived Page access token
  instagram_account_id          TEXT,        -- IG Business Account ID linked to the FB Page

  -- Google Business Profile
  google_business_account_id    TEXT,
  google_access_token           TEXT,
  google_refresh_token          TEXT,

  is_connected                  BOOLEAN     NOT NULL DEFAULT false,
  connected_at                  TIMESTAMPTZ,
  expires_at                    TIMESTAMPTZ,

  created_at                    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (location_id, platform)
);

-- ----------------------------------------------------------------
-- 4. Row Level Security
-- ----------------------------------------------------------------
ALTER TABLE public.camp_social_settings        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_posts                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_platform_connections ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies (idempotent)
DROP POLICY IF EXISTS "Authenticated users manage social settings"   ON public.camp_social_settings;
DROP POLICY IF EXISTS "Service role full access social settings"     ON public.camp_social_settings;
DROP POLICY IF EXISTS "Authenticated users manage social posts"      ON public.social_posts;
DROP POLICY IF EXISTS "Service role full access social posts"        ON public.social_posts;
DROP POLICY IF EXISTS "Authenticated users manage connections"       ON public.social_platform_connections;
DROP POLICY IF EXISTS "Service role full access connections"         ON public.social_platform_connections;

-- Authenticated users (owners/admins) can manage all social settings
CREATE POLICY "Authenticated users manage social settings"
  ON public.camp_social_settings FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Service role full access social settings"
  ON public.camp_social_settings
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Authenticated users manage social posts"
  ON public.social_posts FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Service role full access social posts"
  ON public.social_posts
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Authenticated users manage connections"
  ON public.social_platform_connections FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Service role full access connections"
  ON public.social_platform_connections
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ----------------------------------------------------------------
-- 5. updated_at trigger (reuse or create)
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_camp_social_settings_updated_at  ON public.camp_social_settings;
DROP TRIGGER IF EXISTS update_social_posts_updated_at          ON public.social_posts;
DROP TRIGGER IF EXISTS update_social_connections_updated_at    ON public.social_platform_connections;

CREATE TRIGGER update_camp_social_settings_updated_at
  BEFORE UPDATE ON public.camp_social_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_social_posts_updated_at
  BEFORE UPDATE ON public.social_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_social_connections_updated_at
  BEFORE UPDATE ON public.social_platform_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
