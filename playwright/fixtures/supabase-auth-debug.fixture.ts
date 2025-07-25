import { type Page, test as base, expect } from '@playwright/test';

/**
 * Debug version of Supabase Authentication Fixture
 *
 * Uses form submission to test the client-side authentication fallback
 */

type SupabaseAuthFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<SupabaseAuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Enable console logging for debugging
    page.on('console', (_msg) => {});

    // Navigate to login page
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Fill in the login form
    await page.fill('input[name="email"]', 'admin@kamdental.com');
    await page.fill('input[name="password"]', 'Figther2*');

    // Take screenshot before submitting
    await page.screenshot({ path: 'before-signin.png' });

    // Submit the form (this will trigger our fallback logic)
    await page.click('button[type="submit"]');

    // Wait for either redirect to dashboard or stay on login page with processing
    await page.waitForTimeout(3000);

    // Take screenshot after submitting
    await page.screenshot({ path: 'after-signin.png' });

    // Check current URL and errors
    const currentUrl = page.url();

    // Look for error messages on the page
    const errorElement = await page
      .locator('.bg-red-50 .text-red-600')
      .textContent()
      .catch(() => null);
    if (errorElement) {
    }

    // If we're still on login page, check if auth worked but redirect failed
    if (currentUrl.includes('/login')) {
      await page.goto('/dashboard');
      await page.waitForTimeout(2000);

      const dashboardUrl = page.url();

      if (dashboardUrl.includes('/login')) {
        await page.screenshot({ path: 'final-auth-failure.png' });
        throw new Error('Authentication failed - session was not established');
      }
    }

    // Wait for dashboard to load properly
    try {
      await page.waitForURL('**/dashboard**', { timeout: 5000 });
    } catch {
      // May already be on dashboard, check URL
      const finalUrl = page.url();
      if (!finalUrl.includes('/dashboard')) {
        throw new Error(`Expected to be on dashboard, but on: ${finalUrl}`);
      }
    }

    await use(page);
  },
});

export { expect };
