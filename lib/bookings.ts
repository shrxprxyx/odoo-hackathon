import { prisma, Prisma } from "./prisma";

export async function getBookingsForResource(resourceId: number, date: Date) {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  return prisma.resourceBooking.findMany({
    where: {
      resourceId,
      status: { not: "CANCELLED" },
      startTime: { lte: dayEnd },
      endTime: { gte: dayStart },
    },
    include: { booker: { select: { firstName: true, lastName: true } } },
    orderBy: { startTime: "asc" },
  });
}

export async function createBooking(
  resourceId: number,
  bookerId: number,
  startTime: Date,
  endTime: Date,
  purpose?: string
) {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Re-check inside the transaction (not just before it) so two
    // simultaneous requests against the same resource can't both pass.
    const overlapping = await tx.resourceBooking.findFirst({
      where: {
        resourceId,
        status: { not: "CANCELLED" },
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
    });

    if (overlapping) {
      throw {
        status: 409,
        body: {
          error: "booking_overlap",
          message: "This slot is unavailable — it overlaps an existing booking.",
          conflictingBooking: {
            startTime: overlapping.startTime,
            endTime: overlapping.endTime,
          },
        },
      };
    }

    return tx.resourceBooking.create({
      data: { resourceId, bookerId, startTime, endTime, purpose, status: "UPCOMING" },
    });
  });
}

export async function cancelBooking(bookingId: number) {
  return prisma.resourceBooking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  });
}