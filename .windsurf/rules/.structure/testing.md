---
trigger: model_decision
description: Guidlines for testing the application with Vitest
globs: 
---
---
description: Guidelines for testing the application with Vitest
globs: 
alwaysApply: false
---

# Testing Guidelines

## Testing Framework and Structure

- We use `vitest` as our primary testing framework
- Tests are colocated next to the tested file for easy discovery and maintenance
  - Example: `services/metrics/calculations.ts` and `services/metrics/calculations.test.ts`
- Exception: AI-related tests are placed in the `__tests__` directory and excluded from standard test runs since they use real LLM calls
- Test files should follow the pattern `*.test.ts` or `*.test.tsx` for component tests

## Types of Tests

### Unit Tests
- Focus on testing pure functions and service layer logic
- Test business logic and calculations thoroughly
- Mock all external dependencies, API calls, and database interactions

### Component Tests
- Test React components in isolation
- For client components, focus on user interactions and state changes
- For server components, test the rendered output based on provided props
- Use React Testing Library for component tests

### Integration Tests
- Test the interaction between multiple services and components
- Minimize the use of mocks for these tests to ensure actual compatibility
- Focus on critical user flows and business processes

## Common Mocks

### Server-Only Mock
```ts
vi.mock("server-only", () => ({}));
```

### Prisma Mock
```ts
import { beforeEach } from "vitest";
import prisma from "@/utils/__mocks__/prisma";
vi.mock("@/utils/prisma");

describe("MetricsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it("should calculate the monthly production total", async () => {
    // Setup mock data
    prisma.metrics.findMany.mockResolvedValue([
      { date: "2023-01-01", production: 1000 },
      { date: "2023-01-15", production: 1500 }
    ]);
    
    // Test the service
    const result = await MetricsService.calculateMonthlyProduction("2023-01");
    
    // Assertions
    expect(result).toBe(2500);
    expect(prisma.metrics.findMany).toHaveBeenCalledTimes(1);
  });
});
```

### Supabase Mock
```ts
import { vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          data: [{ id: 1, name: "Test Clinic" }],
          error: null
        })
      })
    }),
    auth: {
      getUser: () => ({ data: { user: { id: "test-user-id" } } })
    }
  })
}));
```

## Testing Service Layer

- Service layer tests should be comprehensive as they contain critical business logic
- Ensure all edge cases and error conditions are tested
- Mock database calls and external APIs
- Example:

```ts
// src/services/clinics/clinics.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import prisma from "@/utils/__mocks__/prisma";
import { ClinicService } from "./clinics";

vi.mock("@/utils/prisma");

describe("ClinicService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return clinics for a user", async () => {
    prisma.clinic.findMany.mockResolvedValue([
      { id: "1", name: "Dental Clinic A" },
      { id: "2", name: "Dental Clinic B" }
    ]);

    const result = await ClinicService.getUserClinics("user-123");
    
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Dental Clinic A");
    expect(prisma.clinic.findMany).toHaveBeenCalledWith({
      where: { users: { some: { id: "user-123" } } }
    });
  });
});
```

## Testing API Route Handlers

- Test API route handlers by mocking the Next.js Request and Response objects
- Focus on testing the correct status codes, headers, and response formats
- Example:

```ts
// src/app/api/metrics/route.test.ts
import { describe, it, expect, vi } from "vitest";
import { GET } from "./route";
import { MetricsService } from "@/services/metrics";

vi.mock("@/services/metrics");

describe("Metrics API Route", () => {
  it("should return metrics data with 200 status", async () => {
    // Mock the service
    vi.mocked(MetricsService.getDailyMetrics).mockResolvedValue([
      { date: "2023-01-01", value: 100 }
    ]);
    
    // Create mock request
    const request = new Request("http://localhost:3000/api/metrics?clinicId=123");
    
    // Call the route handler
    const response = await GET(request);
    
    // Assert response
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual([{ date: "2023-01-01", value: 100 }]);
  });
});
```

## Test Coverage Expectations

- Aim for at least 80% test coverage across the codebase
- Critical business logic in services should have 90%+ coverage
- UI components can have lower coverage, focusing on key functionality
- Run coverage reports regularly: `pnpm test:coverage`

## Best Practices

- Each test should be independent and not rely on the state from other tests
- Use descriptive test names that explain the expected behavior, not implementation
- Mock external dependencies to isolate the code being tested
- Always clean up mocks between tests using `beforeEach` and `vi.clearAllMocks()`
- Avoid testing implementation details; test behavior and outputs
- Follow the Arrange-Act-Assert pattern for clear test structure
- Use factories or test helpers to create test data instead of duplicating setup code
- Minimize the use of snapshots; when used, keep them small and focused

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode during development
pnpm test:watch

# Run tests with coverage report
pnpm test:coverage

# Run specific test file
pnpm test path/to/file.test.ts
```

## CI Integration

- All tests must pass before merging pull requests
- Coverage reports are generated on CI and stored as artifacts
- Integration tests run on scheduled intervals to detect regressions

These guidelines ensure consistent and effective testing across the codebase, supporting our server-first architecture and maintaining code quality.