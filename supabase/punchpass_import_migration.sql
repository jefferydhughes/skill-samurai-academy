-- ================================================================
-- Skill Samurai Academy – Punchpass Import Migration
-- ================================================================
-- Run this in Supabase SQL Editor.
--
-- Existing tables (NOT recreated): programs, students, weekly_class_slots
-- New tables: contacts, instructors, pass_purchases
-- Altered tables: weekly_class_slots (add instructor_id),
--                 students (add contact_id, make parent_id/dob nullable)
-- ================================================================


-- ----------------------------------------------------------------
-- 1. instructors (NEW)
--    Teachers per location, imported from Punchpass instructor reports.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.instructors (
  id                UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  location_id       UUID        NOT NULL REFERENCES public.franchise_locations(id) ON DELETE CASCADE,
  first_name        TEXT        NOT NULL,
  last_name         TEXT,
  email             TEXT,
  phone             TEXT,
  role              TEXT        DEFAULT 'instructor'
                    CHECK (role IN ('instructor', 'lead_instructor', 'assistant', 'volunteer')),
  is_active         BOOLEAN     NOT NULL DEFAULT true,
  classes_taught    INTEGER     DEFAULT 0,
  total_attendances INTEGER     DEFAULT 0,
  punchpass_name    TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (location_id, punchpass_name)
);

CREATE INDEX IF NOT EXISTS idx_instructors_location ON public.instructors(location_id);


-- ----------------------------------------------------------------
-- 2. contacts (NEW)
--    Parent/guardian records imported from Punchpass customer exports.
--    One row per Punchpass customer. Each location is identified
--    by location_id (no separate tables per location).
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contacts (
  id                    UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  location_id           UUID        NOT NULL REFERENCES public.franchise_locations(id) ON DELETE CASCADE,
  punchpass_customer_id TEXT        NOT NULL,

  -- Parsed names
  first_name            TEXT,
  last_name             TEXT        NOT NULL,
  raw_first_name        TEXT,

  -- Contact
  email                 TEXT,
  phone                 TEXT,

  -- Address
  street                TEXT,
  city                  TEXT,
  state                 TEXT,
  zip_code              TEXT,
  country               TEXT        DEFAULT 'AU',

  -- Emergency
  emergency_contact     TEXT,
  emergency_phone       TEXT,

  -- Punchpass metadata
  date_added            DATE,
  last_attendance       DATE,
  attendances_count     INTEGER     DEFAULT 0,
  referral_source       TEXT,
  tags                  TEXT,
  flagged               BOOLEAN     DEFAULT false,
  do_not_email          BOOLEAN     DEFAULT false,
  notes                 TEXT,

  -- Status
  status                TEXT        DEFAULT 'active'
                        CHECK (status IN ('active', 'inactive', 'trial', 'archived')),

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (location_id, punchpass_customer_id)
);

CREATE INDEX IF NOT EXISTS idx_contacts_location  ON public.contacts(location_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email     ON public.contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_last_name ON public.contacts(last_name);


-- ----------------------------------------------------------------
-- 3. pass_purchases (NEW)
--    Sales / membership data from Punchpass pass purchase exports.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pass_purchases (
  id                    UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  location_id           UUID        NOT NULL REFERENCES public.franchise_locations(id) ON DELETE CASCADE,
  contact_id            UUID        REFERENCES public.contacts(id) ON DELETE SET NULL,

  punchpass_customer_id TEXT        NOT NULL,
  punchpass_pass_id     TEXT        NOT NULL,

  pass_type             TEXT,
  pass_name             TEXT,
  purchased_date        DATE,
  expires_date          DATE,
  punches               INTEGER     DEFAULT 0,
  status                TEXT        DEFAULT 'active'
                        CHECK (status IN ('active', 'expired', 'cancelled', 'paused')),

  price                 NUMERIC(10,2),
  paid_with             TEXT,

  customer_first_name   TEXT,
  customer_last_name    TEXT,
  customer_email        TEXT,

  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (location_id, punchpass_pass_id)
);

CREATE INDEX IF NOT EXISTS idx_pass_purchases_location ON public.pass_purchases(location_id);
CREATE INDEX IF NOT EXISTS idx_pass_purchases_contact  ON public.pass_purchases(contact_id);
CREATE INDEX IF NOT EXISTS idx_pass_purchases_status   ON public.pass_purchases(status);


-- ----------------------------------------------------------------
-- 4. ALTER weekly_class_slots – add instructor_id column
-- ----------------------------------------------------------------
ALTER TABLE public.weekly_class_slots
  ADD COLUMN IF NOT EXISTS instructor_id UUID REFERENCES public.instructors(id) ON DELETE SET NULL;

-- Note: No unique constraint on (location_id, program_id, weekday, start_time)
-- because a location may have multiple classes at the same time and program.
-- Import script uses delete + re-insert for idempotency instead.


-- ----------------------------------------------------------------
-- 5. ALTER students – add contact_id, make parent_id/dob nullable
--    for Punchpass imports (imported students don't have app users)
-- ----------------------------------------------------------------
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL;

ALTER TABLE public.students
  ALTER COLUMN parent_id DROP NOT NULL;

ALTER TABLE public.students
  ALTER COLUMN dob DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_students_contact  ON public.students(contact_id);
CREATE INDEX IF NOT EXISTS idx_students_location ON public.students(location_id);


-- ----------------------------------------------------------------
-- 6. Row Level Security for new tables
-- ----------------------------------------------------------------
ALTER TABLE public.instructors   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pass_purchases ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies (idempotent)
DROP POLICY IF EXISTS "Authenticated users manage instructors"   ON public.instructors;
DROP POLICY IF EXISTS "Service role full access instructors"     ON public.instructors;
DROP POLICY IF EXISTS "Authenticated users manage contacts"      ON public.contacts;
DROP POLICY IF EXISTS "Service role full access contacts"        ON public.contacts;
DROP POLICY IF EXISTS "Authenticated users manage pass_purchases" ON public.pass_purchases;
DROP POLICY IF EXISTS "Service role full access pass_purchases"  ON public.pass_purchases;

CREATE POLICY "Authenticated users manage instructors"
  ON public.instructors FOR ALL
  USING (auth.role() = 'authenticated');
CREATE POLICY "Service role full access instructors"
  ON public.instructors
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Authenticated users manage contacts"
  ON public.contacts FOR ALL
  USING (auth.role() = 'authenticated');
CREATE POLICY "Service role full access contacts"
  ON public.contacts
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Authenticated users manage pass_purchases"
  ON public.pass_purchases FOR ALL
  USING (auth.role() = 'authenticated');
CREATE POLICY "Service role full access pass_purchases"
  ON public.pass_purchases
  USING (auth.jwt() ->> 'role' = 'service_role');


-- ----------------------------------------------------------------
-- 7. updated_at triggers
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_instructors_updated_at   ON public.instructors;
DROP TRIGGER IF EXISTS update_contacts_updated_at      ON public.contacts;
DROP TRIGGER IF EXISTS update_pass_purchases_updated_at ON public.pass_purchases;

CREATE TRIGGER update_instructors_updated_at
  BEFORE UPDATE ON public.instructors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pass_purchases_updated_at
  BEFORE UPDATE ON public.pass_purchases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
