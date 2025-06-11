# Providers Main Page

## Summary

Create a comprehensive Providers page at `/dashboard/providers` that serves as the main hub for viewing and managing dental providers (dentists, hygienists, specialists) within the practice. This page will provide an overview of all providers, their performance metrics, and quick access to provider-specific information and actions. The page is distinct from the administrative settings/providers page and focuses on operational provider management and performance monitoring.

## User Stories

### As an Office Manager
- I want to see all providers in my clinic with their key performance metrics so I can monitor practice productivity
- I want to quickly identify top-performing and underperforming providers so I can make informed management decisions
- I want to filter and search providers by specialty, status, or performance criteria so I can find specific information quickly
- I want to access provider details and performance trends so I can conduct meaningful performance reviews

### As a Dentist
- I want to view my own performance metrics and compare them with clinic averages so I can track my progress
- I want to see other providers in my clinic (if permitted) so I can understand team dynamics and collaboration opportunities
- I want to access my production data and goal progress so I can monitor my professional development

### As a Front Desk Staff
- I want to see which providers are active and available so I can schedule appointments effectively
- I want to view provider specialties and services so I can match patients with appropriate providers
- I want to access provider contact information and schedules so I can coordinate patient care

### As a System Administrator
- I want to manage provider access and permissions so I can maintain proper security and data access
- I want to view provider utilization across multiple clinics so I can optimize resource allocation
- I want to generate provider performance reports so I can support clinic management decisions

## Priority & Timeline Assessment

- **Priority**: High
- **Timeline**: 2-3 Days
- **Justification**: This is a core feature for clinic management and provider engagement, directly impacting operational efficiency and performance tracking. Its completion is a high priority for the dashboard's core functionality.

## Functional Expectations

### Core Features

#### 1. Provider Overview Dashboard
- **Provider Summary Cards**: Display key metrics for each provider including:
  - Total production (daily, weekly, monthly)
  - Goal achievement percentage
  - Patient count and appointment volume
  - Specialty and services offered
  - Active status and availability
- **Performance Indicators**: Visual indicators for goal achievement, productivity trends, and performance ratings
- **Quick Stats**: Aggregate statistics for all providers (total production, average performance, etc.)

#### 2. Provider List/Grid View
- **Responsive Layout**: Card-based grid view for desktop with provider photos, names, and key metrics
- **Search Functionality**: Real-time search by provider name, specialty, or services
- **Filtering Options**: Filter by:
  - Provider type (dentist, hygienist, specialist)
  - Status (active, inactive, on leave)
  - Performance level (high, average, needs improvement)
  - Specialty or services offered
- **Sorting Options**: Sort by name, production, goal achievement, or last activity

#### 3. Provider Performance Analytics
- **Individual Performance Cards**: Detailed metrics for each provider including:
  - Production trends (charts and graphs)
  - Goal progress with variance indicators
  - Patient satisfaction scores (if available)
  - Appointment efficiency metrics
- **Comparative Analytics**: Compare provider performance against clinic averages and benchmarks
- **Time-based Analysis**: View performance over different time periods (daily, weekly, monthly, quarterly)

#### 4. Quick Actions and Management
- **Add New Provider**: Quick access to add provider form (if user has permissions)
- **Edit Provider Information**: Direct links to edit provider details and settings
- **View Provider Details**: Navigate to detailed provider profile pages
- **Schedule Management**: Integration with scheduling system for provider availability
- **Communication Tools**: Contact provider directly or send notifications

#### 5. Role-Based Access Control
- **Office Manager View**: Full access to all providers and comprehensive metrics
- **Dentist View**: Own metrics plus limited view of other providers (configurable)
- **Front Desk View**: Basic provider information focused on scheduling and patient assignment
- **System Admin View**: Full administrative access across multiple clinics

#### 6. Data Integration and Real-time Updates
- **Live Data**: Real-time updates of production data and metrics
- **Goal Integration**: Display current goals and progress for each provider
- **Appointment Integration**: Show current day's appointments and schedule status
- **Production Data**: Integration with hygiene and dentist production tracking

### Technical Requirements

#### 1. Page Structure
- **Route**: `/dashboard/providers` (new route to be created)
- **Layout**: Uses existing dashboard layout with sidebar navigation
- **Components**: Reusable provider cards, metrics displays, and filter components
- **Loading States**: Skeleton loaders for provider data and metrics

#### 2. Data Fetching
- **Server Components**: Use Next.js server components for initial data loading
- **API Integration**: Leverage existing `/api/providers` endpoint with enhancements
- **Caching Strategy**: Implement appropriate caching for provider data and metrics
- **Error Handling**: Graceful error handling with retry mechanisms

#### 3. Performance Optimization
- **Pagination**: Implement pagination for large provider lists
- **Lazy Loading**: Load provider metrics on demand or with intersection observer
- **Optimistic Updates**: Immediate UI updates for user actions with background sync
- **Image Optimization**: Optimized provider photos with Next.js Image component

#### 4. Responsive Design
- **Desktop Focus**: Primary design for desktop usage (1024px+)
- **Grid Layout**: Responsive grid that adapts to screen size
- **Touch Interactions**: Support for touch interactions on touch-enabled devices
- **Accessibility**: Full keyboard navigation and screen reader support

## Affected Files

### New Files to Create
- `src/app/(dashboard)/providers/page.tsx` - Main providers page component
- `src/app/(dashboard)/providers/loading.tsx` - Loading skeleton for providers page
- `src/app/(dashboard)/providers/error.tsx` - Error boundary for providers page
- `src/components/providers/provider-card.tsx` - Individual provider display card
- `src/components/providers/provider-grid.tsx` - Grid layout for provider cards
- `src/components/providers/provider-filters.tsx` - Search and filter components
- `src/components/providers/provider-metrics.tsx` - Provider performance metrics display
- `src/components/providers/provider-actions.tsx` - Quick action buttons and menus

### Files to Modify
- `src/app/api/providers/route.ts` - Enhance to support filtering, sorting, and metrics
- `src/lib/database/queries/providers.ts` - Add provider queries with metrics and performance data
- `src/lib/types/providers.ts` - Add provider-related type definitions
- `src/hooks/use-providers.ts` - Create custom hook for provider data management
- `src/components/common/sidebar.tsx` - Ensure providers link points to correct route

### Database Considerations
- **Existing Tables**: Leverage existing `Provider`, `MetricValue`, `Goal` tables
- **Queries**: Optimize queries for provider performance data aggregation
- **Indexes**: Ensure proper indexing for provider filtering and sorting
- **Permissions**: Implement row-level security for provider data access

## Implementation Strategy

The implementation will follow a phased, component-driven approach, starting with data access and backend logic, followed by frontend component creation and integration.

1.  **Backend First**:
    -   Update `src/lib/database/queries/providers.ts` to include functions for fetching provider lists with aggregated performance metrics.
    -   Enhance the API route `src/app/api/providers/route.ts` to support the new data requirements, including filtering, sorting, and pagination.
    -   Implement RLS policies on provider-related tables to enforce the specified access control rules.

2.  **Frontend Scaffolding**:
    -   Create the new page, loading, and error files under `src/app/(dashboard)/providers/`.
    -   Populate the page with basic structure and connect it to the API to fetch and display raw provider data.

3.  **Component Development**:
    -   Develop the reusable UI components (`provider-card.tsx`, `provider-grid.tsx`, `provider-filters.tsx`, etc.) in isolation, preferably using Storybook or a similar tool if available.
    -   Start with displaying static data, then connect them to the custom hook `use-providers.ts`.

4.  **Integration and Interactivity**:
    -   Integrate the developed components into the main page (`page.tsx`).
    -   Implement client-side logic for search, filtering, and sorting, leveraging the custom hook.
    -   Ensure loading and error states are handled gracefully.

5.  **Review and Refine**:
    -   Conduct a thorough review of the functionality against the user stories.
    -   Perform responsive testing and ensure accessibility standards are met.

## AI Guardrails Implementation Strategy

Given the complexity and number of files affected, a strict AI guardrails strategy is required.

-   **File-level Constraints**: When working with an AI assistant, each task should be scoped to a single file or a small, related group of files. For instance, a session should focus *only* on API route changes, or *only* on a specific component.
-   **Change Type Isolation**: Separate different types of changes into distinct sessions. Do not mix database query modifications with frontend component creation in the same request.
-   **Incremental Validation**: After each significant change (e.g., after modifying the API), manually test the endpoint using a tool like Postman or `curl` to validate its functionality before moving to the frontend.
-   **Safety Prompts for AI Sessions**: Use explicit and safe prompts. For example: "Safely add filtering logic to `src/app/api/providers/route.ts`. Do not modify any other part of the file. Show me the diff before applying."

## Risk Assessment & Mitigation

-   **Risk**: Performance degradation due to complex data aggregation queries.
    -   **Mitigation**: Use `EXPLAIN ANALYZE` on all new database queries. Implement proper caching at the data layer and API layer.
-   **Risk**: Incorrect data exposure due to faulty RLS policies or API logic.
    -   **Mitigation**: Write specific tests for access control scenarios. Manually test each user role (Admin, Office Manager, Dentist) to verify data visibility.
-   **Risk**: Breaking changes to the existing `/api/providers` if it's used elsewhere.
    -   **Mitigation**: Before modification, search the codebase for all usages of the endpoint. Consider creating a new, versioned endpoint (`/api/v2/providers`) if the risk of breaking existing functionality is high.

## Phase Breakdown

-   **Phase 1: Data Foundation (Backend)**
    -   Implement database queries in `providers.ts`.
    -   Update API route `route.ts`.
    -   Implement RLS policies and test them.
    -   **Goal**: A functional, secure API endpoint that provides all necessary data.
-   **Phase 2: Core UI (Frontend)**
    -   Create the page and layout files.
    -   Create `provider-card.tsx` and `provider-grid.tsx`.
    -   Display a list of providers using the API from Phase 1.
    -   **Goal**: A page that correctly displays provider information.
-   **Phase 3: Interactivity & Analytics**
    -   Implement `provider-filters.tsx` and `provider-metrics.tsx`.
    -   Add client-side logic for search, filtering, and sorting.
    -   Integrate performance charts and indicators.
    -   **Goal**: A fully interactive and data-rich user experience.

## Additional Considerations

### Security and Privacy
- **Data Access Control**: Implement proper role-based access to provider information
- **Sensitive Information**: Protect sensitive provider data (SSN, personal details)
- **Audit Logging**: Log access to provider information for compliance
- **HIPAA Compliance**: Ensure provider data handling meets healthcare privacy requirements

### Performance and Scalability
- **Large Provider Lists**: Handle clinics with many providers efficiently
- **Metrics Calculation**: Optimize real-time metrics calculation and caching
- **Database Performance**: Ensure queries scale with data volume
- **CDN Integration**: Use CDN for provider photos and static assets

### User Experience
- **Intuitive Navigation**: Clear navigation between providers page and settings
- **Consistent Design**: Maintain design consistency with existing dashboard pages
- **Loading States**: Provide clear feedback during data loading
- **Empty States**: Handle cases where no providers exist or match filters

### Integration Points
- **Settings Integration**: Clear distinction from `/settings/providers` administrative page
- **Goal System**: Integration with existing goal tracking and progress monitoring
- **Reporting**: Integration with reporting system for provider performance reports
- **Scheduling**: Potential integration with appointment scheduling systems

### Future Enhancements
- **Provider Photos**: Support for provider profile photos
- **Performance Benchmarking**: Compare against industry benchmarks
- **Advanced Analytics**: Detailed analytics and trend analysis
- **Mobile App**: Potential mobile app integration for provider access
- **Communication Tools**: Built-in messaging or communication features

---

## Linear Integration Prep

- **Suggested issue title**: Providers Main Page
- **Priority level**: High
- **Due date recommendation**: 2-3 days from start
- **Labels suggestions**: `feature`, `dashboard`, `providers`, `rbac`
- **Assignee recommendations**: AOJ Sr 