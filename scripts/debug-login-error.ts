#!/usr/bin/env tsx
/**
 * Debug script to test signInWithVerification and identify the exception
 */

import { signInWithVerification } from '../src/app/auth/actions';

async function testLogin() {
  console.log('🔄 Testing signInWithVerification function...');
  
  try {
    const formData = new FormData();
    formData.append('email', 'admin@kamdental.com');
    formData.append('password', 'Figther2*');
    
    console.log('📧 Email:', formData.get('email'));
    console.log('🔑 Password: [REDACTED]');
    
    const result = await signInWithVerification(formData);
    
    console.log('✅ Function completed successfully');
    console.log('📊 Result:', result);
    
  } catch (error) {
    console.error('❌ Exception caught:');
    console.error('Type:', typeof error);
    console.error('Name:', (error as Error)?.name);
    console.error('Message:', (error as Error)?.message);
    console.error('Stack:', (error as Error)?.stack);
    console.error('Full error:', error);
  }
}

testLogin().catch(console.error);