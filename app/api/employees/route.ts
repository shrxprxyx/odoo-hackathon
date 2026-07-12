import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const departmentId = searchParams.get('departmentId');
    const role = searchParams.get('role');
    const status = searchParams.get('status');

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
    const formatted = employees.map((emp) => ({
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
