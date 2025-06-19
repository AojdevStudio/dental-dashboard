/**
 * Next.js Test Mocks
 * 
 * Utilities for mocking Next.js server and client functions in tests
 */

import { vi } from 'vitest';

/**
 * Mock Next.js server context for components that use cookies() or headers()
 */
export function mockNextjsServerContext() {
  const mockCookies = vi.fn(() => ({
    get: vi.fn((name: string) => ({ name, value: `mock-${name}` })),
    set: vi.fn(),
    delete: vi.fn(),
    has: vi.fn(() => false),
    getAll: vi.fn(() => []),
  }));

  const mockHeaders = vi.fn(() => new Map([
    ['user-agent', 'test-agent'],
    ['host', 'localhost:3000'],
    ['x-forwarded-for', '127.0.0.1'],
  ]));

  vi.mock('next/headers', () => ({
    cookies: mockCookies,
    headers: mockHeaders,
  }));

  return { mockCookies, mockHeaders };
}

/**
 * Mock Next.js navigation hooks for client components
 */
export function mockNextjsNavigation() {
  const mockRouter = {
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  };

  const mockPathname = vi.fn(() => '/');
  const mockSearchParams = vi.fn(() => new URLSearchParams());
  const mockParams = vi.fn(() => ({}));

  vi.mock('next/navigation', () => ({
    useRouter: vi.fn(() => mockRouter),
    usePathname: mockPathname,
    useSearchParams: mockSearchParams,
    useParams: mockParams,
    redirect: vi.fn(),
    notFound: vi.fn(),
  }));

  return {
    mockRouter,
    mockPathname,
    mockSearchParams,
    mockParams,
  };
}

/**
 * Mock specific cookie values for testing
 */
export function mockCookieValue(name: string, value: string) {
  const mockCookies = vi.fn(() => ({
    get: vi.fn((cookieName: string) => 
      cookieName === name ? { name, value } : undefined
    ),
    set: vi.fn(),
    delete: vi.fn(),
    has: vi.fn((cookieName: string) => cookieName === name),
    getAll: vi.fn(() => [{ name, value }]),
  }));

  vi.mock('next/headers', () => ({
    cookies: mockCookies,
  }));

  return mockCookies;
}

/**
 * Mock specific header values for testing
 */
export function mockHeaderValue(name: string, value: string) {
  const mockHeaders = vi.fn(() => new Map([[name, value]]));

  vi.mock('next/headers', () => ({
    headers: mockHeaders,
  }));

  return mockHeaders;
}

/**
 * Reset all Next.js mocks
 */
export function resetNextjsMocks() {
  vi.clearAllMocks();
}

/**
 * Mock Next.js server actions
 */
export function mockServerActions() {
  const mockRevalidatePath = vi.fn();
  const mockRevalidateTag = vi.fn();
  const mockRedirect = vi.fn();

  vi.mock('next/cache', () => ({
    revalidatePath: mockRevalidatePath,
    revalidateTag: mockRevalidateTag,
  }));

  vi.mock('next/navigation', () => ({
    redirect: mockRedirect,
  }));

  return {
    mockRevalidatePath,
    mockRevalidateTag,
    mockRedirect,
  };
}
