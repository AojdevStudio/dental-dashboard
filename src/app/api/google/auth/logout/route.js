/**
 * Google Authentication Logout API Route
 * 
 * This API route handles disconnecting a Google Sheets data source from the application.
 * It revokes the access token with Google's authentication server and updates the
 * data source record in the database to reflect the disconnected state. This endpoint
 * is typically called when a user wants to remove Google Sheets integration from their account.
 */

import { NextResponse } from "next/server";
import { revokeToken } from "@/services/google/auth";
import { PrismaClient } from "@prisma/client";

/**
 * Prisma client instance for database operations
 * @type {PrismaClient}
 */
const prisma = new PrismaClient();

/**
 * Handles POST requests to disconnect a Google Sheets data source.
 * Revokes the access token with Google and updates the database record.
 * 
 * The function performs the following steps:
 * 1. Validates the dataSourceId from the request body
 * 2. Retrieves the data source record from the database
 * 3. Revokes the access token with Google's authentication server
 * 4. Updates the data source record to reflect the disconnected state
 *
 * @param {Request} request - The incoming request object
 *   - request.body.dataSourceId: ID of the data source to disconnect
 * @returns {Promise<NextResponse>} JSON response indicating success or failure
 *   - 200: Success with {success: true}
 *   - 400: Bad request if dataSourceId is missing
 *   - 404: Not found if the data source doesn't exist
 *   - 500: Server error if token revocation or database update fails
 * @throws {Error} If token revocation fails or database operations fail
 */
export async function POST(request) {
  try {
    // Parse request body
    const { dataSourceId } = await request.json();

    if (!dataSourceId) {
      return NextResponse.json({ error: "Data source ID is required" }, { status: 400 });
    }

    // Get the data source with its tokens
    const dataSource = await prisma.dataSource.findUnique({
      where: { id: dataSourceId },
    });

    if (!dataSource) {
      return NextResponse.json({ error: "Data source not found" }, { status: 404 });
    }

    // Revoke the access token
    await revokeToken(dataSource.accessToken);

    // Update the data source status in the database
    await prisma.dataSource.update({
      where: { id: dataSourceId },
      data: {
        connectionStatus: "disconnected",
        accessToken: "",
        refreshToken: null,
        expiryDate: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in Google auth logout:", error);
    return NextResponse.json({ error: "Failed to disconnect Google account" }, { status: 500 });
  }
}
