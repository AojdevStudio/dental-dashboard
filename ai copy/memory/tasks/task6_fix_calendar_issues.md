---
id: 6
title: "Fix TypeScript and performance issues in calendar.tsx"
status: completed
priority: high
feature: Code Quality
created_at: 2025-05-21T20:19:05Z
---

## Description

Address TypeScript and performance issues in the calendar component by removing explicit `any` types and optimizing the reduce operation.

## File

`src/components/ui/calendar.tsx`

## Issues

1. Use of `any` type in the `Chevron` component props
2. Inefficient spread operator in a reduce accumulator

## Current Code

```typescript
// Issue 1: any type
const defaultComponents = {
  Chevron: (props: any) => {
    // ...
  },
};

// Issue 2: Spread in reduce
const mergedClassNames = Object.keys(defaultClassNames).reduce(
  (acc, key) => ({
    ...acc,
    [key]: classNames?.[key as keyof typeof classNames]
      ? cn(
          defaultClassNames[key as keyof typeof defaultClassNames],
          classNames[key as keyof typeof classNames]
        )
      : defaultClassNames[key as keyof typeof defaultClassNames],
  }),
  {}
);
```

## Expected Code

```typescript
// Fixed: Properly typed props
const defaultComponents = {
  Chevron: (props: { orientation: 'left' | 'right' } & React.ComponentProps<'svg'>) => {
    // ...
  },
};

// Fixed: More efficient reduce
const mergedClassNames = Object.keys(defaultClassNames).reduce<typeof defaultClassNames>(
  (acc, key) => {
    const k = key as keyof typeof defaultClassNames;
    acc[k] = classNames?.[k]
      ? cn(defaultClassNames[k], classNames[k])
      : defaultClassNames[k];
    return acc;
  },
  {} as typeof defaultClassNames
);
```

## Steps to Implement

1. Open `src/components/ui/calendar.tsx`
2. Locate the `Chevron` component and add proper TypeScript types
3. Find the `mergedClassNames` reduce operation and refactor to avoid spread in the accumulator
4. Ensure all type assertions are safe and necessary
5. Test the calendar component to ensure all functionality remains the same
6. Run `pnpm lint` to verify the issues are resolved

## Dependencies

None

## Related Tasks

- Parent: ID 7 (Address all linting issues)
- Sub-task: ID 7.6 (Complete ID 6)
