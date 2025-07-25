import { test as base } from '@playwright/test';

/**
 * Authentication Fixture
 *
 * Provides authenticated page context for tests
 * Can be extended to support multiple user roles
 */

type AuthFixtures = {
  authenticatedPage: undefined;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Navigate to login page
    await page.goto('/login');

    // Perform login using system admin credentials from .env
    await page.fill('input[name="email"]', process.env.SYSTEM_ADMIN_EMAIL || 'admin@kamdental.com');
    await page.fill('input[name="password"]', process.env.SYSTEM_ADMIN_PASSWORD || 'Figther2*');
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard/**', { timeout: 10000 });

    // Use the authenticated page in tests
    await use();
  },
});
