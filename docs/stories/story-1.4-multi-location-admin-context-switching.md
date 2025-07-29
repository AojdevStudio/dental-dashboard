# Story 1.4: Multi-Location Admin Context Switching

## User Story
As a system administrator managing multiple dental clinic locations, I want to switch between clinic locations and view cross-location dashboards from a single admin interface, so that I can efficiently manage multiple clinics without being locked to a single location context.

## Background Context
**Priority**: High (Blocking system admin workflows)  
**Current Problem**: System admin users can access all provider data but are locked to single location context (defaults to Humble location)  
**Technical Context**: Multi-tenant architecture with RLS policies, existing auth context supports system admin role but lacks location switching UI

## UI/UX Design Specifications

**📐 Complete Wireframes**: [wireframes-multi-location-admin.md](./wireframes-multi-location-admin.md)

> **Important for Developers**: Follow the detailed wireframes document for exact visual specifications, component layouts, interaction patterns, and responsive behavior. All UI components must match the wireframe specifications.

### Location Switcher Component Design

#### Component Structure
```
🏥 [Clinics ▼] 
   ├── 🏥 Humble Clinic
   ├── 🏥 Baytown Clinic  
   └── 🌐 All Locations
```

#### Default Admin View
- **Admin Login Default**: All Locations view (not individual clinic)
- **UX Pattern**: Overview-first, then drill-down as needed
- **Mental Model**: "Show me everything, then let me focus"

#### Visual States
```
🏥 Clinics ▼        [When no specific clinic selected]
🏥 Humble Clinic ▼  [When Humble is active]
🏥 Baytown Clinic ▼ [When Baytown is active]  
🌐 All Locations ▼  [When in aggregated view - DEFAULT]
```

### All Locations Dashboard Design

#### System-Wide KPIs (Top Level)
**Focus Metrics**: MTD Production, MTD Collections, MTD New Patients, MTD Google Reviews

```
┌─ All Locations Overview ──────────────────────────────────────┐
│ 🌐 All Locations - Month to Date Performance                  │
├────────────────────────────────────────────────────────────────┤
│ 💰 MTD Production    📈 MTD Collections    👥 MTD New Patients    ⭐ MTD Reviews │
│    $21,250              $18,900               12                    8           │
├────────────────────────────────────────────────────────────────┤
```

#### Clinic Comparison Cards
```
┌─ 🏥 Humble Clinic ─────────┐  ┌─ 🏥 Baytown Clinic ────────┐
│ 💰 Production: $12,500     │  │ 💰 Production: $8,750      │
│ 📈 Collections: $11,200    │  │ 📈 Collections: $7,700     │
│ 👥 New Patients: 7         │  │ 👥 New Patients: 5         │
│ ⭐ Reviews: 5               │  │ ⭐ Reviews: 3               │
│ ────────────────────────── │  │ ────────────────────────── │
│        [View Details →]    │  │        [View Details →]    │
└────────────────────────────┘  └────────────────────────────┘
```

### Navigation System Design

#### Breadcrumb Navigation
```
🏠 Dashboard > 🌐 All Locations > 🏥 Humble Clinic > 📊 Providers
```

**Features**:
- Clickable segments for navigation
- Current page non-clickable with different styling
- Mobile collapse to "... > Current Page"

#### Back to Overview Navigation
**Recommended Approach**: Subtle integration with breadcrumbs
```
┌─ 🏥 Humble Clinic Dashboard ────────────────┐
│ ← All Locations | Humble Clinic            │ ← Header with back link
├─────────────────────────────────────────────┤
```

### Visual Design System

#### Performance Indicators
```
💰 Production: $12,500 ↗️ +8%   ← Trend indicator
📈 Collections: $11,200 ↘️ -2%  ← Performance vs target
👥 New Patients: 7 ↗️ +3        ← Month-over-month change
⭐ Reviews: 5 ⭐⭐⭐⭐⭐        ← Average rating display
```

#### Color Coding System
- **Green**: Above target/positive trend
- **Amber**: Near target/neutral
- **Red**: Below target/concerning trend

#### Card Interaction Design
- **Hover state**: Subtle shadow/border enhancement
- **Click action**: Navigate to individual clinic dashboard
- **Visual hierarchy**: Key metrics prominent, secondary info smaller
- **Status indicators**: Color-coded performance indicators

### Responsive Design

#### Desktop Layout
- 4-column KPI bar at top
- Side-by-side clinic cards below
- Full metric visibility

#### Mobile Layout
```
┌─ All Locations (Mobile) ─┐
│ 🌐 All Locations         │
├──────────────────────────┤
│ 💰 Production: $21,250   │
│ 📈 Collections: $18,900  │
│ 👥 New Patients: 12      │
│ ⭐ Reviews: 8             │
├──────────────────────────┤
│ [Clinic Cards Stacked]   │
└──────────────────────────┘
```

## User Journey Flow

1. **Admin Login** → All Locations Overview (default)
2. **Review system-wide KPIs** → Identify areas needing attention
3. **Compare clinic performance** → Via comparison cards
4. **Click clinic card** → Navigate to individual clinic dashboard
5. **Use breadcrumbs/back link** → Return to overview or navigate hierarchy

## Technical Requirements
- **Framework**: Next.js 15 with App Router and Server Components
- **Database**: Supabase PostgreSQL with Prisma ORM and Row Level Security
- **UI Components**: shadcn/ui + Radix UI with compound component patterns
- **State Management**: React Server Components + cookies for persistence
- **Authentication**: Existing auth context with system admin role support

## Implementation Tasks

**🎯 Development Reference**: All UI components must follow the detailed wireframes in [wireframes-multi-location-admin.md](./wireframes-multi-location-admin.md)

1. **Location Context Management** - Backend cookie persistence and auth context extension
2. **Location Switcher UI Component** - Dropdown component with clinic list (see wireframe sections 2 & 4)
3. **All Locations Dashboard** - Aggregated metrics view with comparison cards (see wireframe section 1)
4. **Navigation System** - Breadcrumbs and context switching (see wireframe sections 1 & 3)
5. **Individual Clinic Dashboard Integration** - Drill-down views (see wireframe section 3)
6. **API Middleware Enhancement** - Location-aware endpoint handling
7. **Security and Audit Implementation** - Access control and logging

## Acceptance Criteria

**📋 UI Compliance**: All visual elements must match the wireframe specifications in [wireframes-multi-location-admin.md](./wireframes-multi-location-admin.md)

- [ ] Location switcher dropdown in main navigation header (wireframe section 2)
- [ ] Default to "All Locations" view on admin login (wireframe section 1)
- [ ] Display current selected location with clinic name and identifier (wireframe section 2)
- [ ] "All Locations" aggregated dashboard with MTD metrics (wireframe section 1)
- [ ] Clinic comparison cards with drill-down capability (wireframe section 1)
- [ ] Breadcrumb navigation system (wireframe sections 1 & 3)
- [ ] Mobile responsive design matching mobile wireframes (wireframe section 4)
- [ ] Progress bars and trend indicators as specified (wireframe sections 1 & 3)
- [ ] Persist location selection across browser sessions via cookies
- [ ] Visual indicator showing system admin can access multiple locations
- [ ] Cross-location dashboard views with aggregated metrics
- [ ] Proper data filtering based on selected location context
- [ ] System admin only access with security validation
- [ ] Audit logging for location context switches

**Estimated Complexity**: 8-10 implementation sessions (Security-focused development required)  
**Dependencies**: Existing auth context (completed), Multi-tenant RLS policies (exists)

## Refined Design Decisions

### Progress Indicators for Metrics
**Decision**: Include target vs actual with progress bars

```
┌─ MTD Production ─────────────┐
│ 💰 $21,250 / $25,000        │
│ ████████░░ 85%               │
│ ↗️ +12% vs last month        │
└──────────────────────────────┘
```

- Color-coded progress (green >90%, amber 70-90%, red <70%)
- Instant visual assessment of performance vs goals
- Progress bars provide immediate context

### Reviews Display Format
**Decision**: Combined approach - Average rating + Total count

```
⭐ 4.8/5 (23 reviews)
```

- Average rating shows quality
- Total count shows volume/engagement
- Both metrics provide complete picture

### Quick Action Buttons on Clinic Cards
**Decision**: Minimal contextual actions

```
┌─ 🏥 Humble Clinic ─────────┐
│ [Metrics display]          │
│ ────────────────────────── │
│ [View Details] [Schedule]  │
└────────────────────────────┘
```

**Actions**: View Details (primary), Schedule, Reports

### Performance Trends on Clinic Cards
**Decision**: Subtle trend indicators

```
💰 Production: $12,500 ↗️   [Positive trend >5%]
📈 Collections: $11,200 ↘️  [Negative trend >5%]
👥 New Patients: 7 →       [Stable trend ±5%]
```

### Clinic Cards Sorting
**Decision**: Simple sorting dropdown

```
🌐 All Locations    [Sort: Performance ▼]
```

**Sort Options**: Performance (default), Alphabetical, New Patients, Reviews