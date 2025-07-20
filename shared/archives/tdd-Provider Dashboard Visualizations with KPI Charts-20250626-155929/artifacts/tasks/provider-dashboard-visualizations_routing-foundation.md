# Task: Provider Detail Page Routing Foundation

## Description
Create the foundational routing structure for provider detail pages, including dynamic routing, error boundaries, and loading states. This establishes the navigation framework that resolves the current 404 errors when clicking "View" buttons from the provider listing.

## Dependencies
- Existing provider listing functionality (completed)
- Next.js 15 App Router architecture (exists)
- Provider entity schema in database (exists)

## Acceptance Criteria
- [ ] Provider "View" buttons navigate to functional detail pages without 404 errors
- [ ] URL pattern `/dashboard/providers/[providerId]` resolves correctly
- [ ] Support for both UUID and slug-based provider identification
- [ ] Proper error boundaries handle invalid provider IDs with user-friendly 404 pages
- [ ] Loading states display while provider data is being fetched
- [ ] Breadcrumb navigation integration with back button functionality

## Technical Requirements
- Create `src/app/(dashboard)/providers/[providerId]/page.tsx` using Next.js App Router dynamic routing
- Implement `src/app/(dashboard)/providers/[providerId]/loading.tsx` for loading states
- Create `src/app/(dashboard)/providers/[providerId]/error.tsx` for error boundaries
- Build `src/app/api/providers/[providerId]/route.ts` for individual provider data API
- Fix provider card navigation in existing provider listing
- Implement TypeScript strict mode with proper typing
- Follow existing component patterns and multi-tenant security

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Provider detail pages render without 404 errors
- [ ] Error boundaries handle edge cases gracefully
- [ ] Loading states provide proper user feedback
- [ ] API endpoint returns provider data with RLS security
- [ ] Navigation from provider listing works correctly
- [ ] TypeScript compilation passes with no errors
- [ ] Code follows project conventions and patterns

## Test Scenarios
**Happy Path:**
- Navigate from provider listing to detail page successfully
- Provider data loads and displays correctly
- Breadcrumb navigation works properly

**Edge Cases:**
- Invalid provider ID displays 404 error page
- Non-existent provider ID handles gracefully
- Network failures show appropriate error states
- UUID format validation works correctly
- Slug-based identification resolves properly

**Security:**
- Multi-tenant RLS policies restrict data access correctly
- Unauthorized clinic access is blocked
- Provider ID validation prevents injection attacks

**Performance:**
- Page loads within performance constraints
- Loading states appear immediately
- Error boundaries don't impact other pages

## Implementation Notes
- Follow Next.js 15 App Router patterns with Server Components
- Use existing withAuth middleware for API security
- Implement clinic-based RLS filtering
- Follow compound component patterns from existing UI
- Use Zod schemas for provider ID validation
- Preserve existing provider listing functionality
- Start with static content to verify routing works
- Add proper error logging for debugging

## Potential Gotchas
- Provider ID parameter extraction and validation
- RLS context must be set correctly for multi-tenant security
- Error boundaries should not catch all errors globally
- Loading states need to be optimistic and immediate
- Breadcrumb state management across navigation
- UUID vs slug handling in the same route parameter