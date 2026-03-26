import { NextRequest, NextResponse } from "next/server";
import { verifyBVN } from "@/lib/interswitch";

export async function POST(req: NextRequest) {
  const { bvn } = await req.json();

  if (!bvn || String(bvn).length !== 11) {
    return NextResponse.json({ error: "BVN must be 11 digits" }, { status: 400 });
  }

  const result = await verifyBVN(String(bvn));
  return NextResponse.json(result);
}
