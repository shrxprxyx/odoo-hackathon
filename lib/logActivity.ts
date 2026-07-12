import { prisma } from "@/lib/prisma";

type LogActivityOptions = {
  actorId?: number | null;
  resourceType?: string;
  resourceId?: number;
  changes?: Record<string, unknown>;
};

export async function logActivity(action: string, options: LogActivityOptions = {}) {
  await prisma.activityLog.create({
    data: {
      actorId: options.actorId ?? null,
      action,
      resourceType: options.resourceType,
      resourceId: options.resourceId,
      changes: options.changes ? JSON.stringify(options.changes) : null,
    },
  });
}