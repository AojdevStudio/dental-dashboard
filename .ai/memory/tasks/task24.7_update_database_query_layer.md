---
id: 24.7
title: 'Phase 5 - Update Database Query Layer'
status: completed
priority: high
feature: Database Migration & Auth Integration
dependencies:
  - 24.6
assigned_agent: null
created_at: "2025-05-23T23:56:40Z"
started_at: null
completed_at: null
error_log: null
---

## Description

Refactor all database queries in lib/database/queries/ to work with new auth-integrated schema and multi-tenant structure.

## Details

- Update query files in lib/database/queries/:
  - `metrics.ts` - Add clinic context filtering
  - `users.ts` - Integrate auth.users references
  - `clinics.ts` - Implement multi-tenant access
  - `goals.ts` - Update for new relationships
  - `google-sheets.ts` - Add tenant isolation
- Implement auth context in queries:
  - Add user context parameter to all functions
  - Implement clinic-based filtering
  - Add RLS-aware query patterns
  - Handle service-level queries
- Update query patterns:
  - Replace String IDs with UUID types
  - Add proper TypeScript types
  - Implement proper error handling
  - Add query logging/debugging
- Optimize query performance:
  - Review and update indexes usage
  - Implement query result caching
  - Add pagination where needed
  - Optimize complex joins
- Handle backward compatibility:
  - Support both old and new ID formats temporarily
  - Graceful fallbacks for missing data
  - Migration period query variants
- Create query utilities:
  - Common auth context helpers
  - Clinic access validators
  - ID format converters
  - Error standardization
- Update query tests:
  - Multi-tenant test scenarios
  - Auth context mocking
  - Performance benchmarks
  - Edge case coverage
- Document query changes:
  - Migration guide for developers
  - New query pattern examples
  - Performance considerations
  - Security best practices

## Test Strategy

- Unit test each updated query function
- Integration test with real database
- Verify multi-tenant isolation works
- Performance test critical queries
- Test backward compatibility scenarios

## Agent Notes

Query layer is critical for application functionality. Each change must maintain backward compatibility during migration period. 