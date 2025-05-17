import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { exchangeCodeForTokens, getUserProfile } from '@/services/google/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Handles the callback from Google OAuth
 * Exchanges authorization code for tokens and stores them in the database
 */
export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    
    // Check for errors returned from Google
    if (error) {
      console.error('Google authorization error:', error);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/auth/error?error=${error}`);
    }
    
    // Verify state to prevent CSRF attacks
    const storedState = cookies().get('googleAuthState')?.value;
    if (!storedState || state !== storedState) {
      console.error('State verification failed');
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/auth/error?error=invalid_state`);
    }
    
    // Clear the state cookie
    cookies().delete('googleAuthState');
    
    // No code provided
    if (!code) {
      console.error('No authorization code received');
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/auth/error?error=no_code`);
    }
    
    // Exchange the authorization code for tokens
    const tokenResponse = await exchangeCodeForTokens(code);
    
    // Get the user's profile information
    const userProfile = await getUserProfile(tokenResponse.access_token);

    // Check if a dataSource with this email already exists
    // Typically you'd check for the user's email, but here we're just storing
    // the token without specific user association for demonstration
    const clinicId = searchParams.get('clinic_id');
    
    if (!clinicId) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/auth/error?error=missing_clinic_id`);
    }
    
    // Store tokens in the database
    // We're creating a new DataSource record, but in a real app you might update
    // an existing record or associate it with a user
    await prisma.dataSource.create({
      data: {
        name: `Google Sheets - ${userProfile.email}`,
        spreadsheetId: '', // Will be filled in later when user selects a spreadsheet
        sheetName: '', // Will be filled in later when user selects a sheet
        syncFrequency: 'daily',
        connectionStatus: 'connected',
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        expiryDate: tokenResponse.expires_in 
          ? new Date(Date.now() + tokenResponse.expires_in * 1000)
          : null,
        clinicId: clinicId
      },
    });
    
    // Redirect to success page
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/datasources/setup`);
  } catch (error) {
    console.error('Error in Google auth callback:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/auth/error?error=server_error`);
  }
}
