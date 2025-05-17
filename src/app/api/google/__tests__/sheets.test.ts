import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "../sheets/route";

// Mock the Google Sheets service
vi.mock("../../../../services/google/sheets", () => ({
  listSpreadsheets: vi.fn().mockResolvedValue([
    { id: "spreadsheet1", name: "Dental Practice Data" },
    { id: "spreadsheet2", name: "Patient Metrics" },
  ]),
  getSpreadsheetData: vi.fn().mockResolvedValue({
    title: "Mock Spreadsheet",
    sheets: [
      { title: "Sheet1", id: 0 },
      { title: "Sheet2", id: 1 },
    ],
    data: {
      headers: ["Header1", "Header2", "Header3"],
      rows: [
        ["Value1", "Value2", "Value3"],
        ["Value4", "Value5", "Value6"],
      ],
    },
  }),
}));

// Mock token retrieval
vi.mock("../../../../lib/db", () => ({
  prisma: {
    dataSource: {
      findFirst: vi.fn().mockResolvedValue({
        id: "mock-data-source-id",
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token",
        expiryDate: new Date(Date.now() + 3600000),
      }),
    },
  },
}));

describe("Google Sheets API Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should handle GET request to list spreadsheets", async () => {
    const mockRequest = new NextRequest("http://localhost:3000/api/google/sheets");

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      spreadsheets: [
        { id: "spreadsheet1", name: "Dental Practice Data" },
        { id: "spreadsheet2", name: "Patient Metrics" },
      ],
    });
  });

  it("should handle GET request to get spreadsheet data", async () => {
    const url = new URL("http://localhost:3000/api/google/sheets");
    url.searchParams.append("spreadsheetId", "spreadsheet1");
    url.searchParams.append("sheetName", "Sheet1");
    const mockRequest = new NextRequest(url);

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      title: "Mock Spreadsheet",
      sheets: [
        { title: "Sheet1", id: 0 },
        { title: "Sheet2", id: 1 },
      ],
      data: {
        headers: ["Header1", "Header2", "Header3"],
        rows: [
          ["Value1", "Value2", "Value3"],
          ["Value4", "Value5", "Value6"],
        ],
      },
    });
  });
});
