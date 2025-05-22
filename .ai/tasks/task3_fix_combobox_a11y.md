---
id: 3
title: "Fix accessibility issues in MultiSelectCombobox.tsx"
status: pending
priority: high
feature: Accessibility
created_at: 2025-05-21T20:19:05Z
---

## Description

Address accessibility issues in the MultiSelectCombobox component by using semantic HTML elements and proper button types.

## File

`src/components/dashboards/filters/MultiSelectCombobox.tsx`

## Issues

1. Using `role="combobox"` on a non-`<select>` element
2. Missing `type` attribute on a button element

## Current Code

```tsx
<Button
  variant="outline"
  role="combobox"
  aria-expanded={open}
  // ...
>
  {/* ... */}
  <button
    className="..."
    // Missing type attribute
  >
    <X className="h-3 w-3" />
    <span className="sr-only">Remove {value}</span>
  </button>
</Button>
```

## Expected Code

```tsx
<Select>
  <SelectTrigger>
    <SelectValue />
    {/* ... */}
  </SelectTrigger>
  {/* ... */}
</Select>

{/* For the remove button */}
<button 
  type="button"
  className="..."
  onClick={...}
>
  <X className="h-3 w-3" />
  <span className="sr-only">Remove {value}</span>
</button>
```

## Steps to Implement

1. Replace the custom combobox implementation with the shadcn/ui `Select` component
2. Ensure all interactive elements have proper `type` attributes
3. Test keyboard navigation and screen reader compatibility
4. Verify with `pnpm lint` that the accessibility issues are resolved

## Dependencies

None

## Related Tasks

- Parent: ID 7 (Address all linting issues)
- Sub-task: ID 7.3 (Complete ID 3)
