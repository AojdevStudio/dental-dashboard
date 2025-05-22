/**
 * @fileoverview Tests for the SpreadsheetSelector component
 * 
 * This file contains unit tests for the SpreadsheetSelector component, which allows
 * users to select Google Spreadsheets. The tests verify the component's behavior in
 * various states including loading, error handling, empty results, and successful selection.
 * 
 * The tests use Vitest as the test runner and React Testing Library for component rendering
 * and assertions. TanStack Query (React Query) is mocked to simulate data fetching scenarios.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SpreadsheetSelector, { type Spreadsheet } from "../SpreadsheetSelector";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * Mock setup for tests
 * - Mock Next.js router to prevent navigation during tests
 * - Mock global fetch to control API responses
 * - Create sample spreadsheet data for testing
 */

// Mock the API fetch calls
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

global.fetch = vi.fn();

/**
 * Sample spreadsheet data for testing
 * Represents the expected structure of spreadsheets returned from the API
 */
const mockSpreadsheets: Spreadsheet[] = [
  { id: "spreadsheet1", name: "Dental Practice Data" },
  { id: "spreadsheet2", name: "Patient Metrics Q1" },
  { id: "spreadsheet3", name: "Financials 2023" },
];

/**
 * Creates a configured QueryClient instance for testing
 * - Disables retries to prevent hanging tests
 * - Prevents garbage collection to maintain query cache during tests
 * 
 * @returns {QueryClient} A configured QueryClient for testing
 */
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Prevent retries in tests
        gcTime: Number.POSITIVE_INFINITY, // Prevent garbage collection in tests
      },
    },
  });

/**
 * Renders a component with a QueryClient provider for testing
 * This helper ensures that components using React Query hooks have the necessary context
 * 
 * @param {React.ReactElement} ui - The component to render
 * @param {QueryClient} [client] - Optional custom QueryClient instance
 * @returns {Object} The rendered component with testing utilities
 */
const renderWithClient = (ui: React.ReactElement, client?: QueryClient) => {
  const queryClient = client || createTestQueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

/**
 * Test suite for the SpreadsheetSelector component
 * Tests various states and behaviors of the component
 */
describe("SpreadsheetSelector Component", () => {
  let queryClient: QueryClient;

  /**
   * Setup before each test
   * - Reset all mocks to ensure clean test environment
   * - Create a fresh QueryClient instance
   */
  beforeEach(() => {
    vi.resetAllMocks(); // Use resetAllMocks to clear mock history and implementations
    queryClient = createTestQueryClient();
  });

  /**
   * Test case: Component should display a message when no clinic is selected
   * Verifies that the component shows an appropriate message when clinicId is null
   */
  it("should display 'Please select a clinic' if no clinicId is provided", () => {
    renderWithClient(
      <SpreadsheetSelector clinicId={null} onSpreadsheetSelected={vi.fn()} />,
      queryClient
    );
    expect(
      screen.getByText("Please select a clinic first to load spreadsheets.")
    ).toBeInTheDocument();
  });

  /**
   * Test case: Component should show loading state when fetching spreadsheets
   * Verifies that loading indicators appear while data is being fetched
   * Uses an indefinitely pending promise to simulate ongoing network request
   */
  it("should render loading skeletons when fetching spreadsheets", () => {
    (global.fetch as vi.Mock).mockImplementationOnce(() => new Promise(() => {})); // Indefinite pending state

    renderWithClient(
      <SpreadsheetSelector clinicId="clinic123" onSpreadsheetSelected={vi.fn()} />,
      queryClient
    );
    expect(screen.getByText("Fetching spreadsheets...")).toBeInTheDocument(); // Placeholder in SelectTrigger
    // Check for one of the skeleton texts for SelectItem options
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  /**
   * Test case: Component should display spreadsheets after successful data fetching
   * Verifies that spreadsheet names appear in the dropdown after data loads
   * Mocks a successful API response with sample spreadsheet data
   */
  it("should display spreadsheets after successful loading", async () => {
    (global.fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ spreadsheets: mockSpreadsheets }),
    });

    renderWithClient(
      <SpreadsheetSelector clinicId="clinic123" onSpreadsheetSelected={vi.fn()} />,
      queryClient
    );

    await waitFor(() => {
      expect(screen.getByText("Dental Practice Data")).toBeInTheDocument();
    });
    expect(screen.getByText("Patient Metrics Q1")).toBeInTheDocument();
    expect(screen.getByText("Financials 2023")).toBeInTheDocument();
    // Check the trigger value placeholder
    expect(screen.getByText("Select a spreadsheet")).toBeInTheDocument();
  });

  /**
   * Test case: Component should trigger callback when a spreadsheet is selected
   * Verifies that the onSpreadsheetSelected callback is called with the correct spreadsheet object
   * Tests the complete interaction flow: load data → open dropdown → select item → trigger callback
   */
  it("should call onSpreadsheetSelected with the correct spreadsheet object when an item is clicked", async () => {
    const mockOnSpreadsheetSelected = vi.fn();
    (global.fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ spreadsheets: mockSpreadsheets }),
    });

    renderWithClient(
      <SpreadsheetSelector
        clinicId="clinic123"
        onSpreadsheetSelected={mockOnSpreadsheetSelected}
      />,
      queryClient
    );

    await waitFor(() => {
      // Open the select
      fireEvent.mouseDown(screen.getByRole("combobox"));
    });

    // Click the specific item
    await waitFor(() => {
      fireEvent.click(screen.getByText("Patient Metrics Q1"));
    });

    expect(mockOnSpreadsheetSelected).toHaveBeenCalledTimes(1);
    expect(mockOnSpreadsheetSelected).toHaveBeenCalledWith(mockSpreadsheets[1]); // { id: "spreadsheet2", name: "Patient Metrics Q1" }
  });

  /**
   * Test case: Component should display empty state message when no spreadsheets are found
   * Verifies that an appropriate message is shown when the API returns an empty list
   * Tests the component's handling of valid but empty responses
   */
  it("should display 'No spreadsheets found' message if API returns empty list", async () => {
    (global.fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ spreadsheets: [] }),
    });

    renderWithClient(
      <SpreadsheetSelector clinicId="clinic123" onSpreadsheetSelected={vi.fn()} />,
      queryClient
    );

    await waitFor(() => {
      expect(screen.getByText("No spreadsheets found for this clinic.")).toBeInTheDocument();
    });
  });

  /**
   * Test case: Component should display error message when fetch request fails
   * Verifies that network errors are properly caught and displayed to the user
   * Tests the component's error handling for rejected promises
   */
  it("should display error message if fetching spreadsheets fails", async () => {
    const errorMessage = "Network Error: Failed to fetch data.";
    (global.fetch as vi.Mock).mockRejectedValueOnce(new Error(errorMessage));

    renderWithClient(
      <SpreadsheetSelector clinicId="clinic123" onSpreadsheetSelected={vi.fn()} />,
      queryClient
    );

    await waitFor(() => {
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    });
  });

  /**
   * Test case: Component should display error message from API error responses
   * Verifies that HTTP error responses (non-200 status codes) are properly handled
   * Tests the component's error handling for successful requests with error status codes
   */
  it("should display error message from API response if fetching spreadsheets returns !ok", async () => {
    const errorMessage = "Unauthorized access to spreadsheets.";
    (global.fetch as vi.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ message: errorMessage }), // Assuming error response has a message field
    });

    renderWithClient(
      <SpreadsheetSelector clinicId="clinic123" onSpreadsheetSelected={vi.fn()} />,
      queryClient
    );

    await waitFor(() => {
      // The component prefixes with "Error: "
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    });
  });
});
