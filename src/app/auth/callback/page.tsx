import { redirect } from 'next/navigation';

// This page exists to redirect from /auth/callback to /callback
// since Supabase email confirmations go to /auth/callback
export default function AuthCallbackRedirect() {
  redirect('/callback');
}
