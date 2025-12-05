#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bxnkocxoacakljbcnulv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4bmtvY3hvYWNha2xqYmNudWx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NDM2OTUsImV4cCI6MjA2NzIxOTY5NX0.RgxmXQa6Kgt4yeeFw4QxY_IOr9wfyEJMU5UNAr2pgYs';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  console.log('🔄 Testing login with admin@kamdental.com...');
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@kamdental.com',
    password: 'Figther2*',
  });

  if (error) {
    console.error('❌ Sign in failed:', error.message);
    console.error('Error details:', error);
  } else {
    console.log('✅ Sign in successful!');
    console.log('User ID:', data.user?.id);
    console.log('Email:', data.user?.email);
    console.log('Session:', data.session ? 'Created' : 'No session');
  }
}

testLogin().catch(console.error);