/**
 * RLS Test Helpers for Multi-tenant Security Testing
 * 
 * This module provides utilities for testing Row Level Security (RLS) policies
 * by creating authenticated Supabase clients for specific users and clinics.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Use environment variables for Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Admin client for setting up tests (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Anonymous client for testing unauthenticated access
export const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

export interface TestUser {
  id: string;
  email: string;
  authId: string;
  clinicId: string;
  role: 'office_manager' | 'clinic_admin' | 'dentist' | 'hygienist';
}

export interface TestClinic {
  id: string;
  name: string;
  location: string;
  status: 'active' | 'inactive';
}

/**
 * Creates a test clinic for RLS testing
 */
export async function createTestClinic(name?: string): Promise<TestClinic> {
  const clinic: TestClinic = {
    id: uuidv4(),
    name: name || `Test Clinic ${Date.now()}`,
    location: 'Test Location',
    status: 'active',
  };

  const { error } = await supabaseAdmin
    .from('clinics')
    .insert(clinic);

  if (error) {
    throw new Error(`Failed to create test clinic: ${error.message}`);
  }

  return clinic;
}

/**
 * Creates a test user with proper clinic association for RLS testing
 */
export async function createTestUser(
  clinicId: string,
  role: TestUser['role'] = 'office_manager',
  email?: string
): Promise<TestUser> {
  const testEmail = email || `test-user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`;
  const userId = uuidv4();
  const authId = uuidv4();

  // Create user record in our users table
  const user: Omit<TestUser, 'id'> & { id: string } = {
    id: userId,
    email: testEmail,
    authId,
    clinicId,
    role,
  };

  const { error: userError } = await supabaseAdmin
    .from('users')
    .insert({
      id: user.id,
      email: user.email,
      name: `Test User ${role}`,
      role: user.role,
      clinic_id: user.clinicId,
      auth_id: user.authId,
    });

  if (userError) {
    throw new Error(`Failed to create test user: ${userError.message}`);
  }

  // Create user-clinic role mapping
  const { error: roleError } = await supabaseAdmin
    .from('user_clinic_roles')
    .insert({
      user_id: user.id,
      clinic_id: user.clinicId,
      role: user.role,
      is_active: true,
    });

  if (roleError) {
    throw new Error(`Failed to create user-clinic role: ${roleError.message}`);
  }

  return user;
}

/**
 * Creates a Supabase client that impersonates a specific user for RLS testing
 * This uses the auth_id to set the proper context for RLS policies
 */
export function createUserClient(user: TestUser): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        // Set the user context for RLS policies
        'X-User-ID': user.authId,
        'X-Clinic-ID': user.clinicId,
      },
    },
  });
}

/**
 * Sets the RLS context for the current database session
 * This function should be called before executing queries that depend on RLS
 */
export async function setRLSContext(client: SupabaseClient, userId: string, clinicId: string): Promise<void> {
  // Set session variables for RLS context
  const { error } = await client.rpc('set_config', {
    setting_name: 'app.current_user_id',
    new_value: userId,
    is_local: true,
  });

  if (error) {
    throw new Error(`Failed to set user context: ${error.message}`);
  }

  const { error: clinicError } = await client.rpc('set_config', {
    setting_name: 'app.current_clinic_id',
    new_value: clinicId,
    is_local: true,
  });

  if (clinicError) {
    throw new Error(`Failed to set clinic context: ${clinicError.message}`);
  }
}

/**
 * Creates an authenticated client with proper RLS context
 */
export async function createAuthenticatedClient(user: TestUser): Promise<SupabaseClient> {
  const client = createUserClient(user);
  await setRLSContext(client, user.authId, user.clinicId);
  return client;
}

/**
 * Cleanup function to remove test data atomically
 * Uses a transaction to ensure all deletions succeed or none are applied
 */
export async function cleanupTestData(users: TestUser[], clinics: TestClinic[]): Promise<void> {
  // Use a transaction for atomic cleanup
  const { error: transactionError } = await supabaseAdmin.rpc('execute_transaction', {
    queries: [
      // Clean up user-clinic roles first (foreign key dependency)
      ...users.map(user => ({
        sql: 'DELETE FROM user_clinic_roles WHERE user_id = $1',
        params: [user.id]
      })),
      // Clean up users next
      ...users.map(user => ({
        sql: 'DELETE FROM users WHERE id = $1',
        params: [user.id]
      })),
      // Clean up clinics last
      ...clinics.map(clinic => ({
        sql: 'DELETE FROM clinics WHERE id = $1',
        params: [clinic.id]
      }))
    ]
  });

  if (transactionError) {
    throw new Error(`Failed to cleanup test data: ${transactionError.message}`);
  }
}

/**
 * Test helper to verify RLS policy enforcement
 */
export async function testRLSIsolation(
  tableName: string,
  userClient: SupabaseClient,
  expectedCount: number,
  filter?: Record<string, unknown>
): Promise<void> {
  let query = userClient.from(tableName).select('*');
  
  if (filter) {
    for (const [key, value] of Object.entries(filter)) {
      query = query.eq(key, value);
    }
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`RLS test failed for ${tableName}: ${error.message}`);
  }

  if (data === null) {
    throw new Error(`RLS test returned null data for ${tableName}`);
  }

  if (data.length !== expectedCount) {
    throw new Error(
      `RLS isolation failed for ${tableName}: expected ${expectedCount} rows, got ${data.length}`
    );
  }
}