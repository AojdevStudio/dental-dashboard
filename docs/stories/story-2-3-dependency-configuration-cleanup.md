# Story 2.3: Dependency and Configuration Cleanup

## Status: Draft

## Story

- As a **Backend Developer**
- I want to **remove Google Sheets integration dependencies and clean up configuration**
- so that **the application has a lighter dependency footprint and cleaner configuration**

## Acceptance Criteria (ACs)

- AC1: Remove Google APIs npm dependencies (googleapis, google-auth-library)
- AC2: Clean up Google OAuth environment variable configurations
- AC3: Remove Google Sheets related TypeScript type definitions
- AC4: Update package.json to remove unused Google dependencies
- AC5: Clean up any Google Sheets related configuration files or constants
- AC6: Remove Google OAuth scope configurations and constants
- AC7: Ensure Supabase database migrations and Apps Script deployment remain unaffected

## Tasks / Subtasks

- [ ] Task 1: Remove Google APIs dependencies (AC1, AC4)
  - [ ] Remove `googleapis` package from package.json
  - [ ] Remove `google-auth-library` dependency
  - [ ] Remove any other Google Sheets specific packages
  - [ ] Run dependency audit and clean up unused packages
  - [ ] Update lockfile after dependency removal
- [ ] Task 2: Clean up environment variables and configuration (AC2, AC5, AC6)
  - [ ] Remove Google OAuth client ID environment variables
  - [ ] Remove Google OAuth client secret configurations
  - [ ] Remove Google OAuth scope constants and configurations
  - [ ] Clean up Google API credentials from environment files
  - [ ] Remove Google Sheets specific configuration constants
- [ ] Task 3: Remove type definitions and interfaces (AC3)
  - [ ] Remove Google Sheets API response type definitions
  - [ ] Remove Google OAuth token type interfaces
  - [ ] Remove column mapping type definitions
  - [ ] Remove Google Sheets data source type definitions
  - [ ] Clean up any Google Sheets related utility types
- [ ] Task 4: Validate Apps Script preservation (AC7)
  - [ ] Ensure Google Apps Script deployment scripts remain intact
  - [ ] Verify Apps Script environment variables are preserved
  - [ ] Confirm Apps Script → Supabase integration remains functional
  - [ ] Test Apps Script deployment pipeline continues working

## Dev Notes

**Dependencies to Remove:**
- `googleapis` - Google APIs client library
- `google-auth-library` - Google OAuth authentication
- Any Google Sheets specific utility packages

**Configuration Cleanup:**
- Google OAuth client credentials (dashboard-side only)
- Google OAuth scopes and redirect URIs
- Google Sheets API configuration constants
- Column mapping configuration interfaces

**Critical Preservation:**
- Apps Script deployment infrastructure in `/gas` directory
- Apps Script environment variables and deployment scripts
- Supabase connection and authentication systems
- One-way data flow: Google Sheets → Apps Script → Supabase

**Source Tree Context:**
- Dependencies: `package.json` and `pnpm-lock.yaml`
- Types: `/src/types/` directory for Google-related interfaces
- Configuration: Environment variable files and constants
- Apps Script: `/gas` directory remains completely untouched

### Testing

Dev Note: Story Requires the following tests:

- [ ] Jest Unit Tests: (nextToFile: true), coverage requirement: 80%
- [ ] Build validation tests to ensure clean compilation
- [ ] Apps Script deployment test: location: `/tests/gas/deployment-preservation.test.ts`

Manual Test Steps:
- Run `pnpm install` and verify no Google Sheets dependencies remain
- Build application successfully without Google APIs dependencies
- Test Apps Script deployment continues working
- Verify environment configuration is clean of Google OAuth variables
- Confirm no TypeScript compilation errors after type cleanup

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