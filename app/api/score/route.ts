import { NextRequest, NextResponse } from "next/server";
import { calculateScore, type ScoringInput } from "@/lib/scoring";
import { merchants } from "@/lib/merchants";

// GET  → returns the pre-computed authoritative score for a known demo merchant
// POST → runs calculateScore on raw input (production / future use)

// GET /api/score?merchantId=emeka — score a known demo merchant
// POST /api/score — score raw merchant data (for production flow)
export async function GET(req: NextRequest) {
  const merchantId = req.nextUrl.searchParams.get("merchantId");
  const merchant = merchants.find((m) => m.id === merchantId);

  if (!merchant) {
    return NextResponse.json({ error: "Merchant not found" }, { status: 404 });
  }

  // For known demo merchants, return the pre-computed authoritative score.
  // This ensures the BVN scan result matches the dashboard score exactly.
  // (The calculateScore engine is used for the POST endpoint / production flow.)

  // Compute revenue trend from weekly data
  const weeks = merchant.weeklyData.map((w) => w.amount);
  let trend: "growing" | "stable" | "declining" | "unknown" = "unknown";
  if (weeks.length >= 4) {
    const mid = Math.floor(weeks.length / 2);
    const firstHalf = weeks.slice(0, mid).reduce((a, b) => a + b, 0);
    const secondHalf = weeks.slice(mid).reduce((a, b) => a + b, 0);
    const change = (secondHalf - firstHalf) / firstHalf;
    if (change > 0.05) trend = "growing";
    else if (change < -0.05) trend = "declining";
    else trend = "stable";
  }

  // Map scoreBreakdown to the breakdown shape the API contract expects
  const bd = merchant.scoreBreakdown;
  const breakdown = {
    revenue:         bd.find((s) => s.label === "Revenue Volume")?.score ?? 0,
    consistency:     bd.find((s) => s.label === "Trading Consistency")?.score ?? 0,
    stability:       bd.find((s) => s.label === "Revenue Stability")?.score ?? 0,
    refundRate:      bd.find((s) => s.label === "Refund Rate")?.score ?? 0,
    settlementSpeed: bd.find((s) => s.label === "Settlement Speed")?.score ?? 0,
    diversity:       bd.find((s) => s.label === "Account Coverage")?.score ?? 0,
  };

  return NextResponse.json({
    merchantId,
    merchantName: merchant.name,
    score: merchant.score,
    scoreLabel: merchant.scoreLabel,
    scoreColor: merchant.scoreColor,
    eligible: merchant.loanEligible,
    qualifiedAmount: merchant.qualifiedAmount,
    breakdown,
    trend,
  });
}

export async function POST(req: NextRequest) {
  const body: ScoringInput = await req.json();

  if (
    body.monthlyRevenue === undefined ||
    body.activeDays === undefined ||
    body.totalDays === undefined ||
    body.refundRate === undefined ||
    body.connectedAccounts === undefined
  ) {
    return NextResponse.json(
      { error: "Missing required fields: monthlyRevenue, activeDays, totalDays, refundRate, connectedAccounts" },
      { status: 400 }
    );
  }

  const result = calculateScore(body);
  return NextResponse.json(result);
}
