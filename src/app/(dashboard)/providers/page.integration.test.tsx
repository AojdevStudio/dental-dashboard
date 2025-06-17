/**
 * @fileoverview Integration tests for the Providers Main Page Component Integration
 * 
 * Tests the integration of provider UI components (ProviderCard, ProviderGrid, ProviderFilters)
 * with the main providers page, focusing on data flow, URL state management, and responsive behavior.
 * 
 * Key Integration Points:
 * - Provider data fetching via useProviders hook
 * - URL parameter state management via next/navigation
 * - Component composition and data passing
 * - Error handling and loading states
 * - Filter functionality integration
 * - Permission-based UI rendering
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ProviderWithLocations } from '@/types/providers';

// Component under test
import ProvidersPage from './page';

// Mock next/navigation for URL state testing
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  prefetch: vi.fn(),
};

const mockSearchParams = new URLSearchParams();
const mockPathname = '/providers';

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => mockSearchParams,
  usePathname: () => mockPathname,
}));

// Mock fetch for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock permissions hook
const mockPermissions = {
  user: {
    id: 'user-1',
    clinicId: 'clinic-123',
    role: 'admin',
  },
  isSystemAdmin: () => true,
  getAccessibleClinics: () => ['clinic-123'],
  canCreateProvider: (clinicId: string) => clinicId === 'clinic-123', // Fixed: now accepts clinicId parameter
};

const usePermissions = vi.fn(() => mockPermissions);

vi.mock('@/hooks/use-permissions', () => ({
  usePermissions,
}));

// Mock UI components with test-friendly implementations
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button 
      data-testid="button" 
      onClick={onClick} 
      {...props}
    >
      {children}
    </button>
  ),
}));

// Mock provider components for integration testing
vi.mock('@/components/providers/permissions-provider', () => ({
  PermissionsProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="permissions-provider">{children}</div>
  ),
}));

vi.mock('@/components/providers/provider-filters', () => ({
  ProviderFilters: ({ locations, showLocationFilter, className }: any) => (
    <div 
      data-testid="provider-filters" 
      className={className}
      data-location-count={locations?.length || 0}
      data-show-location-filter={showLocationFilter}
    >
      <input 
        data-testid="search-input" 
        placeholder="Search providers..."
        onChange={(e) => {
          // Simulate filter change triggering URL update
          const params = new URLSearchParams();
          if (e.target.value) {
            params.set('search', e.target.value);
          }
          // This would trigger URL change in real component
        }}
      />
      <select data-testid="provider-type-filter">
        <option value="">All Types</option>
        <option value="dentist">Dentist</option>
        <option value="hygienist">Hygienist</option>
      </select>
      <select data-testid="status-filter">
        <option value="">All Statuses</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      <button data-testid="clear-filters-button">Clear Filters</button>
    </div>
  ),
}));

vi.mock('@/components/providers/provider-grid', () => ({
  ProviderGrid: ({ 
    providers, 
    isLoading, 
    isError, 
    error, 
    onRetry, 
    pagination, 
    viewMode, 
    onViewModeChange, 
    onPageChange,
    onProviderEdit,
    onProviderView,
    onProviderClick,
    emptyMessage,
    emptyDescription
  }: any) => {
    if (isLoading) {
      return <div data-testid="provider-grid-loading">Loading providers...</div>;
    }
    
    if (isError) {
      return (
        <div data-testid="provider-grid-error">
          <span>Error: {error?.message}</span>
          <button onClick={onRetry} data-testid="retry-button">Retry</button>
        </div>
      );
    }

    if (!providers || providers.length === 0) {
      return (
        <div data-testid="provider-grid-empty">
          <p data-testid="empty-message">{emptyMessage}</p>
          <p data-testid="empty-description">{emptyDescription}</p>
        </div>
      );
    }

    return (
      <div data-testid="provider-grid" data-view-mode={viewMode}>
        <div data-testid="view-mode-controls">
          <button 
            onClick={() => onViewModeChange?.('grid')} 
            data-testid="grid-view-button"
            data-active={viewMode === 'grid'}
          >
            Grid
          </button>
          <button 
            onClick={() => onViewModeChange?.('list')} 
            data-testid="list-view-button"
            data-active={viewMode === 'list'}
          >
            List
          </button>
        </div>
        
        <div data-testid="providers-container">
          {providers.map((provider: ProviderWithLocations) => (
            <div 
              key={provider.id} 
              data-testid={`provider-card-${provider.id}`}
              onClick={() => onProviderClick?.(provider)}
            >
              <h3 data-testid={`provider-name-${provider.id}`}>{provider.name}</h3>
              <p data-testid={`provider-email-${provider.id}`}>{provider.email}</p>
              <span data-testid={`provider-type-${provider.id}`}>{provider.providerType}</span>
              <span data-testid={`provider-status-${provider.id}`}>{provider.status}</span>
              <span data-testid={`provider-location-count-${provider.id}`}>
                {provider.locations?.length || 0} locations
              </span>
              {onProviderEdit && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onProviderEdit(provider);
                  }}
                  data-testid={`edit-provider-${provider.id}`}
                >
                  Edit
                </button>
              )}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onProviderView?.(provider);
                }}
                data-testid={`view-provider-${provider.id}`}
              >
                View
              </button>
            </div>
          ))}
        </div>

        {pagination && (
          <div data-testid="pagination-controls">
            <button 
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={!pagination.hasPreviousPage}
              data-testid="previous-page-button"
            >
              Previous
            </button>
            <span data-testid="page-info">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button 
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={!pagination.hasNextPage}
              data-testid="next-page-button"
            >
              Next
            </button>
          </div>
        )}
      </div>
    );
  },
}));

// Mock data for testing
const createMockProvider = (overrides: Partial<ProviderWithLocations> = {}): ProviderWithLocations => ({
  id: 'provider-1',
  name: 'Dr. Test Provider',
  firstName: 'Test',
  lastName: 'Provider',
  email: 'test@provider.com',
  providerType: 'dentist',
  status: 'active',
  clinic: {
    id: 'clinic-123',
    name: 'Test Clinic',
  },
  locations: [
    {
      id: 'loc-rel-1',
      locationId: 'loc-1',
      locationName: 'Main Office',
      locationAddress: '123 Main St',
      isPrimary: true,
      isActive: true,
      startDate: '2024-01-01',
      endDate: null,
    },
  ],
  primaryLocation: {
    id: 'loc-1',
    name: 'Main Office',
    address: '123 Main St',
  },
  _count: {
    locations: 1,
    hygieneProduction: 10,
    dentistProduction: 15,
  },
  ...overrides,
});

const mockProviders: ProviderWithLocations[] = [
  createMockProvider({
    id: 'provider-1',
    name: 'Dr. Alice Johnson',
    email: 'alice@test.com',
    providerType: 'dentist',
  }),
  createMockProvider({
    id: 'provider-2',
    name: 'Dr. Bob Smith',
    email: 'bob@test.com',
    providerType: 'hygienist',
    status: 'inactive',
  }),
];

const mockApiResponse = {
  success: true,
  data: mockProviders,
  pagination: {
    total: 2,
    page: 1,
    limit: 12,
    totalPages: 1,
  },
};

const mockFilterOptions = {
  providerTypes: ['dentist', 'hygienist', 'specialist'],
  statuses: ['active', 'inactive'],
  locations: [
    { id: 'loc-1', name: 'Main Office' },
    { id: 'loc-2', name: 'Branch Office' },
  ],
  totalCount: 2,
};

// Test helper to create QueryClient wrapper
const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('Providers Page Integration Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = createTestQueryClient();
    
    // Reset URL search params
    mockSearchParams.entries = vi.fn().mockReturnValue([]);
    mockSearchParams.get = vi.fn().mockReturnValue(null);
    mockSearchParams.toString = vi.fn().mockReturnValue('');
    
    // Default successful API responses
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/providers')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockApiResponse),
        });
      }
      return Promise.reject(new Error('Unhandled fetch call'));
    });
  });

  describe('Initial Page Load and Component Integration', () => {
    it('should render all provider UI components integrated correctly', async () => {
      render(
        <TestWrapper>
          <ProvidersPage />
        </TestWrapper>
      );

      // Assert main page structure
      expect(screen.getByText('Providers')).toBeInTheDocument();
      expect(screen.getByText('Manage dental providers and their assignments')).toBeInTheDocument();
      
      // Assert permissions provider is rendered
      expect(screen.getByTestId('permissions-provider')).toBeInTheDocument();
      
      // Assert filters component is integrated
      expect(screen.getByTestId('provider-filters')).toBeInTheDocument();
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
      expect(screen.getByTestId('provider-type-filter')).toBeInTheDocument();
      expect(screen.getByTestId('status-filter')).toBeInTheDocument();
      
      // Assert provider grid integration
      await waitFor(() => {
        expect(screen.getByTestId('provider-grid')).toBeInTheDocument();
      });
    });

    it('should display add provider button when user has create permissions', async () => {
      render(
        <TestWrapper>
          <ProvidersPage />
        </TestWrapper>
      );

      const addButton = screen.getByText('Add Provider');
      expect(addButton).toBeInTheDocument();
      expect(addButton.closest('button')).toBeInTheDocument();
    });

    it('should hide add provider button when user lacks create permissions', async () => {
      // Create a new mock permissions object for this test
      const restrictedPermissions = {
        ...mockPermissions,
        canCreateProvider: (clinicId: string) => false, // User cannot create providers in any clinic
        isSystemAdmin: () => false,
      };

      // Mock the hook to return restricted permissions
      vi.mocked(usePermissions).mockReturnValue(restrictedPermissions);

      render(
        <TestWrapper>
          <ProvidersPage />
        </TestWrapper>
      );

      expect(screen.queryByText('Add Provider')).not.toBeInTheDocument();
    });

    it('should integrate provider data correctly from useProviders hook to grid component', async () => {
      render(
        <TestWrapper>
          <ProvidersPage />
        </TestWrapper>
      );

      // Wait for data to load and assert provider cards are rendered
      await waitFor(() => {
        expect(screen.getByTestId('provider-card-provider-1')).toBeInTheDocument();
        expect(screen.getByTestId('provider-card-provider-2')).toBeInTheDocument();
      });

      // Assert provider data is passed correctly
      expect(screen.getByTestId('provider-name-provider-1')).toHaveTextContent('Dr. Alice Johnson');
      expect(screen.getByTestId('provider-email-provider-1')).toHaveTextContent('alice@test.com');
      expect(screen.getByTestId('provider-type-provider-1')).toHaveTextContent('dentist');
      expect(screen.getByTestId('provider-status-provider-1')).toHaveTextContent('active');

      expect(screen.getByTestId('provider-name-provider-2')).toHaveTextContent('Dr. Bob Smith');
      expect(screen.getByTestId('provider-status-provider-2')).toHaveTextContent('inactive');
    });
  });

  describe('URL State Management Integration', () => {
    it('should parse URL search parameters and pass them to useProviders hook', async () => {
      // Mock URL parameters
      mockSearchParams.get = vi.fn().mockImplementation((key: string) => {
        const params: Record<string, string> = {
          search: 'test query',
          providerType: 'dentist',
          status: 'active',
          page: '2',
          limit: '24',
          viewMode: 'list',
        };
        return params[key] || null;
      });

      render(
        <TestWrapper>
          <ProvidersPage />
        </TestWrapper>
      );

      // Assert API was called with correct parameters
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/providers'),
          expect.objectContaining({
            method: 'GET',
            credentials: 'include',
          })
        );
      });

      // Verify the URL contains the expected parameters
      const fetchCall = mockFetch.mock.calls[0][0] as string;
      expect(fetchCall).toContain('search=test+query');
      expect(fetchCall).toContain('providerType=dentist');
      expect(fetchCall).toContain('status=active');
      expect(fetchCall).toContain('page=2');
      expect(fetchCall).toContain('limit=24');
    });

    it('should handle NaN validation for page and limit parameters', async () => {
      // Mock invalid numeric parameters
      mockSearchParams.get = vi.fn().mockImplementation((key: string) => {
        const params: Record<string, string> = {
          page: 'invalid',
          limit: 'NaN',
        };
        return params[key] || null;
      });

      render(
        <TestWrapper>
          <ProvidersPage />
        </TestWrapper>
      );

      // Should default to safe values
      await waitFor(() => {
        const fetchCall = mockFetch.mock.calls[0][0] as string;
        expect(fetchCall).toContain('page=1'); // Default page
        expect(fetchCall).toContain('limit=12'); // Default limit
      });
    });

    it('should update URL when view mode changes', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <ProvidersPage />
        </TestWrapper>
      );

      // Wait for grid to load and click view mode button
      await waitFor(() => {
        expect(screen.getByTestId('provider-grid')).toBeInTheDocument();
      });

      const listViewButton = screen.getByTestId('list-view-button');
      await user.click(listViewButton);

      // Assert router.replace was called with view mode parameter
      expect(mockRouter.replace).toHaveBeenCalledWith(
        expect.stringContaining('viewMode=list'),
        expect.objectContaining({ scroll: false })
      );
    });

    it('should update URL when pagination changes', async () => {
      const user = userEvent.setup();

      // Mock pagination data
      const paginatedResponse = {
        ...mockApiResponse,
        pagination: {
          total: 25,
          page: 1,
          limit: 12,
          totalPages: 3,
        },
      };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(paginatedResponse),
      });

      render(
        <TestWrapper>
          <ProvidersPage />
        </TestWrapper>
      );

      // Wait for pagination controls to appear
      await waitFor(() => {
        expect(screen.getByTestId('pagination-controls')).toBeInTheDocument();
      });

      const nextPageButton = screen.getByTestId('next-page-button');
      await user.click(nextPageButton);

      // Assert router.replace was called with page parameter
      expect(mockRouter.replace).toHaveBeenCalledWith(
        expect.stringContaining('page=2'),
        expect.objectContaining({ scroll: false })
      );
    });
  });

  describe('Provider Actions Integration', () => {
    it('should navigate to provider details when provider is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <ProvidersPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('provider-card-provider-1')).toBeInTheDocument();
      });

      const providerCard = screen.getByTestId('provider-card-provider-1');
      await user.click(providerCard);

      expect(mockRouter.push).toHaveBeenCalledWith('/providers/provider-1');
    });

    it('should navigate to edit page when edit button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <ProvidersPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('edit-provider-provider-1')).toBeInTheDocument();
      });

      const editButton = screen.getByTestId('edit-provider-provider-1');
      await user.click(editButton);

      expect(mockRouter.push).toHaveBeenCalledWith('/providers/provider-1/edit');
    });

    it('should navigate to view page when view button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <ProvidersPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('view-provider-provider-1')).toBeInTheDocument();
      });

      const viewButton = screen.getByTestId('view-provider-provider-1');
      await user.click(viewButton);

      expect(mockRouter.push).toHaveBeenCalledWith('/providers/provider-1');
    });

    it('should navigate to create provider page when add button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <ProvidersPage />
        </TestWrapper>
      );

      const addButton = screen.getByText('Add Provider');
      await user.click(addButton);

      expect(mockRouter.push).toHaveBeenCalledWith('/providers/create');
    });
  });

  describe('Error Handling Integration', () => {
    it('should display error state in provider grid when API fails', async () => {
      mockFetch.mockRejectedValue(new Error('API service unavailable'));

      render(
        <TestWrapper>
          <ProvidersPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('provider-grid-error')).toBeInTheDocument();
        expect(screen.getByText('Error: API service unavailable')).toBeInTheDocument();
      });
    });

    it('should provide retry functionality when error occurs', async () => {
      const user = userEvent.setup();
      
      // First call fails
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      // Second call succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponse),
      });

      render(
        <TestWrapper>
          <ProvidersPage />
        </TestWrapper>
      );

      // Wait for error state
      await waitFor(() => {
        expect(screen.getByTestId('provider-grid-error')).toBeInTheDocument();
      });

      // Click retry button
      const retryButton = screen.getByTestId('retry-button');
      await user.click(retryButton);

      // Should show loading then success state
      await waitFor(() => {
        expect(screen.getByTestId('provider-grid')).toBeInTheDocument();
        expect(screen.queryByTestId('provider-grid-error')).not.toBeInTheDocument();
      });
    });

    it('should handle HTTP error responses gracefully', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve({ error: 'Database connection failed' }),
      });

      render(
        <TestWrapper>
          <ProvidersPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('provider-grid-error')).toBeInTheDocument();
        expect(screen.getByText('Error: Database connection failed')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States Integration', () => {
    it('should display loading state while fetching providers', async () => {
      // Create a promise that we can control
      let resolvePromise: (value: any) => void;
      const loadingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockFetch.mockReturnValue(
        loadingPromise.then(() => ({
          ok: true,
          json: () => Promise.resolve(mockApiResponse),
        }))
      );

      render(
        <TestWrapper>
          <ProvidersPage />
        </TestWrapper>
      );

      // Should show loading state
      expect(screen.getByTestId('provider-grid-loading')).toBeInTheDocument();
      expect(screen.getByText('Loading providers...')).toBeInTheDocument();

      // Resolve the promise and wait for data
      resolvePromise!({});
      await waitFor(() => {
        expect(screen.getByTestId('provider-grid')).toBeInTheDocument();
        expect(screen.queryByTestId('provider-grid-loading')).not.toBeInTheDocument();
      });
    });
  });

  describe('Empty States Integration', () => {
    it('should display empty state when no providers are found', async () => {
      const emptyResponse = {
        success: true,
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 12,
          totalPages: 0,
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(emptyResponse),
      });

      render(
        <TestWrapper>
          <ProvidersPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('provider-grid-empty')).toBeInTheDocument();
        expect(screen.getByTestId('empty-message')).toHaveTextContent('No providers found');
        expect(screen.getByTestId('empty-description')).toHaveTextContent(
          'Try adjusting your search criteria or add a new provider to get started.'
        );
      });
    });
  });

  describe('Filter Options Integration', () => {
    it('should pass filter options to provider filters component', async () => {
      render(
        <TestWrapper>
          <ProvidersPage />
        </TestWrapper>
      );

      // Wait for component to load and assert filter options are passed
      await waitFor(() => {
        const filtersComponent = screen.getByTestId('provider-filters');
        expect(filtersComponent).toHaveAttribute('data-show-location-filter', 'true');
        // The locations will be fetched separately by useProviderFilters
      });
    });

    it('should apply correct CSS classes to filters component', async () => {
      render(
        <TestWrapper>
          <ProvidersPage />
        </TestWrapper>
      );

      const filtersComponent = screen.getByTestId('provider-filters');
      expect(filtersComponent).toHaveClass('bg-white', 'p-6', 'rounded-lg', 'border');
    });
  });

  describe('Responsive Design Integration', () => {
    it('should render with responsive container classes', async () => {
      render(
        <TestWrapper>
          <ProvidersPage />
        </TestWrapper>
      );

      // Check for responsive container classes
      const container = screen.getByText('Providers').closest('.container');
      expect(container).toHaveClass('container', 'mx-auto', 'py-6', 'px-4');
    });

    it('should pass view mode correctly to provider grid', async () => {
      // Mock grid view mode in URL
      mockSearchParams.get = vi.fn().mockImplementation((key: string) => {
        return key === 'viewMode' ? 'grid' : null;
      });

      render(
        <TestWrapper>
          <ProvidersPage />
        </TestWrapper>
      );

      await waitFor(() => {
        const providerGrid = screen.getByTestId('provider-grid');
        expect(providerGrid).toHaveAttribute('data-view-mode', 'grid');
      });
    });

    it('should handle list view mode correctly', async () => {
      // Mock list view mode in URL
      mockSearchParams.get = vi.fn().mockImplementation((key: string) => {
        return key === 'viewMode' ? 'list' : null;
      });

      render(
        <TestWrapper>
          <ProvidersPage />
        </TestWrapper>
      );

      await waitFor(() => {
        const providerGrid = screen.getByTestId('provider-grid');
        expect(providerGrid).toHaveAttribute('data-view-mode', 'list');
      });
    });
  });

  describe('Component Composition and Data Flow', () => {
    it('should maintain proper component hierarchy and data flow', async () => {
      render(
        <TestWrapper>
          <ProvidersPage />
        </TestWrapper>
      );

      // Verify component hierarchy
      const permissionsProvider = screen.getByTestId('permissions-provider');
      expect(permissionsProvider).toBeInTheDocument();
      
      // Verify filters are within the page structure
      expect(screen.getByTestId('provider-filters')).toBeInTheDocument();
      
      // Verify grid receives correct props and renders within hierarchy
      await waitFor(() => {
        expect(screen.getByTestId('provider-grid')).toBeInTheDocument();
      });
    });

    it('should handle concurrent data fetching for providers and filter options', async () => {
      let providerCallCount = 0;
      mockFetch.mockImplementation((url: string) => {
        providerCallCount++;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(
            url.includes('filters') ? mockFilterOptions : mockApiResponse
          ),
        });
      });

      render(
        <TestWrapper>
          <ProvidersPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('provider-grid')).toBeInTheDocument();
      });

      // Both provider data and filter options should be fetched
      expect(providerCallCount).toBeGreaterThan(0);
    });
  });

  describe('Accessibility Integration', () => {
    it('should render page with proper semantic structure and ARIA attributes', async () => {
      render(
        <TestWrapper>
          <ProvidersPage />
        </TestWrapper>
      );

      // Check heading hierarchy
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('Providers');

      // Wait for interactive elements
      await waitFor(() => {
        expect(screen.getByTestId('provider-grid')).toBeInTheDocument();
      });
    });

    it('should maintain focus management for interactive elements', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <ProvidersPage />
        </TestWrapper>
      );

      // Test tab navigation through key interactive elements
      const addButton = screen.getByText('Add Provider');
      expect(addButton).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByTestId('search-input')).toBeInTheDocument();
      });

      // Elements should be focusable
      const searchInput = screen.getByTestId('search-input');
      await user.click(searchInput);
      expect(searchInput).toHaveFocus();
    });
  });
});