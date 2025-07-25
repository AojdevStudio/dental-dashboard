import { type Page, test as base, expect } from '@playwright/test';

/**
 * Mock Authentication Fixture
 *
 * Alternative authentication strategy that bypasses the login form
 * and directly sets authentication state for tests when the test
 * database is not accessible.
 */

type MockAuthFixtures = {
  mockAuthenticatedPage: Page;
};

export const mockTest = base.extend<MockAuthFixtures>({
  mockAuthenticatedPage: async ({ page }, use) => {
    // Navigate to login page first
    await page.goto('/login');

    // Mock authentication by setting local storage or cookies
    // This simulates a logged-in state without requiring database access
    await page.evaluate(() => {
      // Mock Supabase auth session
      const mockAuthData = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_at: Date.now() + 3600000,
        token_type: 'bearer',
        user: {
          id: 'test-user-id',
          email: 'admin@kamdental.com',
          user_metadata: {
            name: 'Test Admin User',
          },
        },
      };

      // Set in localStorage (Supabase client checks this)
      localStorage.setItem('sb-bxnkocxoacakljbcnulv-auth-token', JSON.stringify(mockAuthData));

      // Also set as cookie for server-side
      document.cookie = `sb-access-token=${mockAuthData.access_token}; path=/; max-age=3600`;
    });

    // Add custom header to identify mock authentication
    await page.setExtraHTTPHeaders({
      'X-Test-Mock-Auth': 'true',
      'X-Test-User-Id': 'test-user-id',
      'X-Test-User-Email': 'admin@kamdental.com',
    });

    // Try to navigate to dashboard to verify mock auth works
    try {
      await page.goto('/dashboard');
      await page.waitForURL('**/dashboard/**', { timeout: 5000 });
    } catch (_error) {
      console.warn('Mock auth navigation failed, continuing with current page');
    }

    await use(page);
  },
});
export { expect };
