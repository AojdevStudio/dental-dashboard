# Story 2.2: OAuth Flow and Authentication Cleanup

## Status: Draft

## Story

- As a **Frontend Developer**
- I want to **remove Google OAuth authentication flows from the dashboard**
- so that **the application no longer handles Google authentication complexity**

## Acceptance Criteria (ACs)

- AC1: Remove Google OAuth callback handling pages/components
- AC2: Remove Google authentication state management (context/store)
- AC3: Remove Google OAuth redirect logic and route handlers
- AC4: Clean up any Google authentication error handling
- AC5: Remove Google OAuth tokens from client-side storage/state
- AC6: Ensure user authentication (Supabase Auth) remains unaffected
- AC7: Remove any Google OAuth-related environment variable usage

## Tasks / Subtasks

- [ ] Task 1: Remove OAuth callback handling (AC1, AC3)
  - [ ] Remove `/api/google/callback` route handler
  - [ ] Remove Google OAuth callback pages in Next.js app directory
  - [ ] Remove OAuth redirect logic and URL handling
  - [ ] Remove OAuth authorization code processing
- [ ] Task 2: Clean up authentication state management (AC2, AC5)
  - [ ] Remove Google OAuth tokens from React context/state
  - [ ] Remove Google authentication state from Zustand store
  - [ ] Remove Google OAuth token storage utilities
  - [ ] Remove Google authentication refresh token logic
- [ ] Task 3: Remove error handling and environment usage (AC4, AC7)
  - [ ] Remove Google OAuth error handling components
  - [ ] Remove Google OAuth error messages and states
  - [ ] Remove Google OAuth environment variable references in frontend
  - [ ] Remove Google OAuth configuration from client-side code
- [ ] Task 4: Validate Supabase Auth preservation (AC6)
  - [ ] Ensure Supabase authentication flows remain intact
  - [ ] Verify user login/logout functionality works
  - [ ] Test session management and auth context
  - [ ] Validate protected route handling continues working

## Dev Notes

**Critical Preservation:**
- Supabase Auth must remain completely functional
- User authentication, session management, and protected routes unchanged
- Dashboard access control and role-based permissions preserved

**OAuth Cleanup Scope:**
- Google OAuth only - all Google authentication flows removed
- Google API client initialization removed from frontend
- Google OAuth tokens and refresh logic removed
- Google authentication error states and handling removed

**Source Tree Context:**
- OAuth routes: `/src/app/api/google/` directory
- Auth context: Check for Google OAuth in auth providers
- State management: Google OAuth tokens in stores/context
- Environment: Google OAuth client variables in frontend code

### Testing

Dev Note: Story Requires the following tests:

- [ ] Jest Unit Tests: (nextToFile: true), coverage requirement: 80%
- [ ] Cypress E2E: location: `/e2e/auth/supabase-auth-preservation.test.ts`

Manual Test Steps:
- Test Supabase user login and logout flows
- Verify dashboard access with proper authentication
- Confirm no Google OAuth redirect attempts occur
- Test protected routes still require authentication
- Validate session persistence works correctly

## Dev Agent Record

### Agent Model Used: {{Agent Model Name/Version}}

### Debug Log References

[[LLM: (Dev Agent) If the debug is logged to during the current story progress, create a table with the debug log and the specific task section in the debug log - do not repeat all the details in the story]]

### Completion Notes List

[[LLM: (Dev Agent) Anything the SM needs to know that deviated from the story that might impact drafting the next story.]]

### Change Log

[[LLM: (Dev Agent) Track document versions and changes during development that deviate from story dev start]]

| Date | Version | Description | Author |
| :--- | :------ | :---------- | :----- |