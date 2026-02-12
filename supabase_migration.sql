-- ================================================
-- SUPABASE MIGRATION: profiles, startups, investors
-- Run this in Supabase SQL Editor
-- ================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'INVESTOR' CHECK (role IN ('FOUNDER', 'INVESTOR')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='Users can view all profiles') THEN
        CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='Users can update own profile') THEN
        CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='Users can insert own profile') THEN
        CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
    END IF;
END $$;


-- 2. STARTUPS TABLE (full creation — includes original + new columns)
CREATE TABLE IF NOT EXISTS startups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    founder_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    industry TEXT,
    logo_url TEXT,
    tagline TEXT,
    sector TEXT,
    stage TEXT,
    raise_amount TEXT,
    description TEXT,
    about TEXT,
    product TEXT,
    website TEXT,
    trending BOOLEAN DEFAULT false,
    founded_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE startups ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='startups' AND policyname='Anyone authenticated can view startups') THEN
        CREATE POLICY "Anyone authenticated can view startups" ON startups FOR SELECT TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='startups' AND policyname='Founders can insert startups') THEN
        CREATE POLICY "Founders can insert startups" ON startups FOR INSERT TO authenticated WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='startups' AND policyname='Founders can update startups') THEN
        CREATE POLICY "Founders can update startups" ON startups FOR UPDATE TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='startups' AND policyname='Founders can delete startups') THEN
        CREATE POLICY "Founders can delete startups" ON startups FOR DELETE TO authenticated USING (auth.uid() = founder_id);
    END IF;
END $$;


-- 3. INVESTORS TABLE
CREATE TABLE IF NOT EXISTS investors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    firm_name TEXT,
    thesis TEXT,
    invested_startups UUID[] DEFAULT '{}',
    total_invested TEXT DEFAULT '$0',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE investors ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='investors' AND policyname='Users can view all investors') THEN
        CREATE POLICY "Users can view all investors" ON investors FOR SELECT TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='investors' AND policyname='Users can manage own investor profile') THEN
        CREATE POLICY "Users can manage own investor profile" ON investors FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='investors' AND policyname='Users can update own investor profile') THEN
        CREATE POLICY "Users can update own investor profile" ON investors FOR UPDATE TO authenticated USING (auth.uid() = user_id);
    END IF;
END $$;


-- 4. STARTUP EVALUATIONS TABLE (used by existing backend)
CREATE TABLE IF NOT EXISTS startup_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    startup_id TEXT NOT NULL,
    user_id TEXT,                -- links evaluation to the submitting user
    final_score NUMERIC,
    risk_label TEXT,
    report_json JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE startup_evaluations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='startup_evaluations' AND policyname='Anyone authenticated can view evaluations') THEN
        CREATE POLICY "Anyone authenticated can view evaluations" ON startup_evaluations FOR SELECT TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='startup_evaluations' AND policyname='Anyone authenticated can insert evaluations') THEN
        CREATE POLICY "Anyone authenticated can insert evaluations" ON startup_evaluations FOR INSERT TO authenticated WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='startup_evaluations' AND policyname='Anyone authenticated can update evaluations') THEN
        CREATE POLICY "Anyone authenticated can update evaluations" ON startup_evaluations FOR UPDATE TO authenticated USING (true);
    END IF;
END $$;


-- 5. INVESTOR INTERESTS TABLE
CREATE TABLE IF NOT EXISTS investor_interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    startup_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, startup_id)
);

ALTER TABLE investor_interests ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='investor_interests' AND policyname='Users can view own interests') THEN
        CREATE POLICY "Users can view own interests" ON investor_interests FOR SELECT TO authenticated USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='investor_interests' AND policyname='Users can insert own interests') THEN
        CREATE POLICY "Users can insert own interests" ON investor_interests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='investor_interests' AND policyname='Users can delete own interests') THEN
        CREATE POLICY "Users can delete own interests" ON investor_interests FOR DELETE TO authenticated USING (auth.uid() = user_id);
    END IF;
END $$;


-- Indexes
CREATE INDEX IF NOT EXISTS idx_startups_founder_id ON startups(founder_id);
CREATE INDEX IF NOT EXISTS idx_startups_sector ON startups(sector);
CREATE INDEX IF NOT EXISTS idx_startups_stage ON startups(stage);
CREATE INDEX IF NOT EXISTS idx_investors_user_id ON investors(user_id);
CREATE INDEX IF NOT EXISTS idx_investor_interests_user_id ON investor_interests(user_id);
CREATE INDEX IF NOT EXISTS idx_startup_evaluations_user_id ON startup_evaluations(user_id);

