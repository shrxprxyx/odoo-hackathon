import { prisma } from '@/lib/prisma';
import { TransferAssetSchema } from '@/lib/schemas';
import { transferAsset } from '@/lib/allocations';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const data = TransferAssetSchema.parse(body);

    // Get actor ID
    const actor = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    // Verify toHolder exists
    const toHolder = await prisma.user.findUnique({
      where: { id: data.toHolderId },
    });

    if (!toHolder) {
      return NextResponse.json({ error: 'Recipient user not found' }, { status: 400 });
    }

    // Call transfer logic (handles transaction)
    const result = await transferAsset(
      data.assetId,
      data.fromHolderId,
      data.toHolderId,
      data.reason,
      actor?.id
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

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
