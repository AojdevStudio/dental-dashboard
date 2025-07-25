#!/usr/bin/env tsx
/**
 * Test database connection via Supabase
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
  console.log('URL:', supabaseUrl);
  console.log('Has service key:', Boolean(supabaseServiceKey));
  process.exit(1);
}

console.log('🔄 Testing database connection via Supabase client...');
console.log('URL:', supabaseUrl);
console.log('Has service key:', Boolean(supabaseServiceKey));

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  try {
    // Test a simple query
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, role')
      .eq('email', 'admin@kamdental.com')
      .single();

    if (error) {
      console.error('❌ Query failed:', error);
      return;
    }

    console.log('✅ Database connection successful!');
    console.log('User data:', data);

    // Test auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@kamdental.com',
      password: 'Figther2*',
    });

    if (authError) {
      console.error('❌ Auth failed:', authError);
    } else {
      console.log('✅ Auth successful!');
      console.log('Auth user ID:', authData.user?.id);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testConnection();