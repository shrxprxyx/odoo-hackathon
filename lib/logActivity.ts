import { prisma } from "./prisma";

// TEMP — Person 1 owns this per the build plan (written during their
// "1:30–2:00 Dashboard shell" block). This is a drop-in match for the
// ActivityLog model so you're not blocked. Delete this file the moment
// theirs lands and re-point the import in app/api/bookings/route.ts.

export async function logActivity(
  action: string,
  opts: {
    actorId?: number;
    resourceType?: string;
    resourceId?: number;
    changes?: string;
  } = {}
) {
  await prisma.activityLog.create({
    data: {
      action,
      actorId: opts.actorId ?? null,
      resourceType: opts.resourceType ?? null,
      resourceId: opts.resourceId ?? null,
      changes: opts.changes ?? null,
    },
  });
}
