-- ============================================================
-- TRIGGERS
-- ============================================================

-- ============================================================
-- PROFILE CREATION TRIGGER
-- ============================================================

-- Function to create profile when auth.user is created
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'worker')::TEXT
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- MESSAGE TRIGGERS
-- ============================================================

-- Update conversation last_message_at when message is sent
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_message_sent
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

-- ============================================================
-- CONTRACT TRIGGERS
-- ============================================================

-- Recalculate reliability score when contract status changes
CREATE OR REPLACE FUNCTION handle_contract_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger on status change
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    IF NEW.status = 'completed' THEN
      PERFORM recompute_reliability_score(NEW.worker_id);
    ELSIF NEW.status = 'no_show' THEN
      PERFORM recompute_reliability_score(NEW.worker_id);
    ELSIF NEW.status = 'cancelled' THEN
      PERFORM recompute_reliability_score(NEW.worker_id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_contract_status_change
  AFTER UPDATE OF status ON contracts
  FOR EACH ROW EXECUTE FUNCTION handle_contract_status_change();

-- ============================================================
-- APPLICATION TRIGGERS
-- ============================================================

-- Reject other applications when one is accepted for a job (optional)
-- This is commented out as producers may want to accept multiple workers
/*
CREATE OR REPLACE FUNCTION handle_application_accepted()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
    -- Reject all other pending applications for this job
    UPDATE applications
    SET status = 'rejected'
    WHERE job_id = NEW.job_id
    AND id != NEW.id
    AND status = 'applied';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_application_accepted
  AFTER UPDATE OF status ON applications
  FOR EACH ROW EXECUTE FUNCTION handle_application_accepted();
*/

-- ============================================================
-- REVIEW TRIGGERS
-- ============================================================

-- Recalculate reliability score when a new review is added
CREATE OR REPLACE FUNCTION handle_new_review()
RETURNS TRIGGER AS $$
BEGIN
  -- Get contract to find worker
  DECLARE
    v_worker_id UUID;
  BEGIN
    SELECT worker_id INTO v_worker_id
    FROM contracts
    WHERE id = NEW.contract_id;

    IF v_worker_id IS NOT NULL THEN
      PERFORM recompute_reliability_score(v_worker_id);
    END IF;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_review_created
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION handle_new_review();

-- ============================================================
-- AUDIT LOG TRIGGERS (OPTIONAL)
-- ============================================================

-- Create audit table if needed
/*
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  changed_by UUID REFERENCES profiles(id),
  changed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_log_table ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_log_user ON audit_log(changed_by);
*/

-- Generic audit function (uncomment if audit logging is needed)
/*
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (table_name, record_id, action, new_data, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', to_jsonb(NEW), auth.uid());
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (table_name, record_id, action, old_data, new_data, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), auth.uid());
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log (table_name, record_id, action, old_data, changed_by)
    VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD), auth.uid());
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
*/

-- ============================================================
-- REALTIME NOTIFICATION FUNCTIONS
-- ============================================================

-- Function to send push notification (placeholder - integrate with Expo)
CREATE OR REPLACE FUNCTION notify_user(
  p_user_id UUID,
  p_title TEXT,
  p_body TEXT,
  p_data JSONB DEFAULT '{}'::jsonb
)
RETURNS BOOLEAN AS $$
BEGIN
  -- This is a placeholder function
  -- In production, this would call an external service like Expo Push Notifications
  -- or insert into a notifications queue table

  -- Example implementation:
  -- INSERT INTO notifications_queue (user_id, title, body, data, created_at)
  -- VALUES (p_user_id, p_title, p_body, p_data, now());

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- JOB NOTIFICATIONS
-- ============================================================

-- Notify producer when new application is received
CREATE OR REPLACE FUNCTION notify_new_application()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'applied' THEN
    DECLARE
      v_producer_id UUID;
      v_job_title TEXT;
    BEGIN
      SELECT producer_id, title INTO v_producer_id, v_job_title
      FROM jobs
      WHERE id = NEW.job_id;

      PERFORM notify_user(
        v_producer_id,
        'New Application Received',
        'A worker applied for: ' || v_job_title,
        jsonb_build_object('type', 'new_application', 'application_id', NEW.id, 'job_id', NEW.job_id)
      );
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER notify_on_new_application
  AFTER INSERT ON applications
  FOR EACH ROW EXECUTE FUNCTION notify_new_application();

-- Notify worker when application status changes
CREATE OR REPLACE FUNCTION notify_application_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    IF NEW.status = 'accepted' THEN
      PERFORM notify_user(
        NEW.applicant_id,
        'Application Accepted!',
        'Congratulations! Your application was accepted.',
        jsonb_build_object('type', 'application_accepted', 'application_id', NEW.id, 'job_id', NEW.job_id)
      );
    ELSIF NEW.status = 'rejected' THEN
      PERFORM notify_user(
        NEW.applicant_id,
        'Application Update',
        'Your application status has been updated.',
        jsonb_build_object('type', 'application_rejected', 'application_id', NEW.id, 'job_id', NEW.job_id)
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER notify_on_application_status_change
  AFTER UPDATE OF status ON applications
  FOR EACH ROW EXECUTE FUNCTION notify_application_status_change();

-- ============================================================
-- MESSAGE NOTIFICATIONS
-- ============================================================

-- Notify recipient when message is sent
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify the other participant in the conversation
  INSERT INTO messages_notifications_queue (conversation_id, message_id, recipient_id, created_at)
  VALUES (NEW.conversation_id, NEW.id, NULL, now())
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create messages notifications queue table
CREATE TABLE IF NOT EXISTS messages_notifications_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ
);

CREATE INDEX idx_messages_notifications_queue_created ON messages_notifications_queue(created_at);

CREATE TRIGGER notify_on_new_message
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION notify_new_message();
