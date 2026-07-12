import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// TEMP — Person 2's Asset Registry route will eventually cover this
// (filtering assets by isBookable). Flag it at the 2:00 sync so it
// doesn't get duplicated.

export async function GET() {
  const resources = await prisma.asset.findMany({
    where: { isBookable: true },
    select: { id: true, assetTag: true, name: true, location: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ resources });
}
