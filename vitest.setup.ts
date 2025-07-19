// vitest.setup.ts
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { vi } from 'vitest';

// Make React available globally in tests
global.React = React;

// Mock ResizeObserver for JSDOM
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock Next.js server functions to prevent "called outside request scope" errors
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn((name: string) => ({ name, value: `mock-${name}` })),
    set: vi.fn(),
    delete: vi.fn(),
    has: vi.fn(() => false),
    getAll: vi.fn(() => []),
  })),
  headers: vi.fn(
    () =>
      new Map([
        ['user-agent', 'test-agent'],
        ['host', 'localhost:3000'],
      ])
  ),
}));

// Mock Next.js navigation functions
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  })),
  usePathname: vi.fn(() => '/'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  useParams: vi.fn(() => ({})),
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

// Mock server environment validation to allow server components to run in tests
// Uses cloud test database configuration from .env.test
vi.mock('src/lib/config/environment', () => ({
  validateServerEnvironment: vi.fn(() => ({
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bxnkocxoacakljbcnulv.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-anon-key',
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY || 'test-service-key',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  })),
  validateClientEnvironment: vi.fn(() => ({
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bxnkocxoacakljbcnulv.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-anon-key',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  })),
}));
