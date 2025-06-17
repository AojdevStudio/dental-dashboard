/**
 * Re-export useAuth from the auth context
 *
 * This maintains backward compatibility while using the new
 * centralized AuthProvider pattern for better performance
 * and consistency.
 */
// biome-ignore lint/performance/noBarrelFile: Backwards compatibility hook
export { useAuth } from '@/contexts/auth-context';
export type { AuthState } from '@/contexts/auth-context';

export { useAuth as default } from '@/contexts/auth-context';
