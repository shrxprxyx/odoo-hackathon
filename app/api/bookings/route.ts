import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { bookingSchema } from "@/lib/schemas";
import { createBooking, getBookingsForResource } from "@/lib/bookings";
import { logActivity } from "@/lib/logActivity";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const resourceId = Number(searchParams.get("resourceId"));
  const dateParam = searchParams.get("date");

  if (!resourceId || !dateParam) {
    return NextResponse.json(
      { error: "validation_error", message: "resourceId and date are required", field: "resourceId" },
      { status: 400 }
    );
  }

  const bookings = await getBookingsForResource(resourceId, new Date(dateParam));
  return NextResponse.json({ bookings });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized", message: "Sign in to book a resource" }, { status: 401 });
  }
  const bookerId = Number(session.user.id);

  const body = await req.json();
  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json(
      { error: "validation_error", message: issue.message, field: issue.path[0] },
      { status: 400 }
    );
  }
  const { resourceId, startTime, endTime, purpose } = parsed.data;

  try {
    const booking = await createBooking(resourceId, bookerId, startTime, endTime, purpose);
    await logActivity("booking_confirmed", {
      actorId: bookerId,
      resourceType: "ResourceBooking",
      resourceId: booking.id,
    });
    return NextResponse.json({ booking }, { status: 201 });
  } catch (e: any) {
    if (e?.status === 409) return NextResponse.json(e.body, { status: 409 });
    console.error(e);
    return NextResponse.json({ error: "server_error", message: "Something went wrong creating the booking" }, { status: 500 });
  }
}