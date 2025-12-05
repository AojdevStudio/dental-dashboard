#!/usr/bin/env tsx
/**
 * Script to confirm test admin user email in Supabase Auth
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

// Create admin client with service role key
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function confirmTestAdmin() {
  console.log('🔄 Confirming test admin user email...');

  try {
    // Update the user's email_confirmed_at in auth.users table
    const { data, error } = await supabaseAdmin
      .from('auth.users')
      .update({ 
        email_confirmed_at: new Date().toISOString(),
        confirmed_at: new Date().toISOString(),
      })
      .eq('email', 'admin@kamdental.com')
      .select();

    if (error) {
      console.error('❌ Failed to update user:', error.message);
      throw error;
    }

    if (data && data.length > 0) {
      console.log('✅ Email confirmed for user:', data[0].id);
      
      // Test sign in
      const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
        email: 'admin@kamdental.com',
        password: 'Figther2*',
      });

      if (signInError) {
        console.error('❌ Sign in test failed:', signInError.message);
      } else {
        console.log('✅ Sign in test successful!');
      }
    } else {
      console.error('❌ User not found');
    }
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// Run the script
confirmTestAdmin()
  .then(() => {
    console.log('✨ Done! You can now use the test admin credentials');
    process.exit(0);
  })
  .catch(() => {
    process.exit(1);
  });