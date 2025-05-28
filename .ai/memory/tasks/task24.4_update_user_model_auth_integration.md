---
id: 24.4
title: 'Phase 2 - Update User Model for Auth Integration'
status: completed
priority: critical
feature: Database Migration & Auth Integration
dependencies:
  - 24.3
assigned_agent: null
created_at: "2025-05-23T23:56:40Z"
started_at: null
completed_at: null
error_log: null
---

## Description

Carefully migrate User model to reference Supabase auth.users. Handle ID type conversion and foreign key constraints.

## Details

- Analyze current User model:
  - Document all foreign key relationships
  - Identify all queries using User.id
  - List all tables referencing User
- Create migration strategy for ID change:
  - Add new `auth_id` UUID field to User table
  - Populate `auth_id` with Supabase auth user IDs
  - Create mapping table for old ID to new UUID
  - Update foreign key constraints incrementally
- Implement dual-ID support phase:
  - Keep both old String ID and new UUID temporarily
  - Update queries to handle both ID types
  - Add database triggers for consistency
- Update Prisma schema:
  - Modify User model to reference auth.users
  - Update ID field type from String to UUID
  - Adjust all relationships accordingly
- Handle edge cases:
  - Users without Supabase accounts
  - Orphaned records
  - Data integrity violations
- Create data migration scripts:
  - Batch processing for large datasets
  - Progress tracking and resumability
  - Error handling and logging
- Update application code:
  - Auth context integration
  - Session management updates
  - User lookup modifications

## Test Strategy

- Test ID migration on subset of users first
- Verify all foreign key relationships maintain integrity
- Ensure no data loss during conversion
- Test application functionality with both ID types
- Validate auth integration works correctly

## Agent Notes

This is the most critical and risky phase. Must be executed with extreme care to avoid breaking user authentication and data relationships. 