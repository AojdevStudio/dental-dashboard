import { getAuthContext, updateSelectedClinic } from '@/lib/database/auth-context';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const authContext = await getAuthContext();

    if (!authContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { clinicId } = body;

    if (!clinicId) {
      return NextResponse.json({ error: 'Clinic ID is required' }, { status: 400 });
    }

    // Validate access to the clinic
    if (!(authContext.isSystemAdmin || authContext.clinicIds.includes(clinicId))) {
      return NextResponse.json({ error: 'Access denied to this clinic' }, { status: 403 });
    }

    // Update the selected clinic
    await updateSelectedClinic(clinicId);

    return NextResponse.json({ success: true, clinicId }, { status: 200 });
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to switch clinic' }, { status: 500 });
  }
}
