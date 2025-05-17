import { refreshAccessToken } from './auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Middleware to verify Google authentication status and refresh tokens if needed
 * @param {string} dataSourceId - ID of the data source to check authentication for
 * @returns {Promise<{accessToken: string, isValid: boolean, error?: string}>} Authentication result
 */
export async function verifyGoogleAuth(dataSourceId) {
  try {
    // Get the data source with its tokens
    const dataSource = await prisma.dataSource.findUnique({
      where: { id: dataSourceId }
    });
    
    if (!dataSource) {
      return { isValid: false, error: 'Data source not found' };
    }
    
    // Check if access token exists
    if (!dataSource.accessToken) {
      return { isValid: false, error: 'Not authenticated with Google' };
    }
    
    // Check if token is expired and needs refresh
    const isExpired = dataSource.expiryDate && new Date() > new Date(dataSource.expiryDate);
    
    // If the token is expired and we have a refresh token, try to refresh it
    if (isExpired && dataSource.refreshToken) {
      try {
        const tokenResponse = await refreshAccessToken(dataSource.refreshToken);
        
        // Update the tokens in the database
        await prisma.dataSource.update({
          where: { id: dataSourceId },
          data: {
            accessToken: tokenResponse.access_token,
            expiryDate: tokenResponse.expires_in 
              ? new Date(Date.now() + tokenResponse.expires_in * 1000)
              : null,
            // Note: refresh tokens don't usually change on refresh, but update if provided
            refreshToken: tokenResponse.refresh_token || dataSource.refreshToken,
          }
        });
        
        // Return the new access token
        return { 
          isValid: true, 
          accessToken: tokenResponse.access_token 
        };
      } catch (refreshError) {
        console.error('Failed to refresh access token:', refreshError);
        return { 
          isValid: false, 
          error: 'Failed to refresh access token' 
        };
      }
    } 
    // If not expired, return the current access token
    else if (!isExpired) {
      return { 
        isValid: true, 
        accessToken: dataSource.accessToken 
      };
    }
    // Token is expired and no refresh token available
    else {
      return { 
        isValid: false, 
        error: 'Authentication expired and cannot be refreshed' 
      };
    }
  } catch (error) {
    console.error('Error verifying Google authentication:', error);
    return { 
      isValid: false, 
      error: 'Failed to verify authentication' 
    };
  }
}
