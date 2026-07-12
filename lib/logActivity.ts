import { prisma } from "@/lib/prisma";

export async function logActivity(
  actorId: number | null,
  action: string,
  resourceType?: string,
  resourceId?: number,
  changes?: Record<string, unknown>
) {
  await prisma.activityLog.create({
    data: {
      actorId,
      action,
      resourceType,
      resourceId,
      changes: changes ? JSON.stringify(changes) : null,
    },
  });
}
