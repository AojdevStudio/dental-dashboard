# Tech Context: Dental Practice Analytics Dashboard
*Version: 1.1*
*Created: 2025-05-17*
*Last Updated: 2025-01-15*

## Technology Stack

### Frontend Framework
- **Next.js 15.3.2** with App Router
  - Server Components for optimal performance
  - Client Components for interactivity
  - Enhanced with comprehensive authentication flows
  - Proper loading and error states implementation
  - Multi-step form patterns with validation

### Backend & Database
- **Supabase** (Backend-as-a-Service)
  - PostgreSQL database with Row Level Security (RLS)
  - Authentication with enhanced database verification
  - OAuth integration for third-party services
  - Edge Functions for business logic
  - Real-time subscriptions (future use)
- **Prisma** as ORM
  - Type-safe database interactions
  - Multi-tenant UUID architecture support
  - Migration management
  - Query optimization for RLS

### Authentication & Security
- **Supabase Auth** with enhancements:
  - Enhanced login with database user verification
  - Multi-step registration with clinic association
  - Email/password authentication as primary method
  - Secure token management for integrations
  - Proper session handling and cleanup
- **Google OAuth 2.0** (for Google Sheets integration only):
  - OAuth flow specifically for Google Sheets API access
  - Secure token storage for data source connections
  - Not used for general user authentication
- **Row Level Security (RLS)**
  - Comprehensive policies across all tables
  - Helper functions for permission checks
  - Multi-tenant data isolation

### UI & Styling
- **shadcn/ui** component library
  - Consistent design system
  - Accessible components
  - Form components with validation
  - Loading and error state components
- **Tailwind CSS** for styling
  - Responsive design patterns
  - Consistent spacing and typography
  - Dark/light mode support (future)
- **Lucide React** for icons
  - Consistent iconography
  - Scalable vector icons

### Data Visualization
- **Recharts** for charts and graphs
  - Interactive dashboard components
  - Responsive chart layouts
  - Custom styling integration

### State Management
- **React Query (TanStack Query)** for server state
  - Caching and synchronization
  - Background updates
  - Error handling
- **Zustand** for client state (minimal usage)
  - Global UI state when needed
- **React Hook Form** for form state
  - Multi-step form management
  - Validation integration
  - Performance optimization

### Development Tools
- **TypeScript** for type safety
  - Strict type checking
  - Enhanced developer experience
  - API contract enforcement
- **Biome** for linting and formatting
  - Fast code formatting
  - Import organization
  - Code quality enforcement
- **Vitest** for testing
  - Unit and integration tests
  - Component testing
  - API endpoint testing

### External Integrations
- **Google Sheets API**
  - OAuth 2.0 authentication for API access
  - Spreadsheet discovery and metadata fetching
  - Data extraction with range support (A1 notation)
  - Token refresh mechanisms and error handling
- **Google OAuth 2.0**
  - Secure authentication flow for Google Sheets access
  - Token management and storage in data source records
  - Callback handling for OAuth flow completion

## Development Environment

### Package Management
- **pnpm** as package manager
  - Fast, efficient dependency management
  - Workspace support for monorepo structure
  - Consistent lockfile management

### Environment Configuration
- **Environment Variables**
  - Supabase configuration (URL, anon key, service role key)
  - Google OAuth credentials (client ID, client secret)
  - Next.js configuration (site URL, environment)
  - Database connection strings

### Database Setup
- **Multi-tenant UUID Architecture**
  - UUID primary keys across all tables
  - Clinic-based data isolation
  - User-clinic role associations
- **Scheduled Jobs (pg_cron)**
  - Daily aggregation tasks
  - Weekly reporting
  - Monthly cleanup
  - Hourly sync monitoring

## Key Architectural Patterns

### Authentication Architecture
- **Multi-Step Registration Pattern**
  - Three-step process with validation
  - Transaction-based data consistency
  - Clinic association during signup
  - Provider-specific field collection

- **Enhanced Login Pattern**
  - Supabase Auth + database verification
  - Clinic and role validation
  - Proper error handling and cleanup
  - Session state management

- **OAuth Integration Pattern**
  - Google OAuth 2.0 specifically for Google Sheets API access
  - Secure token storage in database data source records
  - Callback URL handling for OAuth flow completion
  - Token refresh mechanisms for maintaining API access
  - Integration status tracking and validation

### Data Integration Patterns
- **Google Sheets Integration**
  - OAuth 2.0 for secure API access with limited scope
  - Secure token storage in database data source records
  - Proper scope limitation to Google Sheets read access only
  - Token refresh handling for maintaining long-term access
  - Connection status tracking and validation

- **API Route Patterns**
  - RESTful endpoint design
  - Proper error handling and status codes
  - Request validation and sanitization
  - Response formatting consistency

### UI/UX Patterns
- **Loading State Pattern**
  - Skeleton UI components
  - Consistent loading indicators
  - Progressive loading for multi-step forms

- **Error Boundary Pattern**
  - Page-level error handling
  - User-friendly error messages
  - Recovery action suggestions
  - Proper error logging

- **Form Validation Pattern**
  - Real-time validation feedback
  - Step-by-step validation in multi-step forms
  - Server-side validation integration
  - User-friendly error messages

## File Structure Conventions

### Component Organization
```
src/components/
├── auth/                    # Authentication components
│   ├── register-form-comprehensive.tsx
│   └── login-form.tsx
├── ui/                      # Base UI components (shadcn/ui)
├── dashboard/               # Dashboard-specific components
├── google-sheets/           # Google Sheets integration components
└── common/                  # Shared components
```

### API Route Organization
```
src/app/api/
├── auth/                    # Authentication endpoints
│   ├── register-comprehensive/
│   ├── callback/
│   └── session/
├── google/                  # Google API integrations
│   └── sheets/
└── test/                    # Testing endpoints
```

### Page Organization
```
src/app/
├── (auth)/                  # Authentication pages
│   ├── login/
│   ├── register/
│   └── callback/
└── (dashboard)/             # Protected dashboard pages
    ├── dashboard/
    ├── integrations/
    └── settings/
```

## Security Considerations

### Authentication Security
- **Enhanced Login Verification**
  - Database user validation
  - Clinic association verification
  - Role assignment validation
  - Automatic cleanup of partial states

- **OAuth Security**
  - Google OAuth 2.0 for Google Sheets API access only
  - Secure token storage in data source records
  - Token refresh mechanisms for maintaining access
  - Proper callback URL validation and CSRF protection
  - Limited scope for Google Sheets read access

### Data Security
- **Row Level Security (RLS)**
  - Comprehensive policies on all tables
  - Helper functions for permission checks
  - Multi-tenant data isolation

- **API Security**
  - Request validation and sanitization
  - Proper error handling without information leakage
  - Rate limiting (future implementation)

### Integration Security
- **Google Sheets Integration**
  - OAuth 2.0 for secure API access with limited scope
  - Secure token storage in database data source records
  - Proper scope limitation to Google Sheets read access only
  - Token refresh handling for maintaining long-term access
  - Connection status tracking and validation

## Performance Considerations

### Frontend Performance
- **Server Components**
  - Optimal rendering strategy
  - Reduced client-side JavaScript
  - Better SEO and initial load times

- **Loading States**
  - Skeleton UI for better perceived performance
  - Progressive loading for complex forms
  - Proper loading indicators

### Database Performance
- **RLS Optimization**
  - Performance indexes for RLS queries
  - Efficient helper functions
  - Query optimization

- **Connection Management**
  - Prisma connection pooling
  - Supabase connection optimization

## Testing Strategy

### Component Testing
- **Authentication Components**
  - Multi-step form validation
  - Error state handling
  - Loading state behavior

- **Integration Components**
  - Google Sheets testing interface
  - OAuth flow testing
  - Error handling validation

### API Testing
- **Authentication Endpoints**
  - Registration flow testing
  - Login verification testing
  - OAuth callback testing

- **Integration Endpoints**
  - Google Sheets API testing
  - Token management testing
  - Error handling validation

### End-to-End Testing
- **Authentication Flows**
  - Complete registration process
  - Login and logout flows
  - OAuth integration flows

- **Integration Flows**
  - Google Sheets connection
  - Data extraction testing
  - Error recovery testing

## Deployment Configuration

### Environment Setup
- **Development Environment**
  - Local Supabase instance
  - Google OAuth test credentials
  - Development database

- **Production Environment**
  - Supabase production instance
  - Google OAuth production credentials
  - Production database with RLS

### Monitoring & Logging
- **Application Monitoring**
  - Error tracking and reporting
  - Performance monitoring
  - User behavior analytics

- **Database Monitoring**
  - Query performance tracking
  - RLS policy effectiveness
  - Scheduled job monitoring

---

*This document captures the technical context and decisions for the project.* 