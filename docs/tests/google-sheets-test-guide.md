# Google Sheets Integration Test Guide

This guide explains how to test the Google Sheets OAuth integration flow.

## Prerequisites

1. **Google Cloud Console Setup**
   - Go to https://console.cloud.google.com/
   - Create a new project or select existing one
   - Enable Google Sheets API and Google Drive API
   - Create OAuth 2.0 credentials (Web application type)
   - Add authorized redirect URI: `http://localhost:3000/api/auth/google/callback`

2. **Environment Variables**
   Set these in your `.env` file:
   ```
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
   ```

## Testing Steps

1. **Navigate to Test Page**
   Go to: http://localhost:3000/integrations/google-sheets/test

2. **Step 1: Create Data Source**
   - Click "Create Data Source" button
   - This creates a test entry in the database to store Google credentials

3. **Step 2: Authenticate with Google**
   - Click "Connect to Google" button
   - You'll be redirected to Google's OAuth consent screen
   - Grant permissions to access Google Sheets
   - You'll be redirected back to the test page

4. **Step 3: List Spreadsheets**
   - Click "Fetch Spreadsheets" button
   - This lists all Google Sheets you have access to

5. **Step 4: Get Sheet Metadata**
   - Copy a spreadsheet ID from step 3
   - Paste it in the input field
   - Click "Fetch Metadata" to see sheet tabs

6. **Step 5: Fetch Sheet Data**
   - Use the same spreadsheet ID
   - Enter a range (e.g., "Sheet1!A1:B10")
   - Click "Fetch Data" to see the actual cell values

## Common Issues

1. **"Google OAuth error" on callback**
   - Check that redirect URI matches exactly in Google Console
   - Ensure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct

2. **"Failed to fetch spreadsheets"**
   - Token may have expired - try reconnecting
   - Check that Google Sheets API is enabled in Google Console

3. **"Data source not found"**
   - The data source might have been deleted
   - Create a new data source and try again

## Next Steps

Once all tests pass:
1. The OAuth flow is working correctly
2. Tokens are being stored and retrieved properly
3. Google Sheets API calls are functioning

You can then proceed to build the column mapping UI and data pipeline features.