import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SpreadsheetSelector from "../SpreadsheetSelector";

// Mock the API fetch calls
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

global.fetch = vi.fn();

// Mock fetch implementation
vi.mocked(global.fetch).mockImplementation((url: string | URL | Request) => {
  if (url.toString().includes("/api/google/sheets")) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          spreadsheets: [
            { id: "spreadsheet1", name: "Dental Practice Data" },
            { id: "spreadsheet2", name: "Patient Metrics" },
          ],
        }),
    });
  }
  return Promise.resolve({
    ok: false,
    json: () => Promise.resolve({ error: "Not found" }),
  });
});

describe("SpreadsheetSelector Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render spreadsheet selector with loading state", () => {
    render(<SpreadsheetSelector onSelect={vi.fn()} />);

    expect(screen.getByText("Loading spreadsheets...")).toBeInTheDocument();
  });

  it("should display spreadsheets after loading", async () => {
    render(<SpreadsheetSelector onSelect={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("Dental Practice Data")).toBeInTheDocument();
      expect(screen.getByText("Patient Metrics")).toBeInTheDocument();
    });
  });

  it("should call onSelect when a spreadsheet is clicked", async () => {
    const mockOnSelect = vi.fn();
    render(<SpreadsheetSelector onSelect={mockOnSelect} />);

    await waitFor(() => {
      expect(screen.getByText("Dental Practice Data")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Dental Practice Data"));

    expect(mockOnSelect).toHaveBeenCalledWith({
      id: "spreadsheet1",
      name: "Dental Practice Data",
    });
  });

  it("should display error message if fetching fails", async () => {
    // Override the mock for this specific test
    vi.mocked(global.fetch).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: "Authentication failed" }),
      })
    );

    render(<SpreadsheetSelector onSelect={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("Error loading spreadsheets")).toBeInTheDocument();
    });
  });
});
