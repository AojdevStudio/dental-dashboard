/**
 * Scheduled Jobs Setup for Supabase
 * 
 * This script sets up cron jobs using Supabase's pg_cron extension
 * Note: This requires the pg_cron extension to be enabled in Supabase
 */

-- =====================================================
-- CHECK PG_CRON EXTENSION
-- =====================================================

-- Ensure we can access cron schema
DO $$
BEGIN
  -- Check if pg_cron is installed
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    RAISE NOTICE 'pg_cron extension is not installed. Please enable it in Supabase dashboard.';
    RAISE EXCEPTION 'pg_cron extension required but not found';
  END IF;
  
  -- Grant usage on cron schema if needed
  EXECUTE 'GRANT USAGE ON SCHEMA cron TO postgres';
  EXECUTE 'GRANT ALL ON ALL TABLES IN SCHEMA cron TO postgres';
  
  RAISE NOTICE 'pg_cron extension is available';
END $$;

-- =====================================================
-- PLACEHOLDER FUNCTIONS (Create if they don't exist)
-- =====================================================

-- These are placeholder functions for the scheduled jobs
-- Replace with actual implementations

CREATE OR REPLACE FUNCTION public.scheduled_daily_aggregation()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Placeholder for daily aggregation logic
  RAISE NOTICE 'Running daily metric aggregation at %', NOW();
  
  -- Example: Update metric aggregations table
  -- INSERT INTO metric_aggregations (...) SELECT ...;
END;
$$;

CREATE OR REPLACE FUNCTION public.scheduled_weekly_reports()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Placeholder for weekly report generation
  RAISE NOTICE 'Running weekly report generation at %', NOW();
  
  -- Example: Generate and store weekly reports
  -- INSERT INTO weekly_reports (...) SELECT ...;
END;
$$;

CREATE OR REPLACE FUNCTION public.scheduled_monthly_cleanup()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Placeholder for monthly cleanup
  RAISE NOTICE 'Running monthly cleanup at %', NOW();
  
  -- Example: Delete old data
  -- DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$;

CREATE OR REPLACE FUNCTION public.refresh_materialized_views()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Placeholder for materialized view refresh
  RAISE NOTICE 'Refreshing materialized views at %', NOW();
  
  -- Example: Refresh materialized views
  -- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_metrics;
END;
$$;

-- =====================================================
-- SCHEDULED JOBS SETUP (Using PERFORM instead of SELECT)
-- =====================================================

-- Use DO block to handle the cron.schedule calls
DO $$
DECLARE
  job_id bigint;
BEGIN
  -- 1. Daily Metric Aggregation
  -- Runs every day at 2:00 AM
  PERFORM cron.schedule(
    'daily-metric-aggregation',
    '0 2 * * *',
    'SELECT public.scheduled_daily_aggregation();'
  );
  RAISE NOTICE 'Scheduled job: daily-metric-aggregation';

  -- 2. Weekly Report Generation
  -- Runs every Monday at 3:00 AM
  PERFORM cron.schedule(
    'weekly-report-generation',
    '0 3 * * 1',
    'SELECT public.scheduled_weekly_reports();'
  );
  RAISE NOTICE 'Scheduled job: weekly-report-generation';

  -- 3. Monthly Cleanup
  -- Runs on the 1st of each month at 4:00 AM
  PERFORM cron.schedule(
    'monthly-cleanup',
    '0 4 1 * *',
    'SELECT public.scheduled_monthly_cleanup();'
  );
  RAISE NOTICE 'Scheduled job: monthly-cleanup';

  -- 4. Hourly Metric Sync (if using real-time data)
  -- Runs every hour at 15 minutes past
  PERFORM cron.schedule(
    'hourly-metric-sync',
    '15 * * * *',
    'UPDATE data_sources SET last_sync_attempt = NOW() WHERE connection_status = ''active'' AND (last_synced_at IS NULL OR last_synced_at < NOW() - INTERVAL ''1 hour'');'
  );
  RAISE NOTICE 'Scheduled job: hourly-metric-sync';

  -- 5. Daily Index Maintenance
  -- Runs every day at 5:00 AM
  PERFORM cron.schedule(
    'daily-index-maintenance',
    '0 5 * * *',
    'ANALYZE users; ANALYZE clinics; ANALYZE metric_values; ANALYZE goals;'
  );
  RAISE NOTICE 'Scheduled job: daily-index-maintenance';

  -- 6. Weekly Materialized View Refresh
  -- Runs every Sunday at 6:00 AM
  PERFORM cron.schedule(
    'weekly-view-refresh',
    '0 6 * * 0',
    'SELECT public.refresh_materialized_views();'
  );
  RAISE NOTICE 'Scheduled job: weekly-view-refresh';
END $$;

-- =====================================================
-- JOB MONITORING QUERIES (Simplified)
-- =====================================================

-- Note: These views might fail if cron schema is not accessible
-- We'll create them conditionally

DO $$
BEGIN
  -- Try to create monitoring views
  BEGIN
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
    
    RAISE NOTICE 'Created view: scheduled_jobs_status';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not create scheduled_jobs_status view: %', SQLERRM;
  END;

  BEGIN
    -- View recent job runs
    CREATE OR REPLACE VIEW recent_job_runs AS
    SELECT 
      j.jobname,
      r.jobid,
      r.start_time,
      r.end_time,
      r.status,
      r.return_message,
      EXTRACT(EPOCH FROM (r.end_time - r.start_time)) as duration_seconds
    FROM cron.job_run_details r
    JOIN cron.job j ON j.jobid = r.jobid
    WHERE r.start_time > NOW() - INTERVAL '7 days'
    ORDER BY r.start_time DESC
    LIMIT 100;
    
    RAISE NOTICE 'Created view: recent_job_runs';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not create recent_job_runs view: %', SQLERRM;
  END;

  BEGIN
    -- View failed jobs
    CREATE OR REPLACE VIEW failed_jobs AS
    SELECT 
      j.jobname,
      r.jobid,
      r.start_time,
      r.status,
      r.return_message
    FROM cron.job_run_details r
    JOIN cron.job j ON j.jobid = r.jobid
    WHERE r.status = 'failed'
      AND r.start_time > NOW() - INTERVAL '30 days'
    ORDER BY r.start_time DESC;
    
    RAISE NOTICE 'Created view: failed_jobs';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not create failed_jobs view: %', SQLERRM;
  END;
END $$;

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
-- GRANT PERMISSIONS
-- =====================================================

-- Grant permissions to view job status
DO $$
BEGIN
  -- Try to grant permissions on views
  BEGIN
    GRANT SELECT ON scheduled_jobs_status TO authenticated;
    GRANT SELECT ON recent_job_runs TO authenticated;
    GRANT SELECT ON failed_jobs TO authenticated;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not grant permissions on monitoring views: %', SQLERRM;
  END;
END $$;

-- Grant execute permissions on management functions
GRANT EXECUTE ON FUNCTION disable_scheduled_job(text) TO authenticated;
GRANT EXECUTE ON FUNCTION enable_scheduled_job(text) TO authenticated;
GRANT EXECUTE ON FUNCTION run_job_now(text) TO authenticated;

-- =====================================================
-- DOCUMENTATION
-- =====================================================

COMMENT ON FUNCTION scheduled_daily_aggregation() IS 'Placeholder for daily metric aggregation job';
COMMENT ON FUNCTION scheduled_weekly_reports() IS 'Placeholder for weekly report generation job';
COMMENT ON FUNCTION scheduled_monthly_cleanup() IS 'Placeholder for monthly cleanup job';
COMMENT ON FUNCTION refresh_materialized_views() IS 'Placeholder for materialized view refresh job';
COMMENT ON FUNCTION disable_scheduled_job(text) IS 'Temporarily disables a scheduled job';
COMMENT ON FUNCTION enable_scheduled_job(text) IS 'Re-enables a disabled scheduled job';
COMMENT ON FUNCTION run_job_now(text) IS 'Executes a scheduled job immediately';

-- Log setup completion
DO $$
BEGIN
  -- Check if audit_logs table exists before inserting
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
    INSERT INTO audit_logs (action, table_name, new_data)
    VALUES ('SCHEDULED_JOBS_SETUP', 'system', jsonb_build_object(
      'jobs_created', 6,
      'timestamp', NOW()
    ));
  END IF;
END $$;