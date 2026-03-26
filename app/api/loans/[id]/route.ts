import { NextRequest, NextResponse } from "next/server";
import { getLoan } from "@/lib/loans";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const loan = getLoan(id);
  if (!loan) {
    return NextResponse.json({ error: "Loan not found" }, { status: 404 });
  }
  return NextResponse.json({ loan });
}
