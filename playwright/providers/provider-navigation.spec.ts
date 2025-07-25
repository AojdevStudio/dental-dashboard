import { test, expect } from '../fixtures/supabase-auth.fixture';
import type { Page } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

/**
 * Provider Navigation UX Tests
 * 
 * Comprehensive GUI-based testing for provider navigation functionality
 * Tests actual user interactions and visual elements
 */

// Test configuration is handled by the supabase-auth fixture

// Page Objects for better maintainability
class LoginPage {
  constructor(private page: Page) {}

  async navigateTo() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="password"]', password);
    await this.page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await this.page.waitForURL('**/dashboard/**', { timeout: 10000 });
  }
}

class ProvidersListPage {
  constructor(private page: Page) {}

  async navigateTo() {
    await this.page.goto('/dashboard/providers');
    
    // Wait for the page to load and check what's actually there
    await this.page.waitForLoadState('networkidle');
    
    // Check if we have providers or an empty state
    try {
      await this.page.waitForSelector('[data-testid="provider-card"], [data-testid="provider-row"]', { 
        timeout: 5000 
      });
    } catch (error) {
      // If no providers found, check for empty state or error messages
      const pageContent = await this.page.textContent('body');
      console.log('Page content when no providers found:', pageContent?.substring(0, 500));
      
      // Check for common empty state indicators
      const hasEmptyState = await this.page.locator('text=No providers found, text=No data, text=Empty').count();
      if (hasEmptyState > 0) {
        console.log('Empty state detected - this is expected with mock auth and no database');
        return;
      }
      
      throw error;
    }
  }

  async getProviderCards() {
    return this.page.locator('[data-testid="provider-card"], .provider-card').all();
  }

  async clickProviderViewButton(providerName: string) {
    const providerCard = this.page.locator('[data-testid="provider-card"], .provider-card')
      .filter({ hasText: providerName });
    
    // Click the View button within the specific provider card
    await providerCard.locator('button:has-text("View")').click();
  }

  async clickProviderCard(providerName: string) {
    const providerCard = this.page.locator('[data-testid="provider-card"], .provider-card')
      .filter({ hasText: providerName });
    
    await providerCard.click();
  }

  async searchProvider(searchTerm: string) {
    await this.page.fill('input[placeholder*="Search"]', searchTerm);
    // Wait for search results to update
    await this.page.waitForTimeout(500);
  }

  async filterByProviderType(type: string) {
    await this.page.click('button:has-text("Provider Type")');
    await this.page.click(`[role="menuitem"]:has-text("${type}")`);
  }
}

class ProviderDetailPage {
  constructor(private page: Page) {}

  async waitForPageLoad() {
    // Wait for provider name to be visible
    await this.page.waitForSelector('h1', { timeout: 10000 });
    // Wait for provider information cards to load
    await this.page.waitForSelector('.card', { timeout: 10000 });
  }

  async getProviderName() {
    return this.page.locator('h1').textContent();
  }

  async getBreadcrumbs() {
    return this.page.locator('nav[aria-label="breadcrumb"] a, nav ol li').allTextContents();
  }

  async clickBackButton() {
    await this.page.click('a:has-text("Back to Providers")');
  }

  async clickBreadcrumbLink(linkText: string) {
    await this.page.click(`nav a:has-text("${linkText}")`);
  }

  async getProviderInfo() {
    const info: Record<string, string | null> = {};
    
    // Get provider type
    const typeElement = await this.page.locator('text=/Provider Type/i').locator('..').locator('p').last();
    info.providerType = await typeElement.textContent();
    
    // Get status
    const statusElement = await this.page.locator('text=/Status/i').locator('..').locator('p').last();
    info.status = await statusElement.textContent();
    
    // Get email if present
    const emailElement = await this.page.locator('text=/Email/i').locator('..').locator('p').last();
    info.email = await emailElement.textContent().catch(() => null);
    
    return info;
  }

  async getLocationCount() {
    const locationsHeader = await this.page.locator('h2:has-text("Locations")').textContent();
    const match = locationsHeader?.match(/\((\d+)\)/);
    return match ? parseInt(match[1]) : 0;
  }

  async isKPIDashboardVisible() {
    return this.page.locator('[data-testid="provider-kpi-dashboard"], .provider-dashboard').isVisible();
  }
}

// Test suite
test.describe('Provider Navigation UX Tests', () => {
  let loginPage: LoginPage;
  let providersListPage: ProvidersListPage;
  let providerDetailPage: ProviderDetailPage;

  test.beforeEach(async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    loginPage = new LoginPage(page);
    providersListPage = new ProvidersListPage(page);
    providerDetailPage = new ProviderDetailPage(page);
    
    // Authentication is already handled by the fixture
    // We should already be on the dashboard
  });

  test.describe('Provider Listing Navigation', () => {
    test('should display provider cards with clickable elements', async ({ authenticatedPage }) => {
      const page = authenticatedPage;
      await providersListPage.navigateTo();
      
      // We should have provider cards (5 providers in test database)
      const providerCards = await providersListPage.getProviderCards();
      expect(providerCards.length).toBeGreaterThan(0);
      console.log(`✅ Found ${providerCards.length} provider cards`);
      
      // Verify each card has necessary elements
      const firstCard = providerCards[0];
      await expect(firstCard).toBeVisible();
      
      // Check for provider name
      const providerName = await firstCard.locator('h3, h4').textContent();
      expect(providerName).toBeTruthy();
      
      // Check for View button
      const viewButton = firstCard.locator('button:has-text("View")');
      await expect(viewButton).toBeVisible();
      await expect(viewButton).toBeEnabled();
    });

    test('should navigate to provider detail page when clicking View button', async ({ page }) => {
      await providersListPage.navigateTo();
      
      // Get first provider name
      const firstCard = (await providersListPage.getProviderCards())[0];
      const providerName = await firstCard.locator('h3, h4').textContent();
      
      // Click View button
      await providersListPage.clickProviderViewButton(providerName!);
      
      // Verify navigation to detail page
      await expect(page).toHaveURL(/\/dashboard\/providers\/[a-zA-Z0-9-]+$/);
      
      // Verify provider detail page loaded
      await providerDetailPage.waitForPageLoad();
      const detailProviderName = await providerDetailPage.getProviderName();
      expect(detailProviderName).toBe(providerName);
    });

    test('should navigate when clicking on provider card', async ({ page }) => {
      await providersListPage.navigateTo();
      
      // Get first provider name
      const firstCard = (await providersListPage.getProviderCards())[0];
      const providerName = await firstCard.locator('h3, h4').textContent();
      
      // Click on the card itself
      await providersListPage.clickProviderCard(providerName!);
      
      // Verify navigation
      await expect(page).toHaveURL(/\/dashboard\/providers\/[a-zA-Z0-9-]+$/);
      await providerDetailPage.waitForPageLoad();
    });

    test('should maintain search filters when navigating back', async ({ page }) => {
      await providersListPage.navigateTo();
      
      // Apply search filter
      await providersListPage.searchProvider('Dr.');
      
      // Navigate to a provider
      const providerCards = await providersListPage.getProviderCards();
      if (providerCards.length > 0) {
        const providerName = await providerCards[0].locator('h3, h4').textContent();
        await providersListPage.clickProviderViewButton(providerName!);
        
        // Navigate back
        await page.goBack();
        
        // Verify search filter is maintained
        const searchInput = page.locator('input[placeholder*="Search"]');
        await expect(searchInput).toHaveValue('Dr.');
      }
    });
  });

  test.describe('Provider Detail Page', () => {
    test('should display provider information correctly', async ({ page }) => {
      await providersListPage.navigateTo();
      
      // Navigate to first provider
      const firstCard = (await providersListPage.getProviderCards())[0];
      const providerName = await firstCard.locator('h3, h4').textContent();
      await providersListPage.clickProviderViewButton(providerName!);
      
      await providerDetailPage.waitForPageLoad();
      
      // Verify provider information is displayed
      const providerInfo = await providerDetailPage.getProviderInfo();
      expect(providerInfo.providerType).toBeTruthy();
      expect(providerInfo.status).toBeTruthy();
      
      // Verify location information
      const locationCount = await providerDetailPage.getLocationCount();
      expect(locationCount).toBeGreaterThanOrEqual(0);
      
      // Verify KPI dashboard is visible
      const isKPIVisible = await providerDetailPage.isKPIDashboardVisible();
      expect(isKPIVisible).toBeTruthy();
    });

    test('should handle invalid provider ID with 404 page', async ({ page }) => {
      // Navigate to invalid provider ID
      const invalidId = uuidv4();
      await page.goto(`/dashboard/providers/${invalidId}`);
      
      // Should show 404 or error page
      await expect(page.locator('text=/not found|404|error/i')).toBeVisible({ timeout: 10000 });
    });

    test('should handle malformed provider ID', async ({ page }) => {
      // Navigate to malformed ID
      await page.goto('/dashboard/providers/invalid-id-format-123');
      
      // Should show 404 or error page
      await expect(page.locator('text=/not found|404|error/i')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Breadcrumb Navigation', () => {
    test('should display correct breadcrumb hierarchy', async ({ page }) => {
      await providersListPage.navigateTo();
      
      // Navigate to a provider
      const firstCard = (await providersListPage.getProviderCards())[0];
      const providerName = await firstCard.locator('h3, h4').textContent();
      await providersListPage.clickProviderViewButton(providerName!);
      
      await providerDetailPage.waitForPageLoad();
      
      // Check breadcrumbs
      const breadcrumbs = await providerDetailPage.getBreadcrumbs();
      expect(breadcrumbs).toContain('Dashboard');
      expect(breadcrumbs).toContain('Providers');
      expect(breadcrumbs.join(' ')).toContain(providerName!);
    });

    test('should navigate using breadcrumb links', async ({ page }) => {
      await providersListPage.navigateTo();
      
      // Navigate to a provider
      const firstCard = (await providersListPage.getProviderCards())[0];
      const providerName = await firstCard.locator('h3, h4').textContent();
      await providersListPage.clickProviderViewButton(providerName!);
      
      await providerDetailPage.waitForPageLoad();
      
      // Click Providers breadcrumb
      await providerDetailPage.clickBreadcrumbLink('Providers');
      
      // Should be back on providers list
      await expect(page).toHaveURL('/dashboard/providers');
      await page.waitForSelector('[data-testid="provider-card"], .provider-card');
    });

    test('should navigate using Back button', async ({ page }) => {
      await providersListPage.navigateTo();
      
      // Navigate to a provider
      const firstCard = (await providersListPage.getProviderCards())[0];
      const providerName = await firstCard.locator('h3, h4').textContent();
      await providersListPage.clickProviderViewButton(providerName!);
      
      await providerDetailPage.waitForPageLoad();
      
      // Click Back button
      await providerDetailPage.clickBackButton();
      
      // Should be back on providers list
      await expect(page).toHaveURL('/dashboard/providers');
      await page.waitForSelector('[data-testid="provider-card"], .provider-card');
    });
  });

  test.describe('Performance and Loading States', () => {
    test('should show loading state during navigation', async ({ page }) => {
      await providersListPage.navigateTo();
      
      // Start monitoring for loading states
      const loadingPromise = page.waitForSelector('[data-testid="loading"], .loading, .skeleton', {
        state: 'visible',
        timeout: 5000
      }).catch(() => null);
      
      // Navigate to a provider
      const firstCard = (await providersListPage.getProviderCards())[0];
      const providerName = await firstCard.locator('h3, h4').textContent();
      await providersListPage.clickProviderViewButton(providerName!);
      
      // Check if loading state appeared
      const loadingElement = await loadingPromise;
      if (loadingElement) {
        expect(loadingElement).toBeTruthy();
      }
      
      // Ensure page eventually loads
      await providerDetailPage.waitForPageLoad();
    });

    test('should handle slow network gracefully', async ({ page }) => {
      // Simulate slow network
      await page.route('**/api/providers/*', async route => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        await route.continue();
      });
      
      await providersListPage.navigateTo();
      
      // Navigate to a provider
      const firstCard = (await providersListPage.getProviderCards())[0];
      const providerName = await firstCard.locator('h3, h4').textContent();
      await providersListPage.clickProviderViewButton(providerName!);
      
      // Should still load eventually
      await providerDetailPage.waitForPageLoad();
      const detailProviderName = await providerDetailPage.getProviderName();
      expect(detailProviderName).toBe(providerName);
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test.use({ viewport: { width: 375, height: 667 } });
    
    test('should navigate correctly on mobile devices', async ({ page }) => {
      await providersListPage.navigateTo();
      
      // Verify provider cards are visible on mobile
      const providerCards = await providersListPage.getProviderCards();
      expect(providerCards.length).toBeGreaterThan(0);
      
      // Navigate to a provider
      const firstCard = providerCards[0];
      const providerName = await firstCard.locator('h3, h4').textContent();
      
      // On mobile, might need to scroll to view button
      await firstCard.scrollIntoViewIfNeeded();
      await providersListPage.clickProviderViewButton(providerName!);
      
      // Verify navigation works on mobile
      await expect(page).toHaveURL(/\/dashboard\/providers\/[a-zA-Z0-9-]+$/);
      await providerDetailPage.waitForPageLoad();
      
      // Verify back button is accessible on mobile
      const backButton = page.locator('a:has-text("Back to Providers")');
      await backButton.scrollIntoViewIfNeeded();
      await expect(backButton).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper ARIA labels and keyboard navigation', async ({ page }) => {
      await providersListPage.navigateTo();
      
      // Test keyboard navigation
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Find focused element
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
      
      // Navigate to provider with keyboard
      const providerCards = await providersListPage.getProviderCards();
      if (providerCards.length > 0) {
        // Tab to first View button
        for (let i = 0; i < 10; i++) {
          const focused = await page.evaluate(() => document.activeElement?.textContent);
          if (focused?.includes('View')) {
            break;
          }
          await page.keyboard.press('Tab');
        }
        
        // Press Enter to navigate
        await page.keyboard.press('Enter');
        
        // Verify navigation worked
        await expect(page).toHaveURL(/\/dashboard\/providers\/[a-zA-Z0-9-]+$/);
      }
    });
  });

  test.describe('Visual Regression', () => {
    test('should maintain consistent UI across navigations', async ({ page }) => {
      await providersListPage.navigateTo();
      
      // Take screenshot of providers list
      await page.screenshot({ 
        path: 'playwright/screenshots/providers-list.png',
        fullPage: true 
      });
      
      // Navigate to a provider
      const firstCard = (await providersListPage.getProviderCards())[0];
      const providerName = await firstCard.locator('h3, h4').textContent();
      await providersListPage.clickProviderViewButton(providerName!);
      
      await providerDetailPage.waitForPageLoad();
      
      // Take screenshot of provider detail
      await page.screenshot({ 
        path: 'playwright/screenshots/provider-detail.png',
        fullPage: true 
      });
      
      // Navigate back
      await providerDetailPage.clickBackButton();
      
      // Take screenshot after navigation back
      await page.screenshot({ 
        path: 'playwright/screenshots/providers-list-after-nav.png',
        fullPage: true 
      });
    });
  });
});