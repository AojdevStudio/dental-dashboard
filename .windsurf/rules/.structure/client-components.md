---
trigger: model_decision
description: This rule provides guidelines for properly implementing client components in Next.js applications.
globs: 
---
# Client Components in Next.js
# Version 1.0.0

## OVERVIEW

This rule provides guidelines for properly implementing client components in Next.js applications.

## "use client" DIRECTIVE

Next.js 13+ uses React Server Components by default. Any component that needs client-side interactivity (event listeners, hooks, browser APIs) must be explicitly marked as a client component.

### IMPORTANT RULES

1. **ALWAYS add "use client" directive** to:
   - Any component that uses React hooks (useState, useEffect, useContext, etc.)
   - Components handling events (onClick, onChange, etc.)
   - Components using browser-only APIs (localStorage, window, etc.)
   - Error boundary components
   - Custom error pages like error.tsx

2. **"use client" must be the first line** in the file, before imports or any other code

3. **Components that need interactivity include**:
   - Forms with input handling
   - Interactive UI elements
   - Components with state management
   - Error pages and error boundaries
   - Components using client-side navigation

### EXAMPLES

✅ CORRECT:
```tsx
"use client"
import { useState } from 'react';

export default function MyComponent() {
  const [state, setState] = useState(false);
  // Rest of component...
}
```

❌ INCORRECT:
```tsx
import { useState } from 'react';

export default function MyComponent() {
  const [state, setState] = useState(false); // This will fail!
  // Rest of component...
}
```

### TROUBLESHOOTING

If you encounter a runtime error like:
```
Error: useState can only be used in Client Components. Add the "use client" directive at the top of the file to use it.
```

This indicates you're trying to use client-side functionality in a Server Component. Add "use client" as the first line of the file.

## COMMON GOTCHAS

1. **Error Pages**: Always mark error.tsx files as client components
2. **Dynamic Routes**: Components in dynamic route segments often need to be client components when they use route parameters for interactive features
3. **Layout Components**: If a layout needs interactivity, it must be a client component

## BEST PRACTICES

- Keep server components where possible for better performance
- Create smaller client component "islands" within server component pages
- Don't add "use client" unnecessarily - use it only when client-side features are needed

