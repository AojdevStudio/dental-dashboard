import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "../auth/route";

// Mock the services
vi.mock("../../../../services/google/auth", () => ({
  generateAuthUrl: vi.fn().mockReturnValue("https://mock-google-auth-url.com"),
  handleAuthCallback: vi.fn().mockResolvedValue({
    accessToken: "mock-access-token",
    refreshToken: "mock-refresh-token",
    expiryDate: 1234567890,
  }),
  refreshAccessToken: vi.fn().mockResolvedValue({
    accessToken: "mock-refreshed-token",
    expiryDate: 1234567890,
  }),
}));

// Mock database operations
vi.mock("../../../../lib/db", () => ({
  prisma: {
    dataSource: {
      create: vi.fn().mockResolvedValue({ id: "mock-data-source-id" }),
      update: vi.fn().mockResolvedValue({ id: "mock-data-source-id" }),
    },
  },
}));

describe("Google Auth API Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should handle GET request to generate auth URL", async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ authUrl: "https://mock-google-auth-url.com" });
  });

  it("should handle POST request for callback with code", async () => {
    const mockRequest = new NextRequest("http://localhost:3000/api/google/auth", {
      method: "POST",
      body: JSON.stringify({ code: "mock-auth-code" }),
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      success: true,
      message: "Authentication successful",
    });
  });
});
