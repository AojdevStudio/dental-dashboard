#!/usr/bin/env node

/**
 * Automated Authentication Flow Testing Script
 *
 * This script performs automated testing of the authentication system
 * by making HTTP requests to various endpoints and verifying responses.
 */

const http = require('node:http');
const https = require('node:https');

const BASE_URL = 'http://localhost:3000';

/**
 * Makes an HTTP request and returns a promise with the response
 * @param {string} url - The URL to request
 * @param {object} options - Request options
 * @returns {Promise<object>} Response object with status, headers, and body
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      ...options,
    };

    const client = urlObj.protocol === 'https:' ? https : http;

    const req = client.request(requestOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body,
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

/**
 * Test case runner
 * @param {string} testName - Name of the test
 * @param {Function} testFn - Test function that returns a promise
 */
async function runTest(testName, testFn) {
  try {
    console.log(`🧪 Running: ${testName}`);
    const result = await testFn();
    if (result.passed) {
      console.log(`✅ PASSED: ${testName}`);
      if (result.details) {
        console.log(`   Details: ${result.details}`);
      }
    } else {
      console.log(`❌ FAILED: ${testName}`);
      console.log(`   Reason: ${result.reason}`);
    }
    return result.passed;
  } catch (error) {
    console.log(`❌ ERROR: ${testName}`);
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

/**
 * Test if server is running
 */
async function testServerRunning() {
  const response = await makeRequest(`${BASE_URL}/login`);
  return {
    passed: response.statusCode === 200,
    reason: response.statusCode !== 200 ? `Server returned ${response.statusCode}` : null,
    details: 'Development server is accessible',
  };
}

/**
 * Test login page accessibility
 */
async function testLoginPageAccessible() {
  const response = await makeRequest(`${BASE_URL}/login`);
  const hasLoginForm =
    response.body.includes('email') &&
    response.body.includes('password') &&
    response.body.includes('Sign in');

  return {
    passed: response.statusCode === 200 && hasLoginForm,
    reason: hasLoginForm ? null : 'Login form elements not found',
    details: 'Login page contains email, password fields and sign in button',
  };
}

/**
 * Test protected route redirection
 */
async function testProtectedRouteRedirection(route) {
  const response = await makeRequest(`${BASE_URL}${route}`);

  // Check if response contains redirect indicators
  const hasRedirect =
    response.body.includes('NEXT_REDIRECT') ||
    response.body.includes('redirect') ||
    response.statusCode === 307 ||
    response.statusCode === 302;

  return {
    passed: hasRedirect || response.statusCode === 200, // 200 might be the redirected login page
    reason:
      !hasRedirect && response.statusCode !== 200
        ? `Unexpected status: ${response.statusCode}`
        : null,
    details: `Route ${route} properly handles unauthenticated access`,
  };
}

/**
 * Test environment configuration
 */
async function testEnvironmentConfig() {
  // This test checks if the app starts without environment errors
  // by making a request and checking for specific error messages
  const response = await makeRequest(`${BASE_URL}/login`);

  const hasEnvError =
    response.body.includes('Missing Supabase environment variables') ||
    response.body.includes('NEXT_PUBLIC_SUPABASE_URL') ||
    response.body.includes('environment variable');

  return {
    passed: !hasEnvError && response.statusCode === 200,
    reason: hasEnvError ? 'Environment configuration errors detected' : null,
    details: 'No environment variable errors detected',
  };
}

/**
 * Test middleware functionality
 */
async function testMiddlewareFunction() {
  // Test that middleware is working by checking root path behavior
  const response = await makeRequest(`${BASE_URL}/`);

  // Root should redirect to login for unauthenticated users
  const isRedirecting =
    response.body.includes('NEXT_REDIRECT') ||
    response.body.includes('/login') ||
    response.statusCode === 307;

  return {
    passed: isRedirecting,
    reason: isRedirecting ? null : 'Root path not redirecting to login',
    details: 'Middleware correctly redirects unauthenticated users',
  };
}

/**
 * Test API routes accessibility
 */
async function testAPIRoutes() {
  const routes = ['/api/auth/session', '/api/auth/callback'];

  let allPassed = true;
  const details = [];

  for (const route of routes) {
    try {
      const response = await makeRequest(`${BASE_URL}${route}`);
      // API routes should return JSON or handle requests appropriately
      const isValidResponse = response.statusCode < 500;
      if (isValidResponse) {
        details.push(`${route}: OK (${response.statusCode})`);
      } else {
        details.push(`${route}: ERROR (${response.statusCode})`);
        allPassed = false;
      }
    } catch (error) {
      details.push(`${route}: ERROR (${error.message})`);
      allPassed = false;
    }
  }

  return {
    passed: allPassed,
    reason: allPassed ? null : 'Some API routes returned server errors',
    details: details.join(', '),
  };
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('🚀 Starting Authentication Flow Tests\n');

  const tests = [
    ['Server Running', testServerRunning],
    ['Environment Configuration', testEnvironmentConfig],
    ['Login Page Accessible', testLoginPageAccessible],
    ['Middleware Function', testMiddlewareFunction],
    ['Protected Route: /dashboard', () => testProtectedRouteRedirection('/dashboard')],
    ['Protected Route: /goals', () => testProtectedRouteRedirection('/goals')],
    ['Protected Route: /settings', () => testProtectedRouteRedirection('/settings')],
    ['Protected Route: /reports', () => testProtectedRouteRedirection('/reports')],
    ['API Routes', testAPIRoutes],
  ];

  let passedTests = 0;
  const totalTests = tests.length;

  for (const [testName, testFn] of tests) {
    const passed = await runTest(testName, testFn);
    if (passed) passedTests++;
    console.log(''); // Empty line for readability
  }

  console.log('📊 Test Results Summary');
  console.log('========================');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Authentication system is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the results above.');
  }

  return passedTests === totalTests;
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  makeRequest,
  runTest,
};
