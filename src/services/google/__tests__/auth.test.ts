import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateAuthUrl, handleAuthCallback, refreshAccessToken } from "../auth";

// Mock Google OAuth client
vi.mock("google-auth-library", () => {
  return {
    OAuth2Client: vi.fn().mockImplementation(() => {
      return {
        generateAuthUrl: vi.fn().mockReturnValue("https://mock-google-auth-url.com"),
        getToken: vi.fn().mockResolvedValue({
          tokens: {
            access_token: "mock-access-token",
            refresh_token: "mock-refresh-token",
            expiry_date: Date.now() + 3600000, // 1 hour from now
          },
        }),
        setCredentials: vi.fn(),
        refreshAccessToken: vi.fn().mockResolvedValue({
          credentials: {
            access_token: "mock-refreshed-token",
            expiry_date: Date.now() + 3600000,
          },
        }),
      };
    }),
  };
});

describe("Google Auth Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should generate an authentication URL", () => {
    const authUrl = generateAuthUrl();

    expect(authUrl).toBe("https://mock-google-auth-url.com");
    // Verify the OAuth client was initialized with proper scopes
    expect(vi.mocked(require("google-auth-library").OAuth2Client)).toHaveBeenCalled();
  });

  it("should handle auth callback and return tokens", async () => {
    const result = await handleAuthCallback("mock-code");

    expect(result).toEqual({
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      expiryDate: expect.any(Number),
    });
  });

  it("should refresh an expired access token", async () => {
    const result = await refreshAccessToken("mock-refresh-token");

    expect(result).toEqual({
      accessToken: "mock-refreshed-token",
      expiryDate: expect.any(Number),
    });
  });
});
