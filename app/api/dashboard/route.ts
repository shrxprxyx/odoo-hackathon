import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const now = new Date();

  const [available, allocated, maintenanceToday, activeBookings, pendingTransfers, overdue, upcoming] =
    await Promise.all([
      prisma.asset.count({ where: { status: "AVAILABLE" } }),
      prisma.asset.count({ where: { status: "ALLOCATED" } }),
      prisma.asset.count({ where: { status: "UNDER_MAINTENANCE" } }),
      prisma.resourceBooking.count({ where: { status: { in: ["UPCOMING", "ONGOING"] } } }),
      prisma.transferRequest.count({ where: { status: "PENDING" } }),
      prisma.allocation.count({
        where: { status: "ACTIVE", expectedReturnDate: { lt: now } },
      }),
      prisma.allocation.count({
        where: { status: "ACTIVE", expectedReturnDate: { gte: now } },
      }),
    ]);

  return NextResponse.json({
    available,
    allocated,
    maintenanceToday,
    activeBookings,
    pendingTransfers,
    overdue,
    upcomingReturns: upcoming,
  });
}