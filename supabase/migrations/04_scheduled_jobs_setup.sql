/**
 * Scheduled Jobs Setup for Supabase
 * 
 * This script sets up cron jobs using Supabase's pg_cron extension
 * Note: This requires the pg_cron extension to be enabled in Supabase
 */

-- =====================================================
-- ENABLE PG_CRON EXTENSION
-- =====================================================

-- Note: This needs to be enabled in Supabase dashboard
-- Under Database > Extensions, enable pg_cron

-- =====================================================
-- SCHEDULED JOBS SETUP
-- =====================================================

-- 1. Daily Metric Aggregation
-- Runs every day at 2:00 AM
SELECT cron.schedule(
  'daily-metric-aggregation',
  '0 2 * * *',
  $$SELECT public.scheduled_daily_aggregation();$$
);

-- 2. Weekly Report Generation
-- Runs every Monday at 3:00 AM
SELECT cron.schedule(
  'weekly-report-generation',
  '0 3 * * 1',
  $$SELECT public.scheduled_weekly_reports();$$
);

-- 3. Monthly Cleanup
-- Runs on the 1st of each month at 4:00 AM
SELECT cron.schedule(
  'monthly-cleanup',
  '0 4 1 * *',
  $$SELECT public.scheduled_monthly_cleanup();$$
);

-- 4. Hourly Metric Sync (if using real-time data)
-- Runs every hour at 15 minutes past
SELECT cron.schedule(
  'hourly-metric-sync',
  '15 * * * *',
  $$
  -- Sync recent metrics from data sources
  UPDATE data_sources
  SET last_sync_attempt = NOW()
  WHERE connection_status = 'active'
    AND (last_synced_at IS NULL OR last_synced_at < NOW() - INTERVAL '1 hour');
  $$
);

-- 5. Daily Index Maintenance
-- Runs every day at 5:00 AM
SELECT cron.schedule(
  'daily-index-maintenance',
  '0 5 * * *',
  $$
  -- Analyze tables for query optimization
  ANALYZE users;
  ANALYZE clinics;
  ANALYZE metric_values;
  ANALYZE goals;
  ANALYZE goal_progress;
  $$
);

-- 6. Weekly Materialized View Refresh
-- Runs every Sunday at 6:00 AM
SELECT cron.schedule(
  'weekly-view-refresh',
  '0 6 * * 0',
  $$SELECT public.refresh_materialized_views();$$
);

-- =====================================================
-- JOB MONITORING QUERIES
-- =====================================================

-- View all scheduled jobs
CREATE OR REPLACE VIEW scheduled_jobs_status AS
SELECT 
  jobid,
  jobname,
  schedule,
  command,
  nodename,
  nodeport,
  database,
  username,
  active
FROM cron.job
ORDER BY jobname;

-- View recent job runs
CREATE OR REPLACE VIEW recent_job_runs AS
SELECT 
  j.jobname,
  r.job_id,
  r.start_time,
  r.end_time,
  r.status,
  r.return_message,
  EXTRACT(EPOCH FROM (r.end_time - r.start_time)) as duration_seconds
FROM cron.job_run_details r
JOIN cron.job j ON j.jobid = r.job_id
WHERE r.start_time > NOW() - INTERVAL '7 days'
ORDER BY r.start_time DESC
LIMIT 100;

-- View failed jobs
CREATE OR REPLACE VIEW failed_jobs AS
SELECT 
  j.jobname,
  r.job_id,
  r.start_time,
  r.status,
  r.return_message
FROM cron.job_run_details r
JOIN cron.job j ON j.jobid = r.job_id
WHERE r.status = 'failed'
  AND r.start_time > NOW() - INTERVAL '30 days'
ORDER BY r.start_time DESC;

-- =====================================================
-- HELPER FUNCTIONS FOR JOB MANAGEMENT
-- =====================================================

-- Function to disable a job
CREATE OR REPLACE FUNCTION disable_scheduled_job(job_name text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE cron.job
  SET active = false
  WHERE jobname = job_name;
  
  RAISE NOTICE 'Job % has been disabled', job_name;
END;
$$;

-- Function to enable a job
CREATE OR REPLACE FUNCTION enable_scheduled_job(job_name text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE cron.job
  SET active = true
  WHERE jobname = job_name;
  
  RAISE NOTICE 'Job % has been enabled', job_name;
END;
$$;

-- Function to run a job immediately
CREATE OR REPLACE FUNCTION run_job_now(job_name text)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  job_command text;
BEGIN
  -- Get the job command
  SELECT command INTO job_command
  FROM cron.job
  WHERE jobname = job_name
    AND active = true;
  
  IF job_command IS NULL THEN
    RAISE EXCEPTION 'Job % not found or inactive', job_name;
  END IF;
  
  -- Execute the command
  EXECUTE job_command;
  
  RAISE NOTICE 'Job % executed successfully', job_name;
END;
$$;

-- =====================================================
-- MONITORING AND ALERTING
-- =====================================================

-- Function to check job health
CREATE OR REPLACE FUNCTION check_job_health()
RETURNS TABLE (
  job_name text,
  last_run timestamp with time zone,
  last_status text,
  consecutive_failures integer,
  health_status text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH job_stats AS (
    SELECT 
      j.jobname,
      MAX(r.start_time) as last_run,
      (
        SELECT status 
        FROM cron.job_run_details r2 
        WHERE r2.job_id = j.jobid 
        ORDER BY start_time DESC 
        LIMIT 1
      ) as last_status,
      COUNT(*) FILTER (
        WHERE r.status = 'failed' 
        AND r.start_time > (
          SELECT MAX(start_time) 
          FROM cron.job_run_details r3 
          WHERE r3.job_id = j.jobid 
          AND r3.status = 'succeeded'
        )
      ) as consecutive_failures
    FROM cron.job j
    LEFT JOIN cron.job_run_details r ON r.job_id = j.jobid
    WHERE j.active = true
    GROUP BY j.jobid, j.jobname
  )
  SELECT 
    jobname,
    last_run,
    last_status,
    consecutive_failures,
    CASE
      WHEN last_run IS NULL THEN 'Never Run'
      WHEN consecutive_failures >= 3 THEN 'Critical'
      WHEN consecutive_failures >= 1 THEN 'Warning'
      WHEN last_run < NOW() - INTERVAL '2 days' THEN 'Stale'
      ELSE 'Healthy'
    END as health_status
  FROM job_stats
  ORDER BY 
    CASE
      WHEN consecutive_failures >= 3 THEN 1
      WHEN consecutive_failures >= 1 THEN 2
      WHEN last_run < NOW() - INTERVAL '2 days' THEN 3
      ELSE 4
    END,
    jobname;
END;
$$;

-- =====================================================
-- USAGE EXAMPLES
-- =====================================================

-- Check all scheduled jobs
-- SELECT * FROM scheduled_jobs_status;

-- Check recent job runs
-- SELECT * FROM recent_job_runs;

-- Check failed jobs
-- SELECT * FROM failed_jobs;

-- Check job health
-- SELECT * FROM check_job_health();

-- Disable a job temporarily
-- SELECT disable_scheduled_job('daily-metric-aggregation');

-- Enable a job
-- SELECT enable_scheduled_job('daily-metric-aggregation');

-- Run a job immediately
-- SELECT run_job_now('weekly-report-generation');

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant permissions to view job status
GRANT SELECT ON scheduled_jobs_status TO authenticated;
GRANT SELECT ON recent_job_runs TO authenticated;
GRANT SELECT ON failed_jobs TO authenticated;

-- Only admins can manage jobs
GRANT EXECUTE ON FUNCTION disable_scheduled_job(text) TO authenticated;
GRANT EXECUTE ON FUNCTION enable_scheduled_job(text) TO authenticated;
GRANT EXECUTE ON FUNCTION run_job_now(text) TO authenticated;
GRANT EXECUTE ON FUNCTION check_job_health() TO authenticated;

-- =====================================================
-- NOTIFICATIONS
-- =====================================================

-- Create a function to send notifications for failed jobs
CREATE OR REPLACE FUNCTION notify_job_failure()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'failed' THEN
    -- In a real implementation, this would send an email or webhook
    INSERT INTO audit_logs (
      action,
      table_name,
      new_data,
      created_at
    ) VALUES (
      'JOB_FAILED',
      'cron.job_run_details',
      jsonb_build_object(
        'job_id', NEW.job_id,
        'start_time', NEW.start_time,
        'error', NEW.return_message
      ),
      NOW()
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for job failure notifications
CREATE TRIGGER notify_on_job_failure
AFTER INSERT ON cron.job_run_details
FOR EACH ROW
EXECUTE FUNCTION notify_job_failure();

-- =====================================================
-- DOCUMENTATION
-- =====================================================

COMMENT ON VIEW scheduled_jobs_status IS 'Shows all configured scheduled jobs and their status';
COMMENT ON VIEW recent_job_runs IS 'Shows job execution history for the last 7 days';
COMMENT ON VIEW failed_jobs IS 'Shows all failed job executions in the last 30 days';
COMMENT ON FUNCTION check_job_health() IS 'Returns health status of all active scheduled jobs';
COMMENT ON FUNCTION disable_scheduled_job(text) IS 'Temporarily disables a scheduled job';
COMMENT ON FUNCTION enable_scheduled_job(text) IS 'Re-enables a disabled scheduled job';
COMMENT ON FUNCTION run_job_now(text) IS 'Executes a scheduled job immediately';

-- Log setup completion
INSERT INTO audit_logs (action, table_name, new_data)
VALUES ('SCHEDULED_JOBS_SETUP', 'system', jsonb_build_object(
  'jobs_created', 6,
  'timestamp', NOW()
));