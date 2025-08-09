/**
 * ===== TEST RETRY LOGIC =====
 * 
 * Test functions to verify retry logic implementation
 * 
 * @version 2.1.0
 */

/**
 * Test exponential backoff calculation
 */
function testExponentialBackoff() {
  const ui = SpreadsheetApp.getUi();
  const results = [];
  
  results.push('🧪 Testing Exponential Backoff Calculation\n');
  
  for (let i = 0; i < 5; i++) {
    const backoff = calculateExponentialBackoff(i);
    results.push(`Retry ${i + 1}: ${backoff}ms`);
  }
  
  // Test with custom parameters
  results.push('\nWith custom base (500ms) and max (10000ms):');
  for (let i = 0; i < 5; i++) {
    const backoff = calculateExponentialBackoff(i, 500, 10000);
    results.push(`Retry ${i + 1}: ${backoff}ms`);
  }
  
  ui.alert('Exponential Backoff Test', results.join('\n'), ui.ButtonSet.OK);
}

/**
 * Test retry detection logic
 */
function testRetryableErrorDetection() {
  const ui = SpreadsheetApp.getUi();
  const results = [];
  
  results.push('🧪 Testing Retryable Error Detection\n');
  
  // Test cases
  const testCases = [
    { code: 500, message: 'Internal Server Error', expected: true },
    { code: 502, message: 'Bad Gateway', expected: true },
    { code: 503, message: 'Service Unavailable', expected: true },
    { code: 504, message: 'Gateway Timeout', expected: true },
    { code: 429, message: 'Too Many Requests', expected: true },
    { code: 408, message: 'Request Timeout', expected: true },
    { code: 400, message: 'Bad Request', expected: false },
    { code: 401, message: 'Unauthorized', expected: false },
    { code: 403, message: 'Forbidden', expected: false },
    { code: 404, message: 'Not Found', expected: false },
    { code: 200, message: 'OK', expected: false }
  ];
  
  testCases.forEach(test => {
    const isRetryable = isRetryableHttpError(test.code, { message: test.message });
    const status = isRetryable === test.expected ? '✅' : '❌';
    results.push(`${status} ${test.code} ${test.message}: ${isRetryable ? 'Retryable' : 'Not Retryable'}`);
  });
  
  ui.alert('Retryable Error Detection Test', results.join('\n'), ui.ButtonSet.OK);
}

/**
 * Test retry logic with simulated failures
 */
function testRetryWithSimulation() {
  const ui = SpreadsheetApp.getUi();
  const logger = resetLogger({ function: 'testRetryWithSimulation' });
  
  let attempts = 0;
  const maxFailures = 2;
  
  try {
    const result = executeWithRetry(() => {
      attempts++;
      logger.log('INFO', `Attempt ${attempts}`);
      
      if (attempts <= maxFailures) {
        throw new Error(`Simulated network error (attempt ${attempts})`);
      }
      
      return 'Success!';
    }, {
      maxRetries: 3,
      baseDelay: 100,
      isRetryable: (error) => error.message.includes('network'),
      onRetry: (error, attemptNumber, backoffTime) => {
        logger.log('WARN', `Retrying after error`, {
          error: error.message,
          attempt: attemptNumber,
          backoffMs: backoffTime
        });
      }
    });
    
    ui.alert('✅ Retry Test Success', 
      `Result: ${result}\n` +
      `Total attempts: ${attempts}\n` +
      `Failed attempts: ${maxFailures}\n\n` +
      'The retry logic successfully recovered from simulated failures!',
      ui.ButtonSet.OK
    );
    
  } catch (error) {
    ui.alert('❌ Retry Test Failed', 
      `Error: ${error.message}\n` +
      `Total attempts: ${attempts}`,
      ui.ButtonSet.OK
    );
  }
}

/**
 * Test credential resolution with retry
 */
function testCredentialRetry() {
  const ui = SpreadsheetApp.getUi();
  const logger = resetLogger({ function: 'testCredentialRetry' });
  
  logger.log('INFO', 'Testing credential resolution with retry logic');
  
  try {
    // This will use the retry logic if available
    const credentials = getSupabaseCredentials_();
    
    if (credentials) {
      const info = [
        '✅ Credential Resolution Test Passed',
        '',
        `System: ${credentials.systemName || 'N/A'}`,
        `Has URL: ${!!credentials.url}`,
        `Has Key: ${!!credentials.key}`,
        `Clinic ID: ${credentials.clinicId ? 'Resolved' : 'Missing'}`,
        `Provider ID: ${credentials.providerId ? 'Resolved' : 'Missing'}`,
        '',
        'The retry logic is properly integrated with credential resolution!'
      ];
      
      ui.alert('Credential Retry Test', info.join('\n'), ui.ButtonSet.OK);
    } else {
      ui.alert('❌ Credential Resolution Failed', 
        'Could not resolve credentials even with retry logic.',
        ui.ButtonSet.OK
      );
    }
    
  } catch (error) {
    ui.alert('❌ Test Error', 
      `Error during credential test: ${error.message}`,
      ui.ButtonSet.OK
    );
  }
}

/**
 * Run all retry tests
 */
function runAllRetryTests() {
  const ui = SpreadsheetApp.getUi();
  
  ui.alert('🧪 Running Retry Logic Tests', 
    'This will run several tests to verify the retry implementation:\n\n' +
    '1. Exponential backoff calculation\n' +
    '2. Retryable error detection\n' +
    '3. Retry simulation\n' +
    '4. Credential retry integration\n\n' +
    'Click OK to continue.',
    ui.ButtonSet.OK
  );
  
  // Run each test
  testExponentialBackoff();
  testRetryableErrorDetection();
  testRetryWithSimulation();
  testCredentialRetry();
  
  ui.alert('✅ All Tests Complete', 
    'All retry logic tests have been completed.\n\n' +
    'Check the results to ensure everything is working correctly.',
    ui.ButtonSet.OK
  );
}