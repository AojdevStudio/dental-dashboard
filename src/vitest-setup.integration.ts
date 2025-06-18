/**
 * Integration Test Setup
 *
 * Configures the test environment for integration tests
 */

import dotenv from 'dotenv';
import { afterAll, beforeAll } from 'vitest';
import { validateTestEnvironment } from '@/lib/config/environment';

// Load test environment variables
dotenv.config({ path: '.env.test' });

beforeAll(() => {
  try {
    // Use validated environment configuration instead of manual checks
    validateTestEnvironment();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown environment validation error';
    throw new Error(
      `Integration test environment validation failed: ${errorMessage}\nPlease create a .env.test file with test database credentials.`
    );
  }
});

afterAll(() => {});

// Mock next/navigation for API route tests
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/test',
}));

// Set test timeouts
vi.setConfig({
  testTimeout: 30000,
  hookTimeout: 60000,
});
