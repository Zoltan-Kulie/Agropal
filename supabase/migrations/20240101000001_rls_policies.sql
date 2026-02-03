-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE producer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PROFILES RLS
-- ============================================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Insert handled by trigger on auth.users creation
CREATE POLICY "Service role can insert" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================
-- WORKER_PROFILES RLS
-- ============================================================

-- Workers can read their own profile
CREATE POLICY "Workers can read own profile" ON worker_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Workers can update their own profile
CREATE POLICY "Workers can update own profile" ON worker_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Producers can read worker profiles only for applicants or contracted workers
CREATE POLICY "Producers can read applicant profiles" ON worker_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE a.applicant_id = worker_profiles.user_id
      AND j.producer_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM contracts c
      WHERE c.worker_id = worker_profiles.user_id
      AND c.producer_id = auth.uid()
    )
  );

-- ============================================================
-- PRODUCER_PROFILES RLS
-- ============================================================

-- Producers can read their own profile
CREATE POLICY "Producers can read own profile" ON producer_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Producers can update their own profile
CREATE POLICY "Producers can update own profile" ON producer_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Workers can read producer profiles only for jobs they applied/contracted to
CREATE POLICY "Workers can read applied job producers" ON producer_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE a.applicant_id = auth.uid()
      AND j.producer_id = producer_profiles.user_id
    )
    OR
    EXISTS (
      SELECT 1 FROM contracts c
      WHERE c.worker_id = auth.uid()
      AND c.producer_id = producer_profiles.user_id
    )
  );

-- ============================================================
-- JOBS RLS
-- ============================================================

-- Public can read active jobs
CREATE POLICY "Anyone can read active jobs" ON jobs
  FOR SELECT USING (status = 'active');

-- Producers can read all their own jobs (any status)
CREATE POLICY "Producers can read own jobs" ON jobs
  FOR SELECT USING (producer_id = auth.uid());

-- Producers can create jobs
CREATE POLICY "Producers can create jobs" ON jobs
  FOR INSERT WITH CHECK (producer_id = auth.uid());

-- Producers can update their own jobs
CREATE POLICY "Producers can update own jobs" ON jobs
  FOR UPDATE USING (producer_id = auth.uid());

-- Workers can read jobs they applied to
CREATE POLICY "Workers can read applied jobs" ON jobs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM applications
      WHERE job_id = jobs.id AND applicant_id = auth.uid()
    )
  );

-- ============================================================
-- JOB_PAYMENTS RLS
-- ============================================================

-- Only via edge functions (no direct client access)
-- All policies require service_role key
CREATE POLICY "Service role only" ON job_payments
  FOR ALL USING (false);

-- ============================================================
-- APPLICATIONS RLS
-- ============================================================

-- Workers can read their own applications
CREATE POLICY "Workers can read own applications" ON applications
  FOR SELECT USING (applicant_id = auth.uid());

-- Workers can create applications
CREATE POLICY "Workers can apply" ON applications
  FOR INSERT WITH CHECK (applicant_id = auth.uid());

-- Workers can update their own applications (withdraw)
CREATE POLICY "Workers can withdraw" ON applications
  FOR UPDATE USING (applicant_id = auth.uid());

-- Producers can read applications to their jobs
CREATE POLICY "Producers can read job applications" ON applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE id = applications.job_id AND producer_id = auth.uid()
    )
  );

-- Producers can update applications (accept/reject)
CREATE POLICY "Producers can update applications" ON applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE id = applications.job_id AND producer_id = auth.uid()
    )
  );

-- ============================================================
-- CONTRACTS RLS
-- ============================================================

-- Both parties can read their contracts
CREATE POLICY "Parties can read contracts" ON contracts
  FOR SELECT USING (producer_id = auth.uid() OR worker_id = auth.uid());

-- Only service role can insert (via accept_application function)
CREATE POLICY "Service role insert" ON contracts
  FOR INSERT WITH CHECK (false);

-- Producers can update contract status
CREATE POLICY "Producers can update contracts" ON contracts
  FOR UPDATE USING (producer_id = auth.uid());

-- Workers can update contract status (cancel)
CREATE POLICY "Workers can update contracts" ON contracts
  FOR UPDATE USING (worker_id = auth.uid());

-- ============================================================
-- REVIEWS RLS
-- ============================================================

-- Users can read reviews about them or by them
CREATE POLICY "Users can read relevant reviews" ON reviews
  FOR SELECT USING (from_user = auth.uid() OR to_user = auth.uid());

-- Users can create reviews for completed contracts
CREATE POLICY "Users can create reviews" ON reviews
  FOR INSERT WITH CHECK (
    from_user = auth.uid()
    AND EXISTS (
      SELECT 1 FROM contracts
      WHERE id = reviews.contract_id
      AND status = 'completed'
      AND (producer_id = auth.uid() OR worker_id = auth.uid())
    )
  );

-- Public can read all reviews (for reliability scores)
CREATE POLICY "Public can read all reviews" ON reviews
  FOR SELECT USING (true);

-- ============================================================
-- CONVERSATIONS RLS
-- ============================================================

-- Participants can read their conversations
CREATE POLICY "Participants can read" ON conversations
  FOR SELECT USING (producer_id = auth.uid() OR worker_id = auth.uid());

-- Participants can create conversations
CREATE POLICY "Participants can create" ON conversations
  FOR INSERT WITH CHECK (producer_id = auth.uid() OR worker_id = auth.uid());

-- ============================================================
-- MESSAGES RLS
-- ============================================================

-- Participants can read messages in their conversations
CREATE POLICY "Participants can read messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = messages.conversation_id
      AND (producer_id = auth.uid() OR worker_id = auth.uid())
    )
  );

-- Participants can send messages
CREATE POLICY "Participants can send" ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM conversations
      WHERE id = messages.conversation_id
      AND (producer_id = auth.uid() OR worker_id = auth.uid())
    )
  );

-- ============================================================
-- REPORTS RLS
-- ============================================================

-- Users can create reports
CREATE POLICY "Users can report" ON reports
  FOR INSERT WITH CHECK (reporter_id = auth.uid());

-- Only admins can read/update reports (via service role)
CREATE POLICY "Admin only read" ON reports
  FOR SELECT USING (false);

CREATE POLICY "Admin only update" ON reports
  FOR UPDATE USING (false);
