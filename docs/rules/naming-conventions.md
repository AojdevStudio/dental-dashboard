## File Naming and Organization
- Use kebab case for route directories (e.g., `api/hello-world/route`)
- Use lowercase for components (e.g. `components/button.tsx`)

## New Pages

- Create new pages at: src/app/PAGE_NAME/page.tsx
- Use import aliases to reference components from the global components directory
- Keep page files lean, focused on layout and component composition
- All components should be organized in the global component directories by type:

- components/ui/ for shadcn components
- components/charts/ for chart components
- components/dashboards/ for dashboard-specific components
- components/[category]/ for other component types


## Pages are Server Components for direct data loading
- All data fetching and calculations MUST happen on the server side
- Create dedicated data-fetching functions in src/lib/data/ that return pre-calculated data
- For real-time updates, use Supabase Realtime subscriptions with server-calculated data
- Components with interactive elements (onClick, etc.) must be Client Components with use client directive
- Server Actions must start with use server directive and handle all data mutations and calculations

## Utility Functions

- Create utility functions in utils/ folder for reusable logic
- Server-side utility functions should be in utils/server/ to clearly separate them
- Use lodash utilities for common operations (arrays, objects, strings)
- Import specific lodash functions to minimize bundle size:
```ts
import groupBy from "lodash/groupBy";
```