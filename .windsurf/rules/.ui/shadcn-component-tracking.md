---
trigger: model_decision
description: Record of installed shadcn/ui components and their usage use when you install compontents
globs: 
---
---
description: Record of installed shadcn/ui components and their usage
globs: 
alwaysApply: false
---

# ShadCN Component Tracking

This document tracks all installed shadcn/ui components for reference. Before installing a new component, check if it's already installed here.
If installed mark it with a ✅, if not installed yet mark it with a ❌

## Core Components

| Component       | Installed | Command | Notes |
|-----------------|-----------|---------|-------|
| accordion       | ❌        | `pnpm dlx shadcn@latest add accordion` | Used for collapsible content |
| alert           | ❌        | `pnpm dlx shadcn@latest add alert` | System notifications |
| button          | ✅        | `pnpm dlx shadcn@latest add button` | Primary interaction element |
| card            | ❌        | `pnpm dlx shadcn@latest add card` | Content containers |
| checkbox        | ❌        | `pnpm dlx shadcn@latest add checkbox` | Boolean input |
| dialog          | ❌        | `pnpm dlx shadcn@latest add dialog` | Modal dialogs |
| dropdown-menu   | ✅        | `pnpm dlx shadcn@latest add dropdown-menu` | Contextual actions |
| form            | ❌        | `pnpm dlx shadcn@latest add form` | Form validation and control |
| input           | ❌        | `pnpm dlx shadcn@latest add input` | Text input fields |
| label           | ❌        | `pnpm dlx shadcn@latest add label` | Form field labels |
| popover         | ❌        | `pnpm dlx shadcn@latest add popover` | Contextual tooltips |
| select          | ✅        | `pnpm dlx shadcn@latest add select` | Single-choice selection |
| separator       | ❌        | `pnpm dlx shadcn@latest add separator` | Visual dividers |
| skeleton        | ✅        | `pnpm dlx shadcn@latest add skeleton` | Loading placeholders |
| tabs            | ✅        | `pnpm dlx shadcn@latest add tabs` | Tabbed interfaces |
| toast           | ❌        | `pnpm dlx shadcn@latest add toast` | System notifications |

## Data Display Components

| Component       | Installed | Command | Notes |
|-----------------|-----------|---------|-------|
| avatar          | ❌        | `pnpm dlx shadcn@latest add avatar` | User profile photos |
| badge           | ❌        | `pnpm dlx shadcn@latest add badge` | Status indicators |
| table           | ✅        | `pnpm dlx shadcn@latest add table` | Data tables |
| progress        | ❌        | `pnpm dlx shadcn@latest add progress` | Progress indicators |
| hover-card      | ❌        | `pnpm dlx shadcn@latest add hover-card` | Hover previews |

## Date & Time Components

| Component       | Installed | Command | Notes |
|-----------------|-----------|---------|-------|
| calendar        | ❌        | `pnpm dlx shadcn@latest add calendar` | Date picker |
| date-picker     | ❌        | `pnpm dlx shadcn@latest add date-picker` | Complete date input |

## Layout Components

| Component       | Installed | Command | Notes |
|-----------------|-----------|---------|-------|
| sheet           | ❌        | `pnpm dlx shadcn@latest add sheet` | Slide-out panels |
| scroll-area     | ❌        | `pnpm dlx shadcn@latest scroll-area` | Custom scrollbars |
| resizable       | ❌        | `pnpm dlx shadcn@latest add resizable` | Resizable panels |

## Navigation Components

| Component       | Installed | Command | Notes |
|-----------------|-----------|---------|-------|
| navigation-menu | ❌        | `pnpm dlx shadcn@latest add navigation-menu` | Site navigation |
| command         | ❌        | `pnpm dlx shadcn@latest add command` | Command palette |
| pagination      | ❌        | `pnpm dlx shadcn@latest add pagination` | Page navigation |

## Advanced Form Components

| Component       | Installed | Command | Notes |
|-----------------|-----------|---------|-------|
| combobox        | ❌        | `pnpm dlx shadcn@latest add combobox` | Searchable select |
| radio-group     | ❌        | `pnpm dlx shadcn@latest add radio-group` | Option selection |
| switch          | ❌        | `pnpm dlx shadcn@latest add switch` | Toggle control |
| textarea        | ❌        | `pnpm dlx shadcn@latest add textarea` | Multiline text input |
| slider          | ❌        | `pnpm dlx shadcn@latest add slider` | Range selection |

## Custom Components

| Component            | Installed | Notes |
|----------------------|-----------|-------|
| x-gradient-card      | ✅        | Custom gradient card component |
| expandable-tabs      | ✅        | Custom implementation of tabs with expansion |
| modern-stunning-sign-in | ✅     | Custom sign-in component with modern design |

## Usage Notes

- When building forms, always use the `form` component with validation
- For date inputs in forms, use the complete `date-picker` component
- For tables with pagination, combine the `table` and `pagination` components

## Example Form With Components

```tsx
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <Card>
      <CardHeader>
        <CardTitle>Front Desk KPIs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <DatePicker
                value={field.value}
                onChange={field.onChange}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="hygiene_appointments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Hygiene Appointments</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Separator className="my-4" />
        
        <Button type="submit">Submit</Button>
      </CardContent>
    </Card>
  </form>
</Form>
```