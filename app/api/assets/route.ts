import { prisma } from '@/lib/prisma';
import { CreateAssetSchema } from '@/lib/schemas';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Only Admin or AssetManager can register assets
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || !['ADMIN', 'ASSET_MANAGER'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = CreateAssetSchema.parse(body);

    // Validate category exists
    const category = await prisma.assetCategory.findUnique({
      where: { id: data.categoryId },
    });
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 400 });
    }

    // Check serial number uniqueness if provided
    if (data.serialNumber) {
      const existing = await prisma.asset.findFirst({
        where: { serialNumber: data.serialNumber },
      });
      if (existing) {
        return NextResponse.json(
          { error: 'Asset with this serial number already exists' },
          { status: 400 }
        );
      }
    }

    // Generate asset tag: AF-NNNN
    const count = await prisma.asset.count();
    const assetTag = `AF-${String(count + 1).padStart(4, '0')}`;

    // Parse acquisition date if provided
    const acquisitionDate = data.acquisitionDate
      ? new Date(data.acquisitionDate)
      : null;

    const asset = await prisma.asset.create({
      data: {
        assetTag,
        name: data.name,
        categoryId: data.categoryId,
        serialNumber: data.serialNumber,
        acquisitionDate,
        acquisitionCost: data.acquisitionCost,
        condition: data.condition,
        location: data.location,
        isBookable: data.isBookable,
        photoUrl: data.photoUrl,
        notes: data.notes,
        status: 'AVAILABLE',
      },
      include: { category: { select: { name: true } } },
    });

    return NextResponse.json(asset);
  } catch (error) {
    console.error('Error creating asset:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create asset' },
      { status: 400 }
    );
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const tag = searchParams.get('tag');
    const serial = searchParams.get('serial');
    const name = searchParams.get('name');
    const categoryId = searchParams.get('categoryId');
    const status = searchParams.get('status');
    const location = searchParams.get('location');

    const assets = await prisma.asset.findMany({
      where: {
        ...(tag && { assetTag: { contains: tag, mode: 'insensitive' } }),
        ...(serial && { serialNumber: { contains: serial, mode: 'insensitive' } }),
        ...(name && { name: { contains: name, mode: 'insensitive' } }),
        ...(categoryId && { categoryId: parseInt(categoryId) }),
        ...(status && { status }),
        ...(location && { location: { contains: location, mode: 'insensitive' } }),
      },
      include: {
        category: { select: { name: true } },
        allocations: {
          where: { status: 'ACTIVE' },
          take: 1,
          include: { holder: { select: { id: true, firstName: true, lastName: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // Format response to flatten allocations
    const formatted = assets.map((asset) => ({
      ...asset,
      currentHolder: asset.allocations[0]?.holder || null,
      allocations: undefined,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assets' },
      { status: 500 }
    );
  }
}
