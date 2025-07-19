#!/usr/bin/env tsx

/**
 * Test Suite with Cloud Database
 * 
 * Runs a subset of the test suite with the cloud test database
 * to verify compatibility
 */

import { spawn } from 'child_process';
import dotenv from 'dotenv';
import { performance } from 'perf_hooks';

// Force test environment and load test configuration
process.env.NODE_ENV = 'test';

// Clear any existing DATABASE_URL to ensure .env.test loads correctly
delete process.env.DATABASE_URL;
delete process.env.NEXT_PUBLIC_SUPABASE_URL;

// Load test environment
const result = dotenv.config({ path: '.env.test' });

if (result.error) {
  console.error('Error loading .env.test:', result.error);
  process.exit(1);
}

async function runTestsWithCloudDatabase(): Promise<void> {
  console.log('🧪 Running Test Suite with Cloud Database');
  console.log('==========================================\n');
  
  console.log('Environment Configuration:');
  console.log(`• NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`• DATABASE_URL: ${process.env.DATABASE_URL?.substring(0, 80)}...`);
  console.log(`• SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
  console.log('');
  
  const startTime = performance.now();
  
  try {
    // Run a limited set of tests to verify cloud database compatibility
    console.log('🚀 Starting test execution...\n');
    
    const vitestProcess = spawn('pnpm', ['vitest', 'run', '--reporter=verbose'], {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'test',
        // Ensure test environment variables are passed
        DATABASE_URL: process.env.DATABASE_URL,
        DIRECT_URL: process.env.DIRECT_URL,
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
      },
      shell: true
    });
    
    // Wait for tests to complete
    await new Promise<void>((resolve, reject) => {
      vitestProcess.on('close', (code) => {
        const duration = performance.now() - startTime;
        
        console.log('\n' + '='.repeat(50));
        console.log(`⏱️  Total test execution time: ${(duration / 1000).toFixed(2)}s`);
        
        if (code === 0) {
          console.log('🎉 All tests passed with cloud database!');
          resolve();
        } else {
          console.log(`❌ Tests failed with exit code: ${code}`);
          reject(new Error(`Tests failed with exit code: ${code}`));
        }
      });
      
      vitestProcess.on('error', (error) => {
        console.error('❌ Test process failed:', error);
        reject(error);
      });
    });
    
  } catch (error) {
    console.error('🚨 Test execution failed:', error);
    throw error;
  }
}

async function main(): Promise<void> {
  try {
    await runTestsWithCloudDatabase();
  } catch (error) {
    console.error('Script execution failed:', error);
    process.exit(1);
  }
}

// Run the tests
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Script execution failed:', error);
    process.exit(1);
  });
}