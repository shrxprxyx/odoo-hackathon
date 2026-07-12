import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { auditCycleSchema } from "@/lib/schemas";
import { logActivity } from "@/lib/logActivity";
import { getAssetsInScope } from "@/lib/audits";

export async function GET() {
  const [cycles, departments] = await Promise.all([
    prisma.auditCycle.findMany({
      orderBy: { createdAt: "desc" },
      include: { findings: { select: { status: true } } },
    }),
    prisma.department.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const cyclesWithCounts = await Promise.all(
    cycles.map(async (cycle) => {
      const assets = await getAssetsInScope(cycle.scopeType, cycle.scopeId);
      const missingCount = cycle.findings.filter((f) => f.status === "MISSING").length;
      const damagedCount = cycle.findings.filter((f) => f.status === "DAMAGED").length;
      return {
        id: cycle.id,
        name: cycle.name,
        scopeType: cycle.scopeType,
        scopeId: cycle.scopeId,
        startDate: cycle.startDate,
        endDate: cycle.endDate,
        status: cycle.status,
        closedAt: cycle.closedAt,
        assetCount: assets.length,
        checkedCount: cycle.findings.length,
        missingCount,
        damagedCount,
      };
    })
  );

  return NextResponse.json({ cycles: cyclesWithCounts, departments });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "forbidden", message: "Only Admins can create audit cycles" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const parsed = auditCycleSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json(
      { error: "validation_error", message: issue.message, field: issue.path[0] },
      { status: 400 }
    );
  }

  const { name, scopeType, scopeId, startDate, endDate } = parsed.data;

  if (endDate < startDate) {
    return NextResponse.json(
      { error: "validation_error", message: "End date must be on or after the start date", field: "endDate" },
      { status: 400 }
    );
  }

  if (scopeType === "DEPARTMENT" && !scopeId) {
    return NextResponse.json(
      { error: "validation_error", message: "Select a department for a department-scoped audit", field: "scopeId" },
      { status: 400 }
    );
  }

  const adminId = Number(session.user.id);

  const cycle = await prisma.auditCycle.create({
    data: {
      name,
      scopeType,
      scopeId: scopeType === "DEPARTMENT" ? scopeId : null,
      startDate,
      endDate,
      createdBy: adminId,
    },
  });

  await logActivity("audit_cycle_created", {
    actorId: adminId,
    resourceType: "AuditCycle",
    resourceId: cycle.id,
  });

  return NextResponse.json({ cycle }, { status: 201 });
}
