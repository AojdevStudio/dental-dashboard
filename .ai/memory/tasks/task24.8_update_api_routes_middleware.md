---
id: 24.8
title: 'Phase 6 - Update API Routes & Middleware'
status: completed
priority: high
feature: Database Migration & Auth Integration
dependencies:
  - 24.7
assigned_agent: null
created_at: "2025-05-23T23:56:40Z"
started_at: null
completed_at: null
error_log: null
---

## Description

Modify all API routes to use updated database queries, ensure proper auth context, and implement RLS-aware data access.

## Details

- Update API route handlers:
  - `/api/auth/*` - Full auth integration
  - `/api/metrics/*` - Multi-tenant metrics access
  - `/api/goals/*` - Clinic-scoped goal management
  - `/api/clinics/*` - Access control updates
  - `/api/users/*` - Auth user integration
  - `/api/google-sheets/*` - Tenant-isolated sync
  - `/api/export/*` - Filtered data exports
- Implement auth middleware enhancements:
  - Extract user context from session
  - Validate clinic access permissions
  - Add request context enrichment
  - Implement role-based access
- Update request/response handling:
  - UUID parameter validation
  - Proper error responses
  - Consistent status codes
  - Enhanced error messages
- Add security layers:
  - Rate limiting per tenant
  - Request validation
  - Input sanitization
  - Output filtering
- Implement API versioning:
  - Support both old and new patterns
  - Deprecation warnings
  - Migration period headers
  - Version negotiation
- Update API documentation:
  - New parameter formats
  - Auth requirements
  - Multi-tenant behavior
  - Breaking changes
- Add monitoring/logging:
  - Request tracking
  - Performance metrics
  - Error logging
  - Audit trail
- Handle edge cases:
  - Missing auth context
  - Invalid clinic access
  - Legacy API calls
  - Service-level access

## Test Strategy

- Test each API endpoint individually
- Verify auth context is properly enforced
- Test multi-tenant data isolation
- Load test with new auth layer
- Test API version compatibility

## Agent Notes

API layer is user-facing. Changes must be carefully tested to avoid breaking client applications. 