import { type Page, test as base } from '@playwright/test';

/**
 * Debug version of Supabase Authentication Fixture
 *
 * Provides more detailed logging to diagnose authentication issues
 */

// Define error regex at top level for performance
const ERROR_REGEX = /error|Error|failed|Failed/;

type SupabaseAuthFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<SupabaseAuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Enable console logging
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
      }
    });

    // Log network requests
    page.on('request', (request) => {
      if (request.url().includes('/login') || request.url().includes('/auth')) {
      }
    });

    page.on('response', (response) => {
      if (response.url().includes('/login') || response.url().includes('/auth')) {
      }
    });
    await page.goto('/login');

    // Wait for the login form to be ready
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Use the admin credentials
    const email = 'admin@kamdental.com';
    const password = 'Figther2*';

    // Fill in the login form
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await emailInput.waitFor({ state: 'visible' });
    await emailInput.fill(email);

    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    await passwordInput.waitFor({ state: 'visible' });
    await passwordInput.fill(password);

    // Take a screenshot before clicking sign in
    await page.screenshot({ path: 'before-signin.png' });
    const signInButton = page.locator('button[type="submit"], button:has-text("Sign in")').first();
    await signInButton.waitFor({ state: 'visible' });
    await page.waitForTimeout(500);
    await signInButton.click();
    await page.waitForTimeout(2000); // Give it time to process

    // Take a screenshot after clicking
    await page.screenshot({ path: 'after-signin.png' });

    const currentUrl = page.url();

    // Check if we're still on login page
    if (currentUrl.includes('/login')) {
      // Get all visible text on the page
      const _visibleText = await page.locator('body').innerText();

      // Look for any error messages
      const errorElements = await page.locator('p, div').filter({ hasText: ERROR_REGEX }).all();
      for (const element of errorElements) {
        const _text = await element.textContent();
      }

      throw new Error('Authentication failed - still on login page');
    }
    await use(page);
  },
});
