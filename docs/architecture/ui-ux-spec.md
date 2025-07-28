# Unified Design System Architecture

## Overview

This document defines the comprehensive design system for the Dental Dashboard - a unified approach that harmonizes visual design, interaction patterns, and user experience guidelines. It consolidates design principles from multiple sources into a cohesive, implementable architecture that supports both light and dark themes while maintaining consistency across all user interfaces.

## Quick Reference

```typescript
// Unified Design Tokens
export const designTokens = {
  // Color system - theme adaptive
  colors: {
    primary: {
      light: 'hsl(220.9 39.3% 11%)',    // Navy blue
      dark: 'hsl(262 83% 58%)'          // Purple accent
    },
    background: {
      light: 'hsl(0 0% 100%)',          // White
      dark: 'hsl(224 71.4% 4.1%)'       // Dark navy
    },
    foreground: {
      light: 'hsl(224 71.4% 4.1%)',     // Dark text
      dark: 'hsl(210 20% 98%)'          // Light text
    }
  },
  
  // Responsive breakpoints
  breakpoints: {
    sm: '640px',   // Mobile landscape
    md: '768px',   // Tablet
    lg: '1024px',  // Desktop
    xl: '1280px',  // Wide desktop
    '2xl': '1536px' // Ultra-wide
  },
  
  // Fluid spacing system (8px grid)
  spacing: {
    0: '0',
    1: '0.25rem',  // 4px
    2: '0.5rem',   // 8px
    3: '0.75rem',  // 12px
    4: '1rem',     // 16px
    6: '1.5rem',   // 24px
    8: '2rem',     // 32px
    12: '3rem',    // 48px
    16: '4rem'     // 64px
  }
}
```

## Core Design Principles

### 1. Clean Healthcare Aesthetic
Professional, clinical appearance that instills trust while remaining approachable for dental practice management.

```css
/* Healthcare-grade interface standards */
.clinical-interface {
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}
```

### 2. Dual Theme Architecture
Seamless support for both light and dark modes with context-aware switching.

**Light Theme**: Optimal for clinical documentation and detailed data analysis
**Dark Theme**: Enhanced for extended dashboard usage and reduced eye strain

### 3. Data-First Hierarchy
Information architecture that prioritizes critical metrics and KPIs with progressive disclosure of complexity.

### 4. Accessibility by Design
WCAG 2.1 AA compliance with enhanced support for healthcare workflows.

### 5. Mobile-First Responsive
Progressive enhancement from mobile to desktop with touch-friendly interactions.

## Typography System

### Font Architecture
```css
/* Performance-optimized system font stack */
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, 
  "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", 
  "Segoe UI Emoji", "Segoe UI Symbol";
```

### Fluid Type Scale
```css
/* Responsive typography with clamp() */
:root {
  --text-xs: clamp(0.75rem, 2vw, 0.875rem);
  --text-sm: clamp(0.875rem, 2.5vw, 1rem);
  --text-base: clamp(1rem, 3vw, 1.125rem);
  --text-lg: clamp(1.125rem, 3.5vw, 1.25rem);
  --text-xl: clamp(1.25rem, 4vw, 1.5rem);
  --text-2xl: clamp(1.5rem, 5vw, 2rem);
  --text-3xl: clamp(1.875rem, 6vw, 2.5rem);
  --text-4xl: clamp(2.25rem, 7vw, 3rem);
}
```

### Typography Hierarchy
```typescript
// Semantic heading system
const headingStyles = {
  h1: "text-3xl font-bold leading-tight",      // 32-40px equivalent
  h2: "text-2xl font-semibold leading-tight",  // 24-28px equivalent
  h3: "text-xl font-semibold leading-normal",
  h4: "text-lg font-medium leading-normal",
  body: "text-base font-normal leading-relaxed", // 14-16px equivalent
  caption: "text-sm font-light leading-normal"    // 12-14px equivalent
}
```

### Font Weight System
```css
:root {
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

## Unified Color Architecture

### Theme-Adaptive Color System
```css
:root {
  /* Light theme (default) */
  --primary: hsl(220.9 39.3% 11%);
  --primary-foreground: hsl(210 20% 98%);
  --background: hsl(0 0% 100%);
  --foreground: hsl(224 71.4% 4.1%);
  --card: hsl(0 0% 100%);
  --card-foreground: hsl(224 71.4% 4.1%);
  --muted: hsl(220 14.3% 95.9%);
  --muted-foreground: hsl(220 8.9% 46.1%);
  --border: hsl(220 13% 91%);
  --accent: hsl(220 14.3% 95.9%);
  --accent-foreground: hsl(220.9 39.3% 11%);
}

[data-theme="dark"] {
  /* Dark theme with purple accent */
  --primary: hsl(262 83% 58%);
  --primary-foreground: hsl(210 20% 98%);
  --background: hsl(224 71.4% 4.1%);
  --foreground: hsl(210 20% 98%);
  --card: hsl(224 71.4% 4.1%);
  --card-foreground: hsl(210 20% 98%);
  --muted: hsl(215 27.9% 16.9%);
  --muted-foreground: hsl(217.9 10.6% 64.9%);
  --border: hsl(215 27.9% 16.9%);
  --accent: hsl(215 27.9% 16.9%);
  --accent-foreground: hsl(210 20% 98%);
}
```

### Semantic Color System
```css
:root {
  /* Status colors - consistent across themes */
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

## Spacing & Layout Architecture

### 8px Grid System
```css
/* Systematic spacing scale */
:root {
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
  --space-20: 5rem;    /* 80px */
}
```

### Responsive Layout Patterns

#### Dashboard Grid System
```css
/* Adaptive dashboard layout */
.dashboard-grid {
  display: grid;
  gap: var(--space-6);
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

/* KPI metrics row */
.kpi-grid {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

/* Responsive chart container */
.chart-container {
  aspect-ratio: 16 / 9;
  min-height: 300px;
}

@media (max-width: 768px) {
  .chart-container {
    aspect-ratio: 4 / 3;
    min-height: 250px;
  }
}
```

#### Sidebar Layout Architecture
```typescript
// Collapsible sidebar with theme support
<div className="flex h-screen bg-background">
  <aside className={cn(
    "border-r border-border bg-card transition-all duration-300",
    isCollapsed ? "w-16" : "w-64"
  )}>
    <Sidebar />
  </aside>
  
  <main className="flex-1 overflow-y-auto">
    <TopNav />
    <div className="p-6 space-y-6">
      {children}
    </div>
  </main>
</div>
```

## Component Architecture

### Unified Card Pattern
```typescript
// Standard card structure with theme support
<Card className="bg-card border-border shadow-sm hover:shadow-md transition-all duration-300">
  <CardHeader className="pb-2">
    <div className="flex items-center justify-between">
      <CardTitle className="text-lg font-semibold text-foreground">
        Provider Performance
      </CardTitle>
      <Button variant="ghost" size="icon">
        <MoreVertical className="h-4 w-4" />
      </Button>
    </div>
    <CardDescription className="text-muted-foreground">
      Monthly production metrics
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Primary content */}
  </CardContent>
  <CardFooter className="pt-4 text-sm text-muted-foreground border-t border-border">
    Last updated 5 minutes ago
  </CardFooter>
</Card>
```

### KPI Display Component
```typescript
// Metric card with trend indicators
<Card className="p-6">
  <CardHeader className="pb-2">
    <CardTitle className="text-sm font-medium text-muted-foreground">
      Monthly Production
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-2">
    <div className="text-2xl font-bold text-foreground">
      {formatCurrency(125000)}
    </div>
    <div className="flex items-center space-x-2">
      <Badge variant={trend > 0 ? "success" : "destructive"} className="text-xs">
        <TrendingUp className="h-3 w-3 mr-1" />
        +12% from last month
      </Badge>
    </div>
  </CardContent>
</Card>
```

### Data Table Pattern
```typescript
// Responsive table with theme support
<div className="rounded-md border border-border bg-card">
  <Table>
    <TableHeader>
      <TableRow className="border-border">
        <TableHead className="w-[200px] font-semibold">Provider</TableHead>
        <TableHead className="font-semibold">Production</TableHead>
        <TableHead className="text-right font-semibold">Variance</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {data.map((row) => (
        <TableRow key={row.id} className="border-border hover:bg-muted/50">
          <TableCell className="font-medium">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={row.avatar} />
                <AvatarFallback>{row.initials}</AvatarFallback>
              </Avatar>
              <span>{row.provider}</span>
            </div>
          </TableCell>
          <TableCell>{formatCurrency(row.production)}</TableCell>
          <TableCell className="text-right">
            <Badge variant={row.variance > 0 ? "success" : "destructive"}>
              {row.variance > 0 ? '+' : ''}{row.variance}%
            </Badge>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</div>
```

### Form Architecture
```typescript
// Form field with validation and theme support
<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem className="space-y-2">
      <FormLabel className="text-sm font-medium text-foreground">
        Email Address
      </FormLabel>
      <FormControl>
        <Input 
          placeholder="provider@clinic.com" 
          className="bg-background border-border focus:border-primary focus:ring-primary/20"
          {...field} 
        />
      </FormControl>
      <FormDescription className="text-xs text-muted-foreground">
        Used for account notifications and system alerts
      </FormDescription>
      <FormMessage className="text-xs text-destructive" />
    </FormItem>
  )}
/>
```

## Interactive States & Animations

### Transition System
```css
/* Unified easing functions */
:root {
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* Standard transitions */
.transition-default {
  transition: all 150ms var(--ease-out);
}

.transition-colors {
  transition: color 150ms var(--ease-out), 
              background-color 150ms var(--ease-out),
              border-color 150ms var(--ease-out);
}
```

### Hover & Focus States
```css
/* Interactive button states */
.button {
  transition: all 200ms var(--ease-out);
}

.button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.button:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

/* Card hover interactions */
.card-interactive:hover {
  border-color: var(--primary);
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  transform: translateY(-2px);
}
```

### Loading States
```typescript
// Skeleton loader pattern with theme support
function ProviderCardSkeleton() {
  return (
    <Card className="bg-card">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full bg-muted" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 bg-muted" />
            <Skeleton className="h-3 w-24 bg-muted" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full bg-muted" />
          <Skeleton className="h-4 w-3/4 bg-muted" />
        </div>
      </CardContent>
    </Card>
  )
}

// Loading animations
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.skeleton {
  animation: pulse 2s var(--ease-in-out) infinite;
}
```

## Responsive Behavior

### Breakpoint Strategy
```typescript
// Mobile-first responsive design
const responsivePatterns = {
  // Stack on mobile, grid on desktop
  'grid-responsive': 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
  
  // Hide on mobile, show on desktop
  'desktop-only': 'hidden md:block',
  
  // Show on mobile, hide on desktop
  'mobile-only': 'block md:hidden',
  
  // Responsive padding
  'padding-responsive': 'p-4 md:p-6 lg:p-8',
  
  // Responsive text
  'text-responsive': 'text-sm md:text-base lg:text-lg'
}
```

### Mobile Navigation Pattern
```typescript
// Mobile-first navigation with sheet overlay
<Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
  <SheetTrigger asChild>
    <Button variant="ghost" size="icon" className="md:hidden">
      <Menu className="h-5 w-5" />
    </Button>
  </SheetTrigger>
  <SheetContent side="left" className="w-[280px] bg-card">
    <nav className="flex flex-col space-y-4 mt-8">
      {navigation.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
          onClick={() => setMobileMenuOpen(false)}
        >
          <item.icon className="h-5 w-5" />
          <span className="font-medium">{item.name}</span>
        </Link>
      ))}
    </nav>
  </SheetContent>
</Sheet>
```

## Accessibility Architecture

### WCAG 2.1 AA Compliance
```css
/* Minimum contrast ratios */
:root {
  /* Ensure 4.5:1 contrast for normal text */
  --text-contrast-normal: 4.5;
  /* Ensure 3:1 contrast for large text */
  --text-contrast-large: 3.0;
  /* Ensure 3:1 contrast for interactive elements */
  --interactive-contrast: 3.0;
}
```

### Keyboard Navigation
```typescript
// Comprehensive keyboard support
const keyboardHandlers = {
  // Tab navigation
  onKeyDown: (event: KeyboardEvent) => {
    if (event.key === 'Tab') {
      // Ensure focus visibility
      event.currentTarget.classList.add('focus-visible');
    }
    
    if (event.key === 'Escape') {
      // Close modals/dropdowns
      closeModal();
    }
    
    if (event.key === 'Enter' || event.key === ' ') {
      // Activate buttons
      handleActivation();
    }
  }
}
```

### Screen Reader Support
```typescript
// ARIA patterns for healthcare data
<div 
  role="region" 
  aria-labelledby="metrics-heading"
  aria-describedby="metrics-description"
>
  <h2 id="metrics-heading">Practice Metrics</h2>
  <p id="metrics-description">
    Key performance indicators for the current month
  </p>
  
  {/* Live regions for dynamic updates */}
  <div role="status" aria-live="polite" aria-atomic="true">
    {loading && <span>Loading practice metrics...</span>}
    {error && <span>Error loading metrics. Please try again.</span>}
  </div>
</div>

// Accessible data tables
<Table role="table" aria-label="Provider performance data">
  <TableHeader>
    <TableRow role="row">
      <TableHead role="columnheader" aria-sort="ascending">
        Provider Name
      </TableHead>
      <TableHead role="columnheader" aria-sort="none">
        Monthly Production
      </TableHead>
    </TableRow>
  </TableHeader>
</Table>
```

## Performance Optimization

### CSS Performance
```css
/* CSS containment for performance */
.card {
  contain: layout style;
}

.dashboard-grid {
  contain: layout;
}

/* Prefer transforms over position changes */
.modal {
  transform: translateX(-50%) translateY(-50%);
  will-change: transform;
}

/* Optimize animations */
@keyframes slideIn {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

### Image Optimization
```typescript
// Next.js Image optimization with blur placeholders
<Image
  src={provider.photoUrl}
  alt={`${provider.name} profile photo`}
  width={40}
  height={40}
  placeholder="blur"
  blurDataURL={provider.photoBlur}
  className="rounded-full"
  sizes="(max-width: 768px) 32px, 40px"
/>
```

## Theme Implementation

### Theme Provider
```typescript
// Unified theme context
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Theme toggle component
export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </Button>
  );
};
```

## Design Token Export

### Development Tokens
```typescript
// design-tokens.ts - Exportable design system
export const designTokens = {
  colors: {
    light: {
      primary: 'hsl(220.9 39.3% 11%)',
      background: 'hsl(0 0% 100%)',
      foreground: 'hsl(224 71.4% 4.1%)',
      muted: 'hsl(220 14.3% 95.9%)',
      border: 'hsl(220 13% 91%)',
      accent: 'hsl(220 14.3% 95.9%)'
    },
    dark: {
      primary: 'hsl(262 83% 58%)',
      background: 'hsl(224 71.4% 4.1%)',
      foreground: 'hsl(210 20% 98%)',
      muted: 'hsl(215 27.9% 16.9%)',
      border: 'hsl(215 27.9% 16.9%)',
      accent: 'hsl(215 27.9% 16.9%)'
    },
    semantic: {
      success: 'hsl(142 76% 36%)',
      warning: 'hsl(38 92% 50%)',
      error: 'hsl(346 87% 43%)',
      info: 'hsl(217 91% 60%)'
    }
  },
  spacing: {
    xs: '0.5rem',    // 8px
    sm: '1rem',      // 16px
    md: '1.5rem',    // 24px
    lg: '2rem',      // 32px
    xl: '3rem',      // 48px
    '2xl': '4rem'    // 64px
  },
  typography: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: {
      xs: '0.75rem',   // 12px
      sm: '0.875rem',  // 14px
      base: '1rem',    // 16px
      lg: '1.125rem',  // 18px
      xl: '1.25rem',   // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem'   // 36px
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75
    }
  },
  breakpoints: {
    sm: '640px',
    md: '768px', 
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms'
    },
    easing: {
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  }
};

// CSS custom properties generator
export const generateCSSVariables = (theme: 'light' | 'dark') => {
  const colors = designTokens.colors[theme];
  return Object.entries(colors)
    .map(([key, value]) => `--${key}: ${value};`)
    .join('\n');
};
```

## Implementation Guidelines

### Component Development
1. **Theme Awareness**: All components must support both light and dark themes
2. **Responsive Design**: Mobile-first approach with progressive enhancement
3. **Accessibility**: WCAG 2.1 AA compliance is mandatory
4. **Performance**: Use CSS containment and optimize animations
5. **Consistency**: Follow established patterns and use design tokens

### Code Quality Standards
```typescript
// Component example following all guidelines
interface ProviderMetricCardProps {
  provider: Provider;
  metric: MetricData;
  variant?: 'default' | 'compact';
  className?: string;
}

export const ProviderMetricCard = ({
  provider,
  metric,
  variant = 'default',
  className
}: ProviderMetricCardProps) => {
  return (
    <Card className={cn(
      "bg-card border-border transition-all duration-300 hover:shadow-md",
      variant === 'compact' && "p-4",
      className
    )}>
      {/* Implementation following design system patterns */}
    </Card>
  );
};
```

## Related Documentation

- [Component Library](./components.md) - Detailed component specifications
- [Frontend Architecture](./frontend-architecture.md) - Implementation patterns
- [Core Workflows](./core-workflows.md) - User journey documentation
- [Style Guide](../unified-dental/style-guide.md) - Visual design principles
- [UX Rules](../unified-dental/ux-rules.md) - User experience guidelines

---

**Architecture Status**: ✅ **Active** - This document replaces previous UI/UX specifications
**Last Updated**: December 2024 
**Maintained By**: Architecture Team
**Next Review**: Quarterly

**Navigation**: [Back to Architecture Index](./index.md)