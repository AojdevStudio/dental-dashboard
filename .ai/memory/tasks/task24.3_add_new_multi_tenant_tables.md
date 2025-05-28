---
id: 24.3
title: 'Phase 1 - Add New Multi-Tenant Tables'
status: completed
priority: critical
feature: Database Migration & Auth Integration
dependencies:
  - 24.2
assigned_agent: null
created_at: "2025-05-23T23:56:40Z"
started_at: null
completed_at: null
error_log: null
---

## Description

Add new tables (user_clinic_roles, goal_templates, financial_metrics, etc.) without breaking existing schema. Use additive approach.

## Details

- Create new Prisma schema additions:
  - `user_clinic_roles` table for multi-tenant user access
  - `goal_templates` table for reusable goal configurations
  - `financial_metrics` table for advanced financial tracking
  - `appointment_metrics` table for appointment analytics
  - `call_metrics` table for call tracking data
  - `patient_metrics` table for patient analytics
  - `metric_aggregations` table for pre-computed metrics
- Implement proper relationships:
  - Foreign keys to existing tables where applicable
  - Ensure nullable references during transition
  - Add appropriate indexes for query performance
- Add multi-tenant fields:
  - `clinic_id` on all new tables
  - `created_by` and `updated_by` audit fields
  - `created_at` and `updated_at` timestamps
- Create Prisma migrations:
  - Generate migration files
  - Review SQL for correctness
  - Add any custom SQL for constraints
- Update Prisma client:
  - Regenerate Prisma client
  - Verify type definitions are correct
  - Test basic CRUD operations
- Document new table purposes and relationships

## Test Strategy

- Verify new tables are created successfully
- Test that existing functionality is not broken
- Validate foreign key constraints work correctly
- Ensure indexes are created and used by queries
- Test multi-tenant data isolation

## Agent Notes

This is an additive phase - no existing tables should be modified, only new ones added. This ensures zero risk to existing functionality. 