# Test Runner Cleanup Fix

## Problem

The previous test scripts in `package.json` had several issues that could leave the test database running:

1. **`test` script**: `pnpm test:start && vitest --run && pnpm test:stop`
   - If `vitest` failed, the cleanup command (`pnpm test:stop`) would not execute due to the `&&` operator
   
2. **`test:coverage` script**: `pnpm test:start && vitest run --coverage && pnpm test:stop`
   - Same issue as above - cleanup wouldn't run if tests failed
   
3. **`test:watch` script**: `pnpm test:start && vitest`
   - Started the test database but never stopped it, even when the watch process was terminated

These issues led to:
- Resource leaks (database processes left running)
- Port conflicts on subsequent test runs
- Manual cleanup required after failed tests

## Solution

Created a robust test runner script (`scripts/test-runner.js`) that ensures proper cleanup regardless of test outcomes.

### Key Features

1. **Signal Handling**: Catches SIGINT, SIGTERM, and SIGHUP to ensure cleanup on process termination
2. **Exception Handling**: Catches uncaught exceptions and performs cleanup before exit
3. **Try/Finally Logic**: Uses proper try/finally blocks to guarantee cleanup execution
4. **Mode Support**: Supports `run`, `coverage`, and `watch` modes
5. **Help Documentation**: Provides help information with `--help` flag

### Implementation Details

The test runner:
- Starts the Supabase test database
- Tracks the database state to avoid duplicate starts/stops
- Runs vitest with appropriate arguments based on mode
- Always performs cleanup in a finally block
- Handles watch mode by properly managing child processes
- Exits with appropriate status codes

### Updated Scripts

```json
{
  "test": "node scripts/test-runner.js run",
  "test:watch": "node scripts/test-runner.js watch", 
  "test:coverage": "node scripts/test-runner.js coverage"
}
```

### Usage

```bash
# Run tests once
pnpm test

# Run tests in watch mode (Ctrl+C to stop and cleanup)
pnpm test:watch

# Run tests with coverage report
pnpm test:coverage

# Get help
node scripts/test-runner.js --help
```

### Benefits

1. **Guaranteed Cleanup**: Database will always be stopped, even if tests fail
2. **Signal Safety**: Properly handles interruption signals (Ctrl+C, process kills)
3. **Resource Management**: Prevents port conflicts and resource leaks
4. **Developer Experience**: Clear feedback and error messages
5. **Consistency**: All test modes now behave consistently with cleanup

## Testing the Fix

The fix can be tested by:

1. Running a test that fails and verifying cleanup occurs
2. Interrupting a test run with Ctrl+C and verifying cleanup
3. Running watch mode and terminating it properly
4. Checking that no supabase processes remain after test runs

## Backward Compatibility

The individual `test:start` and `test:stop` scripts are preserved for manual database management when needed. 