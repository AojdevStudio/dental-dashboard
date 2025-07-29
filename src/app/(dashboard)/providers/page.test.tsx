import { render, screen, waitFor, act } from '@testing-library/react';
import { vi } from 'vitest';
import React from 'react';

// The component we are testing - it's a Client Component that uses useSearchParams
import ProvidersPage from './page';

// Mock Next.js navigation
const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams();
const mockPathname = '/providers';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    pathname: mockPathname,
  }),
  useSearchParams: () => mockSearchParams,
  usePathname: () => mockPathname,
}));

// Mock fetch for API calls
global.fetch = vi.fn();

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

describe('ProvidersPage Client Component Integration Tests', () => {
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
    
    // Reset search params
    mockSearchParams.forEach((_, key) => {
      mockSearchParams.delete(key);
    });
    
    // Mock successful API response by default
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: mockProviders,
        pagination: mockPagination,
      }),
    });
  });

  describe('Client-Side Rendering', () => {
    it('should render providers page and fetch data via API', async () => {
      // Arrange - Set up search params
      mockSearchParams.set('page', '1');
      mockSearchParams.set('limit', '12');

      // Act - Render the component with act()
      await act(async () => {
        render(<ProvidersPage />);
      });

      // Assert - Should show loading initially
      expect(screen.getByTestId('provider-grid-loading')).toBeInTheDocument();

      // Wait for API call and data loading
      await waitFor(() => {
        expect(screen.getByText('Dr. Alice Johnson')).toBeInTheDocument();
      });

      expect(screen.getByText('Dr. Bob Smith')).toBeInTheDocument();
      expect(screen.getByTestId('provider-grid')).toBeInTheDocument();
    });

    it('should make API call with correct search parameters', async () => {
      // Arrange
      mockSearchParams.set('page', '2');
      mockSearchParams.set('limit', '24');
      mockSearchParams.set('search', 'dentist');
      mockSearchParams.set('providerType', 'dentist');
      mockSearchParams.set('status', 'active');
      mockSearchParams.set('locationId', 'loc-1');

      // Act
      await act(async () => {
        render(<ProvidersPage />);
      });

      // Wait for API call
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/providers?page=2&limit=24&search=dentist&providerType=dentist&locationId=loc-1&status=active')
        );
      });
    });

    it('should handle default parameters when searchParams are missing', async () => {
      // Arrange - No search params set

      // Act
      await act(async () => {
        render(<ProvidersPage />);
      });

      // Wait for API call
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/providers?page=1&limit=12')
        );
      });
    });

    it('should sanitize and validate numeric parameters', async () => {
      // Arrange - Set invalid numeric parameters
      mockSearchParams.set('page', 'invalid');
      mockSearchParams.set('limit', 'NaN');

      // Act
      await act(async () => {
        render(<ProvidersPage />);
      });

      // Wait for API call with sanitized parameters
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/providers?page=1&limit=12') // Should fallback to defaults
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      // Arrange - Mock API error
      (global.fetch as any).mockResolvedValue({
        ok: false,
        statusText: 'Internal Server Error',
      });

      // Act
      await act(async () => {
        render(<ProvidersPage />);
      });

      // Assert - Should show error state
      await waitFor(() => {
        expect(screen.getByTestId('provider-grid-error')).toBeInTheDocument();
      });
    });

    it('should handle network timeouts gracefully', async () => {
      // Arrange - Mock network error
      (global.fetch as any).mockRejectedValue(new Error('Network timeout'));

      // Act
      await act(async () => {
        render(<ProvidersPage />);
      });

      // Assert - Should show error state
      await waitFor(() => {
        expect(screen.getByTestId('provider-grid-error')).toBeInTheDocument();
      });
    });

    it('should display empty state when no providers found', async () => {
      // Arrange - Mock empty response
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: [],
          pagination: { total: 0, page: 1, limit: 12, totalPages: 0 },
        }),
      });

      // Act
      await act(async () => {
        render(<ProvidersPage />);
      });

      // Assert - Should render empty grid
      await waitFor(() => {
        expect(screen.getByTestId('provider-grid')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('provider-1')).not.toBeInTheDocument();
    });
  });
});
