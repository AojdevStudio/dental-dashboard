# Story 3.2: Deployment and Environment Cleanup

## Status: Draft

## Story

- As a **DevOps Engineer**
- I want to **clean up deployment configuration and environment setup to remove Google Sheets integration complexity**
- so that **deployments are simplified and production environments are cleaner**

## Acceptance Criteria (ACs)

- AC1: Remove Google OAuth environment variables from production deployment configuration
- AC2: Update CI/CD pipeline to remove Google Sheets integration build steps
- AC3: Clean up staging and production environment configurations
- AC4: Update deployment scripts to remove Google OAuth credential setup
- AC5: Preserve Apps Script deployment pipeline and environment variables
- AC6: Update monitoring and logging to remove Google Sheets integration metrics
- AC7: Validate that simplified deployment process works correctly

## Tasks / Subtasks

- [ ] Task 1: Clean up environment variables (AC1, AC3)
  - [ ] Remove `GOOGLE_CLIENT_ID` from production environment
  - [ ] Remove `GOOGLE_CLIENT_SECRET` from deployment configurations
  - [ ] Remove Google OAuth redirect URI environment variables
  - [ ] Clean up Google OAuth scope configurations from environments
  - [ ] Update environment variable documentation and examples
- [ ] Task 2: Update CI/CD pipeline (AC2)
  - [ ] Remove Google Sheets integration test steps from CI pipeline
  - [ ] Remove Google OAuth credential validation from build process
  - [ ] Update deployment validation to skip Google Sheets integration checks
  - [ ] Clean up any Google Sheets related environment setup in CI
- [ ] Task 3: Preserve Apps Script deployment (AC5)
  - [ ] Ensure Apps Script deployment environment variables remain
  - [ ] Verify `pnpm gas:deploy` command continues working
  - [ ] Preserve Apps Script health check commands in deployment
  - [ ] Maintain Apps Script → Supabase connection configuration
- [ ] Task 4: Update monitoring and validation (AC6, AC7)
  - [ ] Remove Google Sheets sync metrics from monitoring dashboards
  - [ ] Update application health checks to remove Google OAuth validation
  - [ ] Remove Google Sheets integration alerts and monitoring
  - [ ] Test simplified deployment process end-to-end

## Dev Notes

**Environment Variables to Remove:**
- `GOOGLE_CLIENT_ID` (dashboard OAuth, not Apps Script)
- `GOOGLE_CLIENT_SECRET` (dashboard OAuth, not Apps Script)
- Google OAuth redirect URIs and scope configurations
- Google Sheets API credentials for dashboard integration

**Environment Variables to Preserve:**
- Apps Script deployment credentials and configuration
- Supabase connection environment variables
- Database connection strings and authentication
- Apps Script → Supabase API keys and endpoints

**CI/CD Pipeline Updates:**
- Remove Google OAuth credential validation steps
- Remove Google Sheets integration test suites from pipeline
- Preserve Apps Script deployment validation
- Update deployment health checks to reflect simplified architecture

**Source Tree Context:**
- CI/CD configuration: `.github/workflows/` or similar
- Environment configuration: `.env` examples and deployment scripts
- Apps Script deployment: `/gas` directory deployment scripts
- Monitoring configuration: Application monitoring and alerting setup

### Testing

Dev Note: Story Requires the following tests:

- [ ] Deployment pipeline validation tests
- [ ] Environment configuration validation
- [ ] Apps Script deployment preservation tests: location: `/tests/deployment/gas-deployment.test.ts`

Manual Test Steps:
- Execute full deployment pipeline in staging environment
- Verify application starts successfully without Google OAuth variables
- Test Apps Script deployment continues working correctly
- Validate monitoring dashboards reflect simplified architecture
- Confirm no Google OAuth related deployment errors occur

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