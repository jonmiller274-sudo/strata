-- Strata Migration 001: Auth Foundation
-- Adds author_id, plan_tier, archived_at to artifacts table
-- Creates profiles table with auto-creation trigger
-- Enables RLS with policies

-- ============================================
-- 1. Add new columns to artifacts
-- ============================================
ALTER TABLE artifacts
  ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS plan_tier TEXT NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

-- Add check constraint for plan_tier values
ALTER TABLE artifacts
  DROP CONSTRAINT IF EXISTS artifacts_plan_tier_check;
ALTER TABLE artifacts
  ADD CONSTRAINT artifacts_plan_tier_check
  CHECK (plan_tier IN ('free', 'pro', 'team', 'enterprise'));

-- Index for author lookups (dashboard, artifact count)
CREATE INDEX IF NOT EXISTS idx_artifacts_author_id ON artifacts(author_id);

-- ============================================
-- 2. Create profiles table
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  plan TEXT NOT NULL DEFAULT 'free'
    CHECK (plan IN ('free', 'pro', 'team', 'enterprise')),
  is_founding_member BOOLEAN NOT NULL DEFAULT false,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 3. Auto-create profile on user signup
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if any, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 4. Enable RLS
-- ============================================
ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. RLS Policies for artifacts
-- ============================================

-- Anyone can view published, non-archived artifacts
DROP POLICY IF EXISTS "Public can view published artifacts" ON artifacts;
CREATE POLICY "Public can view published artifacts"
  ON artifacts FOR SELECT
  USING (is_published = true AND archived_at IS NULL);

-- Authors can view all their own artifacts (drafts, archived, etc.)
DROP POLICY IF EXISTS "Authors can view own artifacts" ON artifacts;
CREATE POLICY "Authors can view own artifacts"
  ON artifacts FOR SELECT
  USING (auth.uid() = author_id);

-- Authenticated users can create artifacts (must set their own author_id)
DROP POLICY IF EXISTS "Authenticated users can create artifacts" ON artifacts;
CREATE POLICY "Authenticated users can create artifacts"
  ON artifacts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Authors can update their own artifacts
DROP POLICY IF EXISTS "Authors can update own artifacts" ON artifacts;
CREATE POLICY "Authors can update own artifacts"
  ON artifacts FOR UPDATE
  USING (auth.uid() = author_id);

-- Authors can delete their own artifacts
DROP POLICY IF EXISTS "Authors can delete own artifacts" ON artifacts;
CREATE POLICY "Authors can delete own artifacts"
  ON artifacts FOR DELETE
  USING (auth.uid() = author_id);

-- ============================================
-- 6. RLS Policies for profiles
-- ============================================

-- Users can read their own profile
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
