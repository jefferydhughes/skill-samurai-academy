# Skill Samurai Academy

A comprehensive youth education and registration platform for coding, STEM, and robotics programs.

## Tech Stack

- **Frontend:** React 18 + Vite
- **Styling:** Tailwind CSS + shadcn/ui
- **Backend:** Supabase (auth + database)
- **Payments:** Stripe (connected accounts)
- **Deployment:** Vercel

## Features

- Multi-role access: Students, Parents, Teachers, Owners/Admins
- Program & camp browsing and booking
- Interactive lesson player with gamification
- Parent dashboard and child profile management
- Owner analytics, staff management, and franchise tools
- AI-powered curriculum authoring tools
- PWA support for mobile

## Getting Started

```bash
npm install
npm run dev
```

## Environment Variables

Create a `.env.local` file with:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
OPENAI_API_KEY=your_openai_key  # used by Vercel functions only
```

## Deployment

Push to a GitHub repo connected to Vercel. The `vercel.json` config handles SPA routing.
