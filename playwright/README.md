# Playwright E2E Tests for Provider Navigation

This directory contains comprehensive GUI-based tests for the provider navigation functionality using Playwright.

## 🎨 What These Tests Verify

### Provider Navigation (AC1)
- ✅ Provider "View" buttons navigate to functional detail pages without 404 errors
- ✅ URL pattern `/dashboard/providers/[providerId]` resolves correctly
- ✅ Support for both UUID and slug-based provider identification
- ✅ Proper error boundaries and 404 handling for invalid provider IDs
- ✅ Breadcrumb navigation integration with back button functionality

## 🚀 Running the Tests

### ✅ **Environment Setup (FIXED)**
Tests now properly use the isolated test database:

1. **Test Environment**: Uses `.env.test` configuration automatically
2. **Database**: Isolated cloud test database (`bxnkocxoacakljbcnulv`)
3. **Environment Validation**: Fixed to allow test database access
4. **Configuration**: Playwright loads test environment variables via `dotenv-cli`

### ⚠️ **Current Status: Authentication Issue**
- **Fixed**: Database environment validation
- **Fixed**: Test environment configuration  
- **Remaining**: Test database needs seeding with admin user and provider data

### Run All Tests
```bash
pnpm test:e2e
```

### Run Tests with UI Mode (Interactive)
```bash
pnpm test:e2e:ui
```

### Run Tests in Headed Mode (See Browser)
```bash
pnpm test:e2e:headed
```

### Run Specific Test File
```bash
pnpm playwright test providers/provider-navigation.spec.ts
```

### Generate and View Test Report
```bash
pnpm test:e2e:report
```

## 📸 Screenshots and Videos

Failed tests automatically capture:
- Screenshots on failure
- Videos of the entire test run
- Trace files for debugging

Find these in:
- `playwright/screenshots/` - Visual regression screenshots
- `test-results/` - Failure artifacts
- `playwright-report/` - HTML report with all details

## 🧪 Test Structure

### Page Object Model
Tests use Page Object Model for maintainability:
- `LoginPage` - Handles authentication
- `ProvidersListPage` - Provider listing interactions
- `ProviderDetailPage` - Individual provider page interactions

### Test Categories
1. **Provider Listing Navigation**
   - Display of provider cards
   - Click interactions (View button and card)
   - Filter persistence

2. **Provider Detail Page**
   - Information display
   - Invalid ID handling (404 errors)
   - KPI dashboard visibility

3. **Breadcrumb Navigation**
   - Hierarchy display
   - Navigation links
   - Back button functionality

4. **Performance & Loading**
   - Loading states
   - Slow network handling

5. **Mobile Responsiveness**
   - Mobile viewport testing
   - Touch interactions

6. **Accessibility**
   - Keyboard navigation
   - ARIA labels

7. **Visual Regression**
   - UI consistency
   - Screenshot comparisons

## 🔧 Debugging Tips

### Run Single Test
```bash
pnpm playwright test -g "should navigate to provider detail page"
```

### Debug Mode
```bash
pnpm playwright test --debug
```

### View Trace
After a test failure:
```bash
pnpm playwright show-trace trace.zip
```

## 📝 Writing New Tests

1. Create test files in appropriate subdirectories
2. Use the auth fixture for authenticated tests:
   ```typescript
   import { test, expect } from '../fixtures/auth.fixture';
   
   test('my authenticated test', async ({ page, authenticatedPage }) => {
     // Already logged in
     await page.goto('/dashboard/providers');
   });
   ```

3. Follow naming conventions:
   - `*.spec.ts` for test files
   - Descriptive test names
   - Group related tests with `describe`

## 🎯 Best Practices

1. **Use Data Attributes**: Add `data-testid` attributes to components for reliable selection
2. **Wait for Elements**: Use `waitForSelector` instead of fixed timeouts
3. **Page Objects**: Keep selectors in page objects, not test files
4. **Parallel Execution**: Tests run in parallel by default
5. **Isolation**: Each test should be independent

## 🐛 Common Issues

### Login Fails
- Verify `.env` file has correct `SYSTEM_ADMIN_EMAIL` and `SYSTEM_ADMIN_PASSWORD`
- Check that the system admin user exists in the database
- Verify authentication is working in dev environment

### 404 Errors
- Ensure test data (providers) exist in the database
- Check if running against correct environment

### Timeout Errors
- Increase timeout in specific tests if needed:
  ```typescript
  test.setTimeout(60000); // 60 seconds
  ```

### Flaky Tests
- Add explicit waits for dynamic content
- Use `waitForLoadState('networkidle')` after navigation
- Check for race conditions in the application

## 🔗 Related Documentation

- [Playwright Documentation](https://playwright.dev)
- [Next.js Testing Guide](https://nextjs.org/docs/testing)
- [Project Testing Strategy](../docs/testing-strategy.md)