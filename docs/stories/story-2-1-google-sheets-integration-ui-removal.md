# Story 2.1: Google Sheets Integration UI Removal

## Status: Draft

## Story

- As a **Frontend Developer**
- I want to **remove all Google Sheets integration UI components from the dashboard**
- so that **the application has a cleaner interface without unused features**

## Acceptance Criteria (ACs)

- AC1: Remove Google OAuth login/connection UI components
- AC2: Remove column mapping interface and related forms
- AC3: Remove Google Sheets data source management pages
- AC4: Update navigation to remove Google Sheets integration menu items
- AC5: Remove any Google Sheets status indicators or connection widgets
- AC6: Ensure all remaining dashboard pages function normally
- AC7: Update any help text or documentation that references Google Sheets integration

## Tasks / Subtasks

- [ ] Task 1: Remove Google OAuth UI components (AC1)
  - [ ] Remove Google OAuth login buttons and authentication forms
  - [ ] Remove Google account connection status displays
  - [ ] Remove Google OAuth callback success/error pages
  - [ ] Remove Google authentication flow components
- [ ] Task 2: Remove column mapping interface (AC2)
  - [ ] Remove column mapping configuration forms
  - [ ] Remove Google Sheets column selection dropdowns
  - [ ] Remove metric mapping interface components
  - [ ] Remove column mapping validation and preview components
- [ ] Task 3: Remove data source management UI (AC3)
  - [ ] Remove Google Sheets data source creation pages
  - [ ] Remove Google Sheets connection management interface
  - [ ] Remove Google Sheets sync status displays
  - [ ] Remove Google Sheets configuration settings pages
- [ ] Task 4: Update navigation and help content (AC4, AC5, AC7)
  - [ ] Remove Google Sheets integration menu items from navigation
  - [ ] Remove Google Sheets status widgets from dashboard
  - [ ] Update help text to remove Google Sheets references
  - [ ] Remove Google Sheets integration from user guides

## Dev Notes

**UI Components to Preserve:**
- All existing dashboard metrics displays (these read from Supabase)
- Provider performance charts and KPI widgets
- Navigation for existing dashboard functionality
- User authentication (Supabase Auth) remains unchanged

**Architectural Context:**
- Removing pull-based Google Sheets integration from dashboard
- Preserving one-way data flow: Google Sheets → Apps Script → Supabase ← Dashboard
- Google Apps Script infrastructure remains active and unchanged

**Source Tree Context:**
- UI components likely in `/src/components/` and `/src/app/` directories
- Navigation components in layout files
- Form components related to Google OAuth and column mapping
- Settings/admin pages with Google integration options

### Testing

Dev Note: Story Requires the following tests:

- [ ] Jest Unit Tests: (nextToFile: true), coverage requirement: 80%
- [ ] Cypress E2E: location: `/e2e/ui/navigation-cleanup.test.ts`

Manual Test Steps:
- Navigate through entire dashboard to ensure no broken links
- Verify all existing dashboard functionality still works
- Confirm no Google Sheets references remain in UI
- Test that provider metrics and KPI displays function normally

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