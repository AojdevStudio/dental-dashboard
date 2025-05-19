import { describe, it, expect, vi, beforeEach } from "vitest";
import { listSpreadsheets, getSpreadsheetData } from "../sheets";

// Mock the Google Sheets API client
vi.mock("googleapis", () => {
  return {
    google: {
      sheets: vi.fn().mockReturnValue({
        spreadsheets: {
          get: vi.fn().mockResolvedValue({
            data: {
              properties: { title: "Mock Spreadsheet" },
              sheets: [
                { properties: { title: "Sheet1", sheetId: 0 } },
                { properties: { title: "Sheet2", sheetId: 1 } },
              ],
            },
          }),
          values: {
            get: vi.fn().mockResolvedValue({
              data: {
                values: [
                  ["Header1", "Header2", "Header3"],
                  ["Value1", "Value2", "Value3"],
                  ["Value4", "Value5", "Value6"],
                ],
              },
            }),
          },
        },
      }),
      drive: vi.fn().mockReturnValue({
        files: {
          list: vi.fn().mockResolvedValue({
            data: {
              files: [
                {
                  id: "spreadsheet1",
                  name: "Dental Practice Data",
                  mimeType: "application/vnd.google-apps.spreadsheet",
                },
                {
                  id: "spreadsheet2",
                  name: "Patient Metrics",
                  mimeType: "application/vnd.google-apps.spreadsheet",
                },
              ],
            },
          }),
        },
      }),
    },
  };
});

describe("Google Sheets Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should list available spreadsheets", async () => {
    const accessToken = "mock-access-token";
    const spreadsheets = await listSpreadsheets(accessToken);

    expect(spreadsheets).toHaveLength(2);
    expect(spreadsheets[0]).toEqual({
      id: "spreadsheet1",
      name: "Dental Practice Data",
    });
    expect(spreadsheets[1]).toEqual({
      id: "spreadsheet2",
      name: "Patient Metrics",
    });
  });

  it("should get spreadsheet data including sheets and content", async () => {
    const accessToken = "mock-access-token";
    const spreadsheetId = "spreadsheet1";
    const result = await getSpreadsheetData(accessToken, spreadsheetId, "Sheet1");

    expect(result).toEqual({
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
