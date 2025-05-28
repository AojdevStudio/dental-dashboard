/**
 * Auth Context Utilities
 * Provides user and clinic context for database queries
 */

import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { prisma } from './client'

export interface AuthContext {
  userId: string
  authId: string
  clinicIds: string[]
  currentClinicId?: string
  role?: string
}

/**
 * Get the current auth context from Supabase session
 */
export async function getAuthContext(): Promise<AuthContext | null> {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    // Get user details and clinic access
    const dbUser = await prisma.user.findUnique({
      where: { authId: user.id },
      include: {
        clinic: true,
      },
    })

    if (!dbUser) {
      return null
    }

    // Get all clinic access for the user
    const clinicAccess = await prisma.userClinicRole.findMany({
      where: {
        userId: dbUser.id,
        isActive: true,
      },
      select: {
        clinicId: true,
        role: true,
      },
    })

    return {
      userId: dbUser.id,
      authId: user.id,
      clinicIds: clinicAccess.map(ca => ca.clinicId),
      currentClinicId: dbUser.clinicId, // Primary clinic
      role: dbUser.role,
    }
  } catch (error) {
    console.error('Error getting auth context:', error)
    return null
  }
}

/**
 * Validate user has access to a specific clinic
 */
export async function validateClinicAccess(
  authContext: AuthContext,
  clinicId: string
): Promise<boolean> {
  return authContext.clinicIds.includes(clinicId)
}

/**
 * Get user's role in a specific clinic
 */
export async function getUserClinicRole(
  authContext: AuthContext,
  clinicId: string
): Promise<string | null> {
  const role = await prisma.userClinicRole.findUnique({
    where: {
      userId_clinicId: {
        userId: authContext.userId,
        clinicId: clinicId,
      },
    },
    select: {
      role: true,
    },
  })

  return role?.role || null
}

/**
 * Check if user is a clinic admin
 */
export async function isClinicAdmin(
  authContext: AuthContext,
  clinicId: string
): Promise<boolean> {
  const role = await getUserClinicRole(authContext, clinicId)
  return role === 'clinic_admin'
}

/**
 * Get auth context for a specific user by auth ID
 * Used for scenarios where we have the user ID but not the full session
 */
export async function getAuthContextByAuthId(authId: string): Promise<AuthContext | null> {
  try {
    // Get user details and clinic access
    const dbUser = await prisma.user.findUnique({
      where: { authId },
      include: {
        clinic: true,
      },
    })

    if (!dbUser) {
      return null
    }

    // Get all clinic access for the user
    const clinicAccess = await prisma.userClinicRole.findMany({
      where: {
        userId: dbUser.id,
        isActive: true,
      },
      select: {
        clinicId: true,
        role: true,
      },
    })

    return {
      userId: dbUser.id,
      authId,
      clinicIds: clinicAccess.map(ca => ca.clinicId),
      currentClinicId: dbUser.clinicId, // Primary clinic
      role: dbUser.role,
    }
  } catch (error) {
    console.error('Error getting auth context by ID:', error)
    return null
  }
}

/**
 * Service account context for system operations
 */
export function getServiceContext(): AuthContext {
  return {
    userId: 'system',
    authId: 'system',
    clinicIds: ['*'], // Access to all clinics
    role: 'system',
  }
}