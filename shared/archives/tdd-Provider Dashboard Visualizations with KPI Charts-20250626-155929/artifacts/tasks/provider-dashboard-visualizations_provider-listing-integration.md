# Task: Provider Listing Integration and Preview Metrics

## Description
Enhance the existing provider listing page by adding preview metrics to provider cards and ensuring seamless navigation to the new provider detail dashboards. This integration maintains existing functionality while providing improved user experience.

## Dependencies
- Provider detail page routing foundation (provider-dashboard-visualizations_routing-foundation)
- Provider metrics calculation system (provider-dashboard-visualizations_metrics-calculation-system)
- Data integration and optimization (provider-dashboard-visualizations_data-integration-optimization)

## Acceptance Criteria
- [ ] Provider cards display preview metrics (key financial and performance indicators)
- [ ] "View" buttons navigate successfully to provider detail dashboards
- [ ] Preview metrics load efficiently without impacting list performance
- [ ] Hover states provide additional metric details
- [ ] Responsive design maintains card layout on all devices
- [ ] Loading states show while preview metrics are calculated
- [ ] Error handling manages missing preview data gracefully
- [ ] No regression in existing provider listing functionality

## Technical Requirements
- Enhance existing `src/components/providers/provider-card.tsx` with preview metrics
- Add preview metric calculations to provider listing API endpoints
- Implement efficient data fetching for preview metrics
- Update provider listing layout to accommodate additional metric data
- Fix navigation integration with provider detail dashboard routing
- Use consistent styling with existing provider card design
- Add proper TypeScript interfaces for preview metric data
- Implement caching for preview metric calculations

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Provider cards display relevant preview metrics
- [ ] Navigation to provider dashboards works seamlessly
- [ ] Preview metrics load efficiently with list data
- [ ] Provider listing performance is maintained or improved
- [ ] Responsive design works across all device sizes
- [ ] Integration preserves all existing provider listing features
- [ ] Error handling provides appropriate user feedback

## Test Scenarios
**Integration Testing:**
- Provider listing loads successfully with preview metrics
- Navigation from listing to dashboard works correctly
- Back navigation from dashboard returns to listing properly
- Preview metrics match full dashboard calculations
- URL parameters and routing work correctly

**Performance Testing:**
- Provider listing loads within existing performance standards
- Preview metric calculations don't slow down list rendering
- Efficient caching reduces redundant preview calculations
- Large provider lists maintain smooth scrolling and interaction
- Mobile performance remains responsive

**User Experience:**
- Provider cards provide useful preview information
- Visual hierarchy guides users to important metrics
- Hover states enhance preview metric display
- Loading states provide appropriate feedback
- Error states handle missing metrics gracefully

**Regression Testing:**
- All existing provider listing functionality remains intact
- Provider filtering and sorting continue to work
- Provider creation and editing features are unaffected
- Mobile responsive design is preserved
- Accessibility features remain functional

## Implementation Notes
- Design preview metrics to highlight most important KPIs
- Implement hover states for additional metric details
- Use consistent color coding and visual indicators
- Add subtle loading animations for preview metrics
- Consider implementing preview metric tooltips
- Optimize preview calculations for list performance
- Design integration to be backward compatible
- Add proper error logging for preview metric failures

## Potential Gotchas
- Provider listing performance impact from preview calculations
- Card layout complexity with additional metric data
- Caching strategy alignment with full dashboard metrics
- Navigation state management between listing and dashboard
- Responsive design complexity with preview metrics
- Error handling that doesn't disrupt existing listing functionality
- Preview metric accuracy matching dashboard calculations
- Mobile touch interaction optimization with enhanced cards