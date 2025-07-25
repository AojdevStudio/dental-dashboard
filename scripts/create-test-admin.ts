#!/usr/bin/env tsx
/**
 * Script to create test admin user in Supabase Auth
 * Run with: pnpm dlx tsx scripts/create-test-admin.ts
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { join } from 'path';

// Load test environment
config({ path: join(process.cwd(), '.env.test') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

// Verify we're using test database
if (!supabaseUrl.includes('bxnkocxoacakljbcnulv')) {
  console.error('❌ This script should only be run against the test database');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createTestAdmin() {
  console.log('🔄 Creating test admin user...');

  try {
    // First try to sign in to see if user exists
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'admin@kamdental.com',
      password: 'Figther2*',
    });

    if (signInData?.user) {
      console.log('✅ Admin user already exists and can sign in with ID:', signInData.user.id);
      return signInData.user.id;
    }

    // If sign in failed, try to create the user
    console.log('📝 User does not exist, creating new user...');
    
    // Use signUp to create user
    const { data, error } = await supabase.auth.signUp({
      email: 'admin@kamdental.com',
      password: 'Figther2*',
      options: {
        data: {
          full_name: 'System Admin',
          role: 'admin',
        },
      },
    });

    if (error) {
      console.error('❌ Failed to create user:', error.message);
      throw error;
    }

    if (!data.user) {
      throw new Error('No user returned from signUp');
    }

    console.log('✅ Created admin user with ID:', data.user.id);
    
    // Note: In a test environment, we might need to manually confirm the email
    // The user should be able to sign in immediately in test mode
    
    return data.user.id;
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// Run the script
createTestAdmin()
  .then((userId) => {
    console.log('✨ Done! Admin user ID:', userId);
    console.log('📝 You can now use these credentials in tests:');
    console.log('   Email: admin@kamdental.com');
    console.log('   Password: Figther2*');
    process.exit(0);
  })
  .catch(() => {
    process.exit(1);
  });