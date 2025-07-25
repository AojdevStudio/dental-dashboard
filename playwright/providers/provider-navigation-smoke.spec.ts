import { mockTest as test, expect } from '../fixtures/mock-auth.fixture';
import type { Page } from '@playwright/test';

/**
 * Provider Navigation Smoke Tests (Mock Authentication)
 * 
 * These tests verify basic navigation functionality using mock authentication
 * without requiring a seeded database. They focus on UI behavior and routing.
 */

test.describe('Provider Navigation Smoke Tests (Mock Auth)', () => {
  test.beforeEach(async ({ mockAuthenticatedPage }) => {
    const page = mockAuthenticatedPage;
    // Mock authentication is already handled by the fixture
    await page.goto('/dashboard');
  });

  test('should navigate to providers page without errors', async ({ mockAuthenticatedPage }) => {
    const page = mockAuthenticatedPage;
    
    // Navigate to providers page
    await page.goto('/dashboard/providers');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Verify we're on the providers page (not 404 or 500 error)
    const url = page.url();
    expect(url).toContain('/dashboard/providers');
    
    // Check that the page loaded successfully (not an error page)
    const title = await page.title();
    expect(title).not.toContain('Error');
    
    // Look for page structure elements that should exist
    const bodyText = await page.textContent('body');
    
    // The page should have loaded content (not just error or blank)
    expect(bodyText).toBeTruthy();
    expect(bodyText!.length).toBeGreaterThan(10);
    
    console.log('✅ Providers page loaded successfully with mock authentication');
  });

  test('should handle provider detail page routing', async ({ mockAuthenticatedPage }) => {
    const page = mockAuthenticatedPage;
    
    // Test navigation to a specific provider ID (even if it doesn't exist)
    await page.goto('/dashboard/providers/test-provider-id');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // The page should load (might show 404 or empty state, but not crash)
    const url = page.url();
    expect(url).toContain('/dashboard/providers/test-provider-id');
    
    // Verify page loaded without fatal errors
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
    
    console.log('✅ Provider detail page routing works with mock authentication');
  });

  test('should display dashboard navigation elements', async ({ mockAuthenticatedPage }) => {
    const page = mockAuthenticatedPage;
    
    await page.goto('/dashboard/providers');
    await page.waitForLoadState('networkidle');
    
    // Look for common dashboard navigation elements
    const hasNavigation = await page.locator('nav, [role="navigation"], .sidebar, .menu').count();
    
    // We should have some form of navigation structure
    expect(hasNavigation).toBeGreaterThan(0);
    
    console.log('✅ Dashboard navigation elements present');
  });

  test('should handle breadcrumb navigation structure', async ({ mockAuthenticatedPage }) => {
    const page = mockAuthenticatedPage;
    
    // Test breadcrumb navigation
    await page.goto('/dashboard/providers/test-provider-id');
    await page.waitForLoadState('networkidle');
    
    // Look for breadcrumb-like elements
    const breadcrumbSelectors = [
      '[aria-label*="breadcrumb"]',
      '.breadcrumb',
      '[data-testid*="breadcrumb"]',
      'nav ol, nav ul', // Common breadcrumb structures
    ];
    
    let foundBreadcrumbs = false;
    for (const selector of breadcrumbSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        foundBreadcrumbs = true;
        break;
      }
    }
    
    // This test is informational - breadcrumbs may or may not be implemented yet
    console.log(foundBreadcrumbs ? '✅ Breadcrumb structure found' : 'ℹ️ No breadcrumb structure detected');
  });

  test('should maintain authenticated state across navigation', async ({ mockAuthenticatedPage }) => {
    const page = mockAuthenticatedPage;
    
    // Navigate between different dashboard pages
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/dashboard/providers');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/dashboard/providers/test-id');
    await page.waitForLoadState('networkidle');
    
    // We should still be authenticated (not redirected to login)
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/login');
    expect(currentUrl).toContain('/dashboard');
    
    console.log('✅ Authentication state maintained across navigation');
  });
});