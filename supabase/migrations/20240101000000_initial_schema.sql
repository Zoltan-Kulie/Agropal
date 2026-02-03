-- Enable PostGIS extension for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================
-- TABLES
-- ============================================================

-- profiles: Base user identity (linked to auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('producer','worker','leader','admin')),
  display_name TEXT NOT NULL,
  phone TEXT UNIQUE,
  preferred_locale TEXT NOT NULL DEFAULT 'el',
  push_token TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- worker_profiles: Extended profile for workers/leaders
CREATE TABLE worker_profiles (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  home_base GEOGRAPHY(Point,4326),
  skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  languages TEXT[] NOT NULL DEFAULT '{}'::text[],
  emergency_available BOOLEAN NOT NULL DEFAULT false,
  availability JSONB,
  reliability_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  verified_level TEXT CHECK (verified_level IN ('none','phone','id_pending','id_verified')) DEFAULT 'none',
  bio TEXT,
  profile_photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- producer_profiles: Extended profile for producers (farmers)
CREATE TABLE producer_profiles (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  farm_name TEXT NOT NULL,
  base_location GEOGRAPHY(Point,4326),
  verified_level TEXT CHECK (verified_level IN ('none','phone','business_pending','business_verified')) DEFAULT 'none',
  business_doc_url TEXT,
  bio TEXT,
  profile_photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- jobs: Job listings posted by producers
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  crop_type TEXT NOT NULL,
  location GEOGRAPHY(Point,4326) NOT NULL,
  location_label TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  workers_needed INTEGER NOT NULL CHECK (workers_needed > 0),
  daily_pay_eur NUMERIC(8,2) NOT NULL CHECK (daily_pay_eur > 0),
  accommodation BOOLEAN NOT NULL DEFAULT false,
  food BOOLEAN NOT NULL DEFAULT false,
  transport BOOLEAN NOT NULL DEFAULT false,
  required_skills TEXT[] NOT NULL DEFAULT '{}'::text[],
  status TEXT NOT NULL CHECK (status IN ('draft','pending_payment','active','filled','completed','cancelled')) DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ
);

-- job_payments: Track 5€ publication payments
CREATE TABLE job_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID UNIQUE NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  producer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount_eur NUMERIC(8,2) NOT NULL DEFAULT 5.00,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('created','paid','failed','refunded')) DEFAULT 'created',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- applications: Worker applications to jobs
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  as_group BOOLEAN NOT NULL DEFAULT false,
  group_size INTEGER CHECK (group_size >= 1) DEFAULT 1,
  cover_message TEXT,
  status TEXT NOT NULL CHECK (status IN ('applied','accepted','rejected','withdrawn')) DEFAULT 'applied',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(job_id, applicant_id)
);

-- contracts: Active work agreements
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  producer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('active','completed','cancelled','no_show')) DEFAULT 'active',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(job_id, worker_id)
);

-- reviews: Mutual ratings after contract completion
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  from_user UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  to_user UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stars INTEGER NOT NULL CHECK (stars BETWEEN 1 AND 5),
  tags TEXT[] NOT NULL DEFAULT '{}'::text[],
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(contract_id, from_user)
);

-- conversations: Chat threads (one per job+producer+worker)
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  producer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(job_id, producer_id, worker_id)
);

-- messages: Individual chat messages (realtime)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- reports: User reports for trust & safety
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending','reviewed','resolved','dismissed')) DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Profiles indexes
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_phone ON profiles(phone);

-- Jobs indexes
CREATE INDEX idx_jobs_producer_id ON jobs(producer_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_location ON jobs USING GIST(location);
CREATE INDEX idx_jobs_dates ON jobs(start_date, end_date);

-- Applications indexes
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_applicant_id ON applications(applicant_id);
CREATE INDEX idx_applications_status ON applications(status);

-- Contracts indexes
CREATE INDEX idx_contracts_job_id ON contracts(job_id);
CREATE INDEX idx_contracts_producer_id ON contracts(producer_id);
CREATE INDEX idx_contracts_worker_id ON contracts(worker_id);
CREATE INDEX idx_contracts_status ON contracts(status);

-- Messages indexes
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Worker profiles indexes
CREATE INDEX idx_worker_profiles_home_base ON worker_profiles USING GIST(home_base);
CREATE INDEX idx_worker_profiles_emergency ON worker_profiles(emergency_available);

-- Producer profiles indexes
CREATE INDEX idx_producer_profiles_base_location ON producer_profiles USING GIST(base_location);

-- ============================================================
-- UPDATED AT TRIGGERS
-- ============================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_worker_profiles_updated_at BEFORE UPDATE ON worker_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_producer_profiles_updated_at BEFORE UPDATE ON producer_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
