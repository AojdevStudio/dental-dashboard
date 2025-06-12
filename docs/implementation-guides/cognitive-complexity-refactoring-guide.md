# Cognitive Complexity Refactoring Guide

## Overview

This guide documents the systematic approach used to refactor API routes with excessive cognitive complexity (>15) in the dental dashboard application. The refactoring reduced complexity while improving code maintainability, testability, and readability.

## Problem Statement

Seven API route functions exceeded Biome's maximum allowed cognitive complexity of 15:
- `register-comprehensive/route.ts` (complexity: 24)
- `goals/route.ts` (complexity: 36)
- `financial/locations/route.ts GET` (complexity: 26)
- `financial/locations/route.ts POST` (complexity: 21)
- `financial/locations/[locationId]/route.ts GET` (complexity: 24)
- `financial/locations/[locationId]/route.ts PUT` (complexity: 50)
- `financial/locations/import/route.ts POST` (complexity: 56)

## Solution Approach

### 1. Service Layer Pattern

The primary strategy was to extract complex business logic into dedicated service classes. This approach:
- Separates concerns between HTTP handling and business logic
- Makes code more testable
- Reduces cognitive complexity by breaking down large functions
- Improves code reusability

### 2. Refactoring Patterns Applied

#### Pattern A: Strategy Pattern (for Complex Branching Logic)
Used in: `goals/route.ts`, `financial/locations/[locationId]/route.ts PUT`

```typescript
// Before: Complex conditional logic in route
if (type === 'provider') {
  // 20+ lines of provider-specific logic
} else if (type === 'clinic') {
  // 20+ lines of clinic-specific logic
} else {
  // 20+ lines of default logic
}

// After: Strategy pattern
const strategy = GoalCreationStrategyFactory.createStrategy(rawBody);
const result = await strategy.create(rawBody, authContext);
```

#### Pattern B: Service Extraction (for Complex Operations)
Used in: `register-comprehensive/route.ts`, `financial/locations/route.ts`

```typescript
// Before: All logic in route handler
export async function POST(request: NextRequest) {
  // 150+ lines of registration logic
}

// After: Extracted to service
export async function POST(request: NextRequest) {
  const registrationService = new RegistrationService(supabase);
  const result = await registrationService.register(data);
  return NextResponse.json({ success: true, ...result });
}
```

#### Pattern C: Query Builder Pattern (for Complex Database Queries)
Used in: `financial/locations/route.ts GET`, `financial/locations/[locationId]/route.ts GET`

```typescript
// Before: Complex query building in route
const conditions = [];
const params = [];
if (clinicId) {
  conditions.push(`clinic_id = $${params.length + 1}`);
  params.push(clinicId);
}
// ... 50+ more lines of query building

// After: Extracted to query service
const queryService = new LocationFinancialQueryService();
const result = await queryService.getAggregatedData(params);
```

## Detailed Implementation Examples

### Example 1: Registration Service Refactoring

**Original Structure** (`register-comprehensive/route.ts`):
```typescript
export async function POST(request: NextRequest) {
  try {
    // Validation logic (10+ lines)
    // Transaction with:
    //   - Clinic verification/creation (30+ lines)
    //   - Auth user creation (20+ lines)
    //   - Database user creation (15+ lines)
    //   - Role assignment (15+ lines)
    //   - Provider creation (10+ lines)
    // Response formatting
  } catch (error) {
    // Error handling
  }
}
```

**Refactored Structure**:
```typescript
// route.ts
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const supabase = await createClient();
    const registrationService = new RegistrationService(supabase);
    const result = await registrationService.register(data);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// registration-service.ts
export class RegistrationService {
  async register(data: RegistrationData) {
    this.validateRequiredFields(data);
    return await prisma.$transaction(async (tx) => {
      const { clinicId, isNewClinic } = await this.handleClinicAssociation(data, tx);
      const authUser = await this.createAuthUser(data);
      const user = await this.createDatabaseRecords(data, authUser, clinicId, isNewClinic, tx);
      return { user, authUser, clinicId, isNewClinic };
    });
  }

  private validateRequiredFields(data: RegistrationData) { /* ... */ }
  private async handleClinicAssociation(data, tx) { /* ... */ }
  private async createAuthUser(data) { /* ... */ }
  private async createDatabaseRecords(data, authUser, clinicId, isNewClinic, tx) { /* ... */ }
}
```

### Example 2: Query Service Refactoring

**Original Structure** (`financial/locations/route.ts GET`):
```typescript
export async function GET(request: NextRequest) {
  // Parse parameters (10+ lines)
  // Build where clause (20+ lines)
  // Handle groupBy logic:
  //   - Build SQL query (30+ lines)
  //   - Execute raw query (10+ lines)
  //   - Enrich results (20+ lines)
  // Handle non-grouped query (15+ lines)
  // Format response
}
```

**Refactored Structure**:
```typescript
// route.ts
export async function GET(request: NextRequest) {
  const queryService = new LocationFinancialQueryService();
  const params = {
    clinicId: searchParams.get('clinicId') || undefined,
    // ... other params
  };
  
  const result = params.groupBy 
    ? await queryService.getAggregatedData(params)
    : await queryService.getDetailedData(params);
    
  return NextResponse.json({ success: true, ...result });
}

// location-query-service.ts
export class LocationFinancialQueryService {
  buildWhereClause(params) { /* ... */ }
  async getAggregatedData(params) { /* ... */ }
  async getDetailedData(params) { /* ... */ }
  private getDateGroupingSql(groupBy) { /* ... */ }
  private buildAggregatedQuery(where, dateGrouping, limit, offset) { /* ... */ }
  private async enrichAggregatedData(aggregatedData) { /* ... */ }
}
```

## Implementation Workflow

### Step 1: Identify Complexity Hotspots
```bash
pnpm biome:check src/app/api/ | grep -B3 "noExcessiveCognitiveComplexity"
```

### Step 2: Analyze the Complex Function
1. Identify distinct responsibilities
2. Look for:
   - Nested conditionals
   - Long parameter lists
   - Multiple database operations
   - Complex validation logic
   - Business rule implementations

### Step 3: Design Service Structure
1. Create service class with clear responsibility
2. Extract related private methods
3. Group related operations
4. Define clear interfaces

### Step 4: Implement Service
1. Create service file in appropriate directory:
   - Auth services: `/lib/services/auth/`
   - Financial services: `/lib/services/financial/`
   - Goal services: `/lib/services/goals/`
2. Move business logic to service methods
3. Keep route handler focused on HTTP concerns

### Step 5: Update Route Handler
1. Import service class
2. Instantiate service
3. Call appropriate service method
4. Handle response formatting and errors

### Step 6: Verify Refactoring
```bash
pnpm biome:check [refactored-file]
```

## Best Practices

### 1. Service Design Principles
- **Single Responsibility**: Each service handles one domain area
- **Clear Interfaces**: Public methods have clear, documented contracts
- **Dependency Injection**: Pass dependencies (like Supabase client) to services
- **Error Handling**: Services throw meaningful errors, routes handle HTTP responses

### 2. Method Extraction Guidelines
- Extract methods when they have a clear, single purpose
- Keep extracted methods at appropriate visibility (private for internal logic)
- Name methods descriptively (e.g., `validateRequiredFields`, `buildDateFilter`)

### 3. Transaction Handling
- Keep transaction logic in services, not routes
- Use Prisma's transaction client type for type safety
- Group related database operations in transactions

### 4. Type Safety
- Define clear interfaces for service inputs/outputs
- Use TypeScript's type system to enforce contracts
- Avoid `any` types; use specific types or generics

## Common Refactoring Scenarios

### Scenario 1: Complex Validation
```typescript
// Before: In route
if (!data.field1 || !data.field2 || (data.type === 'A' && !data.field3)) {
  // Complex validation logic
}

// After: In service
private validateData(data: DataType): void {
  this.validateRequiredFields(data);
  this.validateBusinessRules(data);
}
```

### Scenario 2: Database Query Building
```typescript
// Before: In route
const where = {};
if (param1) where.field1 = param1;
if (param2) where.field2 = param2;
// ... more conditions

// After: In service
private buildWhereClause(params: QueryParams): WhereClause {
  return {
    ...(params.param1 && { field1: params.param1 }),
    ...(params.param2 && { field2: params.param2 }),
  };
}
```

### Scenario 3: Response Transformation
```typescript
// Before: In route
const enrichedData = await Promise.all(
  data.map(async (item) => {
    const related = await getRelatedData(item);
    return { ...item, related };
  })
);

// After: In service
private async enrichData(data: DataItem[]): Promise<EnrichedData[]> {
  return Promise.all(data.map(item => this.enrichSingleItem(item)));
}
```

## Measuring Success

### Metrics to Track
1. **Cognitive Complexity**: Should be ≤15 for all functions
2. **Function Length**: Aim for <50 lines per function
3. **Test Coverage**: Services should have >80% coverage
4. **Code Reuse**: Look for opportunities to share service logic

### Verification Commands
```bash
# Check specific file
pnpm biome:check src/app/api/[route-file]

# Check all API routes
pnpm biome:check src/app/api/

# Run full quality check
pnpm code-quality
```

## Maintenance Guidelines

### Adding New Features
1. Start with service design, not route implementation
2. Consider existing services before creating new ones
3. Follow established patterns in the codebase

### Modifying Existing Services
1. Maintain backward compatibility
2. Update tests when changing service contracts
3. Document breaking changes

### Code Review Checklist
- [x] Cognitive complexity ≤15 for all functions
- [x] Clear separation between HTTP and business logic
- [x] Services have single, clear responsibilities
- [x] Error handling is appropriate and consistent
- [x] TypeScript types are properly defined
- [x] No Biome violations (core API routes fixed)

## Conclusion

By consistently applying these refactoring patterns and following the service layer architecture, we can maintain low cognitive complexity while building maintainable, testable code. The key is to recognize when a function is doing too much and systematically extract responsibilities into well-designed services.