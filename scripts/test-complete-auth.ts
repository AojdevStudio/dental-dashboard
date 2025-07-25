#!/usr/bin/env tsx
/**
 * Test complete authentication flow including database checks
 */

import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import { join } from 'path';

// Load test environment
config({ path: join(process.cwd(), '.env.test') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const prisma = new PrismaClient();

async function testCompleteAuth() {
  console.log('🔄 Testing complete authentication flow...');

  try {
    // Step 1: Sign in
    console.log('\n1️⃣ Signing in with admin@kamdental.com...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@kamdental.com',
      password: 'Figther2*',
    });

    if (authError) {
      console.error('❌ Sign in failed:', authError.message);
      return;
    }

    console.log('✅ Sign in successful!');
    console.log('   Auth User ID:', authData.user?.id);

    // Step 2: Check database user
    console.log('\n2️⃣ Checking database user...');
    const dbUser = await prisma.user.findUnique({
      where: { authId: authData.user?.id },
      include: {
        clinic: true,
      },
    });

    if (!dbUser) {
      // Try by email
      const dbUserByEmail = await prisma.user.findUnique({
        where: { email: 'admin@kamdental.com' },
      });
      
      if (dbUserByEmail) {
        console.log('⚠️  User found by email but authId mismatch:');
        console.log('   DB authId:', dbUserByEmail.authId);
        console.log('   Auth authId:', authData.user?.id);
      } else {
        console.error('❌ No database user found');
      }
      return;
    }

    console.log('✅ Database user found:');
    console.log('   ID:', dbUser.id);
    console.log('   Name:', dbUser.name);
    console.log('   Role:', dbUser.role);
    console.log('   Clinic ID:', dbUser.clinicId);
    console.log('   Clinic:', dbUser.clinic?.name || 'N/A');

    // Step 3: Check user clinic roles
    console.log('\n3️⃣ Checking user clinic roles...');
    const userRoles = await prisma.userClinicRole.findMany({
      where: { userId: dbUser.id },
    });

    if (userRoles.length === 0) {
      console.log('⚠️  No clinic roles found');
    } else {
      console.log('✅ User clinic roles:');
      // Get clinic names separately since the relation is commented out
      for (const role of userRoles) {
        const clinic = await prisma.clinic.findUnique({
          where: { id: role.clinicId },
          select: { name: true },
        });
        console.log(`   - ${role.role} at ${clinic?.name || 'Unknown Clinic'}`);
      }
    }

    // Step 4: Test if the user would pass the login checks
    console.log('\n4️⃣ Testing login validation logic...');
    
    // Check if user is system admin
    if (dbUser.role === 'system_admin') {
      console.log('✅ User is system admin - should bypass clinic checks');
    } else {
      // Check clinic assignment
      if (!dbUser.clinicId || !dbUser.clinic) {
        console.error('❌ User has no clinic assignment - would fail login');
        return;
      }
      
      // Check role assignments
      if (userRoles.length === 0) {
        console.error('❌ User has no clinic roles - would fail login');
        return;
      }
    }

    console.log('✅ All validation checks passed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCompleteAuth().catch(console.error);