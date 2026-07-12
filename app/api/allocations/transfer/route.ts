import { prisma } from '@/lib/prisma';
import { TransferAssetSchema } from '@/lib/schemas';
import { transferAsset } from '@/lib/allocations';
import { logActivity } from '@/lib/logActivity';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const data = TransferAssetSchema.parse(body);

    // Get actor ID
    const actor = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Verify toHolder exists
    const toHolder = await prisma.user.findUnique({
      where: { id: data.toHolderId },
    });

    if (!toHolder) {
      return NextResponse.json({ error: 'Recipient user not found' }, { status: 400 });
    }

    // Call transfer logic (handles transaction). fromHolderId is optional on
    // the wire - when omitted, transferAsset() trusts the DB's current holder
    // instead of requiring the caller to already know it.
    const result = await transferAsset(
      data.assetId,
      data.fromHolderId,
      data.toHolderId,
      data.reason,
      actor.id
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    await logActivity('asset_transferred', {
      actorId: actor.id,
      resourceType: 'Asset',
      resourceId: data.assetId,
      changes: { toHolderId: data.toHolderId, reason: data.reason },
    });

    // Success - return new allocation
    return NextResponse.json(
      {
        success: true,
        allocation: result.allocation,
        message: `Asset transferred to ${toHolder.firstName} ${toHolder.lastName}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error transferring asset:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to transfer asset' },
      { status: 400 }
    );
  }
}
