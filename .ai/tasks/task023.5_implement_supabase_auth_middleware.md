---
id: "023.5"
title: "Implement Supabase Auth Middleware"
status: pending
priority: critical
feature: "Core Authentication System - Middleware & Route Protection"
dependencies:
  - "023.1"
  - "023.2"
assigned_agent: null
created_at: "2025-05-23T05:34:57Z"
started_at: null
completed_at: null
error_log: null
---

## Description

Create or update the Next.js middleware to manage Supabase user sessions. This middleware will be responsible for refreshing session tokens on each request and redirecting unauthenticated users away from protected routes. The implementation must strictly follow the `@supabase/ssr` pattern for middleware provided in the project's Supabase authentication guidelines ([supabase-auth-setup.md](mdc:.windsurf/rules/.stack/supabase-auth-setup.md)). This task will cover the scope of the previously planned `task20.1_create_auth_middleware.md`.

## Details

1.  **File Location:**
    *   The middleware should be located at `src/middleware.ts` (or `middleware.ts` in the project root if using the `app` directory primarily at the root).

2.  **Middleware Implementation:**
    *   The content of `src/middleware.ts` should be as follows, based on `supabase-auth-setup.md`:
        ```typescript
        import { createServerClient, type CookieOptions } from '@supabase/ssr'
        import { NextResponse, type NextRequest } from 'next/server'

        export async function middleware(request: NextRequest) {
          let supabaseResponse = NextResponse.next({
            request,
          })

          const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
              cookies: {
                getAll() {
                  return request.cookies.getAll()
                },
                setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
                  cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                  supabaseResponse = NextResponse.next({
                    request,
                  })
                  cookiesToSet.forEach(({ name, value, options }) =>
                    supabaseResponse.cookies.set(name, value, options)
                  )
                },
              },
            }
          )

          // IMPORTANT: DO NOT REMOVE supabase.auth.getUser()
          // Do not run code between createServerClient and supabase.auth.getUser().
          const { data: { user } } = await supabase.auth.getUser()

          if (
            !user &&
            !request.nextUrl.pathname.startsWith('/login') && // Assuming '/login' is your login page
            !request.nextUrl.pathname.startsWith('/auth') // For any /auth/callback routes
            // Add any other public paths here (e.g., '/signup', '/password-reset')
          ) {
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            return NextResponse.redirect(url)
          }

          // IMPORTANT: Return the supabaseResponse object.
          // Refer to supabase-auth-setup.md for handling custom responses.
          return supabaseResponse
        }

        export const config = {
          matcher: [
            /*
             * Match all request paths except for the ones starting with:
             * - _next/static (static files)
             * - _next/image (image optimization files)
             * - favicon.ico (favicon file)
             * - api (API routes, if they have their own auth)
             * Feel free to modify this pattern to include more paths.
             */
            '/((?!_next/static|_next/image|favicon.ico|api|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
          ],
        }
        ```

3.  **Key Implementation Points:**
    *   Uses `createServerClient` from `@supabase/ssr`.
    *   Correctly implements `getAll` and `setAll` for cookie handling within the middleware context.
    *   Includes the crucial `await supabase.auth.getUser()` call to refresh the session.
    *   Contains logic to redirect unauthenticated users if they try to access protected paths (customize public paths like `/login`, `/auth/callback` as needed).
    *   Returns the `supabaseResponse` correctly.
    *   The `config.matcher` array should be configured to exclude static assets, image optimization files, and potentially API routes if they handle auth differently. Adjust as necessary for your project's public paths.

## Test Strategy

-   **File Creation & Code Correctness:** Verify `src/middleware.ts` is created with the specified code.
-   **Type Checking:** Ensure TypeScript code compiles without errors (`pnpm typecheck`).
-   **Middleware Execution:** After implementing a basic login page (Task 23.6):
    *   Attempt to access a protected route while unauthenticated. Verify redirection to `/login`.
    *   Log in. Attempt to access a protected route. Verify access is granted.
    *   Log out. Attempt to access a protected route again. Verify redirection to `/login`.
-   **Session Refresh:** Monitor browser cookies and network requests to observe session token updates handled by the middleware.
-   **Matcher Behavior:** Test various paths (e.g., static assets, API routes, application pages) to ensure the matcher correctly includes/excludes them from middleware processing.
-   **Console Logs:** Check server-side console for any errors originating from the middleware.
