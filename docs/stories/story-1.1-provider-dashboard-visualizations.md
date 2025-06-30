# Story 1.1: Provider Dashboard Visualizations with KPI Charts

## Status: Approved

## Story
- As a dental clinic administrator
- I want to view individual provider performance dashboards with comprehensive KPI charts and real database data
- so that I can monitor provider productivity, track financial metrics, and make data-driven decisions about clinic operations

## Background Context
**Linear Issue**: AOJ-63  
**Priority**: High (Auto-calculated: Complex dashboard feature blocking provider management workflows)  
**Current State**: Provider detail pages return 404 errors when clicking "View" buttons from provider listing  
**Technical Context**: Next.js 15 + TypeScript + Supabase + Prisma architecture with multi-tenant RLS

## Acceptance Criteria (ACs)

### AC1: Provider Detail Page Navigation
- [x] Provider "View" buttons navigate to functional detail pages without 404 errors
- [x] URL pattern `/dashboard/providers/[providerId]` resolves correctly
- [x] Support for both UUID and slug-based provider identification
- [x] Proper error boundaries and 404 handling for invalid provider IDs
- [x] Breadcrumb navigation integration with back button functionality

### AC2: KPI Metrics Dashboard
- [ ] Financial KPIs display: production totals, collection rates, overhead percentages
- [ ] Performance KPIs show: goal achievement, variance analysis, trend calculations
- [ ] Patient KPIs include: patient count, appointment efficiency, case acceptance rates
- [ ] Comparative KPIs display: provider ranking, clinic averages, benchmark comparisons
- [ ] All metrics load in <2 seconds with real database data

### AC3: Interactive Chart Visualizations
- [ ] Line charts for production trends and goal progress over time
- [ ] Bar charts for monthly/quarterly performance comparisons
- [ ] Pie charts for revenue breakdown and procedure type distribution
- [ ] Gauge charts for goal achievement percentages and performance ratings
- [ ] All charts are interactive with tooltips and responsive design

### AC4: Data Integration and Performance
- [ ] Real-time data updates reflect in dashboard visualizations
- [ ] Performance metrics calculations are accurate and optimized
- [ ] Loading states and error handling work properly across all components
- [ ] Dashboard maintains responsive design across all screen sizes
- [ ] No performance degradation to existing provider listing functionality

## Tasks / Subtasks

### Task 1: Provider Detail Page Foundation (AC1)
- [ ] Create `src/app/(dashboard)/providers/[providerId]/page.tsx` with Next.js App Router dynamic routing
- [ ] Implement `src/app/(dashboard)/providers/[providerId]/loading.tsx` for loading states
- [ ] Create `src/app/(dashboard)/providers/[providerId]/error.tsx` for error boundaries
- [ ] Build `src/app/api/providers/[providerId]/route.ts` for individual provider data API
- [ ] Fix provider card navigation in existing provider listing

### Task 2: Metrics Calculation System (AC2)
- [ ] Implement `src/lib/database/queries/provider-metrics.ts` with optimized performance queries
- [ ] Create `src/lib/metrics/provider-calculations.ts` for business logic calculations
- [ ] Build `src/hooks/use-provider-metrics.ts` for data fetching with caching
- [ ] Define comprehensive type system in `src/lib/types/provider-metrics.ts`
- [ ] Validate calculations against existing provider data

### Task 3: Dashboard Visualization Components (AC3)
- [ ] Create `src/components/dashboard/provider-kpi-dashboard.tsx` main container
- [ ] Implement `src/components/dashboard/charts/provider-performance-chart.tsx`
- [ ] Build `src/components/dashboard/charts/financial-metrics-chart.tsx`
- [ ] Create `src/components/dashboard/charts/goal-progress-chart.tsx`
- [ ] Develop `src/components/dashboard/provider-comparison-table.tsx`

### Task 4: Integration and Performance Optimization (AC4)
- [ ] Integrate all dashboard components with real database data
- [ ] Implement caching strategies for expensive calculations
- [ ] Add preview metrics to provider cards on main listing
- [ ] Optimize performance for <2 second load time requirement
- [ ] Comprehensive testing and bug fixes

## Dev Notes

### Technical Architecture Context
- **Framework**: Next.js 15 with App Router and Server Components
- **Database**: Supabase PostgreSQL with Prisma ORM and Row Level Security
- **UI Components**: shadcn/ui + Radix UI with compound component patterns
- **Charts**: Recharts library for data visualizations
- **State Management**: React Server Components + TanStack Query for client state

### Existing Patterns to Follow
- **Component Architecture**: Use compound components (Root, Header, Content) pattern
- **API Patterns**: Leverage existing withAuth middleware + RLS context functions
- **Database Security**: Multi-tenant data isolation via clinic-based RLS policies
- **Type Safety**: TypeScript strict mode with comprehensive Zod validation

### Performance Requirements
- **Page Load Time**: Provider detail pages must load in <2 seconds
- **Chart Rendering**: Complex visualizations should render in <1 second
- **Database Optimization**: Use EXPLAIN ANALYZE to optimize all provider metric queries
- **Caching Strategy**: Implement appropriate caching for expensive metric calculations

### AI Guardrails (CRITICAL)
**This story requires phased implementation due to complexity:**
- **Phase 1**: Routing foundation (1-2 files max per session)
- **Phase 2**: Data layer implementation (validate queries individually)
- **Phase 3**: Visualization components (one chart type per session)
- **Phase 4**: Integration and optimization

**Safety Measures:**
- Start with static content to verify routing
- Test queries with EXPLAIN ANALYZE for performance
- Validate calculations against known provider data
- Preserve existing provider listing functionality throughout

### Testing

Dev Note: Story Requires the following tests:

- [ ] **Unit Tests**: (nextToFile: true), coverage requirement: 90%
  - Provider metrics calculation logic
  - Chart component rendering with sample data
  - API endpoint parameter validation
  - Type safety for provider metrics interfaces

- [ ] **Integration Tests** (Test Location: tests/integration/provider-dashboard/)
  - Provider detail page API endpoint with real database
  - Metrics calculation accuracy against database values
  - Dashboard component data integration
  - Multi-tenant RLS policy enforcement

- [ ] **E2E Tests**: (location: tests/e2e/provider-dashboard.spec.ts)
  - Complete provider dashboard user workflow
  - Navigation from provider listing to detail pages
  - Chart interactions and responsiveness
  - Performance testing for 2-second load requirement

## Dev Agent Record

### Agent Model Used: 
*To be filled by implementing agent*

### Implementation Phases
- **Phase 1**: Provider detail page routing and basic structure
- **Phase 2**: Database queries and metrics calculation system  
- **Phase 3**: Chart components and dashboard visualizations
- **Phase 4**: Integration, optimization, and testing

### Debug Log References
*To be filled during implementation*

### Completion Notes List
*To be filled as tasks are completed*

### Change Log
*To be updated with each implementation session*

---

**Story Priority**: High  
**Estimated Complexity**: 12-15 implementation sessions (AI Guardrails required)  
**Dependencies**: Provider listing functionality (completed), Database schema (exists)  
**Linear Integration**: AOJ-63 - Provider Dashboard Visualizations with KPI Charts and Real Database Data