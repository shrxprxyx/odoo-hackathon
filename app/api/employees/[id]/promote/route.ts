import { NextRequest, NextResponse } from "next/server";
import { promoteSchema } from "@/lib/schemas";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  // authz check — independent of the Zod shape check below
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "forbidden", message: "Only Admins can promote users" },
      { status: 403 }
    );
  }

  const employeeId = Number(id);
  if (!Number.isInteger(employeeId) || employeeId <= 0) {
    return NextResponse.json({ error: "invalid_id", message: "Invalid employee id" }, { status: 400 });
  }

  const body = await req.json();
  const parsed = promoteSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json(
      { error: "validation_error", message: issue.message, field: issue.path[0] },
      { status: 400 }
    );
  }

  const updated = await prisma.user.update({
    where: { id: employeeId },
    data: { role: parsed.data.role },
  });

  return NextResponse.json({ id: updated.id, role: updated.role });
}