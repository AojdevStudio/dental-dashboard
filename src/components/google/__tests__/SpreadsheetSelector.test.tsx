import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SpreadsheetSelector, { type Spreadsheet } from "../SpreadsheetSelector";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock the API fetch calls
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

global.fetch = vi.fn();

const mockSpreadsheets: Spreadsheet[] = [
  { id: "spreadsheet1", name: "Dental Practice Data" },
  { id: "spreadsheet2", name: "Patient Metrics Q1" },
  { id: "spreadsheet3", name: "Financials 2023" },
];

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Prevent retries in tests
        gcTime: Number.POSITIVE_INFINITY, // Prevent garbage collection in tests
      },
    },
  });

const renderWithClient = (ui: React.ReactElement, client?: QueryClient) => {
  const queryClient = client || createTestQueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

describe("SpreadsheetSelector Component", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.resetAllMocks(); // Use resetAllMocks to clear mock history and implementations
    queryClient = createTestQueryClient();
  });

  it("should display 'Please select a clinic' if no clinicId is provided", () => {
    renderWithClient(
      <SpreadsheetSelector clinicId={null} onSpreadsheetSelected={vi.fn()} />,
      queryClient
    );
    expect(
      screen.getByText("Please select a clinic first to load spreadsheets.")
    ).toBeInTheDocument();
  });

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
