import { prisma } from '@/lib/database/prisma';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Get the current user session
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: 'User not authenticated',
          authError: authError?.message,
        },
        { status: 401 }
      );
    }

    // Get user's clinic from database
    const dbUser = await prisma.user.findUnique({
      where: { authId: user.id },
      select: { clinicId: true, id: true },
    });

    if (!dbUser) {
      return NextResponse.json(
        {
          error: 'User not found in database',
          authId: user.id,
        },
        { status: 404 }
      );
    }

    // Create test data source
    const dataSource = await prisma.dataSource.create({
      data: {
        name: 'Test Google Sheets Connection',
        spreadsheetId: `test-${Date.now()}`,
        sheetName: 'Sheet1',
        syncFrequency: 'manual',
        connectionStatus: 'pending',
        accessToken: 'pending',
        clinicId: dbUser.clinicId,
      },
    });

    return NextResponse.json({
      success: true,
      dataSource: {
        id: dataSource.id,
        name: dataSource.name,
        spreadsheetId: dataSource.spreadsheetId,
        connectionStatus: dataSource.connectionStatus,
        clinicId: dataSource.clinicId,
      },
    });
  } catch (error) {
    console.error('Failed to create data source:', error);
    return NextResponse.json(
      {
        error: 'Failed to create data source',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
