#!/usr/bin/env tsx

/**
 * Database Performance Comparison
 * 
 * Compares performance between local and cloud test databases
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { performance } from 'perf_hooks';

interface PerformanceResult {
  environment: string;
  connectionTime: number;
  simpleQuery: number;
  complexQuery: number;
  transactionTime: number;
  concurrentQueries: number;
  error?: string;
}

class DatabasePerformanceTester {
  
  async testDatabasePerformance(env: 'local' | 'cloud'): Promise<PerformanceResult> {
    console.log(`\n🔬 Testing ${env.toUpperCase()} Database Performance`);
    console.log('='.repeat(40));
    
    // Load appropriate environment
    if (env === 'cloud') {
      process.env.NODE_ENV = 'test';
      delete process.env.DATABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      dotenv.config({ path: '.env.test' });
    } else {
      // Local environment
      process.env.NODE_ENV = 'development';
      delete process.env.DATABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      dotenv.config({ path: '.env.local' });
    }
    
    console.log(`Environment: ${env}`);
    console.log(`DATABASE_URL: ${process.env.DATABASE_URL?.substring(0, 60)}...`);
    
    const result: PerformanceResult = {
      environment: env,
      connectionTime: 0,
      simpleQuery: 0,
      complexQuery: 0,
      transactionTime: 0,
      concurrentQueries: 0
    };
    
    let prisma: PrismaClient;
    
    try {
      // Test 1: Connection Time
      console.log('Testing connection time...');
      const connectStart = performance.now();
      prisma = new PrismaClient();
      await prisma.$connect();
      result.connectionTime = performance.now() - connectStart;
      console.log(`✅ Connection: ${result.connectionTime.toFixed(2)}ms`);
      
      // Test 2: Simple Query
      console.log('Testing simple query...');
      const simpleStart = performance.now();
      await prisma.$queryRaw`SELECT 1 as test, NOW() as timestamp`;
      result.simpleQuery = performance.now() - simpleStart;
      console.log(`✅ Simple query: ${result.simpleQuery.toFixed(2)}ms`);
      
      // Test 3: Complex Query (schema introspection)
      console.log('Testing complex query...');
      const complexStart = performance.now();
      await prisma.$queryRaw`
        SELECT 
          t.table_name,
          COUNT(c.column_name) as column_count,
          STRING_AGG(c.column_name, ', ') as columns
        FROM information_schema.tables t
        LEFT JOIN information_schema.columns c ON t.table_name = c.table_name
        WHERE t.table_schema = 'public' 
        AND t.table_type = 'BASE TABLE'
        GROUP BY t.table_name
        ORDER BY t.table_name
        LIMIT 10
      `;
      result.complexQuery = performance.now() - complexStart;
      console.log(`✅ Complex query: ${result.complexQuery.toFixed(2)}ms`);
      
      // Test 4: Transaction
      console.log('Testing transaction...');
      const transactionStart = performance.now();
      await prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT 1`;
        await tx.$queryRaw`SELECT 2`;
        await tx.$queryRaw`SELECT 3`;
      });
      result.transactionTime = performance.now() - transactionStart;
      console.log(`✅ Transaction: ${result.transactionTime.toFixed(2)}ms`);
      
      // Test 5: Concurrent Queries
      console.log('Testing concurrent queries...');
      const concurrentStart = performance.now();
      const queries = Array.from({ length: 5 }, (_, i) => 
        prisma.$queryRaw`SELECT ${i} as query_id, NOW() as timestamp`
      );
      await Promise.all(queries);
      result.concurrentQueries = performance.now() - concurrentStart;
      console.log(`✅ Concurrent queries: ${result.concurrentQueries.toFixed(2)}ms`);
      
    } catch (error) {
      result.error = error instanceof Error ? error.message : String(error);
      console.error(`❌ Error testing ${env} database:`, result.error);
    } finally {
      if (prisma!) {
        await prisma.$disconnect();
      }
    }
    
    return result;
  }
  
  compareResults(local: PerformanceResult, cloud: PerformanceResult): void {
    console.log('\n📊 Performance Comparison Results\n' + '='.repeat(60));
    
    const metrics = [
      { name: 'Connection Time', local: local.connectionTime, cloud: cloud.connectionTime },
      { name: 'Simple Query', local: local.simpleQuery, cloud: cloud.simpleQuery },
      { name: 'Complex Query', local: local.complexQuery, cloud: cloud.complexQuery },
      { name: 'Transaction', local: local.transactionTime, cloud: cloud.transactionTime },
      { name: 'Concurrent Queries', local: local.concurrentQueries, cloud: cloud.concurrentQueries }
    ];
    
    console.log('Metric'.padEnd(20) + 'Local (ms)'.padEnd(15) + 'Cloud (ms)'.padEnd(15) + 'Difference'.padEnd(15) + 'Performance');
    console.log('-'.repeat(80));
    
    for (const metric of metrics) {
      if (local.error || cloud.error) continue;
      
      const localMs = metric.local.toFixed(2);
      const cloudMs = metric.cloud.toFixed(2);
      const diff = metric.cloud - metric.local;
      const diffPercent = ((diff / metric.local) * 100).toFixed(1);
      
      let performance = '';
      if (diff < 0) {
        performance = `${Math.abs(diff).toFixed(2)}ms faster`;
      } else if (diff > 0) {
        performance = `${diff.toFixed(2)}ms slower`;
      } else {
        performance = 'Same';
      }
      
      console.log(
        metric.name.padEnd(20) +
        localMs.padEnd(15) +
        cloudMs.padEnd(15) +
        `${diffPercent}%`.padEnd(15) +
        performance
      );
    }
    
    if (local.error) {
      console.log(`\n❌ Local database error: ${local.error}`);
    }
    
    if (cloud.error) {
      console.log(`\n❌ Cloud database error: ${cloud.error}`);
    }
    
    if (!local.error && !cloud.error) {
      const totalLocal = local.connectionTime + local.simpleQuery + local.complexQuery + local.transactionTime + local.concurrentQueries;
      const totalCloud = cloud.connectionTime + cloud.simpleQuery + cloud.complexQuery + cloud.transactionTime + cloud.concurrentQueries;
      const overallDiff = ((totalCloud - totalLocal) / totalLocal * 100).toFixed(1);
      
      console.log(`\n🎯 Overall Performance:`);
      console.log(`Local Total: ${totalLocal.toFixed(2)}ms`);
      console.log(`Cloud Total: ${totalCloud.toFixed(2)}ms`);
      console.log(`Difference: ${overallDiff}% ${Number(overallDiff) > 0 ? 'slower' : 'faster'} in cloud`);
      
      if (Math.abs(Number(overallDiff)) < 50) {
        console.log('✅ Performance difference is acceptable (<50%)');
      } else {
        console.log('⚠️ Significant performance difference detected');
      }
    }
  }
}

async function main(): Promise<void> {
  console.log('⚡ Database Performance Comparison');
  console.log('Comparing local vs cloud test database performance...\n');
  
  const tester = new DatabasePerformanceTester();
  
  try {
    // Test local database (if available)
    const localResult = await tester.testDatabasePerformance('local');
    
    // Test cloud database
    const cloudResult = await tester.testDatabasePerformance('cloud');
    
    // Compare results
    tester.compareResults(localResult, cloudResult);
    
  } catch (error) {
    console.error('🚨 Performance comparison failed:', error);
  }
}

// Run the comparison
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Script execution failed:', error);
    process.exit(1);
  });
}