import { NextResponse } from 'next/server';
import { getAuthorizationUrl } from '@/services/google/auth';
import { nanoid } from 'nanoid';
import { cookies } from 'next/headers';

/**
 * Initiates the Google OAuth login flow specifically for Google Sheets access
 * Generates an authorization URL and redirects the user
 */
export async function GET(request) {
  try {
    // Generate a unique state parameter to prevent CSRF attacks
    const state = nanoid();
    
    // Store state in a cookie for verification during callback
    cookies().set('googleAuthState', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 10, // 10 minutes
      path: '/',
      sameSite: 'lax'
    });

    // Request specific scopes needed for Google Sheets
    const scopes = [
      'profile', 
      'email',
      'https://www.googleapis.com/auth/spreadsheets.readonly', // Read-only access to Google Sheets
      // Add 'https://www.googleapis.com/auth/spreadsheets' for read-write access
    ];

    // Get the authorization URL with offline access (to get refresh token)
    const authUrl = getAuthorizationUrl(scopes, state, 'offline');
    
    // Redirect to Google's OAuth consent screen
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Google login initiation error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Google login' },
      { status: 500 }
    );
  }
}
