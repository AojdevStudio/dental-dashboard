#!/usr/bin/env node

import { execSync, spawn } from 'child_process';
import process from 'process';

/**
 * Test runner that ensures proper cleanup of the test database
 * even if tests fail or are interrupted.
 */
class TestRunner {
  constructor() {
    this.testDbStarted = false;
    this.setupSignalHandlers();
  }

  /**
   * Set up signal handlers to ensure cleanup on process termination
   */
  setupSignalHandlers() {
    const signals = ['SIGINT', 'SIGTERM', 'SIGHUP'];
    
    signals.forEach(signal => {
      process.on(signal, () => {
        console.log(`\nReceived ${signal}, cleaning up...`);
        this.cleanup();
        process.exit(0);
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('Uncaught exception:', error);
      this.cleanup();
      process.exit(1);
    });
  }

  /**
   * Start the test database
   */
  async startTestDb() {
    try {
      console.log('Starting test database...');
      execSync('pnpm supabase start', { stdio: 'inherit' });
      this.testDbStarted = true;
      console.log('Test database started successfully');
    } catch (error) {
      console.error('Failed to start test database:', error.message);
      throw error;
    }
  }

  /**
   * Stop the test database
   */
  cleanup() {
    if (this.testDbStarted) {
      try {
        console.log('Stopping test database...');
        execSync('pnpm supabase stop', { stdio: 'inherit' });
        console.log('Test database stopped successfully');
      } catch (error) {
        console.error('Failed to stop test database:', error.message);
      }
      this.testDbStarted = false;
    }
  }

  /**
   * Run tests with proper cleanup
   */
  async runTests(mode = 'run') {
    let exitCode = 0;
    
    try {
      await this.startTestDb();
      
      console.log(`Running tests in ${mode} mode...`);
      
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
    } finally {
      this.cleanup();
    }
    
    process.exit(exitCode);
  }
}

/**
 * Display help information
 */
function showHelp() {
  console.log(`
Test Runner - Ensures proper test database cleanup

Usage: node scripts/test-runner.js [mode]

Modes:
  run       Run tests once (default)
  coverage  Run tests with coverage report
  watch     Run tests in watch mode

Options:
  --help    Show this help message

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