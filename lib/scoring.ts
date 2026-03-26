// ── MerchantFloat Credit Scoring Engine ──────────────────────────────────────
// Turns raw POS transaction data into a 0-100 credit score.
// This IS the product. Every weight is intentional.

export type ScoringInput = {
  monthlyRevenue: number;           // total naira processed in last 30 days
  activeDays: number;               // days with at least 1 transaction
  totalDays: number;                // window size (typically 30)
  refundRate: number;               // refunds / total transactions (decimal, e.g. 0.041)
  connectedAccounts: number;        // number of bank accounts/wallets linked
  avgSettlementDelayHours?: number; // avg hours between transaction and settlement
  weeklyRevenues?: number[];        // last N weeks of revenue (oldest → newest)
};

export type ScoreBreakdown = {
  revenue: number;          // max 25
  consistency: number;      // max 25
  stability: number;        // max 10
  refundRate: number;       // max 20
  settlementSpeed: number;  // max 10
  diversity: number;        // max 10
};

export type ScoreResult = {
  score: number;
  scoreLabel: "Excellent" | "Good" | "Fair" | "Poor" | "High Risk";
  scoreColor: string;
  eligible: boolean;
  qualifiedAmount: number;
  breakdown: ScoreBreakdown;
  trend: "growing" | "stable" | "declining" | "unknown";
};

export function calculateScore(input: ScoringInput): ScoreResult {
  // ── Revenue (25 pts) ─────────────────────────────────────────────────────
  // ₦4M/month = perfect score. Scales linearly below.
  const revenueScore = Math.min(25, Math.round((input.monthlyRevenue / 4_000_000) * 25));

  // ── Consistency (25 pts) ─────────────────────────────────────────────────
  // Perfect attendance (30/30 days) = 25. Missing days penalised proportionally.
  const consistencyScore = Math.round((input.activeDays / input.totalDays) * 25);

  // ── Revenue Stability (10 pts) ───────────────────────────────────────────
  // How consistent is weekly revenue? Low coefficient of variation = stable business.
  // CV = std(weekly) / mean(weekly). Score = round(10 * max(0, 1 - CV))
  let stabilityScore = 5; // default if no weekly data
  if (input.weeklyRevenues && input.weeklyRevenues.length >= 4) {
    const ws = input.weeklyRevenues;
    const mean = ws.reduce((a, b) => a + b, 0) / ws.length;
    const variance = ws.reduce((a, b) => a + (b - mean) ** 2, 0) / ws.length;
    const cv = Math.sqrt(variance) / mean;
    stabilityScore = Math.max(0, Math.round(10 * (1 - cv)));
  }

  // ── Refund Rate (20 pts) ─────────────────────────────────────────────────
  // 0% refunds = 20 pts. Every 1% costs ~2 pts. 10%+ = 0.
  const refundScore = Math.max(0, Math.round(20 - input.refundRate * 200));

  // ── Settlement Speed (10 pts) ────────────────────────────────────────────
  // How fast Interswitch settles this merchant's funds.
  // Fast settlement = lower-risk, higher-tier merchant. Slow = more trapped float.
  // ≤12h = 10pts | ≤24h = 7pts | ≤36h = 4pts | ≤48h = 2pts | >48h = 0pts
  let settlementScore = 0;
  if (input.avgSettlementDelayHours !== undefined) {
    const h = input.avgSettlementDelayHours;
    if (h <= 12) settlementScore = 10;
    else if (h <= 24) settlementScore = 7;
    else if (h <= 36) settlementScore = 4;
    else if (h <= 48) settlementScore = 2;
    else settlementScore = 0;
  }

  // ── Account Diversity (10 pts) ───────────────────────────────────────────
  // 1 account = 3, 2 = 6, 3+ = 10. More accounts = fuller picture.
  const diversityScore = input.connectedAccounts >= 3 ? 10
    : input.connectedAccounts === 2 ? 6
    : 3;

  const score = revenueScore + consistencyScore + stabilityScore + refundScore + settlementScore + diversityScore;

  // ── Score label + colour ─────────────────────────────────────────────────
  let scoreLabel: ScoreResult["scoreLabel"];
  let scoreColor: string;
  if (score >= 80) { scoreLabel = "Excellent"; scoreColor = "#16a34a"; }
  else if (score >= 65) { scoreLabel = "Good"; scoreColor = "#2563eb"; }
  else if (score >= 50) { scoreLabel = "Fair"; scoreColor = "#d97706"; }
  else if (score >= 35) { scoreLabel = "Poor"; scoreColor = "#ea580c"; }
  else { scoreLabel = "High Risk"; scoreColor = "#dc2626"; }

  // ── Eligibility & loan amount ────────────────────────────────────────────
  const eligible = score >= 50;

  // Loan = 15–20% of monthly revenue, scaled by score, rounded to nearest ₦10k
  const loanRate = 0.15 + (score / 100) * 0.05;
  const qualifiedAmount = eligible
    ? Math.round((input.monthlyRevenue * loanRate) / 10_000) * 10_000
    : 0;

  // ── Revenue trend ────────────────────────────────────────────────────────
  let trend: ScoreResult["trend"] = "unknown";
  if (input.weeklyRevenues && input.weeklyRevenues.length >= 4) {
    const weeks = input.weeklyRevenues;
    const firstHalf = weeks.slice(0, Math.floor(weeks.length / 2)).reduce((a, b) => a + b, 0);
    const secondHalf = weeks.slice(Math.floor(weeks.length / 2)).reduce((a, b) => a + b, 0);
    const change = (secondHalf - firstHalf) / firstHalf;
    if (change > 0.05) trend = "growing";
    else if (change < -0.05) trend = "declining";
    else trend = "stable";
  }

  return {
    score,
    scoreLabel,
    scoreColor,
    eligible,
    qualifiedAmount,
    breakdown: {
      revenue: revenueScore,
      consistency: consistencyScore,
      stability: stabilityScore,
      refundRate: refundScore,
      settlementSpeed: settlementScore,
      diversity: diversityScore,
    },
    trend,
  };
}
