/**
 * Re-export useAuth from the auth context
 *
 * This maintains backward compatibility while using the new
 * centralized AuthProvider pattern for better performance
 * and consistency.
 */
export { useAuth } from '@/contexts/auth-context';
export type { AuthState } from '@/contexts/auth-context';

export { useAuth as default } from '@/contexts/auth-context';
