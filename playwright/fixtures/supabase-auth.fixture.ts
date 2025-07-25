import { type Page, test as base, expect } from '@playwright/test';

/**
 * Supabase Authentication Fixture
 *
 * Provides authenticated page context using real Supabase authentication
 * with the test database. This ensures proper server-side authentication.
 */

type SupabaseAuthFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<SupabaseAuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Navigate to login page
    await page.goto('/login');

    // Wait for the login form to be ready
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Give the page time to fully load

    // Use the admin credentials (hardcoded for test database)
    const email = 'admin@kamdental.com';
    const password = 'Figther2*';

    // Fill in the login form with more specific selectors
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await emailInput.waitFor({ state: 'visible' });
    await emailInput.fill(email);

    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    await passwordInput.waitFor({ state: 'visible' });
    await passwordInput.fill(password);

    // Click the sign in button
    const signInButton = page.locator('button[type="submit"], button:has-text("Sign in")').first();
    await signInButton.waitFor({ state: 'visible' });

    // Add a small delay before clicking to ensure form is ready
    await page.waitForTimeout(500);
    await signInButton.click();

    // Wait for successful redirect to dashboard
    try {
      await page.waitForURL('**/dashboard/**', { timeout: 10000 });
    } catch (error) {
      // If redirect fails, check if we're still on login page
      const currentUrl = page.url();
      if (currentUrl.includes('/login')) {
        // Check for specific error messages
        const errorAlert = await page
          .locator('[role="alert"], .error, .alert-error, p:has-text("error"), p:has-text("Error")')
          .first();
        let errorMessage = '';

        try {
          errorMessage = (await errorAlert.textContent({ timeout: 1000 })) || '';
        } catch {
          // No specific error element found
        }

        console.error('❌ Authentication failed. Current URL:', currentUrl);
        console.error('Error message found:', errorMessage);

        const pageText = await page.textContent('body');
        console.error('Page content:', pageText?.substring(0, 500));

        // Take a screenshot for debugging
        await page.screenshot({ path: 'auth-failure.png' });

        throw new Error(`Authentication failed: ${errorMessage || 'Unknown error'}`);
      }
      throw error;
    }

    // Verify we're authenticated by checking we're not redirected back to login
    const finalUrl = page.url();
    if (finalUrl.includes('/login')) {
      throw new Error('Authentication failed - redirected back to login');
    }

    await use(page);
  },
});
export { expect };
