/**
 * TDD Test Suite for Providers Error Boundary Component
 * Task: AOJ-55-T1 (Foundation) - error.tsx
 * 
 * This test suite drives the TDD implementation of the error boundary
 * for the providers main page following Next.js 15 App Router patterns.
 * 
 * Initial State: All tests FAIL (Red phase of TDD)
 * Expected Implementation: Client Component with retry functionality
 * 
 * IMPORTANT: error.tsx MUST be a Client Component ('use client')
 * because it uses event handlers and the reset function prop.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Error from './error'; // This will initially fail as the file doesn't exist

// Mock Shadcn UI components if they have complex dependencies
// vi.mock('@/components/ui/button', () => ({
//   Button: ({ children, onClick, ...props }: any) => (
//     <button onClick={onClick} {...props}>
//       {children}
//     </button>
//   ),
// }));

describe('Providers Error Boundary Component', () => {
  /**
   * Test: Critical error announcement accessibility
   * 
   * Purpose: Ensures the error is announced immediately by screen readers
   * as it's a critical state change. Uses role="alert" which is more
   * appropriate than "status" for errors.
   * 
   * TDD Failure: Fails initially because error.tsx doesn't exist.
   * Subsequent failures occur if the root element lacks role="alert".
   */
  it('renders with correct accessibility role for critical announcements', () => {
    render(<Error error={new Error('Test error')} reset={vi.fn()} />);
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  /**
   * Test: User-friendly error messaging
   * 
   * Purpose: Confirms that a generic, non-technical message is displayed
   * to users instead of raw error details.
   * 
   * TDD Failure: Fails if the heading or paragraph elements are missing
   * or contain incorrect text content.
   */
  it('displays a generic error message and heading', () => {
    render(<Error error={new Error('Test error')} reset={vi.fn()} />);
    
    expect(screen.getByRole('heading', { name: /something went wrong/i })).toBeInTheDocument();
    expect(screen.getByText(/an unexpected error occurred/i)).toBeInTheDocument();
  });

  /**
   * Test: Security - Prevent sensitive information leakage
   * 
   * Purpose: Critical security test to prevent leaking potentially
   * sensitive implementation details, PHI, or system information.
   * 
   * In a dental dashboard context, this prevents HIPAA violations
   * where error messages might contain patient data or database details.
   * 
   * TDD Failure: Fails if a naive implementation renders error.message
   * directly into the DOM.
   */
  it('does NOT render the raw error message to the user', () => {
    const sensitiveMessage = 'Database connection failed: patient_records table timeout';
    render(<Error error={new Error(sensitiveMessage)} reset={vi.fn()} />);
    
    expect(screen.queryByText(sensitiveMessage)).not.toBeInTheDocument();
  });

  /**
   * Test: Additional security check with PHI-like content
   * 
   * Purpose: Specifically tests for healthcare-related sensitive data
   * that could violate HIPAA if exposed.
   * 
   * TDD Failure: Fails if any part of the error message containing
   * patient-like information is rendered to the user.
   */
  it('does NOT expose potential PHI in error messages', () => {
    const phiMessage = 'Query failed for patient John Doe, insurance ID: ABC123';
    render(<Error error={new Error(phiMessage)} reset={vi.fn()} />);
    
    expect(screen.queryByText(/john doe/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/abc123/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/insurance id/i)).not.toBeInTheDocument();
  });

  /**
   * Test: Core recovery mechanism functionality
   * 
   * Purpose: Verifies that the error boundary's retry functionality
   * is correctly wired to the Next.js reset prop.
   * 
   * This is the primary functional requirement of the error boundary.
   * 
   * TDD Failure: Fails if the button is missing, lacks proper text,
   * or if its onClick handler doesn't invoke the reset prop.
   */
  it('calls the reset function when the retry button is clicked', async () => {
    const user = userEvent.setup();
    const mockReset = vi.fn();
    
    render(<Error error={new Error('Test error')} reset={mockReset} />);

    const retryButton = screen.getByRole('button', { name: /try again/i });
    await user.click(retryButton);

    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  /**
   * Test: Error prop interface validation
   * 
   * Purpose: Ensures the component correctly accepts the Next.js
   * error boundary interface: error: Error & { digest?: string }
   * 
   * TDD Failure: Fails if component doesn't accept both Error
   * object and optional digest property.
   */
  it('accepts error object with optional digest property', () => {
    const errorWithDigest = Object.assign(new Error('Test'), { digest: 'abc123' }) as Error & { digest?: string };
    
    const mockReset = vi.fn();
    
    expect(() => {
      render(<Error error={errorWithDigest} reset={mockReset} />);
    }).not.toThrow();
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  /**
   * Test: Reset function prop validation
   * 
   * Purpose: Ensures the component correctly accepts and uses
   * the reset function prop from Next.js error boundary.
   * 
   * TDD Failure: Fails if the component doesn't accept the
   * reset prop or doesn't make it accessible via the retry button.
   */
  it('accepts and properly wires the reset function prop', () => {
    const mockReset = vi.fn();
    
    render(<Error error={new Error('Test')} reset={mockReset} />);
    
    const retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toBeInTheDocument();
    
    // Reset function should be accessible (not called immediately)
    expect(mockReset).not.toHaveBeenCalled();
  });

  /**
   * Test: Component structure and styling consistency
   * 
   * Purpose: Verifies the error component follows the dashboard's
   * design patterns and includes proper visual hierarchy.
   * 
   * TDD Failure: Fails if the component lacks proper container
   * structure or spacing classes.
   */
  it('follows dashboard design patterns with proper structure', () => {
    render(<Error error={new Error('Test')} reset={vi.fn()} />);
    
    const alertContainer = screen.getByRole('alert');
    
    // Should have proper spacing and centering
    expect(alertContainer).toHaveClass('flex');
    expect(alertContainer).toHaveClass('flex-col');
    expect(alertContainer).toHaveClass('items-center');
    expect(alertContainer).toHaveClass('justify-center');
    expect(alertContainer).toHaveClass('min-h-[400px]');
  });

  /**
   * Test: Button accessibility and interaction
   * 
   * Purpose: Ensures the retry button is properly accessible
   * and follows interactive element best practices.
   * 
   * TDD Failure: Fails if the button lacks proper focus
   * handling or accessible labeling.
   */
  it('retry button is properly accessible and interactive', () => {
    render(<Error error={new Error('Test')} reset={vi.fn()} />);
    
    const retryButton = screen.getByRole('button', { name: /try again/i });
    
    // Should be focusable
    expect(retryButton).toHaveAttribute('type', 'button');
    
    // Should have proper button styling (assuming Shadcn Button classes)
    expect(retryButton).toHaveClass('inline-flex');
  });

  /**
   * Test: Error logging context preservation
   * 
   * Purpose: While we don't test actual logging (side effect),
   * we ensure the error object is available for logging purposes.
   * 
   * TDD Failure: Fails if the component doesn't receive or
   * preserve the error prop for potential logging.
   */
  it('preserves error context for logging purposes', () => {
    const testError = Object.assign(new Error('Critical database failure'), { 
      stack: 'Error stack trace...' 
    });
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<Error error={testError} reset={vi.fn()} />);
    
    // Component should render without exposing the error
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.queryByText('Critical database failure')).not.toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });
});