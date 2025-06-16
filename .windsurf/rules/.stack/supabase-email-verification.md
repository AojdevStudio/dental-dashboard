---
trigger: model_decision
description: This rule provides guidance for implementing email verification with Supabase Auth in Next.js applications.
globs: 
---
# Supabase Auth Email Verification
# Version 1.0.0

## OVERVIEW

This rule provides guidance for implementing email verification with Supabase Auth in Next.js applications.

## EMAIL VERIFICATION FLOW

Supabase Auth supports email verification to confirm user identity during signup and other authentication processes. A complete implementation requires:

1. Configure proper signup with email verification enabled
2. Set up email redirect URLs
3. Create a callback route handler to process verification tokens
4. Implement error handling for the verification process

## IMPLEMENTATION STEPS

### 1. CONFIGURE SIGNUP WITH EMAIL VERIFICATION

When registering users, always include the `emailRedirectTo` option to specify where users should be redirected after verifying their email:

```js
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securepassword',
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`,
  },
})
```

### 2. CREATE AUTH CALLBACK ROUTE HANDLER

Implement a route handler at the redirect path to process verification tokens:

```ts
// app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { type EmailOtpType } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/dashboard';

  if (token_hash && type) {
    const supabase = createClient();
    
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    
    if (!error) {
      return NextResponse.redirect(`${request.nextUrl.origin}${next}`);
    }
  }

  // Return to error page if verification fails
  return NextResponse.redirect(`${request.nextUrl.origin}/auth/auth-error`);
}
```

### 3. IMPLEMENT ERROR HANDLING

Create a proper error page to handle failed verifications:

```ts
// app/auth/auth-error/page.tsx
"use client"

export default function AuthError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="bg-card rounded-xl p-8 max-w-sm w-full text-center">
        <h2 className="text-2xl font-semibold text-destructive mb-4">Authentication Error</h2>
        <p className="text-muted-foreground mb-6">We couldn't verify your email. The link may have expired or is invalid.</p>
        <a href="/login" className="underline text-primary hover:text-primary/80">Back to Login</a>
      </div>
    </div>
  )
}
```

## CUSTOM EMAIL TEMPLATES (OPTIONAL)

Supabase allows customizing email templates. Use this pattern to create custom confirmation links:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next={{ .RedirectTo }}">
  Confirm your email
</a>
```

## BEST PRACTICES

1. **Always Use Email Verification**: Enable email verification for signup to prevent fake accounts
2. **Handle Expired Links**: Create clear error messages for expired verification links
3. **Secure Redirects**: Validate the 'next' parameter to prevent open redirect vulnerabilities
4. **User Feedback**: Provide clear status updates during the verification process
5. **Server-Side Verification**: Always verify tokens on the server, never client-side

