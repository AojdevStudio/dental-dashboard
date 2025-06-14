# PRD: [API] Provider Performance Metrics Endpoint (AOJ-53)

## 1. Document Information

-   **Priority**: High
-   **Timeline**: 1-2 Days
-   **Status**: Updated - Ready for Implementation
-   **Owner**: AOJ Sr
-   **Last Updated**: June 2025

## 2. Executive Summary

This document outlines the requirements for creating a new API endpoint at `/api/providers/[providerId]/performance`. This endpoint will serve as the dedicated source for provider-specific performance analytics, leveraging the existing production data models (`HygieneProduction`, `DentistProduction`) and goal tracking system to deliver comprehensive performance metrics with flexible time-period filtering.

The implementation follows the established project patterns using `withAuth` middleware, Zod validation, and the standardized API response format. This endpoint will integrate with the existing provider-location relationship system and multi-tenant architecture.

## 3. Background and Strategic Fit

The dental dashboard requires detailed provider performance analytics to support data-driven decision making. With the current database schema including dedicated production tracking tables and a sophisticated provider-location relationship system, we can now deliver comprehensive performance metrics that account for multi-location providers and location-specific production data.

This endpoint will serve as the foundation for provider performance dashboards, goal tracking visualizations, and comparative analytics across different time periods and locations.

## 4. Goals and Success Metrics

### Goals
-   Create a dedicated, performant API endpoint for provider performance metrics following established project patterns.
-   Leverage existing production data models (`HygieneProduction`, `DentistProduction`) and provider-location relationships.
-   Provide flexible filtering by time period, location, and date ranges.
-   Return standardized API responses using the project's `ApiSuccessPayload` format.
-   Implement proper authentication and multi-tenant access control.

### Success Metrics
-   **API Performance**: Endpoint response time under 500ms for typical queries.
-   **Data Accuracy**: Metrics match production data in `hygiene_production` and `dentist_production` tables.
-   **Security**: Proper multi-tenant isolation - providers only see their authorized data.
-   **Code Quality**: Follows established patterns with Zod validation, error handling, and TypeScript types.

## 5. Current Architecture Context

### Existing Infrastructure
-   **Database Models**: `HygieneProduction`, `DentistProduction`, `Provider`, `ProviderLocation`, `Goal`
-   **API Patterns**: `withAuth` middleware, standardized response format, Zod validation
-   **Provider System**: Multi-location support with primary/secondary location relationships
-   **Production Tracking**: Location-specific production data with variance calculations
-   **Goal System**: Comprehensive goal tracking with achievement percentages

### Available Query Functions
-   `getProviderPerformanceByLocation()` - Location-specific performance metrics
-   `getHygieneProductionStats()` - Hygiene production aggregations
-   Provider location relationship queries with active/inactive status

## 6. Detailed Requirements

### API Endpoint Specification
**Endpoint**: `GET /api/providers/[providerId]/performance`

**Query Parameters**:
- `period` - Time period filter: `daily`, `weekly`, `monthly`, `quarterly`, `yearly`
- `startDate` - ISO date string (optional, defaults to current month start)
- `endDate` - ISO date string (optional, defaults to current date)
- `locationId` - Filter by specific location (optional)
- `includeGoals` - Include goal achievement data (boolean, default: true)

**Authentication**: Requires valid session, multi-tenant access control applied

### Response Format
```typescript
interface ProviderPerformanceResponse {
  success: true;
  data: {
    provider: {
      id: string;
      name: string;
      providerType: 'dentist' | 'hygienist' | 'specialist' | 'other';
      primaryLocation?: LocationSummary;
    };
    period: {
      startDate: string;
      endDate: string;
      period: string;
    };
    production: {
      total: number;
      average: number;
      goal?: number;
      variance?: number;
      variancePercentage?: number;
      byLocation?: LocationProductionSummary[];
    };
    goals?: {
      total: number;
      achieved: number;
      achievementRate: number;
      details: GoalSummary[];
    };
    trends?: {
      productionTrend: TrendData[];
      goalAchievementTrend: TrendData[];
    };
  };
}
```

### Affected Files and Risk Assessment

| File/Path                                                    | Change Type  | Risk Level | Justification                                                                |
| ------------------------------------------------------------ | ------------ | ---------- | ---------------------------------------------------------------------------- |
| `src/app/api/providers/[providerId]/performance/route.ts`    | New File     | **Low**    | New API route following established patterns. Isolated implementation.       |
| `src/lib/database/queries/providers.ts`                      | Enhancement  | **Medium** | Adding new query function. Existing functions remain unchanged.             |
| `src/lib/types/providers.ts`                                 | Enhancement  | **Low**    | Adding new TypeScript interfaces. No breaking changes.                      |

## 7. Implementation Strategy

### Development Approach
Following the established project patterns and architecture:

1. **Type-First Development**: Define TypeScript interfaces before implementation
2. **Query Layer Separation**: Database logic isolated in query functions
3. **Standardized API Patterns**: Use existing middleware and response formats
4. **Incremental Testing**: Test each component independently

### Security Considerations
-   **Multi-tenant Access Control**: Providers can only access their own performance data
-   **Clinic-based Filtering**: Respect clinic boundaries in data access
-   **Input Validation**: Zod schemas for all query parameters
-   **Error Handling**: Consistent error responses without data leakage

### Performance Optimization
-   **Database Indexing**: Leverage existing indexes on `provider_id`, `date`, `clinic_id`
-   **Query Efficiency**: Use existing optimized queries where possible
-   **Response Caching**: Consider caching for frequently accessed data
-   **Pagination**: Support for large datasets if needed

## 8. Implementation Plan

### Phase 1: Type Definitions and Interfaces (2-3 hours)
**Files**: `src/lib/types/providers.ts`
-   Define `ProviderPerformanceResponse` interface
-   Add supporting types for production summaries, goal data, and trends
-   Ensure compatibility with existing provider types

### Phase 2: Database Query Functions (4-5 hours)
**Files**: `src/lib/database/queries/providers.ts`
-   Create `getProviderPerformanceMetrics()` function
-   Leverage existing production data queries
-   Implement goal achievement calculations
-   Add location-specific aggregations
-   Include proper error handling and validation

### Phase 3: API Route Implementation (3-4 hours)
**Files**: `src/app/api/providers/[providerId]/performance/route.ts`
-   Implement GET handler with `withAuth` middleware
-   Add Zod validation for query parameters
-   Integrate with database query functions
-   Implement standardized error handling
-   Add comprehensive input validation

### Phase 4: Testing and Validation (2-3 hours)
-   Unit tests for query functions
-   API endpoint testing with various scenarios
-   Performance testing with realistic data volumes
-   Security testing for multi-tenant access control

## 9. Technical Implementation Details

### Database Query Strategy
```typescript
// Leverage existing production data models
const hygieneProduction = await prisma.hygieneProduction.findMany({
  where: {
    providerId,
    date: { gte: startDate, lte: endDate },
    clinicId: { in: authContext.clinicIds } // Multi-tenant security
  }
});

const dentistProduction = await prisma.dentistProduction.findMany({
  where: {
    providerId,
    date: { gte: startDate, lte: endDate },
    clinicId: { in: authContext.clinicIds }
  }
});
```

### API Route Pattern
```typescript
export const GET = withAuth<ProviderPerformanceResponse>(
  async (request: Request, { params, authContext }) => {
    // Parameter validation with Zod
    // Multi-tenant access control
    // Query execution
    // Response formatting
  }
);
```

## 10. Risk Assessment and Mitigation

### Technical Risks
-   **Database Performance**: Large date ranges could impact query performance
    -   *Mitigation*: Implement date range limits, use existing indexes, add query optimization
-   **Data Consistency**: Production data across multiple tables
    -   *Mitigation*: Use database transactions, validate data integrity
-   **Memory Usage**: Large result sets for high-volume providers
    -   *Mitigation*: Implement pagination, optimize data structures

### Security Risks
-   **Data Leakage**: Cross-tenant data access
    -   *Mitigation*: Strict clinic-based filtering, comprehensive access control testing
-   **Input Validation**: Malformed query parameters
    -   *Mitigation*: Zod validation schemas, input sanitization

## 11. Success Criteria and Testing

### Functional Requirements
-   ✅ Endpoint returns accurate production metrics for authorized providers
-   ✅ Proper filtering by date range, location, and time period
-   ✅ Goal achievement calculations match expected values
-   ✅ Multi-tenant security enforced correctly
-   ✅ Error handling for invalid inputs and missing data

### Performance Requirements
-   ✅ Response time < 500ms for typical queries (1-12 months of data)
-   ✅ Memory usage remains reasonable for large datasets
-   ✅ Database query optimization verified with EXPLAIN ANALYZE

### Security Requirements
-   ✅ Providers cannot access other providers' data
-   ✅ Clinic boundaries respected in all queries
-   ✅ Input validation prevents injection attacks
-   ✅ Error messages don't leak sensitive information

## 12. Timeline and Deliverables

**Total Estimated Time**: 1.5-2 days (12-16 hours)

**Day 1 (8 hours)**:
-   Morning: Type definitions and interface design
-   Afternoon: Database query implementation and testing

**Day 2 (4-8 hours)**:
-   Morning: API route implementation
-   Afternoon: Testing, validation, and documentation

## 13. Future Enhancements

### Potential Extensions
-   **Caching Layer**: Redis caching for frequently accessed metrics
-   **Real-time Updates**: WebSocket support for live performance updates
-   **Advanced Analytics**: Trend analysis, forecasting, benchmarking
-   **Export Functionality**: CSV/PDF export of performance reports
-   **Comparative Analysis**: Provider-to-provider performance comparisons

### Integration Opportunities
-   **Dashboard Widgets**: Direct integration with dashboard components
-   **Goal Management**: Automated goal creation based on performance trends
-   **Notification System**: Alerts for performance thresholds
-   **Reporting Engine**: Scheduled performance reports

---

**Linear Issue**: [AOJ-53](https://linear.app/aojdevstudio/issue/AOJ-53)
**Priority**: High
**Labels**: `api`, `backend`, `performance`, `providers`, `enhancement`
**Complexity**: Medium-High