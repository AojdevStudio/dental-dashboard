# Story 1.4: Multi-Location System Admin Context Switching

## Status: Draft

## Story
- As a system administrator managing multiple dental clinic locations
- I want to switch between clinic locations and view cross-location dashboards from a single admin interface
- so that I can efficiently manage multiple clinics without being locked to a single location context

## Background Context
**Linear Issue**: To be created  
**Priority**: High (Blocking system admin workflows)  
**Current Problem**: System admin users can access all provider data but are locked to single location context (defaults to Humble location)  
**Technical Context**: Multi-tenant architecture with RLS policies, existing auth context supports system admin role but lacks location switching UI

## Acceptance Criteria (ACs)

### AC1: Location Context Switcher UI Component
- [ ] Location switcher dropdown in main navigation header
- [ ] Display current selected location with clinic name and identifier
- [ ] "All Locations" option for cross-location aggregated views
- [ ] Persist location selection across browser sessions via cookies
- [ ] Visual indicator showing system admin can access multiple locations

### AC2: Cross-Location Dashboard Views
- [ ] "All Locations" dashboard view showing aggregated metrics across all clinics
- [ ] Location-specific dashboard views when individual clinic selected
- [ ] Proper data filtering based on selected location context
- [ ] Breadcrumb navigation showing current location context
- [ ] Smooth transitions between location contexts without page refresh

### AC3: Backend Location Context Management
- [ ] API endpoints respect selected location context from auth middleware
- [ ] Cookie-based location selection persistence (`selectedClinicId`)
- [ ] System admin bypass for location filtering when "All Locations" selected
- [ ] Proper RLS policy handling for cross-location data access
- [ ] Session management for location context switching

### AC4: Security and Access Control
- [ ] Only system admin users can access location switcher
- [ ] Regular users maintain single-clinic isolation
- [ ] Audit logging for location context switches
- [ ] Proper error handling for invalid location selections
- [ ] No data leakage between locations for non-admin users

## Tasks / Subtasks

### Task 1: Location Context Management (AC3)
- [ ] Extend `src/lib/database/auth-context.ts` with location switching functions
- [ ] Create `updateSelectedClinic()` and `getSelectedClinicId()` utilities
- [ ] Implement cookie-based persistence for selected clinic context
- [ ] Add `selectedClinicId` parameter to auth context interface
- [ ] Validate location access permissions for system admins

### Task 2: Location Switcher UI Component (AC1)
- [ ] Create `src/components/common/location-switcher.tsx` compound component
- [ ] Build dropdown with clinic list and "All Locations" option
- [ ] Integrate with existing header navigation layout
- [ ] Add loading states and error handling for location switching
- [ ] Implement responsive design for mobile and desktop

### Task 3: API Middleware Enhancement (AC3)
- [ ] Update `src/lib/api/middleware.ts` to handle location context
- [ ] Add `getLocationContext()` function for extracting selected clinic
- [ ] Modify `withAuth` middleware to pass location context to handlers
- [ ] Implement system admin location bypass logic
- [ ] Add location validation for regular users

### Task 4: Dashboard Location Integration (AC2)
- [ ] Update dashboard components to respect location context
- [ ] Create cross-location data aggregation utilities
- [ ] Implement location-specific data filtering
- [ ] Add breadcrumb navigation with location context
- [ ] Handle "All Locations" vs single location data display

### Task 5: Security and Audit Implementation (AC4)
- [ ] Add audit logging for location context switches
- [ ] Implement access control validation for location switcher
- [ ] Create error boundaries for invalid location access
- [ ] Add security tests for multi-location access patterns
- [ ] Validate RLS policies work correctly with location switching

## Dev Notes

### Technical Architecture Context
- **Framework**: Next.js 15 with App Router and Server Components
- **Database**: Supabase PostgreSQL with Prisma ORM and Row Level Security
- **UI Components**: shadcn/ui + Radix UI with compound component patterns
- **State Management**: React Server Components + cookies for persistence
- **Authentication**: Existing auth context with system admin role support

### Existing Patterns to Follow
- **Component Architecture**: Use compound components (Root, Trigger, Content) pattern
- **API Patterns**: Leverage existing withAuth middleware + auth context functions
- **Database Security**: Multi-tenant data isolation via clinic-based RLS policies
- **Type Safety**: TypeScript strict mode with comprehensive interface definitions

### Location Context Flow
```typescript
// Current Auth Context (existing)
interface AuthContext {
  userId: string;
  authId: string;
  clinicIds: string[];           // All accessible clinics
  currentClinicId?: string;      // Primary clinic (user's home clinic)
  selectedClinicId?: string;     // Currently selected clinic for context
  role?: string;
  isSystemAdmin?: boolean;
}

// Location Switcher Component Structure
const LocationSwitcher = {
  Root: ({ children }: LocationSwitcherProps) => {
    // Container with dropdown trigger
  },
  
  Trigger: ({ children }: LocationTriggerProps) => {
    // Button showing current location
  },
  
  Content: ({ children }: LocationContentProps) => {
    // Dropdown content with clinic list
  },
  
  Item: ({ clinicId, children }: LocationItemProps) => {
    // Individual clinic selection item
  },
  
  AllLocations: ({ children }: AllLocationsProps) => {
    // Special "All Locations" option
  }
}
```

### Cookie-Based Persistence Strategy
```typescript
// Location context persistence
const LOCATION_COOKIE = 'selectedClinicId';
const COOKIE_OPTIONS = {
  httpOnly: false,  // Allow client-side access for UI updates
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 30 * 24 * 60 * 60, // 30 days
  path: '/'
};

// Usage in auth context
export async function updateSelectedClinic(clinicId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(LOCATION_COOKIE, clinicId, COOKIE_OPTIONS);
}
```

### API Middleware Enhancement
```typescript
// Enhanced middleware with location context
export function withAuth<TSuccessPayload = unknown>(
  handler: ApiHandler<TSuccessPayload>,
  options?: {
    requireAdmin?: boolean;
    requireClinicAdmin?: boolean;
    allowCrossLocation?: boolean; // New option for system admin cross-location access
  }
) {
  return async (req: Request, context: { params: Promise<Record<string, string | string[]>> }) => {
    const authContext = await getAuthContext();
    
    // Get location context for system admins
    const locationContext = authContext?.isSystemAdmin 
      ? await getLocationContext(authContext)
      : { selectedClinicId: authContext?.currentClinicId };
    
    return await handler(req, {
      ...context,
      authContext: {
        ...authContext,
        ...locationContext
      }
    });
  };
}
```

### Security Considerations
- **Access Control**: Only system admin users see location switcher
- **Data Isolation**: Regular users maintain single-clinic RLS enforcement
- **Audit Trail**: Log all location context switches with timestamp and user ID
- **Session Security**: Validate selected clinic is in user's accessible clinic list
- **Cookie Security**: Use secure, httpOnly cookies in production

### Performance Requirements
- **Location Switch Time**: Context switching should complete in <500ms
- **Data Loading**: Location-specific data should load in <2 seconds
- **Cross-Location Aggregation**: "All Locations" view should load in <3 seconds
- **Cookie Persistence**: Location selection persists across browser sessions

### AI Implementation Guardrails
**This story requires careful implementation due to security implications:**
- **Security First**: Validate all location access permissions before UI updates
- **Incremental Development**: Start with backend context management, then UI
- **Test-Driven Security**: Comprehensive tests for multi-tenant access patterns
- **Preserve Existing Behavior**: Ensure regular users maintain current functionality

### Testing

Dev Note: Story Requires the following tests:

- [ ] **Unit Tests**: (nextToFile: true), coverage requirement: 90%
  - Location context management utilities
  - Location switcher component rendering
  - Auth middleware location handling
  - Cookie persistence functionality

- [ ] **Integration Tests** (Test Location: tests/integration/location-switching/)
  - System admin location switching workflow
  - Cross-location data aggregation accuracy
  - RLS policy enforcement with location context
  - API endpoint location context handling

- [ ] **Security Tests**: (location: tests/security/multi-location.spec.ts)
  - Access control validation for location switcher
  - Data isolation between locations for regular users
  - System admin cross-location access validation
  - Audit logging for location context switches

- [ ] **E2E Tests**: (location: tests/e2e/location-switching.spec.ts)
  - Complete location switching user workflow
  - Dashboard data updates when switching locations
  - "All Locations" aggregated view functionality
  - Location context persistence across browser sessions

## Dev Agent Record

### Agent Model Used: 
*To be filled by implementing agent*

### Implementation Phases
- **Phase 1**: Backend location context management and cookie persistence
- **Phase 2**: Location switcher UI component and navigation integration  
- **Phase 3**: API middleware enhancement and location-aware endpoints
- **Phase 4**: Dashboard integration and cross-location data aggregation
- **Phase 5**: Security validation and audit logging

### Debug Log References
*To be filled during implementation*

### Completion Notes List
*To be filled as tasks are completed*

### Change Log
*To be updated with each implementation session*

---

**Story Priority**: High  
**Estimated Complexity**: 8-10 implementation sessions (Security-focused development required)  
**Dependencies**: Existing auth context (completed), Multi-tenant RLS policies (exists)  
**Linear Integration**: To be created - Multi-Location System Admin Context Switching 