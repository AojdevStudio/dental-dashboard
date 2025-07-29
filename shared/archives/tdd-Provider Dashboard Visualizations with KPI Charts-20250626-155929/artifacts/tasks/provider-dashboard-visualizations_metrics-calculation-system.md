# Task: Provider Metrics Calculation System

## Description
Implement a comprehensive metrics calculation system for provider performance data, including financial KPIs, performance metrics, patient statistics, and comparative analytics. This forms the data foundation for all dashboard visualizations.

## Dependencies
- Provider detail page routing foundation (provider-dashboard-visualizations_routing-foundation)
- Existing database schema with provider, clinic, and metrics tables
- Multi-tenant RLS policies for data security

## Acceptance Criteria
- [ ] Financial KPIs calculate: production totals, collection rates, overhead percentages
- [ ] Performance KPIs compute: goal achievement, variance analysis, trend calculations
- [ ] Patient KPIs include: patient count, appointment efficiency, case acceptance rates
- [ ] Comparative KPIs show: provider ranking, clinic averages, benchmark comparisons
- [ ] All calculations are accurate and optimized for performance
- [ ] Metrics calculations respect multi-tenant data isolation
- [ ] Type-safe interfaces define all metric data structures
- [ ] Caching strategy implemented for expensive calculations

## Technical Requirements
- Implement `src/lib/database/queries/provider-metrics.ts` with optimized performance queries
- Create `src/lib/metrics/provider-calculations.ts` for business logic calculations
- Build `src/hooks/use-provider-metrics.ts` for data fetching with caching
- Define comprehensive type system in `src/types/provider-metrics.ts`
- Use Prisma ORM with appropriate joins and aggregations
- Implement TanStack Query for client-side caching
- Add Zod schemas for metrics data validation
- Use EXPLAIN ANALYZE for query performance optimization

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Metrics calculations return accurate results
- [ ] Database queries execute within performance requirements (<2 seconds)
- [ ] Type system covers all metric data structures
- [ ] Caching strategies reduce redundant calculations
- [ ] Multi-tenant security maintained throughout
- [ ] Unit tests written for calculation logic (90% coverage)
- [ ] Integration tests validate database accuracy

## Test Scenarios
**Calculation Accuracy:**
- Financial metrics match manual calculations
- Performance metrics align with goal data
- Patient metrics reflect appointment records
- Comparative metrics show correct rankings

**Performance Testing:**
- Complex metric queries execute under 2 seconds
- Caching reduces repeated calculation overhead
- Large datasets don't degrade performance
- Parallel metric calculations work efficiently

**Data Validation:**
- Missing data scenarios handle gracefully
- Invalid date ranges return appropriate errors
- Edge cases with zero values calculate correctly
- Partial data sets don't break calculations

**Security Validation:**
- RLS policies restrict metrics to correct clinic
- Provider access controls work properly
- Sensitive financial data is protected
- Multi-tenant isolation is maintained

## Implementation Notes
- Start with basic financial metrics and expand incrementally
- Use database-level aggregations for performance
- Implement proper error handling for missing data
- Add comprehensive logging for calculation debugging
- Design metrics system to be extensible for new KPIs
- Consider implementing metric caching at multiple levels
- Validate calculations against existing provider data
- Use TypeScript strict mode for type safety

## Potential Gotchas
- Date range calculations and timezone handling
- Null/undefined data in metric calculations
- Division by zero in percentage calculations
- Large dataset performance optimization
- Caching invalidation strategies
- Multi-tenant context in database queries
- Memory usage with large metric datasets
- Concurrent access to cached calculations