# Skill Samurai Academy – Claude Memory

## Project Overview
- **Dual architecture**: Vite/React SPA (`src/`) is the production app; `skill-samurai-next/` is a Next.js 14 parallel build
- **Stack**: React 18, Vite 6, Supabase, Tailwind CSS, shadcn/ui, TanStack Query 5, Stripe
- **Brand colors**: navy `#2A4169`, pink `#EE3E86`, light blue `#A3DAE8`
- **Supabase project URL**: `https://omgtqczbzmgvtwptdbxm.supabase.co`

## Key File Paths
- Camp form: `src/components/owner/CampForm.jsx`
- Camp list page: `src/pages/Owner/OwnerCamps.jsx`
- API client (flat REST): `src/api/apiClient.js`
- Supabase shim (entity pattern): `src/api/base44Client.js`
- Supabase client: `src/lib/supabase/supabaseClient.js`
- DB setup: `supabase/setup.sql`

## Social Media Marketing Feature (added 2026-03-01)
### New Files
- `supabase/social_media_migration.sql` — 3 tables: `camp_social_settings`, `social_posts`, `social_platform_connections`
- `src/lib/supabase/socialMediaApi.js` — all Supabase CRUD + post content generators
- `src/components/owner/CampSocialSettings.jsx` — platform toggles, hashtag/mention tag inputs, trigger toggles
- `src/components/owner/SocialPostComposer.jsx` — editable textarea + FB/IG/Google preview cards
- `src/components/owner/SocialMediaManager.jsx` — 4-tab Dialog (Posts / Compose / Settings / Connections)
- `functions/postToSocial.ts` — Vercel fn: posts to FB Graph API, IG Graph API, Google Business Profile API
- `functions/processSocialQueue.ts` — Vercel cron (daily 9am): sends scheduled posts + auto-creates urgency posts

### Modified Files
- `src/pages/Owner/OwnerCamps.jsx` — added Social button (hover reveal), spaces-left badge (amber/red), SocialMediaManager dialog

### UX Flow
1. Admin hovers a camp card → "Social" button appears
2. Clicking Social opens SocialMediaManager dialog
3. Settings tab: enable platforms, add #tags and @mentions, toggle auto-post triggers, set spaces threshold
4. Compose tab: select post type, edit AI-generated content, preview per platform, queue to Posts tab
5. Posts tab: view all queued/sent posts, Send Now / Remove actions; spaces-filling alert when threshold met
6. Connections tab: connect FB/IG/Google OAuth per location

### Required Vercel Env Vars (for live posting)
`FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`, `FACEBOOK_API_VERSION`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`

### Cron setup (vercel.json)
```json
{ "crons": [{ "path": "/api/processSocialQueue", "schedule": "0 9 * * *" }] }
```

## Patterns & Conventions
- New Supabase tables: use `src/lib/supabase/socialMediaApi.js` pattern (direct supabase client, not apiClient.js)
- `api.entities.CampEvent.list()` style in pages — this is the base44 SDK entity pattern; new tables use direct Supabase
- shadcn/ui components live in `src/components/ui/`
- Forms use React state (not React Hook Form) for simpler camp-related forms
