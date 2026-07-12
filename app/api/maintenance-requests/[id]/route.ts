import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { logActivity } from "@/lib/logActivity";
import {
  approveMaintenanceRequest,
  rejectMaintenanceRequest,
  assignTechnician,
  startMaintenanceRequest,
  resolveMaintenanceRequest,
} from "@/lib/maintenance";

// Kept local rather than added to lib/schemas.ts to avoid touching a
// shared file mid-build — fold into schemas.ts at the next merge sync.
const maintenancePatchSchema = z
  .object({
    status: z.enum(["APPROVED", "REJECTED", "IN_PROGRESS", "RESOLVED"]).optional(),
    technicianId: z.coerce.number().int().positive().optional(),
    resolutionNotes: z.string().max(1000).optional(),
  })
  .refine((data) => data.status || data.technicianId, {
    message: "Provide a status transition or a technicianId to assign",
  });

const MANAGER_ROLES = ["ASSET_MANAGER", "ADMIN"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized", message: "Sign in required" }, { status: 401 });
  }

  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "invalid_id", message: "Invalid request id" }, { status: 400 });
  }

  const body = await req.json();
  const parsed = maintenancePatchSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json(
      { error: "validation_error", message: issue.message, field: issue.path[0] },
      { status: 400 }
    );
  }

  const actorId = Number(session.user.id);
  const role = session.user.role as string;
  const { status, technicianId, resolutionNotes } = parsed.data;

  try {
    // Approve / Reject — Asset Manager or Admin only
    if (status === "APPROVED" || status === "REJECTED") {
      if (!MANAGER_ROLES.includes(role)) {
        return NextResponse.json(
          { error: "forbidden", message: "Only an Asset Manager or Admin can approve or reject requests" },
          { status: 403 }
        );
      }
      const updated =
        status === "APPROVED"
          ? await approveMaintenanceRequest(id, actorId)
          : await rejectMaintenanceRequest(id, actorId);
      await logActivity(status === "APPROVED" ? "maintenance_approved" : "maintenance_rejected", {
        actorId,
        resourceType: "MaintenanceRequest",
        resourceId: id,
      });
      return NextResponse.json({ request: updated });
    }

    // Assign technician — no status change, just metadata
    if (technicianId && !status) {
      if (!MANAGER_ROLES.includes(role)) {
        return NextResponse.json(
          { error: "forbidden", message: "Only an Asset Manager or Admin can assign a technician" },
          { status: 403 }
        );
      }
      const updated = await assignTechnician(id, technicianId);
      await logActivity("maintenance_technician_assigned", {
        actorId,
        resourceType: "MaintenanceRequest",
        resourceId: id,
      });
      return NextResponse.json({ request: updated });
    }

    // Start work
    if (status === "IN_PROGRESS") {
      const updated = await startMaintenanceRequest(id);
      await logActivity("maintenance_in_progress", {
        actorId,
        resourceType: "MaintenanceRequest",
        resourceId: id,
      });
      return NextResponse.json({ request: updated });
    }

    // Resolve
    if (status === "RESOLVED") {
      const updated = await resolveMaintenanceRequest(id, actorId, resolutionNotes);
      await logActivity("maintenance_resolved", {
        actorId,
        resourceType: "MaintenanceRequest",
        resourceId: id,
      });
      return NextResponse.json({ request: updated });
    }

    return NextResponse.json({ error: "no_op", message: "No valid transition in request body" }, { status: 400 });
  } catch (e: any) {
    if (e?.status) return NextResponse.json(e.body, { status: e.status });
    console.error(e);
    return NextResponse.json(
      { error: "server_error", message: "Something went wrong updating the request" },
      { status: 500 }
    );
  }
}