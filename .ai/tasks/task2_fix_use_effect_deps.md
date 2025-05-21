---
id: 2
title: "Fix useExhaustiveDependencies warning in hover-card.tsx"
status: pending
priority: high
feature: Code Quality
created_at: 2025-05-21T20:19:05Z
---

## Description

Fix the React Hook dependency array warning in `hover-card.tsx` by properly destructuring the props.

## File

`src/components/animate-ui/radix/hover-card.tsx`

## Issue

The current code has a `useEffect` that depends on the entire `props` object, which causes unnecessary re-renders.

## Current Code

```typescript
useEffect(() => {
  // effect using props
}, [props]);
```

## Expected Code

```typescript
const { onOpenChange } = props;
useEffect(() => {
  // effect using onOpenChange
}, [onOpenChange]);
```

## Steps to Implement

1. Open `src/components/animate-ui/radix/hover-card.tsx`
2. Identify the `useEffect` hook with `[props]` dependency
3. Destructure the specific prop(s) needed in the effect
4. Update the dependency array to only include the destructured prop(s)
5. Update any references inside the effect to use the destructured prop(s)
6. Save the file
7. Run `pnpm lint` to verify the warning is resolved

## Dependencies

None

## Related Tasks

- Parent: ID 7 (Address all linting issues)
- Sub-task: ID 7.2 (Complete ID 2)
