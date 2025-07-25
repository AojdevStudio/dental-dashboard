import { test, expect } from '@playwright/test';

/**
 * Smoke Test
 * Quick verification that the application is running
 */

test('application loads and shows login page', async ({ page }) => {
  await page.goto('/');
  
  // Should redirect to login if not authenticated
  await expect(page).toHaveURL(/login|dashboard/);
  
  // Check for key elements
  const pageTitle = await page.title();
  expect(pageTitle).toBeTruthy();
});