# Story 3.1: Architecture Documentation Update

## Status: Draft

## Story

- As a **Technical Writer/Architect**
- I want to **update project documentation to reflect the removal of Google Sheets integration**
- so that **the documentation accurately describes the current system architecture**

## Acceptance Criteria (ACs)

- AC1: Update CLAUDE.md to remove Google Sheets integration references
- AC2: Update project README to reflect current data flow architecture
- AC3: Create clear documentation of Apps Script → Supabase one-way data flow
- AC4: Update API documentation to remove Google Sheets endpoints
- AC5: Update deployment guides to reflect simplified architecture
- AC6: Document the preserved Apps Script infrastructure and its purpose
- AC7: Update any developer guides or setup instructions

## Tasks / Subtasks

- [ ] Task 1: Update core project documentation (AC1, AC2)
  - [ ] Remove Google Sheets integration sections from CLAUDE.md
  - [ ] Update architecture diagrams in README to show current data flow
  - [ ] Remove Google OAuth setup instructions from documentation
  - [ ] Update project overview to reflect simplified integration model
- [ ] Task 2: Document Apps Script architecture (AC3, AC6)
  - [ ] Create documentation for Apps Script → Supabase data flow
  - [ ] Document Apps Script deployment process and purpose
  - [ ] Explain one-way data synchronization from Google Sheets
  - [ ] Document Apps Script environment configuration
- [ ] Task 3: Update API and deployment documentation (AC4, AC5)
  - [ ] Remove Google Sheets API endpoints from API docs
  - [ ] Update deployment guides to remove Google OAuth configuration
  - [ ] Remove Google Sheets setup steps from deployment instructions
  - [ ] Update environment variable documentation
- [ ] Task 4: Update developer guides (AC7)
  - [ ] Remove Google Sheets integration from developer setup guides
  - [ ] Update local development instructions
  - [ ] Remove Google OAuth configuration from development setup
  - [ ] Update troubleshooting guides to reflect current architecture

## Dev Notes

**Documentation Files to Update:**
- `/CLAUDE.md` - Remove Google Sheets integration protocols
- `/README.md` - Update architecture overview and data flow
- `/docs/` - Update API documentation and deployment guides
- Development setup guides and troubleshooting docs

**New Documentation Needed:**
- Apps Script data flow documentation
- One-way synchronization architecture explanation
- Apps Script deployment and maintenance procedures
- Simplified dashboard architecture overview

**Architecture Changes to Document:**
- From: Dashboard ↔ Google Sheets (bidirectional)
- To: Google Sheets → Apps Script → Supabase ← Dashboard (unidirectional)
- Removal of Google OAuth complexity from dashboard
- Preservation of Apps Script infrastructure for data ingestion

**Source Tree Context:**
- Documentation files: Root level README, CLAUDE.md, /docs directory
- Apps Script documentation: /gas directory README and deployment docs
- API documentation: OpenAPI specs or similar documentation files
- Developer guides: Setup and troubleshooting documentation

### Testing

Dev Note: Story Requires the following tests:

- [ ] Documentation validation tests for completeness and accuracy
- [ ] Link validation to ensure no broken references
- [ ] Architecture diagram validation against actual implementation

Manual Test Steps:
- Review updated documentation for accuracy and completeness
- Verify all Google Sheets references are appropriately removed
- Confirm Apps Script documentation accurately describes data flow
- Test that developer setup instructions work without Google OAuth
- Validate deployment guides reflect simplified architecture

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