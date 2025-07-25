import { test, expect } from './fixtures/supabase-auth-debug.fixture';

test('debug authentication', async ({ authenticatedPage }) => {
  const page = authenticatedPage;
  
  // If we get here, authentication worked
  console.log('Test: Authentication successful, current URL:', page.url());
  
  // Try to access the dashboard
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/dashboard/);
  
  console.log('Test: Successfully navigated to dashboard');
});