# Provider Queries Refactoring Plan

## Document Information

-   **Priority**: Medium-High
-   **Timeline**: 2-3 Days
-   **Status**: Planning Phase
-   **Owner**: Development Team
-   **Created**: January 2025

## Problem Statement

The `src/lib/database/queries/providers.ts` file has grown to **891 lines** and contains multiple responsibilities, making it difficult to maintain, test, and extend. The file includes:

- Type definitions and interfaces
- Query building utilities
- Data transformation functions
- Performance metrics calculations
- Date/period utilities
- Location aggregation logic
- Goal fetching and processing

This violates the Single Responsibility Principle and makes the codebase harder to navigate and maintain.

## Current File Analysis

### File Structure Breakdown
```
Total Lines: 891

1. Type Definitions (Lines 1-285)
   - ProviderFilters interface
   - Performance row interfaces
   - Location summary interfaces
   - ProviderWithLocations interface
   - ProviderPerformanceMetrics interface

2. Query Building Utilities (Lines 86-199)
   - buildProviderWhereClause()
   - buildProviderQueryOptions()
   - providerQueryArgs constant

3. Data Transformation (Lines 200-237)
   - transformProviderData()

4. Core Provider Queries (Lines 287-628)
   - getProvidersWithLocations()
   - getProviderPerformanceByLocation()
   - getProvidersByLocation()
   - getProviderLocationSummary()
   - getProvidersWithLocationsPaginated()
   - getProviderWithLocationDetails()

5. Performance Metrics System (Lines 629-890)
   - calculatePeriodDates()
   - aggregateProductionByLocation()
   - fetchProviderGoals()
   - getProviderPerformanceMetrics()
```

### Complexity Metrics
- **Functions**: 12 exported functions
- **Interfaces**: 8 major interfaces
- **Raw SQL Queries**: 2 complex queries (100+ lines each)
- **Responsibilities**: 6 distinct areas of concern

## Refactoring Strategy

### Phase 1: Type System Extraction (Day 1 - 2 hours)

#### 1.1 Create Provider Types Module
**New File**: `src/lib/database/types/provider-types.ts`

**Content**:
- Move all provider-related interfaces
- Export comprehensive type definitions
- Add JSDoc documentation for each type

**Interfaces to Move**:
- `ProviderFilters`
- `ProviderWithLocations`
- `ProviderPerformanceMetrics`
- `RawDentistPerformanceRow`
- `RawHygienistPerformanceRow`
- Location summary interfaces

#### 1.2 Create Performance Types Module
**New File**: `src/lib/database/types/performance-types.ts`

**Content**:
- Performance-specific interfaces
- Goal-related types
- Aggregation result types

### Phase 2: Query Utilities Extraction (Day 1 - 3 hours)

#### 2.1 Create Provider Query Builder
**New File**: `src/lib/database/builders/provider-query-builder.ts`

**Content**:
- `buildProviderWhereClause()`
- `buildProviderQueryOptions()`
- `providerQueryArgs` constant
- Query validation utilities

#### 2.2 Create Data Transformers
**New File**: `src/lib/database/transformers/provider-transformers.ts`

**Content**:
- `transformProviderData()`
- `transformPerformanceData()`
- Data normalization utilities

### Phase 3: Core Queries Separation (Day 1-2 - 4 hours)

#### 3.1 Basic Provider Queries
**New File**: `src/lib/database/queries/provider-basic.ts`

**Functions**:
- `getProvidersWithLocations()`
- `getProvidersWithLocationsPaginated()`
- `getProviderWithLocationDetails()`
- `getProvidersByLocation()`

#### 3.2 Provider Location Queries
**New File**: `src/lib/database/queries/provider-locations.ts`

**Functions**:
- `getProviderLocationSummary()`
- Location-specific provider queries
- Provider-location relationship management

### Phase 4: Performance System Extraction (Day 2 - 5 hours)

#### 4.1 Performance Metrics Queries
**New File**: `src/lib/database/queries/provider-performance.ts`

**Functions**:
- `getProviderPerformanceByLocation()`
- `getProviderPerformanceMetrics()`
- Raw SQL performance queries

#### 4.2 Performance Utilities
**New File**: `src/lib/database/utils/performance-utils.ts`

**Functions**:
- `calculatePeriodDates()`
- `aggregateProductionByLocation()`
- Period calculation utilities

#### 4.3 Goal Integration
**New File**: `src/lib/database/queries/provider-goals.ts`

**Functions**:
- `fetchProviderGoals()`
- Goal achievement calculations
- Goal-performance integration

### Phase 5: Integration and Testing (Day 3 - 4 hours)

#### 5.1 Main Provider Queries Index
**Updated File**: `src/lib/database/queries/providers.ts`

**Content**:
- Re-export all functions from sub-modules
- Maintain backward compatibility
- Add deprecation notices for direct imports

#### 5.2 Update Import Statements
**Files to Update**:
- `src/app/api/providers/route.ts`
- `src/hooks/use-providers.ts`
- `src/types/providers.ts`
- Any other files importing from providers.ts

## Proposed File Structure

```
src/lib/database/
├── types/
│   ├── provider-types.ts           # Provider interfaces and types
│   └── performance-types.ts        # Performance-specific types
├── builders/
│   └── provider-query-builder.ts   # Query building utilities
├── transformers/
│   └── provider-transformers.ts    # Data transformation functions
├── utils/
│   └── performance-utils.ts        # Performance calculation utilities
└── queries/
    ├── provider-basic.ts           # Basic provider CRUD operations
    ├── provider-locations.ts       # Location-related queries
    ├── provider-performance.ts     # Performance metrics queries
    ├── provider-goals.ts           # Goal-related queries
    └── providers.ts                # Main index (re-exports)
```

## Implementation Guidelines

### Backward Compatibility
- Maintain all existing function signatures
- Keep the main `providers.ts` file as a re-export index
- Add deprecation warnings for direct sub-module imports
- Ensure no breaking changes to existing API

### Code Quality Standards
- Add comprehensive JSDoc documentation
- Include TypeScript strict mode compliance
- Add unit tests for each extracted module
- Follow established naming conventions

### Testing Strategy
- Unit tests for each new module
- Integration tests for complex queries
- Performance benchmarks for query functions
- Backward compatibility tests

## Risk Assessment

### Low Risk
- Type extraction (no runtime impact)
- Utility function separation
- Documentation improvements

### Medium Risk
- Query builder extraction
- Data transformer separation
- Import statement updates

### High Risk
- Complex SQL query refactoring
- Performance metrics system changes
- Goal integration modifications

## Success Criteria

### Functional Requirements
- ✅ All existing functionality preserved
- ✅ No breaking changes to public API
- ✅ Improved code organization and readability
- ✅ Enhanced testability of individual components

### Technical Requirements
- ✅ Each file under 200 lines
- ✅ Single responsibility per module
- ✅ Comprehensive type safety
- ✅ Performance maintained or improved

### Maintainability Requirements
- ✅ Clear separation of concerns
- ✅ Easy to locate specific functionality
- ✅ Simplified testing and debugging
- ✅ Better code reusability

## Migration Plan

### Phase 1: Preparation
1. Create new directory structure
2. Set up empty files with proper exports
3. Add comprehensive tests for existing functionality

### Phase 2: Gradual Migration
1. Extract types first (safest)
2. Move utility functions
3. Separate query functions
4. Update import statements

### Phase 3: Validation
1. Run full test suite
2. Performance benchmarking
3. Code review and cleanup
4. Documentation updates

## Future Benefits

### Developer Experience
- Faster file navigation and code location
- Easier to understand specific functionality
- Simplified testing and debugging
- Better code reuse across modules

### Maintainability
- Easier to add new provider-related features
- Simplified performance optimization
- Better separation of business logic
- Reduced merge conflicts

### Performance
- Potential for better tree-shaking
- Easier to optimize specific query types
- Better caching strategies per module
- Simplified performance monitoring

## Detailed Implementation Steps

### Step 1: Create Type Modules

#### `src/lib/database/types/provider-types.ts`
```typescript
/**
 * Core provider type definitions
 * Extracted from providers.ts for better organization
 */

export interface ProviderFilters {
  search?: string;
  providerType?: string;
  status?: string;
  locationId?: string;
  page?: number;
  limit?: number;
  clinicId?: string;
  providerId?: string;
  includeInactive?: boolean;
  pagination?: {
    offset: number;
    limit: number;
  };
}

export interface ProviderWithLocations {
  id: string;
  name: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  providerType: string;
  status: string;
  clinic: {
    id: string;
    name: string;
  };
  locations: {
    id: string;
    locationId: string;
    locationName: string;
    locationAddress: string | null;
    isPrimary: boolean;
    isActive: boolean;
    startDate: Date;
    endDate: Date | null;
  }[];
  primaryLocation?: {
    id: string;
    name: string;
    address: string | null;
  };
  _count: {
    locations: number;
    hygieneProduction: number;
    dentistProduction: number;
  };
}

// Additional interfaces...
```

#### `src/lib/database/types/performance-types.ts`
```typescript
/**
 * Performance metrics type definitions
 */

export interface ProviderPerformanceMetrics {
  providerId: string;
  providerName: string;
  locationId: string;
  locationName: string;
  periodStart: Date;
  periodEnd: Date;
  totalProduction: number;
  avgDailyProduction: number;
  productionDays: number;
  productionGoal?: number;
  variancePercentage?: number;
}

export interface RawDentistPerformanceRow {
  provider_id: string;
  provider_name: string;
  location_id: string;
  location_name: string;
  period_start: string;
  period_end: string;
  total_production: string | null;
  avg_daily_production: string | null;
  production_days: string | number;
  production_goal: string | null;
}

// Additional performance interfaces...
```

### Step 2: Create Query Builders

#### `src/lib/database/builders/provider-query-builder.ts`
```typescript
import { Prisma } from '@prisma/client';
import type { ProviderFilters } from '../types/provider-types';

/**
 * Build common where clause for provider queries
 */
export function buildProviderWhereClause(params: {
  providerId?: string;
  clinicId?: string;
  providerType?: string;
  status?: string;
  includeInactive?: boolean;
  locationId?: string;
}): Prisma.ProviderWhereInput {
  // Implementation moved from providers.ts
}

/**
 * Build common query options for provider queries
 */
export function buildProviderQueryOptions(
  whereClause: Prisma.ProviderWhereInput,
  pagination?: { offset: number; limit: number }
) {
  // Implementation moved from providers.ts
}

export const providerQueryArgs = Prisma.validator<Prisma.ProviderFindManyArgs>()({
  // Configuration moved from providers.ts
});
```

### Step 3: Create Core Query Modules

#### `src/lib/database/queries/provider-basic.ts`
```typescript
import { prisma } from '@/lib/database/client';
import type { ProviderFilters, ProviderWithLocations } from '../types/provider-types';
import { buildProviderWhereClause, buildProviderQueryOptions } from '../builders/provider-query-builder';
import { transformProviderData } from '../transformers/provider-transformers';

/**
 * Get all providers with their location relationships
 */
export async function getProvidersWithLocations(
  params?: ProviderFilters
): Promise<ProviderWithLocations[]> {
  // Implementation moved from providers.ts
}

/**
 * Get providers with pagination
 */
export async function getProvidersWithLocationsPaginated(
  params?: ProviderFilters
): Promise<{ providers: ProviderWithLocations[]; total: number }> {
  // Implementation moved from providers.ts
}

// Additional basic query functions...
```

### Step 4: Update Main Index File

#### `src/lib/database/queries/providers.ts` (Refactored)
```typescript
/**
 * Provider Queries - Main Index
 *
 * This file re-exports all provider-related query functions
 * for backward compatibility while maintaining organized code structure.
 */

// Type exports
export type {
  ProviderFilters,
  ProviderWithLocations,
  ProviderPerformanceMetrics,
} from '../types/provider-types';

export type {
  RawDentistPerformanceRow,
  RawHygienistPerformanceRow,
} from '../types/performance-types';

// Basic provider queries
export {
  getProvidersWithLocations,
  getProvidersWithLocationsPaginated,
  getProviderWithLocationDetails,
  getProvidersByLocation,
} from './provider-basic';

// Location-related queries
export {
  getProviderLocationSummary,
} from './provider-locations';

// Performance queries
export {
  getProviderPerformanceByLocation,
  getProviderPerformanceMetrics,
} from './provider-performance';

// Goal queries
export {
  fetchProviderGoals,
} from './provider-goals';

// Utility functions
export {
  calculatePeriodDates,
  aggregateProductionByLocation,
} from '../utils/performance-utils';
```

## Implementation Checklist

### Phase 1: Type Extraction ✅
- [ ] Create `src/lib/database/types/provider-types.ts`
- [ ] Create `src/lib/database/types/performance-types.ts`
- [ ] Move all interfaces and types
- [ ] Add comprehensive JSDoc documentation
- [ ] Verify TypeScript compilation

### Phase 2: Utility Extraction ✅
- [ ] Create `src/lib/database/builders/provider-query-builder.ts`
- [ ] Create `src/lib/database/transformers/provider-transformers.ts`
- [ ] Create `src/lib/database/utils/performance-utils.ts`
- [ ] Move utility functions
- [ ] Add unit tests for utilities

### Phase 3: Query Separation ✅
- [ ] Create `src/lib/database/queries/provider-basic.ts`
- [ ] Create `src/lib/database/queries/provider-locations.ts`
- [ ] Create `src/lib/database/queries/provider-performance.ts`
- [ ] Create `src/lib/database/queries/provider-goals.ts`
- [ ] Move query functions to appropriate modules

### Phase 4: Integration ✅
- [ ] Update main `providers.ts` to re-export functions
- [ ] Update import statements in consuming files
- [ ] Run comprehensive test suite
- [ ] Performance benchmarking
- [ ] Code review and cleanup

### Phase 5: Documentation ✅
- [ ] Update API documentation
- [ ] Add migration guide for developers
- [ ] Update code comments and JSDoc
- [ ] Create architectural decision record (ADR)

## Rollback Plan

If issues arise during refactoring:

1. **Immediate Rollback**: Keep original `providers.ts` as `providers.backup.ts`
2. **Gradual Rollback**: Revert individual modules while keeping others
3. **Import Rollback**: Update import statements back to original file
4. **Test Validation**: Ensure all tests pass after rollback

---

**Estimated Effort**: 2-3 days (16-24 hours)
**Risk Level**: Medium
**Priority**: Medium-High (Technical Debt)
**Dependencies**: None (can be done incrementally)
**Next Steps**: Create GitHub issue and assign to development team
