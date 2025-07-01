# UI/UX Specifications

## Overview

This document defines the visual design language, interaction patterns, and user experience guidelines for the Dental Dashboard. It covers design principles, typography, color systems, spacing, components, and responsive behavior.

## Quick Reference

```typescript
// Design tokens
--primary: hsl(220.9 39.3% 11%)       // Navy blue
--background: hsl(0 0% 100%)          // White
--foreground: hsl(224 71.4% 4.1%)     // Dark blue
--muted: hsl(220 14.3% 95.9%)        // Light gray
--accent: hsl(220 14.3% 95.9%)       // Accent color

// Breakpoints
sm: 640px   // Mobile landscape
md: 768px   // Tablet
lg: 1024px  // Desktop
xl: 1280px  // Wide desktop
2xl: 1536px // Ultra-wide
```

## Design Principles

### 1. Clean Healthcare Aesthetic

The dashboard maintains a professional, clinical appearance that instills trust while remaining approachable.

```css
/* Clean, medical-grade design */
.card {
  background: white;
  border: 1px solid hsl(220 13% 91%);
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}
```

### 2. Data-First Approach

Information hierarchy prioritizes critical metrics and KPIs.

```typescript
// KPI Card hierarchy
<Card>
  <CardHeader className="pb-2">
    <CardTitle className="text-sm font-medium text-muted-foreground">
      Monthly Production
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">$125,000</div>
    <p className="text-xs text-muted-foreground">
      +12% from last month
    </p>
  </CardContent>
</Card>
```

### 3. Accessibility First

All interfaces meet WCAG 2.1 AA standards.

- Minimum contrast ratio: 4.5:1 for normal text
- Focus indicators on all interactive elements
- Keyboard navigation support
- Screen reader announcements

### 4. Mobile Responsive

Mobile-first design with progressive enhancement.

## Typography System

### Font Stack

```css
/* System font stack for performance */
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, 
  "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", 
  "Segoe UI Emoji", "Segoe UI Symbol";
```

### Type Scale

```css
/* Fluid typography with clamp() */
--text-xs: clamp(0.75rem, 2vw, 0.875rem);
--text-sm: clamp(0.875rem, 2.5vw, 1rem);
--text-base: clamp(1rem, 3vw, 1.125rem);
--text-lg: clamp(1.125rem, 3.5vw, 1.25rem);
--text-xl: clamp(1.25rem, 4vw, 1.5rem);
--text-2xl: clamp(1.5rem, 5vw, 2rem);
--text-3xl: clamp(1.875rem, 6vw, 2.5rem);
--text-4xl: clamp(2.25rem, 7vw, 3rem);
```

### Font Weights

```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Line Heights

```css
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

## Color System

### Brand Colors

```css
:root {
  /* Primary palette */
  --primary: hsl(220.9 39.3% 11%);
  --primary-foreground: hsl(210 20% 98%);
  
  /* Secondary palette */
  --secondary: hsl(220 14.3% 95.9%);
  --secondary-foreground: hsl(220.9 39.3% 11%);
  
  /* Accent colors */
  --accent: hsl(220 14.3% 95.9%);
  --accent-foreground: hsl(220.9 39.3% 11%);
}
```

### Semantic Colors

```css
:root {
  /* Status colors */
  --success: hsl(142 76% 36%);
  --success-foreground: hsl(356 100% 97%);
  
  --warning: hsl(38 92% 50%);
  --warning-foreground: hsl(48 100% 96%);
  
  --error: hsl(346 87% 43%);
  --error-foreground: hsl(360 100% 97%);
  
  --info: hsl(217 91% 60%);
  --info-foreground: hsl(214 100% 97%);
}
```

### Dark Mode

```css
.dark {
  --background: hsl(224 71.4% 4.1%);
  --foreground: hsl(210 20% 98%);
  
  --card: hsl(224 71.4% 4.1%);
  --card-foreground: hsl(210 20% 98%);
  
  --primary: hsl(210 20% 98%);
  --primary-foreground: hsl(220.9 39.3% 11%);
}
```

## Spacing System

### Base Unit

8px grid system for consistent spacing.

```css
/* Spacing scale */
--space-0: 0;
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
```

### Component Spacing

```typescript
// Consistent padding patterns
<Card className="p-6">            // 24px padding
  <CardHeader className="pb-2">   // 8px bottom padding
    <CardTitle />
  </CardHeader>
  <CardContent className="pt-4">  // 16px top padding
    {/* Content */}
  </CardContent>
</Card>
```

## Layout Patterns

### Dashboard Grid

```css
/* Responsive dashboard grid */
.dashboard-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

/* KPI row */
.kpi-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}
```

### Sidebar Layout

```typescript
// Collapsible sidebar pattern
<div className="flex h-screen">
  {/* Sidebar */}
  <aside className={cn(
    "bg-card border-r transition-all duration-300",
    isCollapsed ? "w-16" : "w-64"
  )}>
    <Sidebar />
  </aside>
  
  {/* Main content */}
  <main className="flex-1 overflow-y-auto">
    <TopNav />
    <div className="p-6">
      {children}
    </div>
  </main>
</div>
```

### Content Containers

```css
/* Max width containers */
.container {
  width: 100%;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 1280px) {
  .container {
    max-width: 1280px;
  }
}

/* Reading width */
.prose {
  max-width: 65ch;
}
```

## Component Patterns

### Cards

```typescript
// Standard card structure
<Card>
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle className="text-lg font-semibold">
        Provider Performance
      </CardTitle>
      <Button variant="ghost" size="icon">
        <MoreVertical className="h-4 w-4" />
      </Button>
    </div>
    <CardDescription>
      Monthly production metrics
    </CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
  <CardFooter className="text-sm text-muted-foreground">
    Last updated 5 minutes ago
  </CardFooter>
</Card>
```

### Data Tables

```typescript
// Responsive table pattern
<div className="rounded-md border">
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead className="w-[200px]">Provider</TableHead>
        <TableHead>Production</TableHead>
        <TableHead className="text-right">Variance</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {data.map((row) => (
        <TableRow key={row.id}>
          <TableCell className="font-medium">
            {row.provider}
          </TableCell>
          <TableCell>{formatCurrency(row.production)}</TableCell>
          <TableCell className="text-right">
            <Badge variant={row.variance > 0 ? "success" : "destructive"}>
              {row.variance}%
            </Badge>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</div>
```

### Forms

```typescript
// Form field pattern
<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input 
          placeholder="john@example.com" 
          {...field} 
        />
      </FormControl>
      <FormDescription>
        We'll use this for account notifications
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

## Interactive States

### Hover States

```css
/* Button hover */
.button:hover {
  background-color: hsl(220.9 39.3% 15%);
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

/* Card hover */
.card-interactive:hover {
  border-color: hsl(220.9 39.3% 30%);
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}
```

### Focus States

```css
/* Focus ring */
:focus-visible {
  outline: 2px solid hsl(220.9 39.3% 11%);
  outline-offset: 2px;
}

/* Input focus */
.input:focus {
  border-color: hsl(220.9 39.3% 11%);
  box-shadow: 0 0 0 3px hsl(220.9 39.3% 11% / 0.1);
}
```

### Loading States

```typescript
// Skeleton loader pattern
function ProviderCardSkeleton() {
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
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </CardContent>
    </Card>
  )
}
```

### Error States

```typescript
// Error display pattern
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    Failed to load provider data. Please try again.
  </AlertDescription>
</Alert>
```

## Responsive Behavior

### Breakpoint System

```typescript
// Tailwind breakpoints
const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Wide desktop
  '2xl': '1536px' // Ultra-wide
}
```

### Mobile Patterns

```typescript
// Mobile navigation
<Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
  <SheetTrigger asChild>
    <Button variant="ghost" className="md:hidden">
      <Menu className="h-5 w-5" />
    </Button>
  </SheetTrigger>
  <SheetContent side="left" className="w-[250px]">
    <nav className="flex flex-col space-y-4">
      {navigation.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex items-center space-x-2"
          onClick={() => setMobileMenuOpen(false)}
        >
          <item.icon className="h-5 w-5" />
          <span>{item.name}</span>
        </Link>
      ))}
    </nav>
  </SheetContent>
</Sheet>
```

### Responsive Tables

```css
/* Responsive table wrapper */
.table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

/* Mobile table adaptation */
@media (max-width: 640px) {
  .table-mobile {
    display: block;
  }
  
  .table-mobile thead {
    display: none;
  }
  
  .table-mobile tr {
    display: block;
    border: 1px solid var(--border);
    margin-bottom: 0.5rem;
    padding: 0.5rem;
  }
  
  .table-mobile td {
    display: flex;
    justify-content: space-between;
    padding: 0.25rem 0;
  }
  
  .table-mobile td::before {
    content: attr(data-label);
    font-weight: 600;
  }
}
```

## Animation and Transitions

### Timing Functions

```css
/* Easing functions */
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Common Transitions

```css
/* Default transition */
.transition-default {
  transition-property: all;
  transition-duration: 150ms;
  transition-timing-function: var(--ease-out);
}

/* Hover lift */
.hover-lift {
  transition: transform 200ms var(--ease-out), 
              box-shadow 200ms var(--ease-out);
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.1);
}
```

### Loading Animations

```css
/* Spinner */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner {
  animation: spin 1s linear infinite;
}

/* Pulse */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.pulse {
  animation: pulse 2s var(--ease-in-out) infinite;
}
```

## Icons and Imagery

### Icon System

Using Lucide React for consistent iconography.

```typescript
// Icon sizing
<Home className="h-4 w-4" />    // Small
<Home className="h-5 w-5" />    // Default
<Home className="h-6 w-6" />    // Large

// Icon colors
<Home className="text-muted-foreground" />
<Home className="text-primary" />
<Home className="text-destructive" />
```

### Avatar Patterns

```typescript
// Avatar with fallback
<Avatar>
  <AvatarImage src={user.photoUrl} alt={user.name} />
  <AvatarFallback>
    {user.name.split(' ').map(n => n[0]).join('')}
  </AvatarFallback>
</Avatar>
```

## Accessibility Guidelines

### Keyboard Navigation

- All interactive elements accessible via Tab
- Escape closes modals and dropdowns
- Arrow keys navigate menus
- Enter/Space activate buttons

### Screen Reader Support

```typescript
// Proper ARIA labels
<Button aria-label="Delete provider">
  <Trash className="h-4 w-4" />
</Button>

// Live regions
<div role="status" aria-live="polite">
  {loading && <span>Loading providers...</span>}
</div>

// Semantic HTML
<nav aria-label="Main navigation">
  {/* Navigation items */}
</nav>
```

### Color Contrast

All text meets WCAG AA standards:
- Normal text: 4.5:1 minimum
- Large text: 3:1 minimum
- Interactive elements: 3:1 minimum

## Performance Considerations

### CSS Optimization

```css
/* Use CSS containment */
.card {
  contain: layout style;
}

/* Prefer transforms over position */
.modal {
  transform: translateX(-50%) translateY(-50%);
  /* Instead of top/left positioning */
}
```

### Image Optimization

```typescript
// Next.js Image with blur placeholder
<Image
  src={provider.photoUrl}
  alt={provider.name}
  width={40}
  height={40}
  placeholder="blur"
  blurDataURL={provider.photoBlur}
  className="rounded-full"
/>
```

## Design Tokens

### Export for Development

```typescript
// design-tokens.ts
export const tokens = {
  colors: {
    primary: 'hsl(220.9 39.3% 11%)',
    background: 'hsl(0 0% 100%)',
    foreground: 'hsl(224 71.4% 4.1%)',
    // ... more colors
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
  },
  typography: {
    fontFamily: 'system-ui',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
    }
  }
}
```

## Related Resources

- [Component Specifications](./components.md) - Detailed component docs
- [Frontend Architecture](./frontend-architecture.md) - Implementation patterns
- [Core Workflows](./core-workflows.md) - User journeys

---

**Last Updated**: December 2024
**Navigation**: [Back to Architecture Index](./index.md)