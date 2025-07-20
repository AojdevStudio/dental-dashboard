# Story 1.3: Provider Queries Refactoring and Modularization

## Status: Incomplete - Prerequisites Pending

## Story
- As a software developer maintaining the provider management system
- I want the monolithic 891-line provider queries file refactored into focused, testable modules
- so that the codebase becomes more maintainable, testable, and extensible while preserving all existing functionality

## Background Context
**Linear Issue**: AOJ-62  
**Priority**: Medium-High (Technical Debt)  
**Current Problem**: `src/lib/database/queries/providers.ts` has grown to 891 lines with multiple responsibilities  
**Technical Debt**: File violates Single Responsibility Principle with 6 distinct areas of concern

## Acceptance Criteria (ACs)

### AC1: Modular File Structure Implementation
- [ ] 891-line monolithic file decomposed into focused modules under 200 lines each
- [ ] Type definitions extracted to `src/lib/database/types/provider-types.ts`
- [ ] Performance types separated into `src/lib/database/types/performance-types.ts`
- [ ] Query builders modularized in `src/lib/database/builders/provider-query-builder.ts`
- [ ] Data transformers isolated in `src/lib/database/transformers/provider-transformers.ts`

### AC2: Functional Separation and Organization
- [ ] Basic provider queries grouped in `src/lib/database/queries/provider-basic.ts`
- [ ] Location-related queries organized in `src/lib/database/queries/provider-locations.ts`
- [ ] Performance metrics queries isolated in `src/lib/database/queries/provider-performance.ts`
- [ ] Goal management separated into `src/lib/database/queries/provider-goals.ts`
- [ ] Utility functions extracted to `src/lib/database/utils/performance-utils.ts`

### AC3: Backward Compatibility and API Preservation
- [ ] All existing function signatures maintained without breaking changes
- [ ] Main `providers.ts` file converted to re-export index for backward compatibility
- [ ] All consuming files continue to work without import statement changes
- [ ] API contracts preserved: same inputs, same outputs, same error handling
- [ ] Zero functional regression in existing provider workflows

### AC4: Code Quality and Testing Enhancement
- [ ] Each new module under 200 lines with single responsibility
- [ ] Comprehensive JSDoc documentation added to all extracted functions
- [ ] TypeScript strict mode compliance maintained across all modules
- [ ] Unit tests created for each extracted module with 90%+ coverage
- [ ] Integration tests validating inter-module communication

## Tasks / Subtasks

### Task 1: Type System Extraction (AC1)
- [ ] Create `src/lib/database/types/provider-types.ts` with all provider interfaces
- [ ] Move `ProviderFilters`, `ProviderWithLocations`, `ProviderPerformanceMetrics` interfaces
- [ ] Create `src/lib/database/types/performance-types.ts` for performance-specific types
- [ ] Move `RawDentistPerformanceRow`, `RawHygienistPerformanceRow` interfaces
- [ ] Add comprehensive JSDoc documentation for all type definitions

### Task 2: Query Utilities Modularization (AC1)
- [ ] Create `src/lib/database/builders/provider-query-builder.ts`
- [ ] Extract `buildProviderWhereClause()` and `buildProviderQueryOptions()` functions
- [ ] Move `providerQueryArgs` constant and query validation utilities
- [ ] Create `src/lib/database/transformers/provider-transformers.ts`
- [ ] Extract `transformProviderData()` and data normalization utilities

### Task 3: Core Query Separation (AC2)
- [ ] Create `src/lib/database/queries/provider-basic.ts` with CRUD operations
- [ ] Move `getProvidersWithLocations()`, `getProvidersWithLocationsPaginated()` functions
- [ ] Extract `getProviderWithLocationDetails()`, `getProvidersByLocation()` functions
- [ ] Create `src/lib/database/queries/provider-locations.ts`
- [ ] Move `getProviderLocationSummary()` and location relationship management

### Task 4: Performance System Extraction (AC2)
- [ ] Create `src/lib/database/queries/provider-performance.ts`
- [ ] Move `getProviderPerformanceByLocation()`, `getProviderPerformanceMetrics()` functions
- [ ] Extract complex raw SQL performance queries (100+ lines each)
- [ ] Create `src/lib/database/utils/performance-utils.ts`
- [ ] Move `calculatePeriodDates()`, `aggregateProductionByLocation()` utility functions

### Task 5: Goal Integration and Performance Utilities (AC2)
- [ ] Create `src/lib/database/queries/provider-goals.ts`
- [ ] Extract `fetchProviderGoals()` and goal achievement calculations
- [ ] Move goal-performance integration logic
- [ ] Implement period calculation utilities in performance-utils
- [ ] Create goal-related type definitions and validation

### Task 6: Integration Index and Backward Compatibility (AC3)
- [ ] Refactor main `src/lib/database/queries/providers.ts` as re-export index
- [ ] Re-export all functions from sub-modules maintaining original API
- [ ] Add deprecation notices for direct sub-module imports
- [ ] Update import statements in consuming files: API routes, hooks, components
- [ ] Validate zero breaking changes through comprehensive testing

### Task 7: Testing and Documentation (AC4)
- [ ] Create unit test suites for each extracted module
- [ ] Implement integration tests validating module communication
- [ ] Add performance benchmarking tests for complex query functions
- [ ] Create backward compatibility test suite
- [ ] Document migration patterns and architectural decisions

## Dev Notes

### Technical Architecture Context
- **File Complexity**: Current 891-line file with 12 functions, 8 interfaces, 6 responsibilities
- **Decomposition Target**: 8 focused modules under 200 lines each
- **Framework**: Next.js 15 + TypeScript + Prisma with existing quality standards
- **Testing**: Maintain 90%+ coverage with comprehensive unit and integration tests

### Current File Structure Analysis
```
Total Lines: 891

1. Type Definitions (Lines 1-285)
   - ProviderFilters, ProviderWithLocations interfaces
   - Performance row interfaces, Location summary interfaces

2. Query Building Utilities (Lines 86-199)  
   - buildProviderWhereClause(), buildProviderQueryOptions()
   - providerQueryArgs constant

3. Data Transformation (Lines 200-237)
   - transformProviderData()

4. Core Provider Queries (Lines 287-628)
   - getProvidersWithLocations(), getProviderPerformanceByLocation()
   - getProvidersByLocation(), getProviderLocationSummary()

5. Performance Metrics System (Lines 629-890)
   - calculatePeriodDates(), aggregateProductionByLocation()
   - fetchProviderGoals(), getProviderPerformanceMetrics()
```

### Refactoring Strategy
**Phase-based decomposition with backward compatibility preservation:**

```typescript
// Target structure after refactoring
src/lib/database/
├── types/
│   ├── provider-types.ts           # Provider interfaces (50 lines)
│   └── performance-types.ts        # Performance types (40 lines)
├── builders/
│   └── provider-query-builder.ts   # Query building (120 lines)
├── transformers/
│   └── provider-transformers.ts    # Data transformation (80 lines)
├── utils/
│   └── performance-utils.ts        # Utility functions (100 lines)
└── queries/
    ├── provider-basic.ts           # Basic CRUD (150 lines)
    ├── provider-locations.ts       # Location queries (120 lines)
    ├── provider-performance.ts     # Performance queries (180 lines)
    ├── provider-goals.ts           # Goal queries (100 lines)
    └── providers.ts                # Re-export index (50 lines)
```

### Backward Compatibility Strategy
```typescript
// Main providers.ts becomes re-export index
export type {
  ProviderFilters,
  ProviderWithLocations,
  ProviderPerformanceMetrics,
} from '../types/provider-types';

// Re-export all functions maintaining original API
export {
  getProvidersWithLocations,
  getProvidersWithLocationsPaginated,
  getProviderWithLocationDetails,
} from './provider-basic';

export {
  getProviderPerformanceByLocation,
  getProviderPerformanceMetrics,
} from './provider-performance';

// Preserve all existing function signatures and behavior
```

### AI Implementation Guardrails
**CRITICAL**: This refactoring requires careful incremental approach
- **Backward Compatibility First**: Preserve all existing APIs and function signatures
- **Incremental Migration**: One module at a time with validation at each step
- **Test-Driven Decomposition**: Validate functionality before and after each extraction
- **Import Preservation**: Maintain existing import patterns for consuming code

### Risk Mitigation Strategy
- **Rollback Plan**: Keep original `providers.ts` as `providers.backup.ts`
- **Gradual Migration**: Extract types first (safest), then utilities, then queries
- **Comprehensive Testing**: Full test suite validation after each module extraction
- **Performance Validation**: Benchmark complex queries to ensure no performance regression

### Testing

Dev Note: Story Requires the following tests:

- [ ] **Unit Tests**: (nextToFile: true), coverage requirement: 90%
  - Individual module functionality validation
  - Query builder logic testing
  - Data transformation accuracy
  - Performance utility calculations

- [ ] **Integration Tests** (Test Location: tests/integration/provider-refactoring/)
  - Inter-module communication validation
  - API contract preservation testing
  - Complex query workflow validation
  - Performance benchmarking for extracted queries

- [ ] **Backward Compatibility Tests**: (location: tests/integration/provider-compatibility/)
  - Existing API functionality validation
  - Consumer file import compatibility
  - Function signature preservation
  - Output format consistency validation

## Dev Agent Record

### Agent Model Used: 
*To be filled by implementing agent*

### Implementation Phases
- **Phase 1**: Type extraction and basic utilities (Day 1)
- **Phase 2**: Query builder and transformer separation (Day 1)
- **Phase 3**: Core query module separation (Day 2)
- **Phase 4**: Performance system extraction (Day 2)
- **Phase 5**: Integration, testing, and validation (Day 3)

### Complexity Metrics Targets
- **File Count**: 8 focused modules (from 1 monolithic file)
- **Line Count**: Each module <200 lines (from 891-line monolith)
- **Responsibility Count**: Single responsibility per module (from 6 mixed responsibilities)
- **Test Coverage**: 90%+ for each extracted module

### Debug Log References
*To be filled during implementation*

### Completion Notes List
*To be filled as tasks are completed*

### Change Log
*To be updated with each implementation session*

---

**Story Priority**: Medium-High (Technical Debt)  
**Estimated Complexity**: 6-8 implementation sessions (Careful refactoring required)  
**Dependencies**: None (can be done incrementally with rollback capability)  
**Linear Integration**: AOJ-62 - Refactor Provider Queries for Maintainability