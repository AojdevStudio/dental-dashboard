# Phase 1: Providers Main Page Foundation and Structure

## Task Overview
Create the foundational file structure for the providers main page at `/dashboard/providers` with basic routing, loading states, and error handling. This is the lowest-risk phase focusing on structure without complex integration logic.

## Task Objectives
- Create basic page structure files for providers main page
- Implement Next.js App Router patterns for loading and error states
- Establish server-side rendering foundation
- Ensure basic routing functionality

## Files to Create

### 1. Loading Component
**File**: `src/app/(dashboard)/providers/loading.tsx`
**Risk Level**: Low
**Purpose**: Loading skeleton for providers page

**Requirements**:
- Simple loading skeleton component
- Follow existing dashboard loading patterns
- Use Shadcn UI skeleton components
- Responsive design for provider grid layout

### 2. Error Boundary Component  
**File**: `src/app/(dashboard)/providers/error.tsx`
**Risk Level**: Low
**Purpose**: Error boundary for providers page

**Requirements**:
- Standard error handling patterns
- User-friendly error messages
- Retry functionality
- Follow existing dashboard error patterns

### 3. Basic Page Structure
**File**: `src/app/(dashboard)/providers/page.tsx`
**Risk Level**: Low-Medium
**Purpose**: Main providers page with basic structure

**Requirements**:
- Server component with basic structure
- Placeholder for provider data
- Basic layout following dashboard patterns
- Title and breadcrumb structure
- No complex integration logic in this phase

## Expected Output

### Loading Component Structure
- Skeleton grid matching expected provider card layout
- Proper loading states for filters and search
- Responsive skeleton design

### Error Component Structure
- Error message display with retry option
- Consistent with dashboard error handling
- Proper error logging integration

### Page Component Structure
- Basic page layout with title "Providers"
- Placeholder content area for future component integration
- Proper TypeScript types and exports
- Server-side rendering ready structure

## Implementation Constraints

### AI Guardrails
- **Maximum files per session**: 2 files only
- **Change limits**: Maximum 15-20 lines per file
- **No complex logic**: Focus on structure only
- **Safety first**: No integration with APIs or complex components

### Validation Checkpoints
1. **After each file creation**: Run `pnpm tsc --noEmit` to check compilation
2. **After loading.tsx**: Verify component renders without errors
3. **After error.tsx**: Test error boundary functionality
4. **After basic page.tsx**: Test route accessibility at `/dashboard/providers`

## Success Criteria
- [ ] All files compile without TypeScript errors
- [ ] Basic page routing works (`/dashboard/providers` accessible)
- [ ] Loading states display correctly when navigating to page
- [ ] Error boundaries function properly if triggered
- [ ] Page follows existing dashboard layout patterns
- [ ] No breaking changes to existing functionality

## Safety Measures
- Create files in isolation without dependencies
- Test each file independently
- No API calls or complex data fetching in this phase
- Preserve existing routing and navigation functionality
- Use placeholder content only

## Next Phase Dependencies
- Phase 2 will integrate provider components into the basic page structure
- Phase 3 will add navigation integration
- API integration will be handled separately

## Technical Notes
- Follow Next.js 15 App Router patterns
- Use TypeScript with strict mode
- Follow project conventions for component structure
- Ensure server-side rendering compatibility
- Use existing dashboard styling patterns

## Validation Commands
```bash
# Type checking
pnpm tsc --noEmit

# Routing test
# Navigate to /dashboard/providers in browser

# Component compilation test
pnpm build --dry-run
```