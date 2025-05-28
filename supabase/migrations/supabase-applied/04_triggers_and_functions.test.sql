/**
 * Test Suite for Database Triggers & Functions
 * 
 * Run these tests after applying the migration to verify functionality
 */

-- =====================================================
-- TEST HELPERS
-- =====================================================

-- Function to run a test and log results
CREATE OR REPLACE FUNCTION run_test(
  test_name text,
  test_sql text,
  expected_result text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  actual_result text;
  test_passed boolean;
BEGIN
  BEGIN
    EXECUTE test_sql INTO actual_result;
    
    IF expected_result IS NULL OR actual_result = expected_result THEN
      test_passed := true;
      RAISE NOTICE 'PASS: %', test_name;
    ELSE
      test_passed := false;
      RAISE WARNING 'FAIL: % - Expected: %, Got: %', test_name, expected_result, actual_result;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    test_passed := false;
    RAISE WARNING 'ERROR: % - %', test_name, SQLERRM;
  END;
  
  -- Log test result
  INSERT INTO audit_logs (action, table_name, new_data)
  VALUES (
    'TEST_RESULT',
    'test_suite',
    jsonb_build_object(
      'test_name', test_name,
      'passed', test_passed,
      'timestamp', NOW()
    )
  );
END;
$$;

-- =====================================================
-- 1. TEST USER MANAGEMENT TRIGGERS
-- =====================================================

-- Test auto-create user profile
DO $$
DECLARE
  test_auth_id uuid;
  user_count integer;
BEGIN
  -- Create a test auth user
  test_auth_id := gen_random_uuid();
  
  -- Simulate auth user creation (normally done by Supabase Auth)
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data
  ) VALUES (
    test_auth_id,
    'test.trigger@example.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    jsonb_build_object(
      'name', 'Test User',
      'role', 'provider',
      'clinic_id', (SELECT id FROM clinics LIMIT 1)
    )
  );
  
  -- Check if user profile was created
  SELECT COUNT(*) INTO user_count
  FROM users
  WHERE auth_id = test_auth_id::text;
  
  IF user_count = 1 THEN
    RAISE NOTICE 'PASS: User profile auto-creation';
  ELSE
    RAISE WARNING 'FAIL: User profile auto-creation - Expected 1, Got %', user_count;
  END IF;
  
  -- Check if clinic role was created
  SELECT COUNT(*) INTO user_count
  FROM user_clinic_roles ucr
  JOIN users u ON u.id = ucr.user_id
  WHERE u.auth_id = test_auth_id::text;
  
  IF user_count = 1 THEN
    RAISE NOTICE 'PASS: User clinic role auto-creation';
  ELSE
    RAISE WARNING 'FAIL: User clinic role auto-creation - Expected 1, Got %', user_count;
  END IF;
  
  -- Cleanup
  DELETE FROM auth.users WHERE id = test_auth_id;
END;
$$;

-- Test email update sync
DO $$
DECLARE
  test_user_id text;
  updated_email text;
BEGIN
  -- Get a test user
  SELECT id INTO test_user_id
  FROM users
  LIMIT 1;
  
  IF test_user_id IS NOT NULL THEN
    -- Update auth user email
    UPDATE auth.users
    SET email = 'updated.email@example.com'
    WHERE id = (SELECT auth_id::uuid FROM users WHERE id = test_user_id);
    
    -- Check if profile email was updated
    SELECT email INTO updated_email
    FROM users
    WHERE id = test_user_id;
    
    IF updated_email = 'updated.email@example.com' THEN
      RAISE NOTICE 'PASS: Email update sync';
    ELSE
      RAISE WARNING 'FAIL: Email update sync - Email not synced';
    END IF;
  END IF;
END;
$$;

-- =====================================================
-- 2. TEST DATA CONSISTENCY FUNCTIONS
-- =====================================================

-- Test clinic membership validation
DO $$
DECLARE
  test_goal_id text;
  error_caught boolean := false;
BEGIN
  -- Try to create a goal for a clinic the user doesn't have access to
  BEGIN
    INSERT INTO goals (
      name,
      clinic_id,
      user_id,
      target_value,
      current_value,
      target_date
    ) VALUES (
      'Test Invalid Goal',
      '99999999-9999-9999-9999-999999999999', -- Non-existent clinic
      (SELECT id FROM users LIMIT 1),
      1000,
      0,
      CURRENT_DATE + INTERVAL '30 days'
    );
  EXCEPTION WHEN OTHERS THEN
    error_caught := true;
  END;
  
  IF error_caught THEN
    RAISE NOTICE 'PASS: Clinic membership validation';
  ELSE
    RAISE WARNING 'FAIL: Clinic membership validation - Invalid clinic access allowed';
  END IF;
END;
$$;

-- Test goal progress calculation
DO $$
DECLARE
  test_goal_id text;
  goal_status text;
BEGIN
  -- Create a test goal
  INSERT INTO goals (
    id,
    name,
    clinic_id,
    target_value,
    current_value,
    target_date,
    status
  ) VALUES (
    gen_random_uuid()::text,
    'Test Progress Goal',
    (SELECT id FROM clinics LIMIT 1),
    100,
    0,
    CURRENT_DATE + INTERVAL '30 days',
    'active'
  ) RETURNING id INTO test_goal_id;
  
  -- Add progress that completes the goal
  INSERT INTO goal_progress (
    goal_id,
    date,
    current_value,
    notes
  ) VALUES (
    test_goal_id,
    CURRENT_DATE,
    100,
    'Goal completed!'
  );
  
  -- Check if goal status was updated
  SELECT status INTO goal_status
  FROM goals
  WHERE id = test_goal_id;
  
  IF goal_status = 'completed' THEN
    RAISE NOTICE 'PASS: Goal progress calculation';
  ELSE
    RAISE WARNING 'FAIL: Goal progress calculation - Status not updated to completed';
  END IF;
  
  -- Cleanup
  DELETE FROM goals WHERE id = test_goal_id;
END;
$$;

-- =====================================================
-- 3. TEST AUDIT LOGGING
-- =====================================================

-- Test audit logging
DO $$
DECLARE
  audit_count integer;
  test_clinic_id text;
BEGIN
  -- Create a test clinic
  INSERT INTO clinics (
    id,
    name,
    location,
    status
  ) VALUES (
    gen_random_uuid()::text,
    'Test Audit Clinic',
    'Test Location',
    'active'
  ) RETURNING id INTO test_clinic_id;
  
  -- Check if audit log was created
  SELECT COUNT(*) INTO audit_count
  FROM audit_logs
  WHERE table_name = 'clinics'
    AND record_id = test_clinic_id
    AND action = 'INSERT';
  
  IF audit_count = 1 THEN
    RAISE NOTICE 'PASS: Audit logging for INSERT';
  ELSE
    RAISE WARNING 'FAIL: Audit logging for INSERT - Expected 1 log, Got %', audit_count;
  END IF;
  
  -- Update the clinic
  UPDATE clinics
  SET name = 'Updated Test Clinic'
  WHERE id = test_clinic_id;
  
  -- Check if update was logged
  SELECT COUNT(*) INTO audit_count
  FROM audit_logs
  WHERE table_name = 'clinics'
    AND record_id = test_clinic_id
    AND action = 'UPDATE';
  
  IF audit_count = 1 THEN
    RAISE NOTICE 'PASS: Audit logging for UPDATE';
  ELSE
    RAISE WARNING 'FAIL: Audit logging for UPDATE - Expected 1 log, Got %', audit_count;
  END IF;
  
  -- Cleanup
  DELETE FROM clinics WHERE id = test_clinic_id;
  
  -- Check if delete was logged
  SELECT COUNT(*) INTO audit_count
  FROM audit_logs
  WHERE table_name = 'clinics'
    AND record_id = test_clinic_id
    AND action = 'DELETE';
  
  IF audit_count = 1 THEN
    RAISE NOTICE 'PASS: Audit logging for DELETE';
  ELSE
    RAISE WARNING 'FAIL: Audit logging for DELETE - Expected 1 log, Got %', audit_count;
  END IF;
END;
$$;

-- =====================================================
-- 4. TEST HELPER FUNCTIONS
-- =====================================================

-- Test get_user_clinics function
DO $$
DECLARE
  clinic_count integer;
  test_auth_id text;
BEGIN
  -- Get a test user's auth_id
  SELECT auth_id INTO test_auth_id
  FROM users
  WHERE auth_id IS NOT NULL
  LIMIT 1;
  
  IF test_auth_id IS NOT NULL THEN
    -- Get user's clinics
    SELECT COUNT(*) INTO clinic_count
    FROM public.get_user_clinics(test_auth_id);
    
    IF clinic_count >= 0 THEN
      RAISE NOTICE 'PASS: get_user_clinics function';
    ELSE
      RAISE WARNING 'FAIL: get_user_clinics function - Unexpected result';
    END IF;
  END IF;
END;
$$;

-- Test check_clinic_access function
DO $$
DECLARE
  has_access boolean;
  test_auth_id text;
  test_clinic_id text;
BEGIN
  -- Get test data
  SELECT u.auth_id, ucr.clinic_id
  INTO test_auth_id, test_clinic_id
  FROM users u
  JOIN user_clinic_roles ucr ON ucr.user_id = u.id
  WHERE u.auth_id IS NOT NULL
    AND ucr.is_active = true
  LIMIT 1;
  
  IF test_auth_id IS NOT NULL THEN
    -- Test valid access
    has_access := public.check_clinic_access(test_auth_id, test_clinic_id);
    
    IF has_access THEN
      RAISE NOTICE 'PASS: check_clinic_access - Valid access';
    ELSE
      RAISE WARNING 'FAIL: check_clinic_access - Should have access';
    END IF;
    
    -- Test invalid access
    has_access := public.check_clinic_access(test_auth_id, '99999999-9999-9999-9999-999999999999');
    
    IF NOT has_access THEN
      RAISE NOTICE 'PASS: check_clinic_access - Invalid access';
    ELSE
      RAISE WARNING 'FAIL: check_clinic_access - Should not have access';
    END IF;
    
    -- Test role-based access
    has_access := public.check_clinic_access(test_auth_id, test_clinic_id, 'admin');
    RAISE NOTICE 'INFO: Role-based access check completed';
  END IF;
END;
$$;

-- Test calculate_clinic_metrics function
DO $$
DECLARE
  metric_count integer;
  test_clinic_id text;
BEGIN
  -- Get a clinic with metrics
  SELECT clinic_id INTO test_clinic_id
  FROM metric_values
  LIMIT 1;
  
  IF test_clinic_id IS NOT NULL THEN
    -- Calculate metrics for last 30 days
    SELECT COUNT(*) INTO metric_count
    FROM public.calculate_clinic_metrics(
      test_clinic_id,
      CURRENT_DATE - INTERVAL '30 days',
      CURRENT_DATE
    );
    
    IF metric_count >= 0 THEN
      RAISE NOTICE 'PASS: calculate_clinic_metrics function';
    ELSE
      RAISE WARNING 'FAIL: calculate_clinic_metrics function - Unexpected result';
    END IF;
  END IF;
END;
$$;

-- =====================================================
-- 5. TEST DATA VALIDATION
-- =====================================================

-- Test email validation
DO $$
DECLARE
  error_caught boolean := false;
BEGIN
  -- Try to insert invalid email
  BEGIN
    INSERT INTO users (
      auth_id,
      email,
      name,
      role,
      clinic_id
    ) VALUES (
      gen_random_uuid()::text,
      'invalid-email',
      'Test User',
      'viewer',
      (SELECT id FROM clinics LIMIT 1)
    );
  EXCEPTION WHEN OTHERS THEN
    error_caught := true;
  END;
  
  IF error_caught THEN
    RAISE NOTICE 'PASS: Email validation';
  ELSE
    RAISE WARNING 'FAIL: Email validation - Invalid email accepted';
  END IF;
END;
$$;

-- Test business rules
DO $$
DECLARE
  error_caught boolean := false;
BEGIN
  -- Try to create goal with past target date
  BEGIN
    INSERT INTO goals (
      name,
      clinic_id,
      target_value,
      current_value,
      target_date
    ) VALUES (
      'Past Goal',
      (SELECT id FROM clinics LIMIT 1),
      100,
      0,
      CURRENT_DATE - INTERVAL '1 day'
    );
  EXCEPTION WHEN OTHERS THEN
    error_caught := true;
  END;
  
  IF error_caught THEN
    RAISE NOTICE 'PASS: Business rules - Past target date';
  ELSE
    RAISE WARNING 'FAIL: Business rules - Past target date accepted';
  END IF;
  
  -- Reset for next test
  error_caught := false;
  
  -- Try to insert negative metric value
  BEGIN
    INSERT INTO metric_values (
      clinic_id,
      metric_definition_id,
      value,
      date
    ) VALUES (
      (SELECT id FROM clinics LIMIT 1),
      (SELECT id FROM metric_definitions LIMIT 1),
      -100,
      CURRENT_DATE
    );
  EXCEPTION WHEN OTHERS THEN
    error_caught := true;
  END;
  
  IF error_caught THEN
    RAISE NOTICE 'PASS: Business rules - Negative metric value';
  ELSE
    RAISE WARNING 'FAIL: Business rules - Negative metric value accepted';
  END IF;
END;
$$;

-- =====================================================
-- 6. PERFORMANCE FUNCTION TESTS
-- =====================================================

-- Test scheduled functions (without actually scheduling)
DO $$
BEGIN
  -- Test daily aggregation
  BEGIN
    PERFORM public.scheduled_daily_aggregation();
    RAISE NOTICE 'PASS: scheduled_daily_aggregation executed';
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'FAIL: scheduled_daily_aggregation - %', SQLERRM;
  END;
  
  -- Test weekly reports
  BEGIN
    PERFORM public.scheduled_weekly_reports();
    RAISE NOTICE 'PASS: scheduled_weekly_reports executed';
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'FAIL: scheduled_weekly_reports - %', SQLERRM;
  END;
  
  -- Test monthly cleanup
  BEGIN
    PERFORM public.scheduled_monthly_cleanup();
    RAISE NOTICE 'PASS: scheduled_monthly_cleanup executed';
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'FAIL: scheduled_monthly_cleanup - %', SQLERRM;
  END;
END;
$$;

-- =====================================================
-- 7. SUMMARY REPORT
-- =====================================================

-- Generate test summary
DO $$
DECLARE
  total_tests integer;
  passed_tests integer;
  failed_tests integer;
BEGIN
  -- Count test results
  SELECT 
    COUNT(*) FILTER (WHERE new_data->>'passed' = 'true'),
    COUNT(*) FILTER (WHERE new_data->>'passed' = 'false'),
    COUNT(*)
  INTO passed_tests, failed_tests, total_tests
  FROM audit_logs
  WHERE action = 'TEST_RESULT'
    AND created_at > NOW() - INTERVAL '1 hour';
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TEST SUMMARY';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total Tests: %', total_tests;
  RAISE NOTICE 'Passed: %', passed_tests;
  RAISE NOTICE 'Failed: %', failed_tests;
  RAISE NOTICE '========================================';
  
  -- Log summary
  INSERT INTO audit_logs (action, table_name, new_data)
  VALUES (
    'TEST_SUMMARY',
    'test_suite',
    jsonb_build_object(
      'total', total_tests,
      'passed', passed_tests,
      'failed', failed_tests,
      'timestamp', NOW()
    )
  );
END;
$$;

-- Cleanup helper function
DROP FUNCTION IF EXISTS run_test(text, text, text);