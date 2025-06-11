/**
 * Google Authentication Login API Route
 *
 * This API route initiates the Google OAuth 2.0 authentication flow by redirecting
 * the user to Google's authorization page. It generates the authorization URL with
 * the necessary scopes for accessing Google Drive and Sheets APIs, and includes
 * the data source ID as state parameter for the callback.
 *
 * The route requires a dataSourceId query parameter to associate the authentication
 * with a specific data source in the application.
 */

import { withAuth } from '@/lib/api/middleware';
import { type ApiResponse, apiError } from '@/lib/api/utils';
import * as googleSheetsQueries from '@/lib/database/queries/google-sheets';
import { generateAuthUrl } from '@/services/google/auth';
import { NextResponse } from 'next/server';

/**
 * Handles GET requests to initiate Google OAuth authentication.
 * Generates an authorization URL and redirects the user to Google's consent page.
 *
 * The function performs the following steps:
 * 1. Validates the dataSourceId parameter is present
 * 2. Verifies user has access to the data source
 * 3. Checks for required environment configuration
 * 4. Generates the authorization URL with state parameter
 * 5. Redirects the user to Google's authorization page
 *
 * @param {NextRequest} request - The incoming request object
 *   - request.searchParams.dataSourceId: ID of the data source to associate with the auth
 * @returns {Promise<NextResponse>} Redirect to Google's authorization page or error response
 *   - 302: Redirect to Google authorization URL
 *   - 400: Bad request if dataSourceId is missing
 *   - 404: Not found if data source doesn't exist
 *   - 403: Forbidden if user doesn't have access
 *   - 500: Server error if environment is misconfigured or URL generation fails
 */
export const GET = withAuth<null>(
  async (
    request: Request,
    { authContext }
  ): Promise<NextResponse<ApiResponse<null> | ApiResponse<never>>> => {
    const { searchParams } = new URL(request.url);
    const dataSourceId = searchParams.get('dataSourceId');

    if (!dataSourceId) {
      return apiError('dataSourceId is required', 400);
    }

    // Verify the data source exists and user has access
    const dataSource = await googleSheetsQueries.getDataSourceById(authContext, dataSourceId);

    if (!dataSource) {
      return apiError('Data source not found', 404);
    }

    const googleRedirectUri = process.env.GOOGLE_REDIRECT_URI;
    if (!googleRedirectUri) {
      return apiError('Server configuration error', 500);
    }

    try {
      // Generate auth URL with dataSourceId in state
      const authorizationUrl = generateAuthUrl(dataSourceId);
      return NextResponse.json<ApiResponse<null>>(
        { success: true, data: null },
        { status: 302, headers: { Location: authorizationUrl } }
      );
    } catch (_error) {
      return apiError('Failed to initiate Google authentication', 500);
    }
  },
  {
    requireClinicAdmin: true, // Only clinic admins can manage Google auth
  }
);
