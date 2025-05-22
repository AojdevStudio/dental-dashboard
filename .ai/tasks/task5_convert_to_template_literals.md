---
id: 5
title: "Convert string concatenation to template literals in counting-number.tsx"
status: completed
priority: low
feature: Code Quality
created_at: 2025-05-21T20:19:05Z
---

## Description

Convert string concatenation to template literals in `counting-number.tsx` to improve code readability and maintainability.

## File

`src/components/animate-ui/text/counting-number.tsx`

## Issue

The code uses string concatenation with the `+` operator where template literals would be more appropriate.

## Current Code

```typescript
"0" + (decimals > 0 ? decimalSeparator + "0".repeat(decimals) : "");
```

## Expected Code

```typescript
`0${decimals > 0 ? `${decimalSeparator}${'0'.repeat(decimals)}` : ''}`;
```

## Steps to Implement

1. Open `src/components/animate-ui/text/counting-number.tsx`
2. Locate the string concatenation on line ~87
3. Replace the concatenation with a template literal
4. Ensure all dynamic values are properly interpolated
5. Save the file
6. Run `pnpm lint` to verify the issue is resolved

## Dependencies

None

## Related Tasks

- Parent: ID 7 (Address all linting issues)
- Sub-task: ID 7.5 (Complete ID 5)
