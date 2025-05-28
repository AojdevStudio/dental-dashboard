---
id: 4
title: "Make breadcrumb link focusable in breadcrumb.tsx"
status: completed
priority: medium
feature: Accessibility
created_at: 2025-05-21T20:19:05Z
---

## Description

Make the breadcrumb link focusable by adding the `tabIndex` attribute to the span element with role="link".

## File

`src/components/ui/breadcrumb.tsx`

## Issue

The breadcrumb item has `role="link"` but is not focusable, which affects keyboard navigation.

## Current Code

```tsx
<span
  role="link"
  data-slot="breadcrumb-page"
  // Missing tabIndex
  {...props}
/>
```

## Expected Code

```tsx
<span
  role="link"
  data-slot="breadcrumb-page"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      // Handle click action
      if (props.onClick) props.onClick(e as any);
    }
  }}
  {...props}
  onClick={(e) => {
    // Handle click action
    if (props.onClick) props.onClick(e);
  }}
/>
```

## Steps to Implement

1. Open `src/components/ui/breadcrumb.tsx`
2. Locate the `BreadcrumbPage` component
3. Add `tabIndex={0}` to make the element focusable
4. Add keyboard event handling for Enter/Space keys to match click behavior
5. Ensure proper TypeScript types for the event handlers
6. Test keyboard navigation to verify the breadcrumb is focusable and clickable
7. Run `pnpm lint` to verify the accessibility issue is resolved

## Dependencies

None

## Related Tasks

- Parent: ID 7 (Address all linting issues)
- Sub-task: ID 7.4 (Complete ID 4)
