import { NextResponse } from "next/server";
import { getReportsSummary } from "@/lib/reports";

export async function GET() {
  const data = await getReportsSummary();
  return NextResponse.json(data);
}
