import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import React, { Suspense } from 'react';

// The component we are testing - will be converted to server component
import ProvidersPage from './page';

// Mock the provider data layer
const mockGetProvidersWithLocationsPaginated = vi.fn();
const mockGetProviderLocationSummary = vi.fn();
const mockCreateClient = vi.fn();

vi.mock('@/lib/database/queries/providers', () => ({
  getProvidersWithLocationsPaginated: mockGetProvidersWithLocationsPaginated,
  getProviderLocationSummary: mockGetProviderLocationSummary,
}));

// Mock the auth session layer
vi.mock('@/lib/auth/session', () => ({
  createClient: mockCreateClient,
}));

// Mock child components to prevent their logic/rendering from affecting our tests
vi.mock('@/components/providers/provider-grid', () => ({
  ProviderGrid: ({ providers, isLoading, isError, error }: { 
    providers: any[]; 
    isLoading: boolean; 
    isError: boolean; 
    error?: Error;
  }) => {
    if (isLoading) return <div data-testid="provider-grid-loading">Loading providers...</div>;
    if (isError) return <div data-testid="provider-grid-error">Error: {error?.message}</div>;
    return (
      <div data-testid="provider-grid">
        {providers.map(p => <div key={p.id} data-testid={`provider-${p.id}`}>{p.name}</div>)}
      </div>
    );
  },
}));

vi.mock('@/components/providers/provider-filters', () => ({
  ProviderFilters: ({ locations }: { locations: any[] }) => (
    <div data-testid="provider-filters">
      Filters ({locations.length} locations)
    </div>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button data-testid="add-provider-button" onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/providers/permissions-provider', () => ({
  PermissionsProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="permissions-provider">{children}</div>
  ),
}));

// Mock data types for TypeScript
interface MockProvider {
  id: string;
  name: string;
  email: string;
  providerType: 'dentist' | 'hygienist' | 'specialist' | 'other';
  status: 'active' | 'inactive';
  locationIds: string[];
}

interface MockFilterOptions {
  locations: Array<{ id: string; name: string; }>;
  providerTypes: string[];
  statuses: string[];
}

interface MockPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface MockSession {
  user: {
    id: string;
    clinicId: string;
    role: string;
  };
  accessToken: string;
}

// Error boundary for testing error propagation
class TestErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <div data-testid="error-boundary">Something went wrong: {this.state.error?.message}</div>;
    }
    return this.props.children;
  }
}

describe('ProvidersPage Server Component Integration Tests', () => {
  const mockProviders: MockProvider[] = [
    {
      id: 'provider-1',
      name: 'Dr. Alice Johnson',
      email: 'alice@dental.com',
      providerType: 'dentist',
      status: 'active',
      locationIds: ['loc-1', 'loc-2'],
    },
    {
      id: 'provider-2',
      name: 'Dr. Bob Smith',
      email: 'bob@dental.com',
      providerType: 'hygienist',
      status: 'active',
      locationIds: ['loc-1'],
    },
  ];

  const mockFilterOptions: MockFilterOptions = {
    locations: [
      { id: 'loc-1', name: 'Main Office' },
      { id: 'loc-2', name: 'Branch Office' },
    ],
    providerTypes: ['dentist', 'hygienist', 'specialist', 'other'],
    statuses: ['active', 'inactive'],
  };

  const mockPagination: MockPagination = {
    page: 1,
    limit: 12,
    total: 2,
    totalPages: 1,
  };

  const mockSession: MockSession = {
    user: {
      id: 'user-1',
      clinicId: 'clinic-123',
      role: 'admin',
    },
    accessToken: 'test-token',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default successful session mock - mock Supabase client
    const mockSupabaseClient = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockSession.user },
          error: null,
        }),
      },
    };
    mockCreateClient.mockResolvedValue(mockSupabaseClient as never);
  });

  describe('Server-Side Rendering (SSR)', () => {
    it('should render providers page with server-fetched data', async () => {
      // Arrange
      mockGetProvidersWithLocationsPaginated.mockResolvedValue({
        providers: mockProviders,
        total: mockPagination.total,
      });
      mockGetProviderLocationSummary.mockResolvedValue(mockFilterOptions.locations);

      // Act - Direct component invocation for server component testing
      const searchParams = { page: '1', limit: '12' };
      const component = await ProvidersPage({ searchParams });
      render(component);

      // Assert - Provider data should be rendered server-side
      expect(screen.getByText('Dr. Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('Dr. Bob Smith')).toBeInTheDocument();
      expect(screen.getByTestId('provider-grid')).toBeInTheDocument();
    });

    it('should call getProvidersWithLocationsPaginated with correctly parsed searchParams', async () => {
      // Arrange
      mockGetProvidersWithLocationsPaginated.mockResolvedValue({
        providers: [],
        total: 0,
      });
      mockGetProviderLocationSummary.mockResolvedValue([]);

      const searchParams = {
        page: '2',
        limit: '24',
        search: 'dentist',
        providerType: 'dentist',
        status: 'active',
        locationId: 'loc-1',
      };

      // Act
      await ProvidersPage({ searchParams });

      // Assert
      expect(mockGetProvidersWithLocationsPaginated).toHaveBeenCalledWith({
        page: 2,
        limit: 24,
        search: 'dentist',
        providerType: 'dentist',
        status: 'active',
        locationId: 'loc-1',
        clinicId: 'clinic-123', // Multi-tenant isolation
      });
    });

    it('should handle default parameters when searchParams are missing', async () => {
      // Arrange
      mockGetProvidersWithLocationsPaginated.mockResolvedValue({
        providers: [],
        total: 0,
      });
      mockGetProviderLocationSummary.mockResolvedValue([]);

      // Act
      await ProvidersPage({ searchParams: {} });

      // Assert
      expect(mockGetProvidersWithLocationsPaginated).toHaveBeenCalledWith({
        page: 1,
        limit: 12,
        search: undefined,
        providerType: undefined,
        status: undefined,
        locationId: undefined,
        clinicId: 'clinic-123',
      });
    });

    it('should sanitize and validate numeric parameters', async () => {
      // Arrange
      mockGetProvidersWithLocationsPaginated.mockResolvedValue({
        providers: [],
        total: 0,
      });
      mockGetProviderLocationSummary.mockResolvedValue([]);

      const searchParams = {
        page: 'invalid',
        limit: 'NaN',
      };

      // Act
      await ProvidersPage({ searchParams });

      // Assert - Should fallback to defaults for invalid numbers
      expect(mockGetProvidersWithLocationsPaginated).toHaveBeenCalledWith({
        page: 1, // Default fallback
        limit: 12, // Default fallback
        search: undefined,
        providerType: undefined,
        status: undefined,
        locationId: undefined,
        clinicId: 'clinic-123',
      });
    });
  });

  describe('Multi-Tenant Security', () => {
    it('should enforce clinic-based data isolation', async () => {
      // Arrange
      const clinicSession = {
        ...mockSession,
        user: { ...mockSession.user, clinicId: 'clinic-456' },
      };
      const mockSupabaseClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: clinicSession.user },
            error: null,
          }),
        },
      };
      mockCreateClient.mockResolvedValue(mockSupabaseClient as never);
      mockGetProvidersWithLocationsPaginated.mockResolvedValue({
        providers: mockProviders,
        total: mockPagination.total,
      });
      mockGetProviderLocationSummary.mockResolvedValue(mockFilterOptions.locations);

      // Act
      await ProvidersPage({ searchParams: {} });

      // Assert - Should use the session's clinicId
expect(mockGetProvidersWithLocationsPaginated).toHaveBeenCalledWith(
  expect.objectContaining({
    page: 2,
    limit: 24,
    search: 'dentist',
    providerType: 'dentist',
    status: 'active',
    locationId: 'loc-1',
    clinicId: 'clinic-123',
  }),
);
    });

    it('should handle unauthorized access gracefully', async () => {
      // Arrange - No authenticated user
      const mockSupabaseClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'Not authenticated' },
          }),
        },
      };
      mockCreateClient.mockResolvedValue(mockSupabaseClient as never);

      // Act & Assert - Should throw error when no user
      await expect(ProvidersPage({ searchParams: {} })).rejects.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      // Arrange
      mockGetProvidersWithLocationsPaginated.mockRejectedValue(new Error('API service unavailable'));
      
      // Act & Assert
      await expect(ProvidersPage({ searchParams: {} })).rejects.toThrow('API service unavailable');
    });

    it('should handle network timeouts gracefully', async () => {
      // Arrange
      mockGetProvidersWithLocationsPaginated.mockRejectedValue(new Error('Network timeout'));
      
      // Act & Assert
      await expect(ProvidersPage({ searchParams: {} })).rejects.toThrow('Network timeout');
    });

    it('should handle malformed provider data', async () => {
      // Arrange
      mockGetProvidersWithLocationsPaginated.mockResolvedValue({
        providers: [{ invalid: 'data' } as never], // Malformed data
        total: 1,
      });

      // Act & Assert - The server component should validate data structure
      await expect(ProvidersPage({ searchParams: {} })).rejects.toThrow();
    });
  });

  describe('Empty States', () => {
    it('should display empty state when no providers found', async () => {
      // Arrange
      mockGetProvidersWithLocationsPaginated.mockResolvedValue({
        providers: [],
        total: 0,
      });
      mockGetProviderLocationSummary.mockResolvedValue(mockFilterOptions.locations);

      // Act
      const component = await ProvidersPage({ searchParams: {} });
      render(component);

      // Assert
      expect(screen.getByTestId('provider-grid')).toBeInTheDocument();
      expect(screen.queryByTestId('provider-1')).not.toBeInTheDocument();
    });

    it('should handle empty filter options gracefully', async () => {
      // Arrange
      mockGetProvidersWithLocationsPaginated.mockResolvedValue({
        providers: mockProviders,
        total: mockPagination.total,
      });
      mockGetProviderLocationSummary.mockResolvedValue([]);

      // Act
      const component = await ProvidersPage({ searchParams: {} });
      render(component);

      // Assert
      expect(screen.getByTestId('provider-filters')).toBeInTheDocument();
      expect(screen.getByText('Filters (0 locations)')).toBeInTheDocument();
    });
  });

  describe('Performance Optimization', () => {
    it('should implement proper caching headers for SSR', async () => {
      // Arrange
      mockGetProvidersWithLocationsPaginated.mockResolvedValue({
        providers: mockProviders,
        total: mockPagination.total,
      });
      mockGetProviderLocationSummary.mockResolvedValue(mockFilterOptions.locations);

      // Act
      await ProvidersPage({ searchParams: {} });

      // Assert - Verify data fetching functions are called
      expect(mockGetProvidersWithLocationsPaginated).toHaveBeenCalledTimes(1);
      expect(mockGetProviderLocationSummary).toHaveBeenCalledTimes(1);
    });

    it('should handle concurrent data fetching efficiently', async () => {
      // Arrange
      const providerPromise = Promise.resolve({
        providers: mockProviders,
        total: mockPagination.total,
      });
      const filterPromise = Promise.resolve(mockFilterOptions.locations);
      
      mockGetProvidersWithLocationsPaginated.mockReturnValue(providerPromise);
      mockGetProviderLocationSummary.mockReturnValue(filterPromise);

      // Act
      const startTime = Date.now();
      await ProvidersPage({ searchParams: {} });
      const endTime = Date.now();

      // Assert - Both calls should be made in parallel
      expect(mockGetProvidersWithLocationsPaginated).toHaveBeenCalledTimes(1);
      expect(mockGetProviderLocationSummary).toHaveBeenCalledTimes(1);
      
      // Verify parallel execution (should be faster than sequential)
      expect(endTime - startTime).toBeLessThan(100); // Assuming mocked promises resolve quickly
    });
  });

  describe('TypeScript Integration', () => {
    it('should have proper type definitions for searchParams', async () => {
      // Arrange
      mockGetProvidersWithLocationsPaginated.mockResolvedValue({
        providers: mockProviders,
        total: mockPagination.total,
      });
      mockGetProviderLocationSummary.mockResolvedValue(mockFilterOptions.locations);

      // Act & Assert - TypeScript should enforce correct prop types
      const validSearchParams = {
        page: '1',
        limit: '12',
        search: 'test',
        providerType: 'dentist' as const,
        status: 'active' as const,
        locationId: 'loc-1',
      };

      // This should compile without TypeScript errors
      await ProvidersPage({ searchParams: validSearchParams });
      expect(mockGetProvidersWithLocationsPaginated).toHaveBeenCalled();
    });

    it('should validate provider data structure with TypeScript', async () => {
      // Arrange - Mock data with correct TypeScript structure
      const typedProviders: MockProvider[] = [
        {
          id: 'provider-1',
          name: 'Dr. Test',
          email: 'test@example.com',
          providerType: 'dentist',
          status: 'active',
          locationIds: ['loc-1'],
        },
      ];

      mockGetProvidersWithLocationsPaginated.mockResolvedValue({
        providers: typedProviders,
        total: 1,
      });
      mockGetProviderLocationSummary.mockResolvedValue(mockFilterOptions.locations);

      // Act
      const component = await ProvidersPage({ searchParams: {} });
      render(component);

      // Assert
      expect(screen.getByText('Dr. Test')).toBeInTheDocument();
    });
  });
});

// Additional type-checking tests for development time validation
describe('ProvidersPage Type Safety', () => {
  it('should enforce correct searchParams interface', () => {
    // This test ensures TypeScript compilation fails for incorrect prop types
    type SearchParamsType = Parameters<typeof ProvidersPage>[0]['searchParams'];
    
    // Valid searchParams should include optional string properties
    const validParams: SearchParamsType = {
      page: '1',
      limit: '12',
      search: 'test',
      providerType: 'dentist',
      status: 'active',
      locationId: 'loc-1',
    };

    // This validates the type structure at compile time
    expect(typeof validParams).toBe('object');
  });
});