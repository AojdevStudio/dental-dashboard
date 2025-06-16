# Multi-Clinic Access for System Administrators

## Summary

Implement multi-clinic access functionality to allow system administrators to authenticate and operate across all clinics without being restricted to a single clinic assignment. This addresses the current authentication blocker where system admins cannot log in due to missing clinic assignments.

## User Stories

**As a System Administrator:**
- I want to log in without being assigned to a specific clinic so I can access the system
- I want to view and manage all clinics from a single dashboard so I can perform system-wide operations
- I want to switch between clinic contexts so I can focus on specific clinic data when needed
- I want to perform cross-clinic reporting and analytics so I can provide comprehensive insights

**As a Regular User:**
- I want my access to remain restricted to my assigned clinic so data isolation is maintained
- I want clear visual indicators of which clinic context I'm viewing so I don't get confused

## Functional Expectations

### Authentication Flow
- System admin role bypasses clinic assignment requirement during login
- Multi-clinic users receive special session context indicating elevated permissions
- Regular users continue with existing single-clinic authentication flow

### User Interface
- Clinic selector component in header/sidebar for multi-clinic users
- Current clinic context clearly displayed throughout the application
- Dashboard adapts to show single-clinic or multi-clinic views based on user role
- Breadcrumbs and navigation reflect current clinic context

### Data Access
- System admins can query data across all clinics
- Regular users maintain existing data isolation
- Audit logging captures clinic context for all administrative actions

## Affected Files

### Authentication & Authorization
- `src/app/auth/actions.ts` - Modify `signInWithVerification` to handle system_admin role
- `src/lib/database/auth-context.ts` - Update context to support multi-clinic access
- `src/hooks/use-auth.ts` - Add clinic context management

### Database & Queries
- `src/lib/database/queries/` - Update queries to support clinic filtering
- `prisma/seed.ts` - Remove clinic assignment requirement for system admin

### UI Components
- `src/components/common/header.tsx` - Add clinic selector for multi-clinic users
- `src/components/common/clinic-selector.tsx` - New component for clinic switching
- `src/app/(dashboard)/layout.tsx` - Integrate clinic context display

### API Routes
- `src/app/api/clinics/route.ts` - Endpoint for clinic list and switching
- Various metric API routes - Add clinic filtering support

## Additional Considerations

- **Security**: Implement proper authorization checks to ensure only system_admin role can access multi-clinic features
- **Performance**: Consider caching clinic lists and implementing efficient data filtering
- **Audit Trail**: Log all clinic context switches and cross-clinic operations
- **Migration**: Existing system admin users need to be updated to remove clinic assignments
- **Testing**: Comprehensive testing of both single-clinic and multi-clinic user flows 