# Skill Samurai Academy

A full-stack youth education platform for coding, STEM, and robotics programs. Supports six user roles across a public marketing site, multi-portal dashboard system, franchise location management, gamified lesson player, and Stripe-powered booking/payment flows.

**Live site:** https://skill-samurai-academy.vercel.app

---

## Table of Contents

- [System Architecture](#system-architecture)
- [Site Map](#site-map)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Role-Based Access](#role-based-access)
- [Key Features](#key-features)
- [Database Schema](#database-schema)
- [Deployment Architecture](#deployment-architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Browser (React SPA)                         │
│                                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  Public     │  │  Portals     │  │  Full-Screen Players     │  │
│  │  Marketing  │  │  (dashboard  │  │  LessonPlayer            │  │
│  │  + Auth     │  │   sidebar)   │  │  EpicModeEditor          │  │
│  └──────┬──────┘  └──────┬───────┘  │  KitsuneLesson2D         │  │
│         │                │          └──────────────────────────┘  │
│         └────────────────┴──────────────────┐                      │
│                                             ▼                       │
│              React Router v6 (pages.config.js registry)            │
│              65 pages · 34 component directories                    │
└─────────────────────────────────────┬───────────────────────────────┘
                                      │
               ┌──────────────────────┼──────────────────────┐
               ▼                      ▼                       ▼
    ┌──────────────────┐  ┌───────────────────┐  ┌────────────────────┐
    │   Supabase       │  │   Vercel           │  │   Stripe           │
    │                  │  │   Serverless       │  │                    │
    │  • Auth          │  │   Functions        │  │  • Payment intents │
    │  • PostgreSQL DB │  │                    │  │  • Subscriptions   │
    │  • RLS policies  │  │  • calculateFee    │  │  • Connected accts │
    │  • Realtime      │  │  • createCheckout  │  │  • Webhooks        │
    │  • Storage       │  │  • createProduct   │  │  • Transfers       │
    └──────────────────┘  │  • invokeLLM       │  └────────────────────┘
                          │  • stripeWebhook   │
                          │  • (+ 7 more)      │
                          └───────────────────┘
```

### Request Flow

```
User request
     │
     ▼
Vercel CDN ──(static assets)──► dist/ (Vite build)
     │
     └──(API call /api/*)──► Vercel Serverless Functions (TypeScript)
     │                              │
     │                              ├──► Supabase (data / auth)
     │                              └──► Stripe (payments)
     │
     └──(all other paths)──► index.html (SPA fallback)
```

---

## Site Map

### Public / Marketing (no login required)

```
/                       Home            – Hero, location finder, features, reviews
/About                  About           – Company story and mission
/Contact                Contact         – Contact form
/Franchising            Franchising     – Franchise information
/ProgramsBrowser        Programs        – Browse all weekly programs
/CampBrowser            Camps           – Browse holiday camps
/CampCatalogue          Camp Catalogue  – Full camp listing
/CourseCatalogue        Courses         – Full course listing
/BookTrial              Book Trial      – Free trial booking form
/BookingFlow            Booking Flow    – Multi-step booking wizard
/Locations              Locations       – All franchise locations
/:locationSlug          Location Detail – Individual franchise page
/:locationSlug/camps    Location Camps  – Camps at a specific location
/CheckoutSuccess        Checkout OK     – Post-payment confirmation
/Login                  Login / Sign Up – Auth page (sign in + sign up tabs)
/PrivacyPolicy          Privacy         – Legal
/TermsOfService         Terms           – Legal
/HowBeAKidWorks         How It Works    – Programme explainer
```

### Student Portal

```
/StudentPortal          Dashboard       – Overview, progress snapshot
/LearningWorlds         Worlds          – 3D voxel world selector (gamified)
/LearningPaths          Paths           – Curriculum learning paths
/LessonPlayer           Lesson Player   – Full-screen interactive lesson
/KitsuneLesson2D        2D Lesson       – 2D Kitsune lesson environment
/EpicModeEditor         Epic Editor     – Full-screen voxel/code editor
/MyBookings             Bookings        – Upcoming & past class bookings
/MyChildren             Children        – Manage child profiles (parent view)
/WeeklyClassBooking     Class Booking   – Book a weekly class slot
```

### Parent Portal

```
/ParentDashboard        Dashboard       – Children overview and activity
/ParentReports          Reports         – Progress reports per child
/FamilyManagement       Family          – Add/edit family members
```

### Teacher Portal

```
/TeacherPortal          Dashboard       – Class overview and schedule
/InstructorOnboarding   Onboarding      – Setup wizard for new instructors
/InstructorSchedule     Schedule        – Personal teaching schedule
/ClassManagement        Classes         – Manage class rosters
/ClassSchedule          Class Schedule  – Weekly class timetable
/CompanionSetup         Companion       – Configure AI companion tutor
/CompanionQAReviewer    QA Review       – Review AI companion responses
```

### Owner / Admin Portal

```
/AdminDashboard         Dashboard       – Academy-wide overview
/OwnerDashboard         Owner Home      – Owner-level dashboard
/OwnerSettings          Settings        – Academy configuration
/OwnerStudents          Students        – All student management
/OwnerCamps             Camps           – Camp management
/OwnerSchedule          Schedule        – Full schedule view
/OwnerReports           Reports         – Revenue and performance reports
/FinancialDashboard     Finance         – Financial analytics
/StaffManagement        Staff           – Instructor management
/PermissionMatrix       Permissions     – Role/permission configuration
/TrialPipeline          Trials          – Free trial conversion pipeline
/WaitlistDashboard      Waitlist        – Enrolment waitlist management
/BadgeManager           Badges          – Achievement badge editor
/BeaKidFranchise        Franchise       – Franchise management tools
/CreateEvent            Create Event    – New event/camp builder
```

### Content Management

```
/CurriculumManager      Curriculum      – Manage curriculum structure
/CurriculumBuilder      Builder         – Visual curriculum builder
/CourseEditor           Course Editor   – Edit individual courses
/LessonsManager         Lessons         – Manage lesson library
/LessonEditor           Lesson Editor   – Rich lesson editor
/LessonTemplatePage     Templates       – Lesson templates
/WorldsManager          Worlds          – Manage 3D learning worlds
/StudentBlockEditor     Block Editor    – Student-facing block code editor
/ProjectCreator         Projects        – Create guided projects
```

### Location Management

```
/LocationsManager       Locations       – Manage all locations
/LocationSelector       Selector        – Location picker component
/LocationImporter       Importer        – Bulk import locations
/WeeklyScheduleManager  Schedule Mgr    – Per-location schedule editor
/WeeklySlotManager      Slot Manager    – Manage individual time slots
```

### Analytics & Settings

```
/Analytics              Analytics       – Platform-wide analytics
/CustomReports          Reports         – Custom report builder
/Settings               Settings        – User account settings
/EnrollmentsManager     Enrolments      – Enrolment management
/StudentEnrollmentMgr   Student Enrol   – Student-specific enrolments
/PWADashboard           PWA             – PWA and offline status
/GamificationDemo       Demo            – Gamification showcase
/StudentsManager        Students        – Cross-location student manager
/ProgramsManager        Programs        – Program library manager
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite 6 |
| Routing | React Router v6 (SPA) |
| Styling | Tailwind CSS 3 + shadcn/ui (New York, neutral) |
| Animation | Framer Motion |
| Icons | Lucide React |
| State (server) | TanStack React Query 5 |
| State (forms) | React Hook Form + Zod |
| Auth & Database | Supabase (PostgreSQL + RLS) |
| Payments | Stripe (connected accounts, subscriptions) |
| Serverless | Vercel Functions (TypeScript) |
| 3D Rendering | Three.js |
| Charts | Recharts |
| Rich Text | React Quill |
| PWA | vite-plugin-pwa + Workbox |
| Deployment | Vercel |

---

## Project Structure

```
skill-samurai-academy/
│
├── public/                         # Static assets (icons, manifest)
│
├── functions/                      # Vercel serverless functions (12 files)
│   ├── calculatePlatformFee.ts
│   ├── createAccountLink.ts
│   ├── createConnectedAccount.ts
│   ├── createConnectedCheckout.ts
│   ├── createPaymentIntent.ts
│   ├── createProductAndPrice.ts
│   ├── createSubscriptionIntent.ts
│   ├── createTaxRate.ts
│   ├── createTransfer.ts
│   ├── getAccountStatus.ts
│   ├── invokeLLM.ts
│   └── stripeWebhook.ts
│
├── supabase/
│   └── setup.sql                   # DB schema, triggers, RLS policies
│
├── src/
│   ├── main.jsx                    # Vite entry point
│   ├── App.jsx                     # Router + providers
│   ├── Layout.jsx                  # Layout switcher (public / portal / fullscreen)
│   ├── pages.config.js             # Route registry — add all new pages here
│   ├── index.css                   # Global styles
│   │
│   ├── pages/                      # 65 page components, organised by role
│   │   ├── Public/                 # Marketing + auth (13 pages)
│   │   ├── Student/                # Student portal (9 pages)
│   │   ├── Parent/                 # Parent portal (3 pages)
│   │   ├── Teacher/                # Teacher portal (7 pages)
│   │   ├── Owner/                  # Owner / admin (14 pages)
│   │   ├── Content/                # Content management (9 pages)
│   │   ├── Locations/              # Location management (8 pages)
│   │   ├── Analytics/              # Analytics (2 pages)
│   │   └── Settings/               # Settings (4 pages)
│   │
│   ├── components/                 # 187 component files
│   │   ├── ui/                     # 49 shadcn/ui primitives
│   │   ├── layout/                 # PublicHeader, PublicFooter, LeftRail
│   │   ├── ai/                     # AIChatbot
│   │   ├── companion/              # AI companion tutor
│   │   ├── booking/                # Booking wizard
│   │   ├── checkout/               # Stripe checkout + cart
│   │   ├── curriculum/             # Curriculum builder
│   │   ├── gamification/           # XP, badges, leaderboards
│   │   ├── kitsune/                # Kitsune lesson components
│   │   ├── voxel-world/            # Three.js 3D environment
│   │   ├── lesson/                 # Lesson player
│   │   ├── lesson-authoring/       # Lesson creation tools
│   │   ├── block-editor/           # Visual block code editor
│   │   ├── epic-editor/            # Epic mode editor
│   │   ├── locations/              # LocationFinder, maps
│   │   ├── analytics/              # Charts, dashboards
│   │   ├── scheduling/             # Class scheduling
│   │   ├── programs/               # Programme catalogue
│   │   ├── camps/                  # Camp components
│   │   ├── reporting/              # Report components
│   │   ├── onboarding/             # Onboarding wizards
│   │   ├── owner/                  # Owner portal components
│   │   ├── parent/                 # Parent portal components
│   │   ├── instructor/             # Instructor tools
│   │   ├── admin/                  # Admin components
│   │   ├── crm/                    # CRM components
│   │   ├── grading/                # Grading system
│   │   ├── pwa/                    # PWA controls + install prompt
│   │   └── sections/               # Reusable page sections
│   │
│   ├── api/
│   │   ├── apiClient.js            # Axios REST client (/api/*)
│   │   └── base44Client.js         # Supabase entity shim
│   │
│   ├── lib/
│   │   ├── AuthContext.jsx         # Supabase auth state + provider
│   │   ├── PWAContext.jsx          # PWA state (offline, notifications)
│   │   ├── NavigationTracker.jsx   # Page view tracking
│   │   ├── query-client.js         # React Query configuration
│   │   ├── app-params.js           # App-level config constants
│   │   ├── gamification/
│   │   │   ├── GamificationContext.jsx
│   │   │   └── xp-system.js
│   │   └── supabase/
│   │       ├── supabaseClient.js   # Browser Supabase client
│   │       ├── supabaseAdmin.js    # Service-role admin client
│   │       └── server.js           # Server-side Supabase utilities
│   │
│   ├── hooks/
│   │   └── use-mobile.jsx
│   │
│   └── utils/
│       └── index.ts                # createPageUrl + shared helpers
│
├── vite.config.js                  # Vite + PWA + env var remapping
├── tailwind.config.js              # Design tokens, dark mode, animations
├── vercel.json                     # SPA rewrites + CORS headers
├── components.json                 # shadcn/ui config (New York / neutral)
└── package.json
```

---

## Role-Based Access

The app renders one of three layout modes depending on the current page:

```
Request hits a route
        │
        ▼
  Is it in FULLSCREEN_PAGES?  ─── yes ──► Raw render (no chrome)
        │                               (LessonPlayer, EpicModeEditor,
        │ no                             KitsuneLesson2D)
        ▼
  Is it in PUBLIC_PAGES?  ────── yes ──► PublicHeader + PublicFooter
        │                               (Home, About, Login, Locations, …)
        │ no
        ▼
  Portal layout  ──────────────────────► Sidebar nav (role-aware)
                                         Top bar + user menu
```

### Sidebar navigation varies by role

| Role | Nav Items |
|------|-----------|
| **parent** | Dashboard, Programs, Bookings, Children, Progress, Billing |
| **student** | My Worlds, Lessons, Achievements, Progress |
| **teacher** | Curriculum, Courses, Lessons, Students, Progress |
| **admin / instructor** | Academy, Finance, Curriculum, Courses, Camps, Students, Badges, Reports |

---

## Key Features

### Gamification System
- XP points awarded for lesson completion, projects, and streaks
- Badge achievements with unlock notifications
- Leaderboards per class and global
- Level progression with rewards
- Daily streak tracking

### Lesson Player
- Interactive 3D voxel world environment (Three.js)
- 2D Kitsune companion lessons
- Visual block coding editor
- Epic mode: full-screen creative coding
- Auto-save progress

### Booking & Payments
- Free trial booking form
- Multi-step booking wizard
- Stripe connected accounts (franchise revenue split)
- Subscription management
- Payment intents + webhooks

### AI Features
- In-app AI chatbot assistant
- AI companion tutor (per-student configuration)
- AI-powered curriculum authoring
- LLM invocation via Vercel function (`invokeLLM.ts`)

### Franchise / Location System
- Franchise location pages at `/:locationSlug`
- Per-location camp and programme listings
- Franchise management tools for owners
- Location importer for bulk onboarding

### PWA
- Service worker with offline caching (Workbox)
- Install prompt for iOS and Android
- Background sync for offline lesson progress
- Push notification support

---

## Database Schema

Run [`supabase/setup.sql`](supabase/setup.sql) in the Supabase SQL Editor to initialise the database.

### Core Tables

```
auth.users              (Supabase managed)
      │
      └── public.profiles
              id          uuid  PK → auth.users.id
              full_name   text
              email       text
              role        text  (parent | student | teacher | admin)
              avatar_url  text
              created_at  timestamptz
              updated_at  timestamptz

public.franchise_locations
              id          uuid  PK
              name        text
              slug        text  (used as URL: /:locationSlug)
              city        text
              country     text
              is_active   bool
```

### Auth & Sign-up Flow

```
User submits sign-up form
        │
        ▼
supabase.auth.signUp()
        │
        ▼
INSERT into auth.users          ← Supabase managed
        │
        ▼
TRIGGER on_auth_user_created    ← defined in supabase/setup.sql
        │
        ▼
INSERT into public.profiles     ← app-level profile row created automatically
        │
        ▼
Confirmation email sent to user
        │
        ▼
User confirms → signs in → redirected to portal
```

---

## Deployment Architecture

```
GitHub (master branch)
        │
        │  git push
        ▼
Vercel (auto-deploy)
        │
        ├── npm run build  (Vite)
        │       └── dist/   (static SPA bundle served from CDN)
        │
        ├── functions/*.ts  (Vercel Serverless Functions → /api/*)
        │
        └── vercel.json routing:
                • /api/*          → serverless functions (with CORS headers)
                • all other URLs  → index.html (SPA fallback)
```

### Environment Variables on Vercel

The Supabase–Vercel integration injects `SUPABASE_URL` and `SUPABASE_ANON_KEY`. The `vite.config.js` `define` block remaps these at build time so the browser bundle can use them — no extra manual steps needed for those two.

| Variable | Source | Notes |
|----------|--------|-------|
| `SUPABASE_URL` | Supabase integration | Auto-remapped to `VITE_SUPABASE_URL` at build time |
| `SUPABASE_ANON_KEY` | Supabase integration | Auto-remapped to `VITE_SUPABASE_ANON_KEY` at build time |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Manual — Vercel dashboard | Browser-safe Stripe key |
| `STRIPE_SECRET_KEY` | Manual — Vercel dashboard | Server-side only (functions) |
| `OPENAI_API_KEY` | Manual — Vercel dashboard | Used by `invokeLLM.ts` only |

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Create local environment file
cp .env.example .env.local
# Fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, etc.

# 3. Initialise the database
# Open supabase/setup.sql and run it in your Supabase SQL Editor

# 4. Start the dev server
npm run dev
```

### Other Scripts

```bash
npm run build       # Production build → dist/
npm run preview     # Preview production build locally
npm run lint        # ESLint check
npm run lint:fix    # Auto-fix lint issues
npm run typecheck   # TypeScript type check
```

---

## Environment Variables

Create a `.env.local` for local development:

```bash
# Supabase — browser-accessible (VITE_ prefix required for Vite)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Stripe — browser-accessible
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe secret — server / Vercel functions only (no VITE_ prefix)
STRIPE_SECRET_KEY=sk_test_...

# OpenAI — used by invokeLLM.ts Vercel function only
OPENAI_API_KEY=sk-...
```

> **Vercel note:** The Supabase–Vercel integration auto-provides `SUPABASE_URL` and `SUPABASE_ANON_KEY`. The build config remaps them — you do not need to add them manually in the Vercel dashboard.

---

## Adding a New Page

1. Create `src/pages/{Category}/PageName.jsx`
2. Register it in [`src/pages.config.js`](src/pages.config.js)
3. For public marketing pages, add the name to `PUBLIC_PAGES` in [`src/Layout.jsx`](src/Layout.jsx)
4. Link from anywhere using `createPageUrl('PageName')` from `@/utils`

```js
// src/pages.config.js — minimal example
import NewPage from './pages/Category/NewPage';

export const pagesConfig = {
  Pages: {
    // ...existing pages
    NewPage,   // becomes the route /NewPage
  },
};
```
