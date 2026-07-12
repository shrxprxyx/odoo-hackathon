import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { Role, UserStatus } from '@prisma/client';

const VALID_ROLES = Object.values(Role);
const VALID_STATUSES = Object.values(UserStatus);

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const departmentId = searchParams.get('departmentId');
    const roleParam = searchParams.get('role');
    const statusParam = searchParams.get('status');

    // Query params arrive as plain strings - Prisma's `where` expects the
    // real Role/UserStatus enums, so validate + narrow instead of casting
    // blindly (a bad ?role=foo should 400, not crash Prisma or silently
    // return unfiltered results).
    if (roleParam && !VALID_ROLES.includes(roleParam as Role)) {
      return NextResponse.json(
        { error: 'validation_error', message: `role must be one of ${VALID_ROLES.join(', ')}`, field: 'role' },
        { status: 400 }
      );
    }
    if (statusParam && !VALID_STATUSES.includes(statusParam as UserStatus)) {
      return NextResponse.json(
        { error: 'validation_error', message: `status must be one of ${VALID_STATUSES.join(', ')}`, field: 'status' },
        { status: 400 }
      );
    }

    const role = roleParam as Role | null;
    const status = statusParam as UserStatus | null;

    const employees = await prisma.user.findMany({
      where: {
        ...(departmentId && { departmentId: parseInt(departmentId) }),
        ...(role && { role }),
        ...(status && { status }),
      },
      include: {
        department: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Format response
    const formatted = employees.map((emp: typeof employees[number]) => ({
      id: emp.id,
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      departmentId: emp.departmentId,
      departmentName: emp.department?.name,
      role: emp.role,
      status: emp.status,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}
