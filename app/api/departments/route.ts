import { prisma } from '@/lib/prisma';
import { CreateDepartmentSchema, UpdateDepartmentSchema } from '@/lib/schemas';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Check ADMIN role
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = CreateDepartmentSchema.parse(body);

    // Validate parent dept exists and is not self-referential
    if (data.parentDeptId) {
      const parent = await prisma.department.findUnique({
        where: { id: data.parentDeptId },
      });
      if (!parent) {
        return NextResponse.json({ error: 'Parent department not found' }, { status: 400 });
      }
    }

    // Validate head exists
    if (data.headId) {
      const head = await prisma.user.findUnique({ where: { id: data.headId } });
      if (!head) {
        return NextResponse.json({ error: 'Head user not found' }, { status: 400 });
      }
    }

    const dept = await prisma.department.create({
      data: {
        name: data.name,
        headId: data.headId,
        parentDeptId: data.parentDeptId,
        status: data.status,
      },
      include: { head: { select: { id: true, firstName: true, lastName: true } } },
    });

    return NextResponse.json(dept);
  } catch (error) {
    console.error('Error creating department:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create department' },
      { status: 400 }
    );
  }
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const depts = await prisma.department.findMany({
      include: { head: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(depts);
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch departments' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Check ADMIN role
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'Department ID required' }, { status: 400 });
    }

    const validated = UpdateDepartmentSchema.parse(data);

    // Validate parent dept if provided
    if (validated.parentDeptId) {
      const parent = await prisma.department.findUnique({
        where: { id: validated.parentDeptId },
      });
      if (!parent) {
        return NextResponse.json({ error: 'Parent department not found' }, { status: 400 });
      }
    }

    // Validate head if provided
    if (validated.headId) {
      const head = await prisma.user.findUnique({ where: { id: validated.headId } });
      if (!head) {
        return NextResponse.json({ error: 'Head user not found' }, { status: 400 });
      }
    }

    const dept = await prisma.department.update({
      where: { id },
      data: validated,
      include: { head: { select: { id: true, firstName: true, lastName: true } } },
    });

    return NextResponse.json(dept);
  } catch (error) {
    console.error('Error updating department:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update department' },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Check ADMIN role
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Department ID required' }, { status: 400 });
    }

    // Check if dept has child depts or employees
    const hasChildren = await prisma.department.findFirst({
      where: { parentDeptId: id },
    });

    const hasEmployees = await prisma.user.findFirst({
      where: { departmentId: id },
    });

    if (hasChildren || hasEmployees) {
      return NextResponse.json(
        { error: 'Cannot delete department with child departments or employees' },
        { status: 400 }
      );
    }

    // Soft delete: set status to INACTIVE
    const dept = await prisma.department.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });

    return NextResponse.json({ success: true, dept });
  } catch (error) {
    console.error('Error deleting department:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete department' },
      { status: 400 }
    );
  }
}
