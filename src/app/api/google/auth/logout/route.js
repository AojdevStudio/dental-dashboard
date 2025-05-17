import { NextResponse } from 'next/server';
import { revokeToken } from '@/services/google/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Handles disconnecting a Google Sheets data source
 * Revokes token and updates database records
 */
export async function POST(request) {
  try {
    // Parse request body
    const { dataSourceId } = await request.json();
    
    if (!dataSourceId) {
      return NextResponse.json({ error: 'Data source ID is required' }, { status: 400 });
    }
    
    // Get the data source with its tokens
    const dataSource = await prisma.dataSource.findUnique({
      where: { id: dataSourceId }
    });
    
    if (!dataSource) {
      return NextResponse.json({ error: 'Data source not found' }, { status: 404 });
    }
    
    // Revoke the access token
    await revokeToken(dataSource.accessToken);
    
    // Update the data source status in the database
    await prisma.dataSource.update({
      where: { id: dataSourceId },
      data: {
        connectionStatus: 'disconnected',
        accessToken: '',
        refreshToken: null,
        expiryDate: null
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in Google auth logout:', error);
    return NextResponse.json({ error: 'Failed to disconnect Google account' }, { status: 500 });
  }
}
