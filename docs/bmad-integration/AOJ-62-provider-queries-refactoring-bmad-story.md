# BMAD Story: AOJ-62 - Provider Queries Refactoring

## Story Overview

**Linear Issue**: AOJ-62 - Provider Queries Refactoring  
**BMAD Priority**: Medium-High (Technical Debt)  
**Estimated Timeline**: 2-3 Days  
**Agent Assignment**: Dev Agent with QA Agent validation  
**Story Type**: Technical Debt Refactoring  

---

## Background Context

The `src/lib/database/queries/providers.ts` file has grown to **891 lines** with cognitive complexity exceeding safe thresholds (33/25). This violates Single Responsibility Principle and creates maintenance challenges. The file contains multiple concerns that need to be separated into focused modules.

**Current Technical Debt**:
- 891-line monolithic file
- 6 distinct areas of responsibility mixed together
- 12 exported functions with varying complexity
- Complex SQL queries (100+ lines each) embedded in business logic
- Type definitions, query builders, transformers, and data access all mixed

---

## BMAD Implementation Strategy

### Agent Selection Rationale
- **Primary Agent**: Dev Agent - Handles systematic refactoring with TDD approach
- **Supporting Agent**: QA Agent - Validates refactoring maintains functionality
- **Architecture Review**: Brief architect validation on new module structure

### User Stories & Acceptance Criteria

#### Epic: Decompose Provider Queries Monolith
*As a developer, I want provider-related functionality organized into focused modules so that I can maintain and extend the codebase efficiently.*

#### Story 1: Extract Type Definitions
**Agent**: Dev Agent  
**Priority**: High (Foundation)  
**Effort**: 2 hours  

**Acceptance Criteria**:
- [ ] All provider interfaces moved to `src/lib/database/types/provider-types.ts`
- [ ] All performance interfaces moved to `src/lib/database/types/performance-types.ts`  
- [ ] Original file imports new type modules
- [ ] TypeScript compilation successful
- [ ] No runtime behavior changes

**Implementation Notes**:
- Preserve all existing type definitions exactly
- Add comprehensive JSDoc documentation
- Maintain backward compatibility through re-exports

#### Story 2: Extract Query Builders & Transformers
**Agent**: Dev Agent  
**Priority**: High (Core Utilities)  
**Effort**: 3 hours  

**Acceptance Criteria**:
- [ ] Query building logic moved to `src/lib/database/builders/provider-query-builder.ts`
- [ ] Data transformation logic moved to `src/lib/database/transformers/provider-transformers.ts`
- [ ] Performance utilities moved to `src/lib/database/utils/performance-utils.ts`
- [ ] All utility functions unit tested
- [ ] Original functionality preserved

**Implementation Notes**:
- Extract `buildProviderWhereClause()`, `buildProviderQueryOptions()`, `providerQueryArgs`
- Extract `transformProviderData()` and related transformers
- Extract `calculatePeriodDates()`, `aggregateProductionByLocation()`

#### Story 3: Decompose Core Queries  
**Agent**: Dev Agent  
**Priority**: High (Main Refactoring)  
**Effort**: 4 hours  

**Acceptance Criteria**:
- [ ] Basic provider queries in `src/lib/database/queries/provider-basic.ts`
- [ ] Location queries in `src/lib/database/queries/provider-locations.ts` 
- [ ] Performance queries in `src/lib/database/queries/provider-performance.ts`
- [ ] Goal queries in `src/lib/database/queries/provider-goals.ts`
- [ ] Each file under 200 lines
- [ ] Integration tests pass

**Query Distribution**:
- **Basic**: `getProvidersWithLocations()`, `getProvidersWithLocationsPaginated()`, `getProviderWithLocationDetails()`, `getProvidersByLocation()`
- **Locations**: `getProviderLocationSummary()`, location-specific queries
- **Performance**: `getProviderPerformanceByLocation()`, `getProviderPerformanceMetrics()`, raw SQL queries
- **Goals**: `fetchProviderGoals()`, goal achievement calculations

#### Story 4: Integration & Validation
**Agent**: QA Agent + Dev Agent  
**Priority**: Critical (Quality Assurance)  
**Effort**: 3 hours  

**Acceptance Criteria**:
- [ ] Main `providers.ts` file refactored to re-export all functions
- [ ] All import statements updated in consuming files
- [ ] Comprehensive test suite passes (100% of existing tests)
- [ ] Performance benchmarks within 5% of original
- [ ] No breaking changes to public API

**Files Requiring Import Updates**:
- `src/app/api/providers/route.ts`
- `src/hooks/use-providers.ts`  
- `src/types/providers.ts`
- Any other consumers of provider queries

---

## Implementation Workflow

### Phase 1: Foundation Setup (Day 1 Morning)
```bash
# TDD Approach: Start with comprehensive tests
/project:init-agentic-tdd 'AOJ-62-provider-queries-refactoring'

# Task planning with atomic breakdown
cd trees/task-planner && claude
/project:wave1-task-planning 'docs/prds/backlog/provider-queries-refactoring-plan.md'
```

### Phase 2: Test-First Development (Day 1-2)
```bash
# Generate comprehensive failing tests for all modules
cd ../test-writer && claude  
/project:wave2-test-writing

# Focus on:
# - Type definition correctness
# - Query builder functionality  
# - Data transformer accuracy
# - API contract preservation
```

### Phase 3: Systematic Refactoring (Day 2-3)
```bash
# Implement production code to make tests pass
cd ../code-writer && claude
/project:wave3-code-writing

# Follow strict sequence:
# 1. Extract types (safest, no runtime impact)
# 2. Extract utilities (isolated functionality)  
# 3. Decompose queries (main complexity)
# 4. Update imports (integration)
```

### Phase 4: Integration & Cleanup (Day 3)
```bash
# Final integration and validation
cd ../../ && claude
/project:cleanup-agentic-tdd 'AOJ-62-provider-queries-refactoring'

# Comprehensive validation:
# - All tests passing
# - Performance within limits
# - API contracts preserved
# - Documentation updated
```

---

## File Structure After Refactoring

```
src/lib/database/
├── types/
│   ├── provider-types.ts           # Core provider interfaces  
│   └── performance-types.ts        # Performance metrics types
├── builders/
│   └── provider-query-builder.ts   # Query construction utilities
├── transformers/
│   └── provider-transformers.ts    # Data transformation functions
├── utils/
│   └── performance-utils.ts        # Performance calculation utilities
└── queries/
    ├── provider-basic.ts           # CRUD operations (150 lines)
    ├── provider-locations.ts       # Location queries (120 lines) 
    ├── provider-performance.ts     # Performance metrics (180 lines)
    ├── provider-goals.ts           # Goal management (100 lines)
    └── providers.ts                # Main index with re-exports (80 lines)
```

---

## Quality Gates & Validation

### Pre-Refactoring Checklist
- [ ] Comprehensive test coverage of existing functionality
- [ ] Performance baseline measurements captured
- [ ] API contract documentation created
- [ ] Rollback plan prepared

### During Refactoring Validation  
- [ ] TypeScript compilation after each module extraction
- [ ] Unit tests passing for each extracted module
- [ ] Integration tests validating combined functionality
- [ ] Import dependency validation

### Post-Refactoring Quality Gates
- [ ] **Functionality**: All existing API contracts preserved
- [ ] **Performance**: <5% degradation in query execution time
- [ ] **Maintainability**: Each file under 200 lines, single responsibility
- [ ] **Testability**: Improved unit test coverage for individual modules
- [ ] **Documentation**: Updated JSDoc and architectural documentation

---

## Risk Mitigation

### Technical Risks
- **Import Chain Breakage**: Systematic import update with validation
- **Query Behavior Changes**: Comprehensive integration testing
- **Performance Regression**: Before/after benchmarking

### Mitigation Strategies  
- **Incremental Approach**: Extract modules one at a time with validation
- **Backward Compatibility**: Main providers.ts maintains all exports
- **Rollback Plan**: Keep original file as backup until validation complete
- **Comprehensive Testing**: Test existing functionality before and after

---

## Success Metrics

### Code Quality Improvements
- **Lines per File**: 891 lines → 5 files averaging 130 lines each
- **Cognitive Complexity**: Reduced from 33 to <10 per function
- **Maintainability Index**: Improved through single responsibility  
- **Test Coverage**: Enhanced unit testing for individual modules

### Development Experience Improvements
- **Feature Development**: Easier to add new provider-related features
- **Bug Resolution**: Faster to locate and fix issues in focused modules
- **Code Navigation**: Intuitive file organization by responsibility
- **Team Collaboration**: Reduced merge conflicts through smaller files

---

## Linear Integration

### Issue Updates During Implementation
- **In Progress**: When starting agentic TDD workflow
- **Review**: When Wave 3 complete, all modules extracted and tested
- **Done**: When cleanup complete, all quality gates passed

### Final Deliverables
- [ ] Refactored modular code structure
- [ ] Comprehensive test suite covering all modules
- [ ] Performance validation report  
- [ ] Updated documentation reflecting new architecture
- [ ] Linear issue marked complete with evidence

---

*This BMAD story implements systematic refactoring using TDD methodology to decompose a complex monolithic file into maintainable, focused modules while preserving all existing functionality and improving code quality metrics.*