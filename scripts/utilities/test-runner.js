#!/usr/bin/env node

import { execSync, spawn } from 'child_process';
import process from 'process';
import dotenv from 'dotenv';

/**
 * Test runner for cloud-based testing.
 * Now uses cloud Supabase branch database instead of local setup.
 */
class TestRunner {
  constructor() {
    this.setupSignalHandlers();
  }

  /**
   * Set up signal handlers for graceful shutdown
   */
  setupSignalHandlers() {
    const signals = ['SIGINT', 'SIGTERM', 'SIGHUP'];
    
    signals.forEach(signal => {
      process.on(signal, () => {
        console.log(`\nReceived ${signal}, exiting gracefully...`);
        process.exit(0);
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('Uncaught exception:', error);
      process.exit(1);
    });
  }

  /**
   * Verify cloud database connection
   */
  async verifyCloudConnection() {
    try {
      console.log('🔌 Verifying cloud test database configuration...');
      
      // Load test environment
      dotenv.config({ path: '.env.test' });
      
      const dbUrl = process.env.DATABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!dbUrl) {
        throw new Error('No database configuration found in .env.test');
      }
      
      console.log('✅ Cloud test database configuration verified');
      console.log(`📍 Using database: ${dbUrl.substring(0, 30)}...`);
    } catch (error) {
      console.error('❌ Failed to verify cloud test database configuration:', error.message);
      console.error('Please check your .env.test configuration');
      throw error;
    }
  }

  /**
   * Run tests against cloud database
   */
  async runTests(mode = 'run') {
    let exitCode = 0;
    
    try {
      await this.verifyCloudConnection();
      
      console.log(`🧪 Running tests in ${mode} mode against cloud database...`);
      
      const vitestArgs = mode === 'coverage' 
        ? ['run', '--coverage']
        : mode === 'watch' 
        ? ['--watch']
        : ['--run'];

      // For watch mode, we need to handle it differently
      if (mode === 'watch') {
        console.log('Starting tests in watch mode. Press Ctrl+C to stop.');
        const child = spawn('pnpm', ['vitest', ...vitestArgs], {
          stdio: 'inherit',
          shell: true
        });

        // Wait for the child process to exit or error
        await new Promise((resolve, reject) => {
          child.on('exit', (code) => {
            exitCode = code || 0;
            resolve();
          });

          child.on('error', (error) => {
            console.error('Child process error:', error.message);
            exitCode = 1;
            reject(error);
          });
        });
      } else {
        // For run and coverage modes
        execSync(`pnpm vitest ${vitestArgs.join(' ')}`, { stdio: 'inherit' });
      }
      
    } catch (error) {
      console.error('Tests failed:', error.message);
      exitCode = 1;
    }
    
    process.exit(exitCode);
  }
}

/**
 * Display help information
 */
function showHelp() {
  console.log(`
Test Runner - Cloud Database Testing

Usage: node scripts/test-runner.js [mode]

Modes:
  run       Run tests once (default)
  coverage  Run tests with coverage report
  watch     Run tests in watch mode

Options:
  --help    Show this help message

Cloud Database Configuration:
  Tests now run against cloud Supabase branch database.
  Configure connection in .env.test file.

Examples:
  node scripts/test-runner.js run
  node scripts/test-runner.js coverage
  node scripts/test-runner.js watch
`);
}

// Parse command line arguments
const args = process.argv.slice(2);

// Check for help flags first
if (args.includes('--help') || args.includes('-h')) {
  showHelp();
  process.exit(0);
}

const mode = args[0] || 'run';
const validModes = ['run', 'coverage', 'watch'];

if (!validModes.includes(mode)) {
  console.error(`Invalid mode: ${mode}. Valid modes: ${validModes.join(', ')}`);
  console.log('Use --help for more information.');
  process.exit(1);
}

// Create and run the test runner
const runner = new TestRunner();
runner.runTests(mode).catch((error) => {
  console.error('Test runner failed:', error);
  process.exit(1);
}); 