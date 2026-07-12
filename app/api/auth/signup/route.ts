import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signupSchema } from "@/lib/schemas";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json(
      { error: "validation_error", message: issue.message, field: issue.path[0] },
      { status: 400 }
    );
  }

  const { firstName, lastName, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "email_taken", message: "An account with this email already exists", field: "email" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // role is hard-coded here, never taken from the request body —
  // this is what makes signup "non-self-elevating"
  const user = await prisma.user.create({
    data: { firstName, lastName, email, passwordHash, role: "EMPLOYEE" },
  });

  return NextResponse.json({ id: user.id, email: user.email, role: user.role }, { status: 201 });
}