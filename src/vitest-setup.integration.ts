/**
 * Integration Test Setup
 * 
 * Configures the test environment for integration tests
 */

import { beforeAll, afterAll } from 'vitest'
import dotenv from 'dotenv'

// Load test environment variables
dotenv.config({ path: '.env.test' })

// Verify required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_KEY',
]

beforeAll(() => {
  // Check environment setup
  const missingVars = requiredEnvVars.filter(v => !process.env[v])
  
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables for integration tests: ${missingVars.join(', ')}\n` +
      'Please create a .env.test file with test database credentials.'
    )
  }

  // Verify we're using a test database
  const dbUrl = process.env.DATABASE_URL!
  if (!dbUrl.includes('test') && !dbUrl.includes('localhost')) {
    throw new Error(
      'Integration tests must use a test database. ' +
      'Please ensure DATABASE_URL points to a test database.'
    )
  }

  console.log('Integration test environment configured')
  console.log(`Database: ${dbUrl.split('@')[1]?.split('/')[0] || 'unknown'}`)
})

afterAll(() => {
  // Global cleanup if needed
  console.log('Integration tests completed')
})

// Mock next/navigation for API route tests
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/test',
}))

// Set test timeouts
vi.setConfig({
  testTimeout: 30000,
  hookTimeout: 60000,
})