import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const logs = await prisma.activityLog.findMany({
    orderBy: { timestamp: "desc" },
    take: 20,
    include: { actor: { select: { firstName: true, lastName: true } } },
  });

  return NextResponse.json({ data: logs, total: logs.length });
}