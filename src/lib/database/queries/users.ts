/**
 * User Database Queries
 * Multi-tenant aware user operations
 */

import type { Prisma } from '@prisma/client';
import { type AuthContext, validateClinicAccess } from '../auth-context';
import { prisma } from '../client';

export interface CreateUserInput {
  email: string;
  name: string;
  role: string;
  clinicId: string;
  authId?: string;
}

export interface UpdateUserInput {
  name?: string;
  role?: string;
  lastLogin?: Date;
}

/**
 * Get a user by ID with clinic access validation
 */
export async function getUserById(authContext: AuthContext, userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      clinic: true,
      dashboards: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!user) {
    return null;
  }

  // Validate access
  if (!user.clinicId) {
    throw new Error('User has no clinic association');
  }
  const hasAccess = validateClinicAccess(authContext, user.clinicId);
  if (!hasAccess) {
    throw new Error('Access denied to this user');
  }

  return user;
}

/**
 * Get all users in accessible clinics
 */
export async function getUsers(
  authContext: AuthContext,
  options?: {
    clinicId?: string;
    role?: string;
    limit?: number;
    offset?: number;
  }
) {
  const where: Prisma.UserWhereInput = {
    clinicId: {
      in: options?.clinicId ? [options.clinicId] : authContext.clinicIds,
    },
  };

  if (options?.role) {
    where.role = options.role;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        clinic: true,
      },
      orderBy: { name: 'asc' },
      take: options?.limit,
      skip: options?.offset,
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total };
}

/**
 * Get users by clinic with role information
 */
export async function getUsersByClinic(authContext: AuthContext, clinicId: string) {
  // Validate access
  const hasAccess = validateClinicAccess(authContext, clinicId);
  if (!hasAccess) {
    throw new Error('Access denied to this clinic');
  }

  const userRoles = await prisma.userClinicRole.findMany({
    where: {
      clinicId,
      isActive: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Fetch user data separately since relations aren't defined yet
  const userIds = userRoles.map((ur) => ur.userId);
  const users = await prisma.user.findMany({
    where: {
      id: { in: userIds },
    },
  });

  // Create a map for quick lookup
  const userMap = new Map(users.map((user) => [user.id, user]));

  return userRoles
    .map((ur) => {
      const user = userMap.get(ur.userId);
      return {
        ...user,
        clinicRole: ur.role,
        roleId: ur.id,
      };
    })
    .filter((item) => item.id); // Filter out any items where user wasn't found
}

/**
 * Create a new user (clinic admin only)
 */
export async function createUser(authContext: AuthContext, input: CreateUserInput) {
  // Validate clinic access
  const hasAccess = validateClinicAccess(authContext, input.clinicId);
  if (!hasAccess) {
    throw new Error('Access denied to this clinic');
  }

  // Check if user is clinic admin
  const isAdmin =
    authContext.role === 'admin' ||
    (await prisma.userClinicRole.findFirst({
      where: {
        userId: authContext.userId,
        clinicId: input.clinicId,
        role: 'clinic_admin',
        isActive: true,
      },
    }));

  if (!isAdmin) {
    throw new Error('Only clinic admins can create users');
  }

  // Create user with clinic role
  const user = await prisma.$transaction(async (tx) => {
    // Create the user
    const newUser = await tx.user.create({
      data: {
        email: input.email,
        name: input.name,
        role: input.role,
        clinicId: input.clinicId,
        authId: input.authId,
      },
    });

    // Create clinic role mapping
    await tx.userClinicRole.create({
      data: {
        userId: newUser.id,
        clinicId: input.clinicId,
        role: input.role === 'admin' ? 'clinic_admin' : 'staff',
        createdBy: authContext.userId,
      },
    });

    return newUser;
  });

  return user;
}

/**
 * Update a user (self or clinic admin)
 */
export async function updateUser(authContext: AuthContext, userId: string, input: UpdateUserInput) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Check permissions: self or clinic admin
  const isSelf = authContext.userId === userId;
  const isAdmin =
    authContext.role === 'admin' ||
    (await prisma.userClinicRole.findFirst({
      where: {
        userId: authContext.userId,
        clinicId: user.clinicId || undefined,
        role: 'clinic_admin',
        isActive: true,
      },
    }));

  if (!(isSelf || isAdmin)) {
    throw new Error('Permission denied');
  }

  // Update user
  return prisma.user.update({
    where: { id: userId },
    data: input,
    include: {
      clinic: true,
    },
  });
}

/**
 * Delete a user (clinic admin only)
 */
export async function deleteUser(authContext: AuthContext, userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Check if user is clinic admin
  const isAdmin =
    authContext.role === 'admin' ||
    (await prisma.userClinicRole.findFirst({
      where: {
        userId: authContext.userId,
        clinicId: user.clinicId || undefined,
        role: 'clinic_admin',
        isActive: true,
      },
    }));

  if (!isAdmin) {
    throw new Error('Only clinic admins can delete users');
  }

  // Soft delete by deactivating all clinic roles
  await prisma.userClinicRole.updateMany({
    where: { userId },
    data: { isActive: false },
  });

  // Optionally, you might want to actually delete the user
  // return prisma.user.delete({ where: { id: userId } })

  return { success: true, message: 'User deactivated' };
}

/**
 * Get user's clinic roles
 */
export async function getUserClinicRoles(authContext: AuthContext, userId?: string) {
  const targetUserId = userId || authContext.userId;

  // If checking another user, validate they share a clinic
  if (userId && userId !== authContext.userId) {
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!(targetUser?.clinicId && validateClinicAccess(authContext, targetUser.clinicId))) {
      throw new Error('Access denied');
    }
  }

  const roles = await prisma.userClinicRole.findMany({
    where: {
      userId: targetUserId,
      isActive: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return roles;
}

/**
 * Update user's last login timestamp
 * Uses updateMany to gracefully handle cases where the user doesn't exist
 */
export async function updateLastLogin(authId: string): Promise<{ updated: boolean }> {
  const result = await prisma.user.updateMany({
    where: { authId },
    data: { lastLogin: new Date() },
  });

  return { updated: result.count > 0 };
}

/**
 * Search users across accessible clinics
 */
export async function searchUsers(
  authContext: AuthContext,
  query: string,
  options?: {
    limit?: number;
    clinicId?: string;
  }
) {
  const where: Prisma.UserWhereInput = {
    AND: [
      {
        clinicId: {
          in: options?.clinicId ? [options.clinicId] : authContext.clinicIds,
        },
      },
      {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
    ],
  };

  return await prisma.user.findMany({
    where,
    include: {
      clinic: true,
    },
    take: options?.limit || 10,
    orderBy: { name: 'asc' },
  });
}
