# Tech Context: Dental Practice Analytics Dashboard
*Version: 1.3*
*Created: 2025-05-17*
*Last Updated: 2025-06-14*

## Technology Stack

### Frontend Framework
- **Next.js 15.3.2** with App Router
  - Server Components for optimal performance
  - Client Components for interactivity
  - Enhanced with comprehensive dashboard layout and navigation
  - Performance optimized with React Query integration
  - Proper loading and error states implementation
  - Multi-step form patterns with validation

### Backend & Database
- **Supabase** (Backend-as-a-Service)
  - PostgreSQL database with Row Level Security (RLS)
  - Authentication with enhanced database verification
  - OAuth integration for third-party services
  - Edge Functions for business logic
  - Real-time subscriptions (future use)
- **Prisma 6.7.0** as ORM
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
  - Enhanced navigation components
- **Tailwind CSS 4.1.8** for styling
  - Responsive design patterns
  - Consistent spacing and typography
  - Enhanced global styles with smooth transitions
  - Dark/light mode support (future)
- **Lucide React 0.510.0** for icons
  - Consistent iconography
  - Scalable vector icons
  - Navigation and UI icons

### Data Visualization
- **Recharts 2.15.3** for charts and graphs
  - Interactive dashboard components
  - Responsive chart layouts
  - Custom styling integration
  - KPI visualization widgets

### State Management & Performance
- **React Query (TanStack Query) 5.79.0** for server state
  - Comprehensive caching and synchronization
  - Background updates and optimistic updates
  - Error handling and retry logic
  - Performance optimization with automatic background refetching
- **Zustand 5.0.5** for client state (minimal usage)
  - Global UI state when needed
  - Navigation state management
- **React Hook Form 7.56.4** for form state
  - Multi-step form management
  - Validation integration
  - Performance optimization

### Development Tools
- **TypeScript 5.8.3** for type safety
  - Strict type checking
  - Enhanced developer experience
  - API contract enforcement
  - Navigation and layout type definitions
- **Biome 1.9.4** for linting and formatting
  - Fast code formatting
  - Import organization
  - Code quality enforcement
- **Vitest 3.1.4** for testing
  - Unit and integration tests
  - Component testing
  - API endpoint testing

### Recent Additions (2025-06-14)
- **Strict TypeScript Compliance:** Project now compiles cleanly with `pnpm tsc --noEmit`, with zero `any` usages.
- **Supabase Edge Function Scaffolding:** Added placeholder directories and `supabase/config.toml` for future business logic.
- **Edge Migration Placeholders:** Introduced empty SQL migration files under `supabase/migrations/` to guide upcoming schema changes.
  - Unit and integration tests
  - Component testing
  - API endpoint testing

### External Integrations
- **Google Sheets API (googleapis 148.0.0)**
  - OAuth 2.0 authentication for API access
  - Spreadsheet discovery and metadata fetching
  - Data extraction with range support (A1 notation)
  - Token refresh mechanisms and error handling
  - Provider name auto-extraction from sheet titles
- **Google Drive API (@googleapis/drive 12.1.0)**
  - File discovery and metadata access
  - Integration with Google Sheets workflow
- **Google OAuth 2.0**
  - Secure authentication flow for Google Sheets access
  - Token management and storage in data source records
  - Callback handling for OAuth flow completion

## Development Environment

### Package Management
- **pnpm 10.10.0** as package manager
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

### Dashboard Architecture
- **Layout Pattern**
  - Collapsible sidebar with persistent state management
  - Top navigation with user dropdown and account management
  - Responsive design for mobile, tablet, and desktop
  - Type-safe navigation components with proper TypeScript definitions

- **Performance Pattern**
  - React Query integration for aggressive caching (1.7s to 24-42ms improvement)
  - API response caching with appropriate headers
  - Skeleton loading components for perceived performance
  - Optimistic updates and background synchronization

- **Navigation Pattern**
  - Consistent navigation state management across sessions
  - User-friendly navigation with proper accessibility
  - Dynamic navigation based on user roles and permissions

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
  - Provider name auto-extraction from sheet titles

- **API Route Patterns**
  - RESTful endpoint design
  - Proper error handling and status codes
  - Request validation and sanitization
  - Response formatting consistency
  - Caching headers for performance optimization

### UI/UX Patterns
- **Loading State Pattern**
  - Skeleton UI components for better perceived performance
  - Consistent loading indicators across the application
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

## Enhanced Dependencies

### New Performance Dependencies
- **@tanstack/react-query 5.79.0** - Server state management with caching
- **@tanstack/react-query-devtools 5.79.0** - Development tools for debugging
- **lru-cache 10.4.3** - Client-side caching utilities
- **framer-motion 12.15.0** - Smooth animations and transitions

### Enhanced Google Integration
- **googleapis 148.0.0** - Comprehensive Google APIs client
- **@googleapis/drive 12.1.0** - Google Drive API integration
- **@googleapis/sheets 9.8.0** - Google Sheets API client

### Development Tools
- **usehooks-ts 3.1.1** - TypeScript React hooks utilities
- **@base-ui-components/react 1.0.0-alpha.8** - Base UI components
- **next-themes 0.4.6** - Theme management for dark/light mode

## File Structure Conventions (Updated)

### Component Organization
```
src/components/
├── auth/                    # Authentication components
├── ui/                      # Base UI components (shadcn/ui)
├── dashboard/               # Dashboard-specific components
├── google-sheets/           # Google Sheets integration components
└── common/                  # Shared components
    ├── dashboard-layout.tsx # Main dashboard layout
    ├── sidebar.tsx          # Collapsible sidebar navigation
    ├── top-nav.tsx          # Top navigation bar
    ├── nav-item.tsx         # Navigation item components
    └── user-dropdown.tsx    # User account dropdown
```

### API Route Organization
```
src/app/api/
├── auth/                    # Authentication endpoints
├── google-sheets/           # Google Sheets integration endpoints
├── google/sheets/           # Direct Google Sheets API endpoints
├── metrics/                 # Metrics calculation endpoints
├── clinics/                 # Clinic management endpoints
└── users/                   # User management endpoints
```

### Type Definitions
```
src/lib/types/
├── auth.ts                  # Authentication types
├── dashboard.ts             # Dashboard types
├── metrics.ts               # Metrics types
├── goals.ts                 # Goals types
├── api.ts                   # API types
├── layout.ts                # Layout types (NEW)
└── navigation.ts            # Navigation types (NEW)
```

## Performance Metrics

### Current Performance Achievements
- **Initial Load Time:** 585-626ms (down from 1.7s)
- **Subsequent Load Time:** 24-42ms (97% improvement)
- **Time to Interactive:** Sub-600ms target achieved
- **Cache Hit Rate:** >90% for repeated data fetches

### Optimization Strategies
- React Query aggressive caching with background updates
- API response caching with appropriate headers
- Skeleton loading for improved perceived performance
- Optimistic updates for better user experience

---

*This document defines the technical foundation and architectural patterns for the project.* 