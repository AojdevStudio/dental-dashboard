# PRD: Core Provider UI Components (AOJ-54)

## 1. Document Information

-   **Priority**: High
-   **Timeline**: 1-2 Days (Updated)
-   **Status**: Partially Implemented - Ready for Component Development
-   **Owner**: AOJ Sr
-   **Last Updated**: January 2025

## 2. Summary

This document outlines the requirements for implementing the core provider UI components for the dental dashboard. The foundational infrastructure has been established, including API endpoints, data hooks, type definitions, and basic page structure. The remaining work focuses on building the actual UI components using the existing `shadcn/ui` library to display provider information with rich functionality.

## 3. Current Implementation Status

### ✅ Completed Infrastructure
-   **API Layer**: `/api/providers` endpoint with full CRUD operations
-   **Data Layer**: `useProviders` hook with TanStack Query integration
-   **Type System**: Comprehensive TypeScript types in `src/types/providers.ts`
-   **Page Structure**: Basic providers page with loading and error states
-   **Component Files**: Empty component files created in `src/components/providers/`

### ❌ Remaining Implementation
-   **Provider Card Component**: Rich card display for individual providers
-   **Provider Grid Component**: Responsive grid layout with state management
-   **Provider Metrics Component**: Performance metrics display
-   **Provider Actions Component**: Action buttons and dropdown menus
-   **Provider Filters Component**: Advanced filtering and search functionality

## 4. Priority & Timeline Assessment

-   **Priority**: **High**
    -   **Reasoning**: Core dashboard functionality for provider management
    -   **Dependencies**: Required for provider performance analytics (AOJ-53)
-   **Updated Timeline**: **1-2 Days**
    -   **Reasoning**: Infrastructure is complete, focus is on UI component implementation

## 5. User Stories

-   **As a Clinic Administrator, I want to see a comprehensive list of all providers in a visually appealing grid, so that I can quickly assess my team.**
-   **As a Clinic Administrator, I want to view key performance metrics and location assignments for each provider at a glance.**
-   **As a Clinic Administrator, I want to filter and search providers by type, status, and location for efficient management.**
-   **As a Clinic Administrator, I want quick access to provider actions like viewing details, editing information, and managing assignments.**

## 6. Technical Architecture

### Available Data Structure
```typescript
// From src/types/providers.ts
interface ProviderWithLocations {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  providerType: 'dentist' | 'hygienist' | 'specialist' | 'other';
  status: string;
  clinic: { id: string; name: string };
  locations: LocationDetail[];
  primaryLocation?: LocationSummary;
  _count: {
    locations: number;
    hygieneProduction: number;
    dentistProduction: number;
  };
}
```

### Available Hooks
-   `useProviders()` - Main data fetching with filters and pagination
-   `useProvider(id)` - Single provider details
-   `useProviderFilters()` - Filter options and statistics

### Available UI Components
-   **shadcn/ui**: Card, Avatar, Badge, Button, DropdownMenu, Skeleton
-   **Custom**: MetricCard, LoadingSpinner, existing dashboard components

## 7. Component Specifications

### 7.1 Provider Card Component (`provider-card.tsx`)
**Purpose**: Display individual provider information in a card format

**Features**:
-   Provider avatar with fallback initials
-   Name, type, and status display
-   Location assignments with primary location highlight
-   Production count indicators
-   Quick action buttons
-   Responsive design for mobile and desktop

**Props Interface**:
```typescript
interface ProviderCardProps {
  provider: ProviderWithLocations;
  onEdit?: (provider: ProviderWithLocations) => void;
  onViewDetails?: (provider: ProviderWithLocations) => void;
  showMetrics?: boolean;
  compact?: boolean;
}
```

### 7.2 Provider Grid Component (`provider-grid.tsx`)
**Purpose**: Responsive grid layout with state management

**Features**:
-   Responsive grid (1-4 columns based on screen size)
-   Loading state with skeleton cards
-   Empty state with helpful messaging
-   Error state with retry functionality
-   Pagination controls
-   Grid/list view toggle

**Props Interface**:
```typescript
interface ProviderGridProps {
  providers: ProviderWithLocations[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  pagination?: PaginationInfo;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
}
```

### 7.3 Provider Metrics Component (`provider-metrics.tsx`)
**Purpose**: Display key performance indicators

**Features**:
-   Production count badges
-   Location count indicator
-   Status indicators
-   Performance trend icons
-   Compact metric display

### 7.4 Provider Actions Component (`provider-actions.tsx`)
**Purpose**: Action buttons and dropdown menus

**Features**:
-   View details button
-   Edit provider button
-   Manage locations action
-   View performance action
-   Dropdown menu for additional actions
-   Permission-based action visibility

### 7.5 Provider Filters Component (`provider-filters.tsx`)
**Purpose**: Advanced filtering and search

**Features**:
-   Search by name/email
-   Filter by provider type
-   Filter by status (active/inactive)
-   Filter by location
-   Clear all filters
-   Filter count indicators

## 8. Implementation Strategy

### Phase 1: Core Components (Day 1 - 6 hours)

#### 8.1 Provider Card Implementation
**File**: `src/components/providers/provider-card.tsx`
-   Build responsive card layout using shadcn/ui Card components
-   Implement avatar with fallback initials
-   Add provider type badges and status indicators
-   Include location assignments display
-   Add production count metrics
-   Integrate action buttons

#### 8.2 Provider Metrics Implementation
**File**: `src/components/providers/provider-metrics.tsx`
-   Create compact metrics display
-   Show production counts with icons
-   Display location assignments
-   Add status indicators with appropriate colors

#### 8.3 Provider Actions Implementation
**File**: `src/components/providers/provider-actions.tsx`
-   Build dropdown menu with actions
-   Implement permission-based visibility
-   Add navigation handlers
-   Include confirmation dialogs for destructive actions

### Phase 2: Grid and Filters (Day 1-2 - 4 hours)

#### 8.4 Provider Grid Implementation
**File**: `src/components/providers/provider-grid.tsx`
-   Create responsive grid layout
-   Implement loading states with skeletons
-   Add empty and error states
-   Include pagination controls
-   Add view mode toggle (grid/list)

#### 8.5 Provider Filters Implementation
**File**: `src/components/providers/provider-filters.tsx`
-   Build search input with debouncing
-   Create filter dropdowns for type, status, location
-   Add clear filters functionality
-   Implement filter count indicators
-   Integrate with useProviders hook

### Phase 3: Integration and Polish (Day 2 - 2 hours)

#### 8.6 Page Integration
**Files**:
-   `src/app/(dashboard)/providers/page.tsx`
-   `src/app/(dashboard)/settings/providers/page.tsx`

-   Replace basic provider display with rich components
-   Integrate filters with grid
-   Add proper error boundaries
-   Implement responsive design
-   Add loading and empty states

## 9. File Status and Requirements

### ✅ Existing Infrastructure
-   `src/types/providers.ts` - Complete type definitions
-   `src/hooks/use-providers.ts` - Data fetching and state management
-   `src/app/api/providers/route.ts` - API endpoints
-   `src/app/(dashboard)/providers/page.tsx` - Basic page structure
-   `src/app/(dashboard)/providers/loading.tsx` - Loading component
-   `src/app/(dashboard)/providers/error.tsx` - Error component

### 🔄 Files to Implement (Currently Empty)
-   `src/components/providers/provider-card.tsx` - **Priority 1**
-   `src/components/providers/provider-grid.tsx` - **Priority 2**
-   `src/components/providers/provider-metrics.tsx` - **Priority 3**
-   `src/components/providers/provider-actions.tsx` - **Priority 4**
-   `src/components/providers/provider-filters.tsx` - **Priority 5**

### 📝 Files to Update
-   `src/app/(dashboard)/providers/page.tsx` - Replace basic grid with rich components
-   `src/app/(dashboard)/settings/providers/page.tsx` - Add provider management UI

## 10. Design System Integration

### shadcn/ui Components to Use
-   **Card, CardHeader, CardContent, CardFooter** - Provider card structure
-   **Avatar** - Provider profile images with fallback
-   **Badge** - Provider type and status indicators
-   **Button** - Action buttons and controls
-   **DropdownMenu** - Action menus and filters
-   **Input** - Search functionality
-   **Select** - Filter dropdowns
-   **Skeleton** - Loading states
-   **Alert** - Error and empty states

### Design Patterns
-   **Responsive Grid**: 1 column (mobile) → 2 columns (tablet) → 3-4 columns (desktop)
-   **Card Hover States**: Subtle elevation and border changes
-   **Status Colors**: Green (active), Gray (inactive), Blue (pending)
-   **Typography Hierarchy**: Provider name (font-semibold), type (text-sm), details (text-xs)

## 11. Acceptance Criteria

### Functional Requirements
-   ✅ Provider cards display all relevant information clearly
-   ✅ Grid layout is responsive across all device sizes
-   ✅ Loading states use skeleton components
-   ✅ Error states provide retry functionality
-   ✅ Empty states include helpful messaging
-   ✅ Filters work correctly with the useProviders hook
-   ✅ Actions integrate with existing navigation patterns

### Technical Requirements
-   ✅ All components are fully typed with TypeScript
-   ✅ Components follow established project patterns
-   ✅ Code includes comprehensive JSDoc documentation
-   ✅ Components are accessible (ARIA labels, keyboard navigation)
-   ✅ Performance is optimized (memoization where appropriate)

### Design Requirements
-   ✅ Consistent with existing dashboard design system
-   ✅ Uses only approved shadcn/ui components
-   ✅ Responsive design works on all target devices
-   ✅ Loading and error states match application patterns
-   ✅ Color scheme follows established brand guidelines

## 12. Risk Assessment & Mitigation

### Technical Risks
-   **Risk**: Component complexity could impact performance
    -   **Mitigation**: Use React.memo for provider cards, implement virtual scrolling if needed
-   **Risk**: Type safety issues with complex provider data
    -   **Mitigation**: Leverage existing comprehensive types, add runtime validation
-   **Risk**: Inconsistent UI patterns
    -   **Mitigation**: Strict adherence to shadcn/ui components and existing patterns

### UX Risks
-   **Risk**: Information overload in provider cards
    -   **Mitigation**: Progressive disclosure, compact/expanded view modes
-   **Risk**: Poor mobile experience
    -   **Mitigation**: Mobile-first responsive design, touch-friendly interactions
-   **Risk**: Slow loading with many providers
    -   **Mitigation**: Pagination, skeleton loading, optimistic updates

## 13. Testing Strategy

### Component Testing
-   Unit tests for each component with various props
-   Accessibility testing with screen readers
-   Responsive design testing across breakpoints
-   Performance testing with large datasets

### Integration Testing
-   Provider grid with real API data
-   Filter functionality with useProviders hook
-   Navigation and action button functionality
-   Error boundary and loading state handling

## 14. Future Enhancements

### Phase 2 Features
-   **Bulk Actions**: Select multiple providers for batch operations
-   **Advanced Metrics**: Performance charts and trends
-   **Export Functionality**: CSV/PDF export of provider lists
-   **Drag & Drop**: Reorder providers or assign to locations

### Performance Optimizations
-   **Virtual Scrolling**: For large provider lists
-   **Image Optimization**: Lazy loading for provider avatars
-   **Caching**: Aggressive caching of provider data
-   **Search Optimization**: Debounced search with server-side filtering

---

**Linear Issue**: [AOJ-54](https://linear.app/aojdevstudio/issue/AOJ-54)
**Priority**: High
**Labels**: `frontend`, `ui`, `providers`, `components`
**Dependencies**: Requires completion for AOJ-53 (Provider Performance Metrics)
**Estimated Effort**: 1-2 days (12-16 hours)
