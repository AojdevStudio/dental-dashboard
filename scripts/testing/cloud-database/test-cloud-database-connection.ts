#!/usr/bin/env tsx

/**
 * Cloud Database Connection Test Script
 * 
 * Tests that our application can successfully connect to and work with
 * the cloud test database configured in .env.test
 */

import { PrismaClient } from '@prisma/client';
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

console.log('✅ Successfully loaded .env.test file');

interface TestResult {
  name: string;
  success: boolean;
  duration: number;
  error?: string;
  details?: unknown;
}

class CloudDatabaseTester {
  private prisma: PrismaClient;
  private results: TestResult[] = [];

  constructor() {
    this.prisma = new PrismaClient();
  }

  async runTest(name: string, testFn: () => Promise<unknown>): Promise<TestResult> {
    const start = performance.now();
    
    try {
      const details = await testFn();
      const duration = performance.now() - start;
      
      const result: TestResult = {
        name,
        success: true,
        duration,
        details
      };
      
      this.results.push(result);
      console.log(`✅ ${name} (${duration.toFixed(2)}ms)`);
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      
      const result: TestResult = {
        name,
        success: false,
        duration,
        error: error instanceof Error ? error.message : String(error)
      };
      
      this.results.push(result);
      console.log(`❌ ${name} (${duration.toFixed(2)}ms): ${result.error}`);
      
      return result;
    }
  }

  async testConfiguration(): Promise<void> {
    console.log('\n🔧 Configuration Verification\n' + '='.repeat(40));
    
    await this.runTest('Environment Variables Loaded', async () => {
      const requiredEnvs = [
        'DATABASE_URL',
        'DIRECT_URL', 
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_KEY'
      ];
      
      const missing = requiredEnvs.filter(env => !process.env[env]);
      
      if (missing.length > 0) {
        throw new Error(`Missing environment variables: ${missing.join(', ')}`);
      }
      
      return {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL: `${process.env.DATABASE_URL?.substring(0, 50)}...`,
        SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        loadedFrom: '.env.test'
      };
    });

    await this.runTest('Cloud Database Configuration Detected', async () => {
      const dbUrl = process.env.DATABASE_URL;
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      
      // Debug: log the actual URLs for troubleshooting
      console.log(`Debug - DATABASE_URL: ${dbUrl?.substring(0, 80)}...`);
      console.log(`Debug - SUPABASE_URL: ${supabaseUrl}`);
      
      if (!dbUrl?.includes('bxnkocxoacakljbcnulv') || !dbUrl?.includes('supabase.com')) {
        throw new Error(`Expected cloud test database URL not detected. Got: ${dbUrl?.substring(0, 80)}...`);
      }
      
      if (!supabaseUrl?.includes('bxnkocxoacakljbcnulv.supabase.co')) {
        throw new Error(`Expected cloud test Supabase URL not detected. Got: ${supabaseUrl}`);
      }
      
      return {
        database: 'Cloud Test Database',
        supabase: 'Cloud Test Instance',
        pooled: dbUrl.includes('pooler.supabase.com'),
        directConnection: process.env.DIRECT_URL?.includes(':5432')
      };
    });
  }

  async testConnectivity(): Promise<void> {
    console.log('\n🔌 Database Connectivity Tests\n' + '='.repeat(40));
    
    await this.runTest('Prisma Client Connection', async () => {
      await this.prisma.$connect();
      return { status: 'Connected successfully' };
    });

    await this.runTest('Database Version Check', async () => {
      const result = await this.prisma.$queryRaw`SELECT version()` as { version: string }[];
      return { 
        version: result[0]?.version?.substring(0, 50) + '...',
        isPostgreSQL: result[0]?.version?.includes('PostgreSQL')
      };
    });

    await this.runTest('Connection Pool Test', async () => {
      const queries = Array.from({ length: 5 }, (_, i) => 
        this.prisma.$queryRaw`SELECT ${i + 1} as query_number, NOW() as timestamp`
      );
      
      const results = await Promise.all(queries);
      return {
        simultaneousQueries: results.length,
        allSucceeded: results.every(r => Array.isArray(r) && r.length > 0)
      };
    });
  }

  async testCrudOperations(): Promise<void> {
    console.log('\n📝 CRUD Operations Tests\n' + '='.repeat(40));
    
    // Test if basic tables exist and can be queried
    await this.runTest('Read Existing Data', async () => {
      // First check if tables exist
      const tables = await this.prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      ` as { table_name: string }[];
      
      // Try to read from some core tables if they exist
      let clinicsCount = 0;
      let usersCount = 0;
      
      const tableNames = tables.map(t => t.table_name);
      
      if (tableNames.includes('clinics')) {
        const clinics = await this.prisma.clinic.findMany({ take: 5 });
        clinicsCount = clinics.length;
      }
      
      if (tableNames.includes('users')) {
        const users = await this.prisma.user.findMany({ take: 5 });
        usersCount = users.length;
      }
      
      return {
        tablesFound: tableNames.length,
        sampleTableNames: tableNames.slice(0, 10),
        clinicsFound: clinicsCount,
        usersFound: usersCount
      };
    });

    // Test a simple write operation (non-destructive)
    await this.runTest('Write Test (Connection Test Record)', async () => {
      // Create a simple test record that won't interfere with real data
      const timestamp = new Date().toISOString();
      const testQuery = `
        CREATE TABLE IF NOT EXISTS connection_test_log (
          id SERIAL PRIMARY KEY,
          test_timestamp TIMESTAMP DEFAULT NOW(),
          test_message TEXT,
          created_from TEXT
        )
      `;
      
      await this.prisma.$executeRawUnsafe(testQuery);
      
      const insertQuery = `
        INSERT INTO connection_test_log (test_message, created_from) 
        VALUES ($1, $2) 
        RETURNING id, test_timestamp
      `;
      
      const result = await this.prisma.$queryRawUnsafe(insertQuery, 
        `Cloud DB connection test at ${timestamp}`,
        'cloud-database-connection-test'
      ) as { id: number; test_timestamp: Date }[];
      
      return {
        recordCreated: true,
        recordId: result[0]?.id,
        timestamp: result[0]?.test_timestamp
      };
    });

    // Test cleanup of test data
    await this.runTest('Cleanup Test Data', async () => {
      const deleteQuery = `
        DELETE FROM connection_test_log 
        WHERE created_from = 'cloud-database-connection-test'
        AND test_timestamp > NOW() - INTERVAL '1 hour'
      `;
      
      const result = await this.prisma.$executeRawUnsafe(deleteQuery);
      
      return {
        cleanupCompleted: true,
        operation: 'Deleted test records'
      };
    });
  }

  async testPerformance(): Promise<void> {
    console.log('\n⚡ Performance Comparison\n' + '='.repeat(40));
    
    await this.runTest('Query Performance Test', async () => {
      const iterations = 10;
      const durations: number[] = [];
      
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        await this.prisma.$queryRaw`SELECT 1 as test_value, NOW() as timestamp`;
        const duration = performance.now() - start;
        durations.push(duration);
      }
      
      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      const minDuration = Math.min(...durations);
      const maxDuration = Math.max(...durations);
      
      return {
        iterations,
        averageMs: Math.round(avgDuration * 100) / 100,
        minMs: Math.round(minDuration * 100) / 100,
        maxMs: Math.round(maxDuration * 100) / 100,
        totalMs: Math.round(durations.reduce((a, b) => a + b, 0) * 100) / 100
      };
    });
  }

  async cleanup(): Promise<void> {
    await this.prisma.$disconnect();
  }

  generateReport(): void {
    console.log('\n📊 Test Results Summary\n' + '='.repeat(50));
    
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.success).length;
    const failedTests = this.results.filter(r => !r.success);
    
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests} ✅`);
    console.log(`Failed: ${failedTests.length} ❌`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    if (failedTests.length > 0) {
      console.log('\n❌ Failed Tests:');
      failedTests.forEach(test => {
        console.log(`  • ${test.name}: ${test.error}`);
      });
    }
    
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);
    console.log(`\nTotal Execution Time: ${totalDuration.toFixed(2)}ms`);
    
    console.log('\n' + '='.repeat(50));
    
    if (passedTests === totalTests) {
      console.log('🎉 All tests passed! Cloud database connection is working correctly.');
    } else {
      console.log('⚠️  Some tests failed. Check the errors above for details.');
    }
  }
}

async function main(): Promise<void> {
  console.log('🧪 Cloud Database Connection Test');
  console.log('Testing connection to cloud test database...\n');
  
  const tester = new CloudDatabaseTester();
  
  try {
    await tester.testConfiguration();
    await tester.testConnectivity();
    await tester.testCrudOperations();
    await tester.testPerformance();
  } catch (error) {
    console.error('🚨 Test execution failed:', error);
  } finally {
    await tester.cleanup();
    tester.generateReport();
  }
}

// Run the tests
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Script execution failed:', error);
    process.exit(1);
  });
}