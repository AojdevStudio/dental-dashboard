---
id: "023.4"
title: "Implement Supabase Server Client Utility"
status: done
priority: critical
feature: "Core Authentication System - Server Setup"
dependencies:
  - "023.1"
  - "023.2"
assigned_agent: null
created_at: "2025-05-23T05:34:57Z" 
started_at: "2025-05-23T06:03:00Z"
completed_at: "2025-05-23T06:04:00Z"
updated_at: "2025-05-23T06:04:00Z"
error_log: null
---

## Description

Create or update the Supabase server client utility function. This function will use `createServerClient` from the `@supabase/ssr` package to instantiate a Supabase client suitable for use in server-side environments (API routes, Server Components, Route Handlers, `getServerSideProps`, etc.). The implementation must strictly adhere to the pattern specified for server clients in the project's Supabase authentication guidelines ([supabase-auth-setup.md](mdc:.windsurf/rules/.stack/supabase-auth-setup.md)), particularly the cookie handling mechanism.

## Details

1.  **Determine File Location:**
    *   The server client utility should likely reside in a path like `src/lib/supabase/server.ts` or `src/lib/auth/server.ts`. If an existing file like `src/lib/auth/session.ts` is intended for this, it will be refactored/updated.
    *   For this task, let's assume we will create/use `src/lib/supabase/server.ts`.

2.  **Implement `createClient()` function (for Server Components/Route Handlers):**
    *   The file `src/lib/supabase/server.ts` should contain the following code, as per `supabase-auth-setup.md` for use in Server Components and Route Handlers that use `next/headers`:
        ```typescript
        import { createServerClient, type CookieOptions } from '@supabase/ssr'
        import { cookies } from 'next/headers'

        export async function createClient() {
          const cookieStore = cookies() // Use await if your cookies() function is async, but next/headers cookies() is sync.

          return createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
              cookies: {
                getAll() {
                  return cookieStore.getAll()
                },
                setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
                  try {
                    cookiesToSet.forEach(({ name, value, options }) =>
                      cookieStore.set(name, value, options)
                    )
                  } catch {
                    // The `setAll` method was called from a Server Component.
                    // This can be ignored if you have middleware refreshing
                    // user sessions.
                  }
                },
              },
            }
          )
        }
        ```
    *   **Note:** The `supabase-auth-setup.md` shows `const cookieStore = await cookies()`. However, `cookies()` from `next/headers` is synchronous. The `await` might be a typo in the rule or intended for a different `cookies` source. We will use the synchronous version `const cookieStore = cookies()` as it's standard for `next/headers`.

3.  **Environment Variables:** Ensure it uses `process.env.NEXT_PUBLIC_SUPABASE_URL!` and `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!`.

4.  **Cookie Handling:** The `cookies` object within `createServerClient` options is critical. It must implement `getAll()` and `setAll()` exactly as shown in the guidelines to correctly manage session cookies on the server.

5.  **Export:** The `createClient` function must be exported.

## Test Strategy

-   **File Creation & Code Correctness:** Verify `src/lib/supabase/server.ts` is created with the specified code.
-   **Type Checking:** Ensure TypeScript code compiles without errors (`pnpm typecheck`).
-   **Import Test (Server Context):** In a sample Server Component or API route (to be developed/used in later tasks), import `createClient` from `src/lib/supabase/server.ts` and attempt to instantiate it: `const supabase = await createClient()` (or `const supabase = createClient()` if not top-level awaited in an async context).
-   **Successful Instantiation:** The client should initialize without errors in a server context.
-   **Cookie Propagation (Later Tasks):** Full verification occurs when this client is used in conjunction with middleware (Task 23.5) to ensure session cookies are correctly read and written during server-side operations.
