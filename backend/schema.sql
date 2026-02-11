-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Startups Table
CREATE TABLE IF NOT EXISTS startups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    industry TEXT NOT NULL,
    stage TEXT NOT NULL,
    description TEXT,
    website TEXT,
    founded_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Financial Raw Inputs (Immutable)
CREATE TABLE IF NOT EXISTS financial_raw_inputs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    startup_id UUID REFERENCES startups(id) ON DELETE CASCADE,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    revenue NUMERIC NOT NULL,
    cogs NUMERIC NOT NULL,
    operating_expenses NUMERIC NOT NULL,
    cash_balance NUMERIC NOT NULL,
    monthly_burn_rate NUMERIC NOT NULL,
    currency TEXT DEFAULT 'USD',
    schema_version TEXT DEFAULT '1.0.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Constraint to ensure period_end > period_start
    CONSTRAINT check_dates CHECK (period_end > period_start)
);

-- 3. Evaluation Runs (Links all agent outputs to a single run)
CREATE TABLE IF NOT EXISTS evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    startup_id UUID REFERENCES startups(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 4. Financial Metrics (Agent Output)
CREATE TABLE IF NOT EXISTS financial_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evaluation_id UUID REFERENCES evaluations(id) ON DELETE CASCADE,
    agent_name TEXT NOT NULL,
    agent_version TEXT NOT NULL,
    model_name TEXT NOT NULL,
    gross_margin NUMERIC,
    net_margin NUMERIC,
    runway_months NUMERIC,
    revenue_growth_rate NUMERIC,
    burn_multiple NUMERIC,
    projections JSONB, -- Stores flexible projection data
    analysis_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Risk Assessments (Agent Output)
CREATE TABLE IF NOT EXISTS risk_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evaluation_id UUID REFERENCES evaluations(id) ON DELETE CASCADE,
    agent_name TEXT NOT NULL,
    agent_version TEXT NOT NULL,
    model_name TEXT NOT NULL,
    risk_score INTEGER CHECK (risk_score BETWEEN 0 AND 100),
    risk_factors JSONB, -- Array of risk objects
    executive_risk_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Market Analyses (Agent Output)
CREATE TABLE IF NOT EXISTS market_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evaluation_id UUID REFERENCES evaluations(id) ON DELETE CASCADE,
    agent_name TEXT NOT NULL,
    agent_version TEXT NOT NULL,
    model_name TEXT NOT NULL,
    tam NUMERIC,
    sam NUMERIC,
    som NUMERIC,
    competitors JSONB, -- Array of competitor objects
    market_trends JSONB, -- Array of trend strings
    market_attractiveness_score INTEGER CHECK (market_attractiveness_score BETWEEN 0 AND 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Final Reports
CREATE TABLE IF NOT EXISTS final_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evaluation_id UUID REFERENCES evaluations(id) ON DELETE CASCADE,
    startup_id UUID REFERENCES startups(id) ON DELETE CASCADE,
    agent_name TEXT NOT NULL,
    agent_version TEXT NOT NULL,
    model_name TEXT NOT NULL,
    overall_score INTEGER CHECK (overall_score BETWEEN 0 AND 100),
    sections JSONB, -- Detailed report sections
    recommendation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Simplified Persistence (Used by current EvaluationRepository)
CREATE TABLE IF NOT EXISTS startup_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    startup_id TEXT NOT NULL, -- Stored as text to be flexible
    final_score NUMERIC,
    risk_label TEXT,
    report_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
