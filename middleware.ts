import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  // Simple console logging for Edge Runtime compatibility
  console.log(`[${new Date().toISOString()}] Middleware processing started`, {
    requestId,
    method: request.method,
    pathname: request.nextUrl.pathname,
    userAgent: request.headers.get("user-agent"),
    ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
  });

  try {
    let supabaseResponse = NextResponse.next({
      request,
    });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error(`[${new Date().toISOString()}] Missing Supabase environment variables`, {
        requestId,
        pathname: request.nextUrl.pathname,
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseAnonKey,
      });
      throw new Error("Missing Supabase environment variables");
    }

    console.log(`[${new Date().toISOString()}] Initializing Supabase client`, { requestId });

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const cookie of cookiesToSet) {
            const { name, value, options } = cookie;
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({
            request,
          });
          for (const cookie of cookiesToSet) {
            const { name, value, options } = cookie;
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    });

    // IMPORTANT: Do not run code between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    console.log(`[${new Date().toISOString()}] Retrieving user authentication status`, {
      requestId,
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isAuthenticated = !!user;
    console.log(`[${new Date().toISOString()}] User authentication check completed`, {
      requestId,
      isAuthenticated,
      userId: user?.id || null,
      pathname: request.nextUrl.pathname,
    });

    // Check if the request is for an auth page
    const isAuthPage =
      request.nextUrl.pathname.startsWith("/auth/") ||
      request.nextUrl.pathname === "/login" ||
      request.nextUrl.pathname === "/signup";

    console.log(`[${new Date().toISOString()}] Route protection analysis`, {
      requestId,
      pathname: request.nextUrl.pathname,
      isAuthPage,
      isAuthenticated,
      requiresRedirect: (!user && !isAuthPage) || (user && isAuthPage),
    });

    // If no user and not on auth pages, redirect to login
    if (!user && !isAuthPage) {
      console.log(`[${new Date().toISOString()}] Redirecting unauthenticated user to login`, {
        requestId,
        fromPath: request.nextUrl.pathname,
        toPath: "/login",
        reason: "unauthenticated_access_to_protected_route",
      });

      const url = request.nextUrl.clone();
      url.pathname = "/login";
      const response = NextResponse.redirect(url);

      const duration = Date.now() - startTime;
      console.log(`[${new Date().toISOString()}] Middleware redirect completed`, {
        requestId,
        statusCode: 307,
        redirectTo: "/login",
        durationMs: duration,
      });

      return response;
    }

    // If user is authenticated and trying to access auth pages, redirect to dashboard
    if (user && isAuthPage) {
      console.log(`[${new Date().toISOString()}] Redirecting authenticated user to dashboard`, {
        requestId,
        userId: user.id,
        fromPath: request.nextUrl.pathname,
        toPath: "/dashboard",
        reason: "authenticated_access_to_auth_page",
      });

      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      const response = NextResponse.redirect(url);

      const duration = Date.now() - startTime;
      console.log(`[${new Date().toISOString()}] Middleware redirect completed`, {
        requestId,
        statusCode: 307,
        redirectTo: "/dashboard",
        durationMs: duration,
      });

      return response;
    }

    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] Middleware processing completed - no redirect`, {
      requestId,
      pathname: request.nextUrl.pathname,
      isAuthenticated,
      durationMs: duration,
    });

    return supabaseResponse;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${new Date().toISOString()}] Middleware processing failed`, {
      requestId,
      pathname: request.nextUrl.pathname,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      durationMs: duration,
    });

    // In case of error, redirect to login as a safe fallback
    console.warn(`[${new Date().toISOString()}] Redirecting to login due to middleware error`, {
      requestId,
      pathname: request.nextUrl.pathname,
      reason: "middleware_error_fallback",
    });

    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
