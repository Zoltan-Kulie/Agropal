-- ============================================================
-- DATABASE FUNCTIONS
-- ============================================================

-- recompute_reliability_score(p_user_id uuid)
-- Recalculate worker reliability score after contract status change
-- Formula:
--   +10 points per completed contract
--   -15 points per no_show
--   -5 points per worker-cancelled contract
--   Weighted by average star rating (multiplied by stars/5)
--   Floor at 0
CREATE OR REPLACE FUNCTION recompute_reliability_score(p_user_id uuid)
RETURNS NUMERIC AS $$
DECLARE
  v_base_score NUMERIC := 0;
  v_completed INTEGER;
  v_no_shows INTEGER;
  v_cancelled INTEGER;
  v_avg_stars NUMERIC;
BEGIN
  -- Count contract outcomes
  SELECT
    COUNT(*) FILTER (WHERE status = 'completed'),
    COUNT(*) FILTER (WHERE status = 'no_show'),
    COUNT(*) FILTER (WHERE status = 'cancelled')
  INTO v_completed, v_no_shows, v_cancelled
  FROM contracts
  WHERE worker_id = p_user_id;

  -- Calculate base score
  v_base_score := (v_completed * 10) - (v_no_shows * 15) - (v_cancelled * 5);

  -- Get average stars received
  SELECT COALESCE(AVG(stars), 3)
  INTO v_avg_stars
  FROM reviews
  WHERE to_user = p_user_id;

  -- Apply star weight and floor at 0
  RETURN GREATEST(0, v_base_score * (v_avg_stars / 5.0));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- publish_job(p_job_id uuid)
-- Transition job status from pending_payment to active
-- Called after Stripe payment succeeds
CREATE OR REPLACE FUNCTION publish_job(p_job_id uuid)
RETURNS UUID AS $$
BEGIN
  -- Update job status to active and set published_at
  UPDATE jobs
  SET
    status = 'active',
    published_at = now()
  WHERE id = p_job_id AND status = 'pending_payment';

  RETURN p_job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- accept_application(p_application_id uuid)
-- Accept a worker application, create contract, update job status if needed
CREATE OR REPLACE FUNCTION accept_application(p_application_id uuid)
RETURNS UUID AS $$
DECLARE
  v_application RECORD;
  v_contract_id UUID;
  v_job RECORD;
BEGIN
  -- Get application details
  SELECT * INTO v_application
  FROM applications
  WHERE id = p_application_id;

  -- Update application status
  UPDATE applications
  SET status = 'accepted'
  WHERE id = p_application_id;

  -- Get job details
  SELECT * INTO v_job
  FROM jobs
  WHERE id = v_application.job_id;

  -- Create contract
  INSERT INTO contracts (job_id, producer_id, worker_id, application_id, status)
  VALUES (v_job.id, v_job.producer_id, v_application.applicant_id, v_application.id, 'active')
  RETURNING id INTO v_contract_id;

  -- Check if job is now filled
  DECLARE
    v_accepted_count INTEGER;
  BEGIN
    SELECT COUNT(*) INTO v_accepted_count
    FROM applications
    WHERE job_id = v_job.id AND status = 'accepted';

    IF v_accepted_count >= v_job.workers_needed THEN
      UPDATE jobs SET status = 'filled' WHERE id = v_job.id;
    END IF;
  END;

  RETURN v_contract_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- complete_contract(p_contract_id uuid, p_worker_no_show BOOLEAN DEFAULT false)
-- Mark contract as completed or no_show, trigger reliability score recalculation
CREATE OR REPLACE FUNCTION complete_contract(p_contract_id uuid, p_worker_no_show BOOLEAN DEFAULT false)
RETURNS UUID AS $$
DECLARE
  v_contract RECORD;
  v_worker_id UUID;
BEGIN
  -- Get contract details
  SELECT * INTO v_contract
  FROM contracts
  WHERE id = p_contract_id;

  -- Determine final status
  IF p_worker_no_show THEN
    UPDATE contracts
    SET status = 'no_show', completed_at = now()
    WHERE id = p_contract_id;
  ELSE
    UPDATE contracts
    SET status = 'completed', completed_at = now()
    WHERE id = p_contract_id;
  END IF;

  -- Recalculate worker reliability score
  PERFORM recompute_reliability_score(v_contract.worker_id);

  RETURN p_contract_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- cancel_contract(p_contract_id uuid, p_cancelled_by_role TEXT)
-- Cancel a contract and update reliability score if cancelled by worker
CREATE OR REPLACE FUNCTION cancel_contract(p_contract_id uuid, p_cancelled_by_role TEXT)
RETURNS UUID AS $$
DECLARE
  v_contract RECORD;
BEGIN
  -- Get contract details
  SELECT * INTO v_contract
  FROM contracts
  WHERE id = p_contract_id;

  -- Update contract status
  UPDATE contracts
  SET status = 'cancelled'
  WHERE id = p_contract_id;

  -- Recalculate reliability score if cancelled by worker
  IF p_cancelled_by_role = 'worker' THEN
    PERFORM recompute_reliability_score(v_contract.worker_id);
  END IF;

  RETURN p_contract_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- withdraw_application(p_application_id uuid)
-- Worker withdraws their application
CREATE OR REPLACE FUNCTION withdraw_application(p_application_id uuid)
RETURNS UUID AS $$
BEGIN
  UPDATE applications
  SET status = 'withdrawn'
  WHERE id = p_application_id AND status = 'applied';

  RETURN p_application_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- reject_application(p_application_id uuid)
-- Producer rejects an application
CREATE OR REPLACE FUNCTION reject_application(p_application_id uuid)
RETURNS UUID AS $$
BEGIN
  UPDATE applications
  SET status = 'rejected'
  WHERE id = p_application_id AND status = 'applied';

  RETURN p_application_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- get_worker_rating(p_user_id uuid)
-- Returns worker's reliability score and review count
CREATE OR REPLACE FUNCTION get_worker_rating(p_user_id uuid)
RETURNS TABLE(
  reliability_score NUMERIC,
  completed_contracts INTEGER,
  total_reviews INTEGER,
  avg_stars NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    wp.reliability_score,
    COUNT(*) FILTER (WHERE c.status = 'completed'),
    COUNT(r.id),
    AVG(r.stars)
  FROM worker_profiles wp
  LEFT JOIN contracts c ON c.worker_id = wp.user_id
  LEFT JOIN reviews r ON r.to_user = wp.user_id
  WHERE wp.user_id = p_user_id
  GROUP BY wp.reliability_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- get_job_stats(p_producer_id uuid)
-- Returns producer's job statistics
CREATE OR REPLACE FUNCTION get_job_stats(p_producer_id uuid)
RETURNS TABLE(
  total_jobs INTEGER,
  active_jobs INTEGER,
  completed_jobs INTEGER,
  total_applications INTEGER,
  accepted_applications INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER,
    COUNT(*) FILTER (WHERE status = 'active' OR status = 'filled')::INTEGER,
    COUNT(*) FILTER (WHERE status = 'completed')::INTEGER,
    COALESCE(SUM((
      SELECT COUNT(*) FROM applications WHERE job_id = j.id
    )), 0)::INTEGER,
    COALESCE(SUM((
      SELECT COUNT(*) FROM applications WHERE job_id = j.id AND status = 'accepted'
    )), 0)::INTEGER
  FROM jobs j
  WHERE j.producer_id = p_producer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- search_jobs_by_location(p_lat NUMERIC, p_lng NUMERIC, p_radius_km INTEGER, p_limit INTEGER DEFAULT 20)
-- Search for jobs within a radius of a location
CREATE OR REPLACE FUNCTION search_jobs_by_location(
  p_lat NUMERIC,
  p_lng NUMERIC,
  p_radius_km INTEGER DEFAULT 50,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE(
  id UUID,
  title TEXT,
  crop_type TEXT,
  location GEOGRAPHY,
  location_label TEXT,
  start_date DATE,
  end_date DATE,
  daily_pay_eur NUMERIC,
  workers_needed INTEGER,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    j.id,
    j.title,
    j.crop_type,
    j.location,
    j.location_label,
    j.start_date,
    j.end_date,
    j.daily_pay_eur,
    j.workers_needed,
    j.status
  FROM jobs j
  WHERE
    j.status = 'active'
    AND ST_DWithin(j.location, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326), p_radius_km * 1000)
  ORDER BY j.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- suggest_harvest_route(p_worker_id uuid, p_limit INTEGER DEFAULT 5)
-- Suggest next jobs based on dates + distance from current location
CREATE OR REPLACE FUNCTION suggest_harvest_route(
  p_worker_id uuid,
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE(
  job_id UUID,
  title TEXT,
  location GEOGRAPHY,
  location_label TEXT,
  start_date DATE,
  distance_km NUMERIC,
  match_score NUMERIC
) AS $$
DECLARE
  v_worker_home GEOGRAPHY;
  v_skills TEXT[];
BEGIN
  -- Get worker's home base and skills
  SELECT home_base, skills INTO v_worker_home, v_skills
  FROM worker_profiles
  WHERE user_id = p_worker_id;

  -- If no home base, return empty
  IF v_worker_home IS NULL THEN
    RETURN;
  END IF;

  -- Suggest jobs matching skills and location proximity
  RETURN QUERY
  SELECT
    j.id,
    j.title,
    j.location,
    j.location_label,
    j.start_date,
    ST_Distance(v_worker_home, j.location) / 1000 as distance_km,
    CASE
      WHEN j.start_date >= CURRENT_DATE THEN
        -- Future jobs: prioritize proximity and skill match
        (100 - LEAST(100, ST_Distance(v_worker_home, j.location) / 1000)) * 0.7 +
        (100 * (cardinality(j.required_skills & v_skills)::NUMERIC / NULLIF(cardinality(j.required_skills), 0))) * 0.3
      ELSE
        -- Past jobs: lower priority
        0
    END as match_score
  FROM jobs j
  WHERE
    j.status = 'active'
    AND j.start_date > CURRENT_DATE
    AND (cardinality(j.required_skills & v_skills) > 0)
  ORDER BY match_score DESC, j.start_date ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
