# Utility Scripts

This directory contains general-purpose utility scripts that support various development and operational tasks.

## Scripts

### Safety and Testing
- **`safety-utils.js`** - Utility functions for safe operations and environment validation
- **`test-runner.js`** - Custom test runner with enhanced functionality and reporting

## Usage

### Safety Utilities
```bash
# Use safety utilities in other scripts
node -e "const { validateEnvironment } = require('./scripts/utilities/safety-utils.js'); validateEnvironment();"
```

### Test Runner
```bash
# Run custom test suite
node scripts/utilities/test-runner.js
```

## Integration

These utility scripts are designed to be imported and used by other scripts throughout the project:

```javascript
// Example usage in other scripts
const { validateEnvironment, safeExecute } = require('./utilities/safety-utils.js');

// Validate environment before operations
validateEnvironment();

// Safely execute operations with error handling
safeExecute(() => {
  // Your operation here
});
```

## Features

- **Environment validation** - Prevents accidental operations on wrong environments
- **Safe execution patterns** - Error handling and graceful failure
- **Enhanced test running** - Custom test execution with improved reporting
- **Reusable utilities** - Common patterns used across multiple scripts

## Safety Notes

- Utility scripts are designed to be non-destructive
- Always validate environment and inputs before performing operations
- Use safety utilities in all scripts that modify data or configurations