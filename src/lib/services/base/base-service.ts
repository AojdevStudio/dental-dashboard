import type { AuthContext } from '@/lib/database/auth-context';

/**
 * Base service class providing common functionality for all services
 */
export abstract class BaseService {
  /**
   * Standardized error handling for services
   */
  protected handleError(error: unknown, context: string): never {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`${context}: ${message}`);
  }

  /**
   * Validate that auth context is properly provided
   */
  protected validateAuthContext(authContext: AuthContext | null | undefined): void {
    if (!authContext?.userId) {
      throw new Error('Valid authentication context is required');
    }
  }

  /**
   * Validate required parameters
   */
  protected validateRequired<T extends Record<string, unknown>, K extends keyof T>(
    params: T,
    requiredFields: K[]
  ): void {
    const missing = requiredFields.filter(
      (field) => params[field] === undefined || params[field] === null || params[field] === ''
    );

    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
  }
}
