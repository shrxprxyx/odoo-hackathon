import { prisma } from '@/lib/prisma';
import { ReturnAssetSchema } from '@/lib/schemas';
import { returnAsset } from '@/lib/allocations';
import { logActivity } from '@/lib/logActivity';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

// This endpoint was previously missing entirely - lib/allocations.ts had a
// working returnAsset() function with nothing calling it. Closes the "mark
// returned + condition check-in" gap from the problem statement.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const allocationId = Number(id);
  if (!Number.isInteger(allocationId) || allocationId <= 0) {
    return NextResponse.json({ error: 'invalid_id', message: 'Invalid allocation id' }, { status: 400 });
  }

  try {
    const actor = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const data = ReturnAssetSchema.parse(body);

    const result = await returnAsset(allocationId, data.condition, data.returnNotes, actor.id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    await logActivity('asset_returned', {
      actorId: actor.id,
      resourceType: 'Allocation',
      resourceId: allocationId,
      changes: { condition: data.condition },
    });

    return NextResponse.json(
      { success: true, allocation: result.allocation },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error returning asset:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to return asset' },
      { status: 400 }
    );
  }
}
