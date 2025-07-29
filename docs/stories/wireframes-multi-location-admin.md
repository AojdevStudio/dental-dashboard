# Multi-Location Admin Context Switching - Detailed Wireframes

*Created: July 2, 2025*  
*Related Story: [story-1.4-multi-location-admin-context-switching.md](./story-1.4-multi-location-admin-context-switching.md)*

## Wireframe Overview

This document contains detailed wireframes for the multi-location admin context switching feature, showing the complete user interface design for system administrators managing multiple dental clinic locations.

## 1. All Locations Dashboard (Default Admin View)

### Desktop Layout (1200px+)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ HEADER                                                                          │
├─ Logo ──┬─ Navigation ─────────────────────────────┬─ 🌐 All Locations ▼ ─┬─ User ─┤
│  [🦷]   │ Dashboard | Providers | Reports | Goals │                        │  [👤] │
└─────────┴─────────────────────────────────────────┴────────────────────────┴───────┘
┌─────────────────────────────────────────────────────────────────────────────────┐
│ BREADCRUMB NAVIGATION                                                           │
├─ 🏠 Dashboard > 🌐 All Locations                                               │
└─────────────────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────────────────┐
│ PAGE HEADER                                                                     │
├─ 🌐 All Locations - Month to Date Performance                                  │
│   Last updated: 2 minutes ago                                 [Sort: Performance ▼] │
└─────────────────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────────────────┐
│ SYSTEM-WIDE KPI BAR                                                            │
├─┬─ 💰 MTD Production ─┬─ 📈 MTD Collections ─┬─ 👥 MTD New Patients ─┬─ ⭐ MTD Reviews ─┤
│ │     $21,250        │      $18,900         │         12            │    4.8/5 (31)   │
│ │ ████████░░ 85%     │ ███████░░░ 76%       │ ██████░░░░ 60%        │ ⭐⭐⭐⭐⭐      │
│ │ ↗️ +12% vs last mo │ ↘️ -3% vs last mo    │ ↗️ +20% vs last mo    │ → stable        │
│ │ Target: $25,000    │ Target: $25,000      │ Target: 20            │ Target: 4.5+    │
└─┴───────────────────┴─────────────────────┴──────────────────────┴─────────────────┘
┌─────────────────────────────────────────────────────────────────────────────────┐
│ CLINIC COMPARISON CARDS                                                         │
├─┬─ 🏥 Humble Clinic ──────────────┬─ 🏥 Baytown Clinic ─────────────┬─ [Future] ──┤
│ │ 💰 Production: $12,500 ↗️       │ 💰 Production: $8,750 ↗️        │             │
│ │ ████████░░ 83%                  │ ██████░░░░ 70%                  │   [Add New  │
│ │                                 │                                 │    Clinic]  │
│ │ 📈 Collections: $11,200 ↘️      │ 📈 Collections: $7,700 ↘️       │             │
│ │ ███████░░░ 75%                  │ ██████░░░░ 77%                  │             │
│ │                                 │                                 │             │
│ │ 👥 New Patients: 7 ↗️           │ 👥 New Patients: 5 ↗️           │             │
│ │ ████░░░░░░ 35%                  │ ████████░░ 83%                  │             │
│ │                                 │                                 │             │
│ │ ⭐ Reviews: 4.9/5 (18) →        │ ⭐ Reviews: 4.6/5 (13) →        │             │
│ │ ⭐⭐⭐⭐⭐                      │ ⭐⭐⭐⭐⭐                      │             │
│ │                                 │                                 │             │
│ │ ─────────────────────────────── │ ─────────────────────────────── │             │
│ │ [View Details] [Schedule] [Reports] │ [View Details] [Schedule] [Reports] │         │
└─┴─────────────────────────────────┴─────────────────────────────────┴─────────────┘
┌─────────────────────────────────────────────────────────────────────────────────┐
│ COMPARATIVE ANALYTICS SECTION                                                   │
├─ Performance Trends (Last 6 Months)                                            │
│ ┌─ Revenue Comparison ─────────────────┐ ┌─ Patient Acquisition ─────────────┐ │
│ │     $15K ┌──●                       │ │     25 ┌──●                       │ │
│ │     $12K │    ●──●                  │ │     20 │    ●──●                  │ │
│ │      $9K │        ●──●              │ │     15 │        ●──●              │ │
│ │      $6K │            ●──●          │ │     10 │            ●──●          │ │
│ │      $3K └──────────────────────────│ │      5 └──────────────────────────│ │
│ │          Jan Feb Mar Apr May Jun    │ │          Jan Feb Mar Apr May Jun  │ │
│ │ ● Humble   ● Baytown                │ │ ● Humble   ● Baytown              │ │
│ └─────────────────────────────────────┘ └───────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Key Wireframe Elements:

1. **Header Integration**: Location switcher prominently placed in header
2. **KPI Bar**: Four key metrics with progress bars and trend indicators
3. **Clinic Cards**: Side-by-side comparison with detailed metrics
4. **Sorting Control**: Easy access to different organization methods
5. **Comparative Charts**: Visual trend analysis across locations

## 2. Location Switcher Component States

### Collapsed State (Default)
```
┌─ Header Section ────────────────────────────────────────────────┐
│ ... Navigation ...    🌐 All Locations ▼    ... User Menu ... │
└─────────────────────────────────────────────────────────────────┘
```

### Expanded Dropdown
```
┌─ Header Section ────────────────────────────────────────────────┐
│ ... Navigation ...    🌐 All Locations ▼    ... User Menu ... │
│                       ┌─ Location Dropdown ─────────────────┐   │
│                       │ 🌐 All Locations        ✓ SELECTED │   │
│                       │ ─────────────────────────────────── │   │
│                       │ 🏥 Humble Clinic                   │   │
│                       │ 🏥 Baytown Clinic                  │   │
│                       │ ─────────────────────────────────── │   │
│                       │ ⚙️  Manage Locations               │   │
│                       └─────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Individual Clinic Selected
```
┌─ Header Section ────────────────────────────────────────────────┐
│ ... Navigation ...    🏥 Humble Clinic ▼    ... User Menu ... │
└─────────────────────────────────────────────────────────────────┘
```

## 3. Individual Clinic Dashboard (Drill-down View)

### Desktop Layout - Humble Clinic View
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ HEADER                                                                          │
├─ Logo ──┬─ Navigation ─────────────────────────────┬─ 🏥 Humble Clinic ▼ ─┬─ User ─┤
│  [🦷]   │ Dashboard | Providers | Reports | Goals │                       │  [👤] │
└─────────┴─────────────────────────────────────────┴───────────────────────┴───────┘
┌─────────────────────────────────────────────────────────────────────────────────┐
│ BREADCRUMB NAVIGATION                                                           │
├─ 🏠 Dashboard > 🌐 All Locations > 🏥 Humble Clinic                           │
└─────────────────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────────────────┐
│ PAGE HEADER WITH BACK NAVIGATION                                                │
├─ ← All Locations | 🏥 Humble Clinic Dashboard                                 │
│   123 Main St, Humble, TX 77338                      Last updated: 1 min ago    │
└─────────────────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────────────────┐
│ CLINIC-SPECIFIC KPI BAR                                                        │
├─┬─ 💰 MTD Production ─┬─ 📈 MTD Collections ─┬─ 👥 MTD New Patients ─┬─ ⭐ MTD Reviews ─┤
│ │     $12,500        │      $11,200         │          7            │   4.9/5 (18)    │
│ │ ████████░░ 83%     │ ███████░░░ 75%       │ ████░░░░░░ 35%        │ ⭐⭐⭐⭐⭐      │
│ │ ↗️ +15% vs last mo │ ↘️ -5% vs last mo    │ ↗️ +40% vs last mo    │ → stable        │
│ │ Target: $15,000    │ Target: $15,000      │ Target: 20            │ Target: 4.5+    │
└─┴───────────────────┴─────────────────────┴──────────────────────┴─────────────────┘
┌─────────────────────────────────────────────────────────────────────────────────┐
│ DETAILED CLINIC ANALYTICS                                                       │
├─┬─ Provider Performance ──────────┬─ Appointment Analytics ──────────────────┬─┤
│ │ Dr. Kamdi Irondi              │ │ Today's Schedule                        │ │
│ │ • Production: $8,200 ↗️       │ │ ┌─ 9:00 AM ─ John Smith ─ Cleaning ─┐ │ │
│ │ • Patients: 45 this month     │ │ │ Status: Confirmed                  │ │ │
│ │ • Avg per visit: $182         │ │ └────────────────────────────────────┘ │ │
│ │                               │ │ ┌─ 10:30 AM ─ Jane Doe ─ Filling ──┐ │ │
│ │ Dr. Chinyere Enih             │ │ │ Status: In Progress               │ │ │
│ │ • Production: $4,300 ↗️       │ │ └────────────────────────────────────┘ │ │
│ │ • Patients: 28 this month     │ │                                        │ │
│ │ • Avg per visit: $154         │ │ Utilization: 85% ↗️                   │ │
│ │                               │ │ No-shows: 2.1% ↘️                     │ │
└─┴───────────────────────────────┴────────────────────────────────────────────┴─┘
┌─────────────────────────────────────────────────────────────────────────────────┐
│ QUICK ACTIONS & ALERTS                                                          │
├─ 🚨 Alerts: 2 overdue insurance claims need attention                          │
│ 📋 Quick Actions: [Add Patient] [Schedule Appointment] [View Reports] [Settings] │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 4. Mobile Responsive Wireframes

### Mobile All Locations View (375px)
```
┌─────────────────────────────────┐
│ MOBILE HEADER                   │
├─ [☰] 🦷 Dental    🌐 All Loc ▼ │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ 🌐 All Locations                │
│ Last updated: 2 min ago         │
│             [Sort: Perf ▼]      │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ STACKED KPI CARDS               │
├─ 💰 MTD Production              │
│   $21,250 ████████░░ 85%        │
│   ↗️ +12% vs last month          │
├─ 📈 MTD Collections             │
│   $18,900 ███████░░░ 76%        │
│   ↘️ -3% vs last month           │
├─ 👥 MTD New Patients            │
│   12 ██████░░░░ 60%             │
│   ↗️ +20% vs last month          │
├─ ⭐ MTD Reviews                  │
│   4.8/5 (31) ⭐⭐⭐⭐⭐         │
│   → stable                      │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ CLINIC CARDS (STACKED)          │
├─ 🏥 Humble Clinic               │
│ 💰 $12,500 ↗️ | 📈 $11,200 ↘️   │
│ 👥 7 ↗️ | ⭐ 4.9/5 (18) →       │
│ [View Details] [Schedule]       │
├─────────────────────────────────┤
├─ 🏥 Baytown Clinic              │
│ 💰 $8,750 ↗️ | 📈 $7,700 ↘️     │
│ 👥 5 ↗️ | ⭐ 4.6/5 (13) →       │
│ [View Details] [Schedule]       │
└─────────────────────────────────┘
```

### Mobile Location Switcher
```
┌─────────────────────────────────┐
│ [☰] 🦷 Dental    🌐 All Loc ▼  │
│                  ┌─────────────┐│
│                  │🌐 All Loc ✓││
│                  │─────────────││
│                  │🏥 Humble    ││
│                  │🏥 Baytown   ││
│                  │─────────────││
│                  │⚙️ Manage    ││
│                  └─────────────┘│
└─────────────────────────────────┘
```

## 5. Interaction Flow Diagrams

### Admin Login to Clinic Selection Flow
```
[Admin Login] → [All Locations Dashboard] → [Click Clinic Card] → [Individual Clinic Dashboard]
      ↓                     ↓                        ↓                        ↓
[Auth Check]         [Load Aggregated Data]    [Switch Context]      [Load Clinic-Specific Data]
      ↓                     ↓                        ↓                        ↓
[Set Default:        [Display KPIs &           [Update URL &         [Display Detailed
 All Locations]       Comparison Cards]        Breadcrumbs]           Analytics]
```

### Location Switching Flow
```
[Current View] → [Click Location Switcher] → [Select New Location] → [Updated Dashboard]
      ↓                     ↓                        ↓                     ↓
[Any Dashboard]      [Show Dropdown Menu]     [Validate Access]     [Load New Context Data]
      ↓                     ↓                        ↓                     ↓
[Maintain Context]   [Highlight Current]      [Update Cookie]       [Update All Components]
```

## 6. Component Specifications

### Location Switcher Component
```typescript
interface LocationSwitcherProps {
  currentLocation: 'all' | string;
  availableLocations: Clinic[];
  onLocationChange: (locationId: string | 'all') => void;
  isSystemAdmin: boolean;
}

// States:
// - Collapsed: Shows current selection
// - Expanded: Shows dropdown with options
// - Loading: Shows switching state
// - Error: Shows error state with retry
```

### Clinic Comparison Card
```typescript
interface ClinicCardProps {
  clinic: Clinic;
  metrics: {
    production: MetricWithTarget;
    collections: MetricWithTarget;
    newPatients: MetricWithTarget;
    reviews: ReviewMetric;
  };
  onViewDetails: (clinicId: string) => void;
  showTrends: boolean;
  showActions: boolean;
}

// States:
// - Default: Normal display
// - Hover: Enhanced shadow/border
// - Loading: Skeleton placeholder
// - Error: Error state with retry
```

### KPI Metric Card
```typescript
interface KPICardProps {
  title: string;
  value: number | string;
  target?: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: string;
  icon: React.ReactNode;
  showProgressBar: boolean;
  format: 'currency' | 'number' | 'rating';
}
```

## 7. Accessibility Considerations

### Keyboard Navigation
- **Tab order**: Location switcher → Sort dropdown → Clinic cards → Quick actions
- **Arrow keys**: Navigate within dropdowns
- **Enter/Space**: Activate selections
- **Escape**: Close dropdowns

### Screen Reader Support
- **ARIA labels**: All interactive elements properly labeled
- **Live regions**: Announce data updates and context changes
- **Semantic HTML**: Proper heading hierarchy and landmarks
- **Focus management**: Logical focus flow during navigation

### Visual Accessibility
- **Color contrast**: WCAG AA compliance (4.5:1 minimum)
- **Focus indicators**: Clear visual focus states
- **Text sizing**: Scalable fonts, minimum 16px base
- **Motion**: Reduced motion options for animations

## 8. Performance Considerations

### Loading States
- **Skeleton screens**: For clinic cards during data loading
- **Progressive loading**: KPIs load first, then detailed analytics
- **Optimistic updates**: Immediate UI feedback for location switching

### Data Loading Strategy
- **All Locations**: Load aggregated data in single request
- **Individual Clinics**: Load detailed data on demand
- **Caching**: Cache clinic data for 5 minutes
- **Background refresh**: Update data every 2 minutes

## Implementation Notes

### Development Requirements
**📋 Story Reference**: This wireframe implements the requirements defined in [story-1.4-multi-location-admin-context-switching.md](./story-1.4-multi-location-admin-context-switching.md)

> **Critical**: All components must be implemented exactly as shown in these wireframes. Deviations from the visual specifications require UI Expert approval.

### Next Steps for Development
1. **Component Library Setup**: Create base components (KPI Card, Clinic Card, Location Switcher)
2. **Data Layer**: Implement API endpoints for aggregated and clinic-specific data
3. **State Management**: Set up location context and data caching
4. **Responsive Implementation**: Mobile-first approach with progressive enhancement
5. **Testing Strategy**: Unit tests for components, integration tests for flows

### Technical Dependencies
- **shadcn/ui components**: Dropdown, Card, Progress, Badge
- **Chart library**: For comparative analytics (Chart.js or Recharts)
- **State management**: React Context for location switching
- **Routing**: Next.js App Router with dynamic segments

---

*These wireframes provide the complete visual specification for implementing the multi-location admin context switching feature. All interactions, states, and responsive behaviors are documented for development reference.* 