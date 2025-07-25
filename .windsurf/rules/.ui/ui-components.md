---
trigger: model_decision
description: UI component and styling guidelines using Shadcn UI, Radix UI, and Tailwind
globs: 
---
---
description: UI component and styling guidelines using Shadcn UI, Radix UI, and Tailwind
globs: 
alwaysApply: false
---

# UI Components and Styling

## UI Framework
- Use Shadcn UI and Tailwind for components and styling
- Implement responsive design with Tailwind CSS using a mobile-first approach
- Use `next/image` package for images
- Keep UI density moderate - not too sparse or crowded
- Follow a consistent visual hierarchy for all pages

## Shadcn Component Usage
- Always use ShadCN components where applicable
- Use Context7 MCP Tool to find applicable components and packages if you don't know about one
- Use Perplexity or Brave Search MCP Tools for something that Context7 can't satisfy
- If the user provides a URL for a component or package then use the fetch tool to scrape it and use that
- Maintain a list of used ShadCN components in ShadCN-context.md (make one if it doesn't exist)

## Component Installation
```sh
pnpm dlx shadcn@latest add COMPONENT
```
Example:
```sh
pnpm dlx shadcn@latest add progress
```

## Layout & Spacing
- Use Tailwind's spacing scale consistently (4px increments)
- Standard content padding: `p-4 md:p-6`
- Card spacing: `space-y-4` for vertical stacking
- Section spacing: `mb-8` between major sections
- Grid layouts: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`

## Typography
- Use Tailwind's typography classes consistently
- Headings: `text-2xl font-semibold` for page titles
- Subheadings: `text-xl font-medium` for section headers
- Body text: `text-sm` for forms, `text-base` for content
- Field labels: `text-sm font-medium text-gray-700`

## Colors
- Follow theme colors defined in `tailwind.config.js`
- Use semantic color classes: `text-primary`, `bg-secondary`
- For states: `text-destructive` (errors), `text-muted` (disabled)
- Maintain WCAG AA contrast ratio minimum (4.5:1)

## Data Fetching
- Wrap fetch calls in loading states
- Handle errors consistently

Example:
```tsx
// In a server component
const data = await getKPIData(params);

// In a client component
const { data, isLoading, error } = useKPIData(params);
```

## Loading Components
Use the `LoadingContent` component to handle loading states:
```tsx
<Card>
  <LoadingContent loading={isLoading} error={error}>
    {data && <MyComponent data={data} />}
  </LoadingContent>
</Card>
```

## Loading Skeletons
- Use for content that takes time to load
- Match skeleton shapes to actual content

```tsx
<Skeleton className="h-[42px] w-full rounded-md" />
```

## Form Components
- Group related fields with `<FormSection>` component
- Consistent label placement (top-aligned)
- Use field validation with clear error messages
- Required fields: add asterisk to label

Example:
```tsx
<FormField
  control={form.control}
  name="appointmentsCount"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Total hygiene Appointments</FormLabel>
      <FormControl>
        <Input type="number" placeholder="0" {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

## Input Types
- Text inputs: Use `Input` component with appropriate types
- Numeric inputs: Use `type="number"` with min/max when applicable
- Date inputs: Use `DatePicker` component
- Selects: Use `Select` component for single choice, `Combobox` for searchable
- Radio/Checkbox: Use Shadcn components with consistent spacing

## Cards & Containers
- Use `Card` for content grouping
- Standard structure: `CardHeader`, `CardContent`, `CardFooter`
- For metrics cards: consistent height, clear labeling

```tsx
<Card>
  <CardHeader>
    <CardTitle>Weekly KPI Summary</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content here */}
  </CardContent>
</Card>
```

## Tables
- Use Shadcn `Table` component for data grids
- Fixed headers for long tables
- Consistent column alignment (left for text, right for numbers)
- Include empty states and loading states

## Metrics & Data Visualization
- Use appropriate chart types based on data relationships
- Maintain consistent color schemes across charts
- Include legends and clear labeling
- Add context/tooltips for complex metrics

## Responsive Patterns
- Collapse multi-column layouts to single column on mobile
- Use `md:` and `lg:` breakpoints consistently
- Ensure touch targets are at least 44×44px on mobile
- Test layouts at 320px, 768px, and 1280px minimum

## Accessibility
- Maintain keyboard navigation for all interactive elements
- Use appropriate ARIA attributes when needed
- Ensure color is not the only means of conveying information
- Test with screen readers periodically

## Icons
- Use Lucide icons via `lucide-react` package
- Consistent sizing: `size={16}` for inline, `size={20}` for buttons
- Add appropriate labels or aria-labels

```tsx
<Button>
  <PlusIcon className="mr-2 h-4 w-4" />
  Add Appointment
</Button>
```

These guidelines ensure a consistent, accessible, and maintainable UI across the dental practice dashboard.