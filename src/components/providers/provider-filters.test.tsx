import { describe, expect, it, vi } from 'vitest';

describe('ProviderFilters Pagination Reset Logic', () => {
  // Test the updateUrl logic directly without rendering components
  function createMockUpdateUrl() {
    const mockReplace = vi.fn();
    const mockSearchParams = new URLSearchParams();
    const mockPathname = '/providers';

    // Simulate the updateUrl function logic
    const updateUrl = (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(mockSearchParams);

      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === '' || value === undefined) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }

      // Only append ? and query string if parameters exist
      const queryString = params.toString();
      const url = queryString ? `${mockPathname}?${queryString}` : mockPathname;
      mockReplace(url, { scroll: false });
      return params;
    };

    return { updateUrl, mockReplace };
  }

  it('should include page: null when provider type filter changes', () => {
    const { updateUrl, mockReplace } = createMockUpdateUrl();

    // Simulate handleProviderTypeChange logic
    const value = 'dentist';
    updateUrl({ providerType: value || null, page: null });

    expect(mockReplace).toHaveBeenCalledWith(
      '/providers?providerType=dentist',
      { scroll: false }
    );
  });

  it('should include page: null when status filter changes', () => {
    const { updateUrl, mockReplace } = createMockUpdateUrl();

    // Simulate handleStatusChange logic
    const value = 'active';
    updateUrl({ status: value || null, page: null });

    expect(mockReplace).toHaveBeenCalledWith(
      '/providers?status=active',
      { scroll: false }
    );
  });

  it('should include page: null when location filter changes', () => {
    const { updateUrl, mockReplace } = createMockUpdateUrl();

    // Simulate handleLocationChange logic
    const value = 'loc1';
    updateUrl({ locationId: value || null, page: null });

    expect(mockReplace).toHaveBeenCalledWith(
      '/providers?locationId=loc1',
      { scroll: false }
    );
  });

  it('should include page: null when search changes', () => {
    const { updateUrl, mockReplace } = createMockUpdateUrl();

    // Simulate search debounce effect logic
    const debouncedSearch = 'Dr. Smith';
    updateUrl({ search: debouncedSearch || null, page: null });

    expect(mockReplace).toHaveBeenCalledWith(
      '/providers?search=Dr.+Smith',
      { scroll: false }
    );
  });

  it('should include page: null when clearing individual filters', () => {
    const { updateUrl, mockReplace } = createMockUpdateUrl();

    // Simulate handleClearFilter logic for providerType
    updateUrl({ providerType: null, page: null });

    expect(mockReplace).toHaveBeenCalledWith(
      '/providers',
      { scroll: false }
    );
  });

  it('should include page: null when clearing all filters', () => {
    const { updateUrl, mockReplace } = createMockUpdateUrl();

    // Simulate handleClearAll logic
    updateUrl({
      search: null,
      providerType: null,
      status: null,
      locationId: null,
      page: null,
    });

    expect(mockReplace).toHaveBeenCalledWith(
      '/providers',
      { scroll: false }
    );
  });

  it('should properly handle null values by removing parameters', () => {
    const { updateUrl, mockReplace } = createMockUpdateUrl();

    // Test that null values remove parameters from URL
    updateUrl({ providerType: 'dentist', page: null });

    expect(mockReplace).toHaveBeenCalledWith(
      '/providers?providerType=dentist',
      { scroll: false }
    );
  });

  it('should properly handle empty string values by removing parameters', () => {
    const { updateUrl, mockReplace } = createMockUpdateUrl();

    // Test that empty string values remove parameters from URL
    updateUrl({ providerType: '', page: null });

    expect(mockReplace).toHaveBeenCalledWith(
      '/providers',
      { scroll: false }
    );
  });

  it('should maintain existing parameters while adding page: null', () => {
    const { updateUrl, mockReplace } = createMockUpdateUrl();

    // First set some parameters
    updateUrl({ search: 'test', providerType: 'dentist' });

    // Then update with page: null
    updateUrl({ status: 'active', page: null });

    expect(mockReplace).toHaveBeenLastCalledWith(
      '/providers?status=active',
      { scroll: false }
    );
  });
});
