'''
# Google Services Integration Setup

This document outlines the steps required to set up and configure Google services (OAuth, Google Drive API, and Google Sheets API) for this application.

## 1. Prerequisites

- A Google Cloud Platform (GCP) account.
- Node.js and pnpm installed.
- The application codebase cloned to your local machine.

## 2. Google Cloud Console Configuration

### 2.1. Create or Select a Project

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new project or select an existing one.

### 2.2. Enable APIs

You need to enable the following APIs for your project:

1.  **Google Drive API**: Allows listing and accessing spreadsheets.
2.  **Google Sheets API**: Allows reading and writing data to spreadsheets.

To enable them:
1.  In the GCP Console, navigate to "APIs & Services" > "Library".
2.  Search for "Google Drive API" and click "Enable".
3.  Search for "Google Sheets API" and click "Enable".

### 2.3. Configure OAuth Consent Screen

1.  Navigate to "APIs & Services" > "OAuth consent screen".
2.  Choose "External" if your app will be used by general Google users, or "Internal" if it's for users within your Google Workspace organization.
3.  Fill in the required application details:
    *   App name
    *   User support email
    *   Developer contact information
4.  Add Scopes:
    *   Click "Add or Remove Scopes".
    *   Add the following scopes:
        *   `https://www.googleapis.com/auth/drive.readonly` (To view files on Google Drive)
        *   `https://www.googleapis.com/auth/spreadsheets` (To see, edit, create, and delete all your Google Sheets spreadsheets)
        *   `openid`
        *   `https://www.googleapis.com/auth/userinfo.email`
        *   `https://www.googleapis.com/auth/userinfo.profile`
    *   Click "Update".
5.  Add Test Users (if in testing mode and "External" user type):
    *   Add the Google accounts that will be used for testing during development.
6.  Review and save the consent screen configuration.

### 2.4. Create OAuth 2.0 Credentials

1.  Navigate to "APIs & Services" > "Credentials".
2.  Click "+ CREATE CREDENTIALS" and select "OAuth client ID".
3.  Select "Web application" as the application type.
4.  Give it a name (e.g., "Dental Dashboard Web Client").
5.  Add Authorized JavaScript origins:
    *   `http://localhost:3000` (for local development)
    *   Your production application URL (e.g., `https://your-app-domain.com`)
6.  Add Authorized redirect URIs:
    *   `http://localhost:3000/api/google/auth` (for local development, assuming this is your callback endpoint)
    *   `https://your-app-domain.com/api/google/auth` (for production)
7.  Click "CREATE".
8.  A dialog will appear showing your **Client ID** and **Client Secret**. Copy these values securely.

## 3. Environment Variables Setup

Create or update your `.env` file in the root of the project with the credentials obtained from the Google Cloud Console:

```env
GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID"
GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"
# This should match one of the Authorized redirect URIs configured in GCP
GOOGLE_REDIRECT_URI="http://localhost:3000/api/google/auth"

# Optional: For Supabase integration if you are also using Supabase Auth
# NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_URL"
# SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"
```

Replace `"YOUR_GOOGLE_CLIENT_ID"` and `"YOUR_GOOGLE_CLIENT_SECRET"` with the actual values.

## 4. Database Setup (Prisma)

The application uses Prisma to store Google OAuth tokens (access token, refresh token, expiry date) associated with a user or clinic. This is typically stored in a `DataSource` table or a similar entity.

1.  **Review Prisma Schema**: Check the `prisma/schema.prisma` file for a model that stores these tokens (e.g., `DataSource`). It should include fields like:
    *   `accessToken String`
    *   `refreshToken String?`
    *   `expiryDate DateTime?`
    *   Relations to `User` or `Clinic` models.

2.  **Run Migrations**:
    If the schema has been updated or if this is a new setup, run Prisma migrations to update your database:
    ```bash
    pnpm prisma migrate dev
    ```

## 5. Install Dependencies

If you haven't already, install the necessary project dependencies, including testing libraries:

```bash
pnpm install
```

To ensure tests can run, you might need to specifically install testing-related dev dependencies if they were not part of the initial `pnpm install` or if you encounter "Cannot find module" errors for `vitest`, `@testing-library/react`, etc.:

```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event happy-dom
```

## 6. Running Tests

Once the setup is complete and dependencies are installed, you can run the tests to verify the integration:

-   **Unit and Integration Tests**: The project includes tests for Google services, API routes, and components related to the Google integration. These are located in `__tests__` subdirectories (e.g., `src/services/google/__tests__`).

To run all tests:

```bash
pnpm test
```

To run tests in watch mode:

```bash
pnpm test:watch
```

Address any linter errors or failed tests. Common issues might include incorrect environment variable setup or missing dependencies.

## 7. Application Flow

1.  The user initiates the Google login/connection process from the application.
2.  The application redirects the user to the Google Authorization URL (`generateAuthUrl`).
3.  The user authenticates with Google and grants the requested permissions.
4.  Google redirects the user back to the `GOOGLE_REDIRECT_URI` (`/api/google/auth`) with an authorization code.
5.  The callback handler (`handleAuthCallback`) exchanges this code for an access token and a refresh token.
6.  These tokens are then stored securely, typically in the database associated with the user or clinic, using Prisma (e.g., in the `DataSource` table).
7.  The access token is used to make API calls to Google Drive and Google Sheets.
8.  If the access token expires, the refresh token is used to obtain a new access token (`refreshAccessToken`).

By following these steps, you should have a functional Google services integration for your dental dashboard application.
''' 