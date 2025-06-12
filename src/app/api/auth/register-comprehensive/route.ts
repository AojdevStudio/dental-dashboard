import {
  type RegistrationData,
  RegistrationService,
} from '@/lib/services/auth/registration-service';
import { createClient } from '@/lib/supabase/server';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data: RegistrationData = await request.json();
    const supabase = await createClient();

    // Create registration service instance
    const registrationService = new RegistrationService(supabase);

    // Execute registration
    const result = await registrationService.register(data);

    return NextResponse.json({
      success: true,
      message: result.isNewClinic
        ? 'Registration successful! Check your email to verify your account. You can now invite team members to your clinic.'
        : 'Registration successful! Check your email to verify your account.',
      userId: result.user.id,
      clinicId: result.clinicId,
    });
  } catch (error) {
    // Note: In production, you'd want to handle cleanup of partial registrations
    // This could be done via a scheduled job or admin API
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Registration failed',
        details:
          process.env.NODE_ENV === 'development' && error instanceof Error
            ? error.stack
            : undefined,
      },
      { status: 400 }
    );
  }
}
