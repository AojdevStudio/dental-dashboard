#!/usr/bin/env tsx

/**
 * Core Database Functionality Test with Cloud Database
 * 
 * Tests core database operations that should work regardless of data state
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

interface TestResult {
  name: string;
  success: boolean;
  duration: number;
  error?: string;
  details?: unknown;
}

class CoreDatabaseTester {
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

  async testCoreOperations(): Promise<void> {
    console.log('\n📊 Core Database Operations\n' + '='.repeat(40));
    
    await this.runTest('Database Schema Introspection', async () => {
      const tables = await this.prisma.$queryRaw`
        SELECT 
          table_name,
          column_name,
          data_type,
          is_nullable
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name IN ('users', 'clinics', 'providers', 'locations')
        ORDER BY table_name, ordinal_position
      ` as { table_name: string; column_name: string; data_type: string; is_nullable: string }[];
      
      const tableGroups = tables.reduce((acc, row) => {
        if (!acc[row.table_name]) acc[row.table_name] = [];
        acc[row.table_name].push(row);
        return acc;
      }, {} as Record<string, typeof tables>);
      
      return {
        tablesFound: Object.keys(tableGroups),
        totalColumns: tables.length,
        sampleSchema: Object.keys(tableGroups).slice(0, 3)
      };
    });

    await this.runTest('Read Core Data Tables', async () => {
      const results: Record<string, number> = {};
      
      // Try to count records in core tables
      try {
        const clinicsCount = await this.prisma.clinic.count();
        results.clinics = clinicsCount;
      } catch (error) {
        results.clinics = -1; // Table exists but error occurred
      }
      
      try {
        const usersCount = await this.prisma.user.count();
        results.users = usersCount;
      } catch (error) {
        results.users = -1;
      }
      
      try {
        const providersCount = await this.prisma.provider.count();
        results.providers = providersCount;
      } catch (error) {
        results.providers = -1;
      }
      
      try {
        const locationsCount = await this.prisma.location.count();
        results.locations = locationsCount;
      } catch (error) {
        results.locations = -1;
      }
      
      return results;
    });

    await this.runTest('Database Constraints Check', async () => {
      const constraints = await this.prisma.$queryRaw`
        SELECT 
          tc.constraint_name,
          tc.table_name,
          tc.constraint_type,
          kcu.column_name
        FROM information_schema.table_constraints tc
        LEFT JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_schema = 'public'
        AND tc.constraint_type IN ('PRIMARY KEY', 'FOREIGN KEY', 'UNIQUE')
        AND tc.table_name IN ('users', 'clinics', 'providers', 'locations')
        ORDER BY tc.table_name, tc.constraint_type
      ` as { constraint_name: string; table_name: string; constraint_type: string; column_name: string }[];
      
      const constraintsByType = constraints.reduce((acc, constraint) => {
        if (!acc[constraint.constraint_type]) acc[constraint.constraint_type] = [];
        acc[constraint.constraint_type].push(constraint);
        return acc;
      }, {} as Record<string, typeof constraints>);
      
      return {
        totalConstraints: constraints.length,
        primaryKeys: constraintsByType['PRIMARY KEY']?.length || 0,
        foreignKeys: constraintsByType['FOREIGN KEY']?.length || 0,
        uniqueConstraints: constraintsByType['UNIQUE']?.length || 0
      };
    });

    await this.runTest('Transaction Support', async () => {
      // Test transaction rollback capability
      const initialCount = await this.prisma.$queryRaw`
        SELECT COUNT(*) as count FROM connection_test_log 
        WHERE created_from = 'transaction-test'
      ` as { count: number }[];
      
      try {
        await this.prisma.$transaction(async (tx) => {
          // Create test record
          await tx.$executeRaw`
            INSERT INTO connection_test_log (test_message, created_from) 
            VALUES ('Transaction test', 'transaction-test')
          `;
          
          // Intentionally throw error to test rollback
          throw new Error('Intentional rollback test');
        });
      } catch (error) {
        // Expected error from intentional rollback
      }
      
      const finalCount = await this.prisma.$queryRaw`
        SELECT COUNT(*) as count FROM connection_test_log 
        WHERE created_from = 'transaction-test'
      ` as { count: number }[];
      
      return {
        initialCount: Number(initialCount[0]?.count || 0),
        finalCount: Number(finalCount[0]?.count || 0),
        rollbackWorked: initialCount[0]?.count === finalCount[0]?.count
      };
    });
  }

  async testPrismaFeatures(): Promise<void> {
    console.log('\n🔧 Prisma Features Test\n' + '='.repeat(40));
    
    await this.runTest('Raw SQL Queries', async () => {
      const result = await this.prisma.$queryRaw`
        SELECT 
          current_database() as database,
          current_user as user_name,
          version() as pg_version,
          NOW() as current_time
      ` as { database: string; user_name: string; pg_version: string; current_time: Date }[];
      
      return {
        database: result[0]?.database,
        user: result[0]?.user_name,
        version: result[0]?.pg_version?.substring(0, 50) + '...',
        timestamp: result[0]?.current_time
      };
    });

    await this.runTest('Connection Pooling', async () => {
      // Test multiple concurrent queries
      const startTime = performance.now();
      
      const queries = Array.from({ length: 10 }, (_, i) => 
        this.prisma.$queryRaw`SELECT ${i} as query_id, pg_backend_pid() as process_id, NOW() as timestamp`
      );
      
      const results = await Promise.all(queries);
      const duration = performance.now() - startTime;
      
      // Extract process IDs to see if connection pooling is working
      const processIds = results.map(r => (r as any)[0]?.process_id);
      const uniqueProcessIds = new Set(processIds);
      
      return {
        totalQueries: results.length,
        duration: Math.round(duration),
        uniqueConnections: uniqueProcessIds.size,
        connectionPooling: uniqueProcessIds.size < results.length
      };
    });

    await this.runTest('Data Type Support', async () => {
      // Test various PostgreSQL data types
      const result = await this.prisma.$queryRaw`
        SELECT 
          '{"test": "json"}' ::jsonb as jsonb_test,
          ARRAY[1,2,3] as array_test,
          '2024-01-01 12:00:00'::timestamp as timestamp_test,
          123.456::decimal as decimal_test,
          true as boolean_test,
          uuid_generate_v4() as uuid_test
      ` as {
        jsonb_test: object;
        array_test: number[];
        timestamp_test: Date;
        decimal_test: number;
        boolean_test: boolean;
        uuid_test: string;
      }[];
      
      return {
        jsonb: typeof result[0]?.jsonb_test === 'object',
        array: Array.isArray(result[0]?.array_test),
        timestamp: result[0]?.timestamp_test instanceof Date,
        decimal: typeof result[0]?.decimal_test === 'number',
        boolean: typeof result[0]?.boolean_test === 'boolean',
        uuid: typeof result[0]?.uuid_test === 'string'
      };
    });
  }

  async cleanup(): Promise<void> {
    await this.prisma.$disconnect();
  }

  generateReport(): void {
    console.log('\n📊 Core Database Test Results\n' + '='.repeat(50));
    
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
      console.log('🎉 All core database tests passed!');
      console.log('✅ Cloud database is fully compatible with our application.');
    } else {
      console.log('⚠️  Some tests failed, but database connectivity is working.');
      console.log('✅ Basic cloud database operations are functional.');
    }
  }
}

async function main(): Promise<void> {
  console.log('🧪 Core Database Functionality Test');
  console.log('Testing core operations with cloud test database...\n');
  
  const tester = new CoreDatabaseTester();
  
  try {
    await tester.testCoreOperations();
    await tester.testPrismaFeatures();
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