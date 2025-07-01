# Component Specifications

## Overview

This document provides detailed specifications for all UI components in the Dental Dashboard. Components are built using Shadcn UI (based on Radix UI) with Tailwind CSS styling. Each component spec includes props, usage examples, and accessibility considerations.

## Quick Reference

```typescript
// Component Categories
components/
├── ui/          # Base Shadcn UI components
├── dashboard/   # Dashboard-specific components
├── providers/   # Provider management components
├── common/      # Shared application components
└── goals/       # Goal tracking components
```

## Base UI Components

### Button

A versatile button component with multiple variants and sizes.

```typescript
// components/ui/button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  asChild?: boolean
}

// Usage
<Button>Default Button</Button>
<Button variant="destructive" size="sm">Delete</Button>
<Button variant="outline" size="lg">
  <Mail className="mr-2 h-4 w-4" /> Email
</Button>
<Button variant="ghost" size="icon">
  <ChevronRight className="h-4 w-4" />
</Button>
```

**Variants:**
- `default` - Primary action button with brand colors
- `destructive` - Red button for dangerous actions
- `outline` - Secondary button with border
- `secondary` - Muted background button
- `ghost` - Transparent background with hover state
- `link` - Styled as a link

### Card

Container component for grouping related content.

```typescript
// components/ui/card.tsx
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

// Compound components
Card.Header
Card.Title
Card.Description
Card.Content
Card.Footer

// Usage
<Card>
  <CardHeader>
    <CardTitle>Monthly Production</CardTitle>
    <CardDescription>January 2024</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">$125,000</div>
    <p className="text-xs text-muted-foreground">
      +12% from last month
    </p>
  </CardContent>
</Card>
```

### Form Components

#### Input

```typescript
// components/ui/input.tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

// Usage
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input 
    id="email" 
    type="email" 
    placeholder="john@example.com"
  />
</div>
```

#### Select

```typescript
// components/ui/select.tsx
// Usage with React Hook Form
<FormField
  control={form.control}
  name="specialty"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Specialty</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select a specialty" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="general">General Dentistry</SelectItem>
          <SelectItem value="orthodontics">Orthodontics</SelectItem>
          <SelectItem value="periodontics">Periodontics</SelectItem>
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
```

#### Checkbox

```typescript
// components/ui/checkbox.tsx
interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {}

// Usage
<div className="flex items-center space-x-2">
  <Checkbox id="terms" />
  <Label 
    htmlFor="terms" 
    className="text-sm font-medium leading-none"
  >
    Accept terms and conditions
  </Label>
</div>
```

### Dialog (Modal)

```typescript
// components/ui/dialog.tsx
// Usage
<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button>Add Provider</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Add New Provider</DialogTitle>
      <DialogDescription>
        Enter provider details below
      </DialogDescription>
    </DialogHeader>
    <ProviderForm onSubmit={handleSubmit} />
  </DialogContent>
</Dialog>
```

### Table

```typescript
// components/ui/table.tsx
// Usage
<Table>
  <TableCaption>A list of recent appointments</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead>Patient</TableHead>
      <TableHead>Provider</TableHead>
      <TableHead>Time</TableHead>
      <TableHead className="text-right">Amount</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {appointments.map((appointment) => (
      <TableRow key={appointment.id}>
        <TableCell>{appointment.patientName}</TableCell>
        <TableCell>{appointment.providerName}</TableCell>
        <TableCell>{appointment.time}</TableCell>
        <TableCell className="text-right">
          ${appointment.amount}
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Tabs

```typescript
// components/ui/tabs.tsx
// Usage
<Tabs defaultValue="overview" className="w-full">
  <TabsList className="grid w-full grid-cols-3">
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="analytics">Analytics</TabsTrigger>
    <TabsTrigger value="settings">Settings</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">
    <OverviewPanel />
  </TabsContent>
  <TabsContent value="analytics">
    <AnalyticsPanel />
  </TabsContent>
  <TabsContent value="settings">
    <SettingsPanel />
  </TabsContent>
</Tabs>
```

## Dashboard Components

### KPI Card

Displays key performance indicators with trend information.

```typescript
// components/dashboard/kpi-card.tsx
interface KPICardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease'
  }
  icon?: React.ReactNode
  loading?: boolean
}

// Usage
<KPICard
  title="Monthly Production"
  value="$125,000"
  change={{ value: 12, type: 'increase' }}
  icon={<DollarSign className="h-4 w-4" />}
/>

// Implementation
export function KPICard({ title, value, change, icon, loading }: KPICardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className="text-xs text-muted-foreground">
            {change.type === 'increase' ? '+' : '-'}{change.value}% from last month
          </p>
        )}
      </CardContent>
    </Card>
  )
}
```

### Chart Container

Wrapper for chart components with consistent styling.

```typescript
// components/dashboard/chart-container.tsx
interface ChartContainerProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  action?: React.ReactNode
}

// Usage
<ChartContainer
  title="Production Trend"
  description="Monthly production over time"
  action={<Button size="sm">Export</Button>}
>
  <AreaChart data={productionData} />
</ChartContainer>
```

### Metric Card

Displays a single metric with optional comparison.

```typescript
// components/dashboard/metric-card.tsx
interface MetricCardProps {
  label: string
  value: string | number
  previousValue?: string | number
  format?: 'currency' | 'number' | 'percentage'
  trend?: 'up' | 'down' | 'neutral'
}

// Usage
<MetricCard
  label="Active Patients"
  value={1250}
  previousValue={1180}
  trend="up"
/>
```

## Provider Components

### Provider Card

Displays provider information in a card format.

```typescript
// components/providers/provider-card.tsx
interface ProviderCardProps {
  provider: {
    id: string
    name: string
    email: string
    specialty?: string
    imageUrl?: string
    locations: Array<{ id: string; name: string }>
    metrics?: {
      productionYTD: number
      activePatients: number
    }
  }
  onSelect?: (id: string) => void
  selected?: boolean
}

// Usage
<ProviderCard
  provider={provider}
  onSelect={handleProviderSelect}
  selected={selectedId === provider.id}
/>

// Implementation includes:
// - Avatar with fallback initials
// - Contact information
// - Location badges
// - Performance metrics
// - Hover and selection states
```

### Provider Filters

Filter controls for provider list.

```typescript
// components/providers/provider-filters.tsx
interface ProviderFiltersProps {
  filters: {
    search: string
    location: string
    specialty: string
    status: 'all' | 'active' | 'inactive'
  }
  onFiltersChange: (filters: ProviderFilters) => void
  locations: Array<{ id: string; name: string }>
}

// Usage
<ProviderFilters
  filters={currentFilters}
  onFiltersChange={setFilters}
  locations={clinicLocations}
/>
```

### Provider Grid

Responsive grid layout for provider cards.

```typescript
// components/providers/provider-grid.tsx
interface ProviderGridProps {
  providers: Provider[]
  loading?: boolean
  emptyMessage?: string
  onProviderSelect?: (id: string) => void
}

// Features:
// - Responsive grid (1-3 columns)
// - Loading skeleton
// - Empty state
// - Virtual scrolling for large lists
```

## Common Components

### Navigation

#### Sidebar

```typescript
// components/common/sidebar.tsx
interface SidebarProps {
  user: User
  currentPath: string
  isCollapsed?: boolean
  onToggle?: () => void
}

// Navigation items
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Providers', href: '/providers', icon: Users },
  { name: 'Goals', href: '/goals', icon: Target },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings }
]

// Features:
// - Collapsible design
// - Active route highlighting
// - Role-based menu items
// - Clinic selector
```

#### TopNav

```typescript
// components/common/top-nav.tsx
interface TopNavProps {
  user: User
  title?: string
  breadcrumbs?: Array<{ name: string; href: string }>
}

// Features:
// - Breadcrumb navigation
// - User menu dropdown
// - Notifications badge
// - Search functionality
```

### Date Picker

```typescript
// components/common/date-picker.tsx
interface DatePickerProps {
  value?: Date
  onChange: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
}

// Usage
<DatePicker
  value={selectedDate}
  onChange={setSelectedDate}
  placeholder="Select date"
  minDate={new Date(2024, 0, 1)}
/>
```

### Empty State

```typescript
// components/common/empty-state.tsx
interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

// Usage
<EmptyState
  icon={<Users className="h-12 w-12" />}
  title="No providers found"
  description="Add your first provider to get started"
  action={{
    label: "Add Provider",
    onClick: () => router.push('/providers/new')
  }}
/>
```

### Loading States

#### Skeleton Loaders

```typescript
// components/common/skeleton-loaders.tsx
export function ProviderCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-20 w-full" />
      </CardContent>
    </Card>
  )
}

export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {Array.from({ length: columns }).map((_, i) => (
            <TableHead key={i}>
              <Skeleton className="h-4 w-20" />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, i) => (
          <TableRow key={i}>
            {Array.from({ length: columns }).map((_, j) => (
              <TableCell key={j}>
                <Skeleton className="h-4 w-24" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

## Goal Components

### Goal Card

```typescript
// components/goals/goal-card.tsx
interface GoalCardProps {
  goal: {
    id: string
    type: 'production' | 'collection' | 'new_patients'
    period: 'monthly' | 'quarterly' | 'annual'
    target: number
    actual: number
    variance: number
    percentageAchieved: number
    provider?: Provider
  }
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

// Features:
// - Progress visualization
// - Variance indicator (positive/negative)
// - Period badge
// - Action menu
```

### Goal Progress

Visual representation of goal achievement.

```typescript
// components/goals/goal-progress.tsx
interface GoalProgressProps {
  target: number
  actual: number
  format?: 'currency' | 'number' | 'percentage'
  showLabels?: boolean
  size?: 'sm' | 'md' | 'lg'
}

// Usage
<GoalProgress
  target={100000}
  actual={85000}
  format="currency"
  showLabels
/>

// Features:
// - Progress bar with percentage
// - Color coding (green/yellow/red)
// - Animated transitions
// - Tooltip with details
```

## Chart Components

### Area Chart

```typescript
// components/dashboard/charts/area-chart.tsx
interface AreaChartProps {
  data: Array<{
    date: string
    value: number
    [key: string]: any
  }>
  dataKey: string
  xAxisKey?: string
  height?: number
  showGrid?: boolean
  showTooltip?: boolean
}

// Usage
<AreaChart
  data={monthlyProduction}
  dataKey="production"
  xAxisKey="month"
  height={300}
/>
```

### Bar Chart

```typescript
// components/dashboard/charts/bar-chart.tsx
interface BarChartProps {
  data: any[]
  categories: string[]
  index: string
  colors?: string[]
  stacked?: boolean
  showLegend?: boolean
  height?: number
}

// Usage
<BarChart
  data={providerComparison}
  categories={['production', 'collections']}
  index="provider"
  colors={['blue', 'green']}
  stacked
/>
```

## Accessibility Guidelines

### Focus Management

All interactive components must:
- Be keyboard navigable
- Have visible focus indicators
- Support Tab/Shift+Tab navigation
- Use appropriate ARIA attributes

```typescript
// Example: Accessible button
<Button
  onClick={handleClick}
  aria-label="Delete provider"
  aria-describedby="delete-warning"
>
  <Trash className="h-4 w-4" />
</Button>
<span id="delete-warning" className="sr-only">
  This action cannot be undone
</span>
```

### Screen Reader Support

```typescript
// Loading states
<div role="status" aria-live="polite">
  <Spinner />
  <span className="sr-only">Loading providers...</span>
</div>

// Form validation
<Input
  aria-invalid={!!errors.email}
  aria-describedby={errors.email ? "email-error" : undefined}
/>
{errors.email && (
  <p id="email-error" role="alert" className="text-sm text-destructive">
    {errors.email.message}
  </p>
)}
```

### Color Contrast

All text must meet WCAG AA standards:
- Normal text: 4.5:1 contrast ratio
- Large text: 3:1 contrast ratio
- Use semantic color variables

## Component Testing

### Test Structure

```typescript
// Component test example
describe('ProviderCard', () => {
  const defaultProps = {
    provider: {
      id: '1',
      name: 'Dr. Smith',
      email: 'smith@example.com',
      locations: [{ id: 'loc1', name: 'Main Office' }]
    }
  }

  it('renders provider information', () => {
    render(<ProviderCard {...defaultProps} />)
    
    expect(screen.getByText('Dr. Smith')).toBeInTheDocument()
    expect(screen.getByText('smith@example.com')).toBeInTheDocument()
    expect(screen.getByText('Main Office')).toBeInTheDocument()
  })

  it('handles selection', async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()
    
    render(<ProviderCard {...defaultProps} onSelect={onSelect} />)
    
    await user.click(screen.getByRole('article'))
    
    expect(onSelect).toHaveBeenCalledWith('1')
  })

  it('shows loading state', () => {
    render(<ProviderCard {...defaultProps} loading />)
    
    expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument()
  })
})
```

## Component Documentation

Each component should include:

1. **Props Interface** - TypeScript interface with JSDoc comments
2. **Usage Examples** - Common use cases
3. **Styling Props** - Available className and style overrides
4. **Accessibility** - ARIA attributes and keyboard support
5. **Performance** - Memoization and optimization notes

Example:
```typescript
/**
 * ProviderCard displays provider information in a card layout
 * 
 * @example
 * ```tsx
 * <ProviderCard
 *   provider={provider}
 *   onSelect={handleSelect}
 *   selected={isSelected}
 * />
 * ```
 * 
 * @accessibility
 * - Keyboard navigable with Enter/Space for selection
 * - Announces provider details to screen readers
 * - Focus visible indicator
 * 
 * @performance
 * - Memoized to prevent unnecessary re-renders
 * - Lazy loads provider image
 */
```

## Related Resources

- [Frontend Architecture](./frontend-architecture.md) - Component patterns
- [UI/UX Specifications](./ui-ux-spec.md) - Design guidelines
- [Testing Strategy](./testing-strategy.md) - Component testing

---

**Last Updated**: December 2024
**Navigation**: [Back to Architecture Index](./index.md)