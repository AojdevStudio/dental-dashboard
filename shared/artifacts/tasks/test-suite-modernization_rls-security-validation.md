# Task: Implement RLS Security Validation Tests

## Description
Create comprehensive E2E tests specifically for validating the AOJ-65 RLS (Row Level Security) implementation. These tests must verify multi-tenant data isolation, authentication-based access control, and prevent security regressions.

## Dependencies
- test-suite-modernization_test-database-setup.md
- test-suite-modernization_migrate-server-component-tests.md

## Acceptance Criteria
- [ ] Create RLS validation test suite
- [ ] Test multi-tenant data isolation scenarios
- [ ] Verify authentication-based access control
- [ ] Test unauthorized access attempts
- [ ] Validate cross-tenant data leakage prevention
- [ ] Implement security regression tests

## Technical Requirements
- Implementation approach: Comprehensive E2E security testing
- Performance constraints: Security tests must be thorough
- Security considerations: This IS the security validation

## Definition of Done
- [ ] All acceptance criteria met
- [ ] All RLS policies thoroughly tested
- [ ] Security vulnerabilities identified and documented
- [ ] Test suite prevents security regressions
- [ ] Security team review completed

## Test Scenarios
Detailed scenarios that Test Writer should cover:
- User can only see their clinic's data
- Admin can see multiple clinic data based on permissions
- Unauthorized access returns empty results
- Direct database manipulation respects RLS
- Token-based authentication validation
- Session invalidation testing

## Implementation Notes
- Use multiple test users with different permissions
- Test all database tables with RLS policies
- Include negative test cases (what should fail)
- Document security test patterns
- Critical for production deployment confidence
- Work closely with requirements from AOJ-65