// src/services/google/__tests__/auth.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateAuthUrl, handleAuthCallback, refreshAccessToken } from '../auth';

// Mock Google OAuth client
vi.mock('google-auth-library', () => {
  return {
    OAuth2Client: vi.fn().mockImplementation(() => {
      return {
        generateAuthUrl: vi.fn().mockReturnValue('https://mock-google-auth-url.com'),
        getToken: vi.fn().mockResolvedValue({
          tokens: {
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token',
            expiry_date: Date.now() + 3600000 // 1 hour from now
          }
        }),
        setCredentials: vi.fn(),
        refreshAccessToken: vi.fn().mockResolvedValue({
          credentials: {
            access_token: 'mock-refreshed-token',
            expiry_date: Date.now() + 3600000
          }
        })
      };
    })
  };
});

describe('Google Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate an authentication URL', () => {
    const authUrl = generateAuthUrl();
    
    expect(authUrl).toBe('https://mock-google-auth-url.com');
    // Verify the OAuth client was initialized with proper scopes
    expect(vi.mocked(require('google-auth-library').OAuth2Client)).toHaveBeenCalled();
  });

  it('should handle auth callback and return tokens', async () => {
    const result = await handleAuthCallback('mock-code');
    
    expect(result).toEqual({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      expiryDate: expect.any(Number)
    });
  });

  it('should refresh an expired access token', async () => {
    const result = await refreshAccessToken('mock-refresh-token');
    
    expect(result).toEqual({
      accessToken: 'mock-refreshed-token',
      expiryDate: expect.any(Number)
    });
  });
});

// src/services/google/__tests__/sheets.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listSpreadsheets, getSpreadsheetData } from '../sheets';

// Mock the Google Sheets API client
vi.mock('googleapis', () => {
  return {
    google: {
      sheets: vi.fn().mockReturnValue({
        spreadsheets: {
          get: vi.fn().mockResolvedValue({
            data: {
              properties: { title: 'Mock Spreadsheet' },
              sheets: [
                { properties: { title: 'Sheet1', sheetId: 0 } },
                { properties: { title: 'Sheet2', sheetId: 1 } }
              ]
            }
          }),
          values: {
            get: vi.fn().mockResolvedValue({
              data: {
                values: [
                  ['Header1', 'Header2', 'Header3'],
                  ['Value1', 'Value2', 'Value3'],
                  ['Value4', 'Value5', 'Value6']
                ]
              }
            })
          }
        }
      }),
      drive: vi.fn().mockReturnValue({
        files: {
          list: vi.fn().mockResolvedValue({
            data: {
              files: [
                { id: 'spreadsheet1', name: 'Dental Practice Data', mimeType: 'application/vnd.google-apps.spreadsheet' },
                { id: 'spreadsheet2', name: 'Patient Metrics', mimeType: 'application/vnd.google-apps.spreadsheet' }
              ]
            }
          })
        }
      })
    }
  };
});

describe('Google Sheets Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should list available spreadsheets', async () => {
    const accessToken = 'mock-access-token';
    const spreadsheets = await listSpreadsheets(accessToken);
    
    expect(spreadsheets).toHaveLength(2);
    expect(spreadsheets[0]).toEqual({
      id: 'spreadsheet1',
      name: 'Dental Practice Data'
    });
    expect(spreadsheets[1]).toEqual({
      id: 'spreadsheet2',
      name: 'Patient Metrics'
    });
  });

  it('should get spreadsheet data including sheets and content', async () => {
    const accessToken = 'mock-access-token';
    const spreadsheetId = 'spreadsheet1';
    const result = await getSpreadsheetData(accessToken, spreadsheetId, 'Sheet1');
    
    expect(result).toEqual({
      title: 'Mock Spreadsheet',
      sheets: [
        { title: 'Sheet1', id: 0 },
        { title: 'Sheet2', id: 1 }
      ],
      data: {
        headers: ['Header1', 'Header2', 'Header3'],
        rows: [
          ['Value1', 'Value2', 'Value3'],
          ['Value4', 'Value5', 'Value6']
        ]
      }
    });
  });
});

// src/app/api/google/__tests__/auth.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '../auth/route';

// Mock the services
vi.mock('../../../../services/google/auth', () => ({
  generateAuthUrl: vi.fn().mockReturnValue('https://mock-google-auth-url.com'),
  handleAuthCallback: vi.fn().mockResolvedValue({
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    expiryDate: 1234567890
  }),
  refreshAccessToken: vi.fn().mockResolvedValue({
    accessToken: 'mock-refreshed-token',
    expiryDate: 1234567890
  })
}));

// Mock database operations
vi.mock('../../../../lib/db', () => ({
  prisma: {
    dataSource: {
      create: vi.fn().mockResolvedValue({ id: 'mock-data-source-id' }),
      update: vi.fn().mockResolvedValue({ id: 'mock-data-source-id' })
    }
  }
}));

describe('Google Auth API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle GET request to generate auth URL', async () => {
    const response = await GET();
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toEqual({ authUrl: 'https://mock-google-auth-url.com' });
  });

  it('should handle POST request for callback with code', async () => {
    const mockRequest = new NextRequest('http://localhost:3000/api/google/auth', {
      method: 'POST',
      body: JSON.stringify({ code: 'mock-auth-code' })
    });

    const response = await POST(mockRequest);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toEqual({
      success: true,
      message: 'Authentication successful'
    });
  });
});

// src/app/api/google/__tests__/sheets.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '../sheets/route';

// Mock the Google Sheets service
vi.mock('../../../../services/google/sheets', () => ({
  listSpreadsheets: vi.fn().mockResolvedValue([
    { id: 'spreadsheet1', name: 'Dental Practice Data' },
    { id: 'spreadsheet2', name: 'Patient Metrics' }
  ]),
  getSpreadsheetData: vi.fn().mockResolvedValue({
    title: 'Mock Spreadsheet',
    sheets: [
      { title: 'Sheet1', id: 0 },
      { title: 'Sheet2', id: 1 }
    ],
    data: {
      headers: ['Header1', 'Header2', 'Header3'],
      rows: [
        ['Value1', 'Value2', 'Value3'],
        ['Value4', 'Value5', 'Value6']
      ]
    }
  })
}));

// Mock token retrieval
vi.mock('../../../../lib/db', () => ({
  prisma: {
    dataSource: {
      findFirst: vi.fn().mockResolvedValue({
        id: 'mock-data-source-id',
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiryDate: new Date(Date.now() + 3600000)
      })
    }
  }
}));

describe('Google Sheets API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle GET request to list spreadsheets', async () => {
    const mockRequest = new NextRequest('http://localhost:3000/api/google/sheets');
    
    const response = await GET(mockRequest);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toEqual({
      spreadsheets: [
        { id: 'spreadsheet1', name: 'Dental Practice Data' },
        { id: 'spreadsheet2', name: 'Patient Metrics' }
      ]
    });
  });

  it('should handle GET request to get spreadsheet data', async () => {
    const url = new URL('http://localhost:3000/api/google/sheets');
    url.searchParams.append('spreadsheetId', 'spreadsheet1');
    url.searchParams.append('sheetName', 'Sheet1');
    const mockRequest = new NextRequest(url);
    
    const response = await GET(mockRequest);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toEqual({
      title: 'Mock Spreadsheet',
      sheets: [
        { title: 'Sheet1', id: 0 },
        { title: 'Sheet2', id: 1 }
      ],
      data: {
        headers: ['Header1', 'Header2', 'Header3'],
        rows: [
          ['Value1', 'Value2', 'Value3'],
          ['Value4', 'Value5', 'Value6']
        ]
      }
    });
  });
});

// src/components/google/__tests__/SpreadsheetSelector.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SpreadsheetSelector from '../SpreadsheetSelector';

// Mock the API fetch calls
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn()
  }))
}));

global.fetch = vi.fn();

// Mock fetch implementation
vi.mocked(global.fetch).mockImplementation((url) => {
  if (url.toString().includes('/api/google/sheets')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        spreadsheets: [
          { id: 'spreadsheet1', name: 'Dental Practice Data' },
          { id: 'spreadsheet2', name: 'Patient Metrics' }
        ]
      })
    });
  }
  return Promise.resolve({
    ok: false,
    json: () => Promise.resolve({ error: 'Not found' })
  });
});

describe('SpreadsheetSelector Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render spreadsheet selector with loading state', () => {
    render(<SpreadsheetSelector onSelect={vi.fn()} />);
    
    expect(screen.getByText('Loading spreadsheets...')).toBeInTheDocument();
  });

  it('should display spreadsheets after loading', async () => {
    render(<SpreadsheetSelector onSelect={vi.fn()} />);
    
    await waitFor(() => {
      expect(screen.getByText('Dental Practice Data')).toBeInTheDocument();
      expect(screen.getByText('Patient Metrics')).toBeInTheDocument();
    });
  });

  it('should call onSelect when a spreadsheet is clicked', async () => {
    const mockOnSelect = vi.fn();
    render(<SpreadsheetSelector onSelect={mockOnSelect} />);
    
    await waitFor(() => {
      expect(screen.getByText('Dental Practice Data')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Dental Practice Data'));
    
    expect(mockOnSelect).toHaveBeenCalledWith({
      id: 'spreadsheet1',
      name: 'Dental Practice Data'
    });
  });

  it('should display error message if fetching fails', async () => {
    // Override the mock for this specific test
    vi.mocked(global.fetch).mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'Authentication failed' })
      })
    );
    
    render(<SpreadsheetSelector onSelect={vi.fn()} />);
    
    await waitFor(() => {
      expect(screen.getByText('Error loading spreadsheets')).toBeInTheDocument();
    });
  });
});