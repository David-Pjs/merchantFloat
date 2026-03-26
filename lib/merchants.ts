// ─────────────────────────────────────────────────────────────────────────────
// DATA SOURCE: Derived from merchantfloat_synthetic_pos_data.csv and
// merchantfloat_final_dataset.csv (Interswitch x Enyata Buildathon 2026)
//
// Merchant mapping:
//   Emeka  → M002  (₦4.03M/month, 30/30 days, refund 4.1%)
//   Hajiya → M001  (₦2.01M/month, 30/30 days, refund 4.6%)
//   Tunde  → M_LOW (₦988k/month,  refund 11.8% - REJECTED)
// ─────────────────────────────────────────────────────────────────────────────

export type ScoreReason = {
  label: string;
  detail: string;
  positive: boolean;
};

export type Merchant = {
  id: string;
  name: string;
  business: string;
  location: string;
  avatar: string;
  score: number;
  scoreLabel: string;
  scoreColor: string;
  qualifiedAmount: number;
  loanEligible: boolean;
  monthlyRevenue: string;
  avgDailySales: string;
  activeDays: number;
  totalDays: number;
  category: string;
  avgSettlementDelayHours: number;
  weeklyData: { week: string; amount: number }[];
  recentTransactions: { date: string; description: string; channel: string; amount: number }[];
  connectedAccounts: { bank: string; type: string; last4: string }[];
  story: string;
  scoreBreakdown: { label: string; score: number; max: number; detail: string }[];
  scoreReasons: ScoreReason[];
  riskLevel: "Low" | "Medium" | "High";
  growthPrediction: number;
  aiRecommendations: string[];
  riskFlags: string[];
  transactionCount: number;
  plainEnglishSummary: string;
  scoreSimulator: { scenarios: { label: string; detail: string; action: string; scoreGain: number }[] };
};

export const merchants: Merchant[] = [
  // ── EMEKA - M002 data ──────────────────────────────────────────────────────
  {
    id: "emeka",
    name: "Emeka Nwosu",
    business: "Emeka Cold Room & Storage",
    location: "Mile 12, Lagos",
    avatar: "EN",
    score: 85,
    scoreLabel: "Excellent",
    scoreColor: "#16a34a",
    qualifiedAmount: 750000,
    loanEligible: true,
    // Real from CSV: M002 Feb 13–Mar 14 2026 = ₦4,030,876
    monthlyRevenue: "4.03M",
    // Real from CSV: ₦134,363 avg/day
    avgDailySales: "134.4k",
    // Real from CSV: 30 active days out of 30
    activeDays: 30,
    totalDays: 30,
    category: "Agriculture & Storage",
    // Derived from merchantfloat_dataset.csv: M_GOOD/M_TOP tier merchant profile
    avgSettlementDelayHours: 10,
    // Real weekly totals from M002 CSV data (Jan 20 – Mar 14 2026)
    weeklyData: [
      { week: "Wk 1", amount: 952852 },
      { week: "Wk 2", amount: 946358 },
      { week: "Wk 3", amount: 1023187 },
      { week: "Wk 4", amount: 918365 },
      { week: "Wk 5", amount: 897508 },
      { week: "Wk 6", amount: 881040 },
      { week: "Wk 7", amount: 1026473 },
      { week: "Wk 8", amount: 666313 },
    ],
    recentTransactions: [
      { date: "Today, 8:02 AM", description: "Produce payment, Alhaji Sule", channel: "GTBank Transfer", amount: 18500 },
      { date: "Today, 7:45 AM", description: "Storage fee, Mama Ngozi", channel: "Moniepoint POS", amount: 24000 },
      { date: "Yesterday, 5:30 PM", description: "Bulk produce, Iya Risi", channel: "Opay Transfer", amount: 31200 },
      { date: "Yesterday, 9:10 AM", description: "Cold storage, 3 farmers", channel: "UBA Transfer", amount: 15600 },
      { date: "Mar 11, 8:00 AM", description: "Produce payment, Dan Malam", channel: "GTBank Transfer", amount: 22400 },
    ],
    connectedAccounts: [
      { bank: "GTBank", type: "Current", last4: "4821" },
      { bank: "Moniepoint", type: "Business", last4: "9034" },
      { bank: "UBA", type: "Savings", last4: "1157" },
    ],
    story: "Stores produce for 30+ farmers. Fridge broke down. Needs capital fast.",
    scoreBreakdown: [
      { label: "Revenue Volume", score: 21, max: 25, detail: "₦4.03M/month" },
      { label: "Trading Consistency", score: 25, max: 25, detail: "30/30 days active" },
      { label: "Revenue Stability", score: 9, max: 10, detail: "12% weekly variance - rock solid" },
      { label: "Refund Rate", score: 12, max: 20, detail: "4.1% - healthy" },
      { label: "Settlement Speed", score: 10, max: 10, detail: "~10h avg clearance" },
      { label: "Account Coverage", score: 8, max: 10, detail: "3 banks connected" },
    ],
    scoreReasons: [
      { label: "Active all 30 days this month", detail: "Zero days with no transactions - the most consistent merchant in the dataset", positive: true },
      { label: "₦4.03M processed this month", detail: "Highest revenue volume across all accounts - 3,155 transactions verified", positive: true },
      { label: "Revenue rock solid for 8 weeks", detail: "Weekly revenue never dropped below ₦880k - strong demand consistency", positive: true },
      { label: "Refund rate 4.1%", detail: "129 refunds across 3,155 transactions. Within acceptable range for storage business", positive: true },
      { label: "Settlement in ~10 hours", detail: "Funds clear fast - Interswitch data confirms this merchant operates at top-tier settlement speed", positive: true },
    ],
    riskLevel: "Low",
    // Comparing Wk 5-7 vs Wk 1-3 (excluding partial Wk 8)
    growthPrediction: 8,
    aiRecommendations: [
      "Your revenue averages ₦134k/day. Accessing ₦750k working capital lets you replace your fridge and serve 30+ farming families without interruption.",
      "You have been active every single day this month. Maintaining this will push your credit limit to ₦1.2M+ on next cycle.",
      "3 of your top customers pay via GTBank Transfer. A direct debit arrangement with your top 5 could reduce transaction costs significantly.",
    ],
    riskFlags: [],
    transactionCount: 3155,
    scoreSimulator: {
      scenarios: [
        { label: "Reduce refund rate to 2%", detail: "Refund score: 12 → 16 out of 20", action: "Resolve pending customer disputes", scoreGain: 4 },
        { label: "Add a 4th connected account", detail: "Coverage: 8 → 10 out of 10", action: "Connect your remaining Firstbank account", scoreGain: 4 },
        { label: "Settle payments in under 6h", detail: "Settlement: already 10/10 — you are maxed", action: "Nothing to do here — already perfect", scoreGain: 0 },
      ],
    },
    plainEnglishSummary: "Emeka, you sold every single day this month. ₦4 million passed through your accounts and we counted 3,155 payments. Your money comes in clean and consistent. That is exactly the kind of record that earns a loan - and why we are offering you ₦750,000 today.",
  },

  // ── HAJIYA - M001 data ─────────────────────────────────────────────────────
  {
    id: "hajiya",
    name: "Hajiya Ramatu Musa",
    business: "Ramatu Farms & Produce",
    location: "Kaduna",
    avatar: "HR",
    score: 62,
    scoreLabel: "Fair",
    scoreColor: "#d97706",
    qualifiedAmount: 320000,
    loanEligible: true,
    // Real from CSV: M001 Feb 13–Mar 14 2026 = ₦2,008,312
    monthlyRevenue: "2.01M",
    // Real from CSV: ₦66,944 avg/day
    avgDailySales: "66.9k",
    // Real from CSV: 30 active days
    activeDays: 30,
    totalDays: 30,
    category: "Agriculture",
    // Derived from merchantfloat_dataset.csv: M_MED tier merchant profile
    avgSettlementDelayHours: 25,
    // Real weekly totals from M001 CSV data (Jan 20 – Mar 14 2026)
    weeklyData: [
      { week: "Wk 1", amount: 467277 },
      { week: "Wk 2", amount: 469294 },
      { week: "Wk 3", amount: 482272 },
      { week: "Wk 4", amount: 493064 },
      { week: "Wk 5", amount: 480545 },
      { week: "Wk 6", amount: 491434 },
      { week: "Wk 7", amount: 420208 },
      { week: "Wk 8", amount: 307760 },
    ],
    recentTransactions: [
      { date: "Today, 10:15 AM", description: "Tomatoes, market buyer", channel: "Opay Transfer", amount: 12000 },
      { date: "Mar 11, 2:00 PM", description: "Pepper and onions bulk", channel: "Zenith Bank Transfer", amount: 8400 },
      { date: "Mar 10, 11:30 AM", description: "Produce, Kaduna market", channel: "Moniepoint POS", amount: 19500 },
      { date: "Mar 8, 3:45 PM", description: "Farm supply payment", channel: "Opay Transfer", amount: 7200 },
      { date: "Mar 7, 9:00 AM", description: "Weekly market sales", channel: "Zenith Bank Transfer", amount: 14800 },
    ],
    connectedAccounts: [
      { bank: "Zenith Bank", type: "Savings", last4: "2290" },
      { bank: "Opay", type: "Wallet", last4: "5541" },
      { bank: "Moniepoint", type: "Business", last4: "7783" },
    ],
    story: "22 years of farming. Seasonal income. Needs capital before planting season.",
    scoreBreakdown: [
      { label: "Revenue Volume", score: 13, max: 25, detail: "₦2.01M/month" },
      { label: "Trading Consistency", score: 25, max: 25, detail: "30/30 days active" },
      { label: "Revenue Stability", score: 6, max: 10, detail: "14% variance - seasonal dip wks 7-8" },
      { label: "Refund Rate", score: 9, max: 20, detail: "4.6% - borderline for perishables" },
      { label: "Settlement Speed", score: 4, max: 10, detail: "~25h avg - slow" },
      { label: "Account Coverage", score: 5, max: 10, detail: "3 banks, 1 personal - partial picture" },
    ],
    scoreReasons: [
      { label: "₦2.01M processed this month", detail: "1,506 verified transactions - strong volume for a farm & produce business", positive: true },
      { label: "Refund rate 4.6%", detail: "69 refunds across 1,506 transactions - slightly above average but explainable for perishables", positive: false },
      { label: "Revenue dipping in recent weeks", detail: "Weeks 7-8 show a softening pattern typical of pre-planting season cashflow", positive: false },
      { label: "Consistent 30-day activity", detail: "Trading every day of the month shows business is operational and stable", positive: true },
      { label: "Settlement in ~25 hours", detail: "Funds take over a day to clear - ₦66k/day sitting idle. Float advance directly unlocks this trapped cash", positive: false },
    ],
    riskLevel: "Medium",
    growthPrediction: -4,
    aiRecommendations: [
      "Your revenue averaged ₦493k/week for 4 weeks before dipping. This is a seasonal pattern, not a business failure - and MerchantFloat accounts for it.",
      "Planting season is your highest revenue window. Deploying ₦320k now to purchase seeds and inputs will pay back within weeks of harvest.",
      "Connecting a second verified bank account will give us a fuller cashflow picture and could raise your score by 8 to 12 points next cycle.",
    ],
    riskFlags: [
      "Revenue softening in weeks 7–8. Seasonal pattern consistent with pre-planting period, not structural decline.",
    ],
    transactionCount: 1506,
    scoreSimulator: {
      scenarios: [
        { label: "Connect 1 more business account", detail: "Coverage: 5 → 8 out of 10", action: "Add your Firstbank or Access account", scoreGain: 3 },
        { label: "Reduce refund rate to 3%", detail: "Refund score: 9 → 15 out of 20", action: "Review your returns policy with buyers", scoreGain: 6 },
        { label: "Settle payments faster (target 12h)", detail: "Settlement: 4 → 7 out of 10", action: "Switch to daily settlement with your bank", scoreGain: 3 },
      ],
    },
    plainEnglishSummary: "Hajiya, you traded every single day for 30 days straight. ₦2 million came through your accounts and we counted 1,506 payments. A few too many customers returned goods - that pulled your score down a little. But your consistency is strong, and you still qualify for ₦320,000. We know planting season is coming.",
  },

  // ── TUNDE - M_LOW data ─────────────────────────────────────────────────────
  {
    id: "tunde",
    name: "Tunde Adeyemi",
    business: "Tunde Phone World",
    location: "Oshodi, Lagos",
    avatar: "TA",
    score: 29,
    scoreLabel: "High Risk",
    scoreColor: "#dc2626",
    qualifiedAmount: 0,
    loanEligible: false,
    // Real from CSV: M_LOW Feb 13–Mar 14 2026 = ₦988,329
    monthlyRevenue: "988k",
    // Real from CSV: ₦29,949 avg/day
    avgDailySales: "29.9k",
    activeDays: 22,
    totalDays: 30,
    category: "Electronics",
    // Derived from merchantfloat_dataset.csv: M_LOW tier merchant profile
    avgSettlementDelayHours: 40,
    // Real weekly totals from M_LOW CSV data (Jan 20 – Mar 14 2026)
    weeklyData: [
      { week: "Wk 1", amount: 177352 },
      { week: "Wk 2", amount: 213167 },
      { week: "Wk 3", amount: 202585 },
      { week: "Wk 4", amount: 169377 },
      { week: "Wk 5", amount: 177411 },
      { week: "Wk 6", amount: 231900 },
      { week: "Wk 7", amount: 264211 },
      { week: "Wk 8", amount: 143636 },
    ],
    recentTransactions: [
      { date: "Today, 3:45 PM", description: "Phone screen repair", channel: "Palmpay Transfer", amount: 3500 },
      { date: "Mar 10, 12:00 PM", description: "Accessory sale", channel: "Moniepoint POS", amount: 1800 },
      { date: "Mar 7, 2:30 PM", description: "Phone sale", channel: "Palmpay Transfer", amount: 28000 },
      { date: "Mar 3, 10:00 AM", description: "Repair service", channel: "Moniepoint POS", amount: 4500 },
      { date: "Feb 28, 5:00 PM", description: "Accessory sale", channel: "Palmpay Transfer", amount: 2200 },
    ],
    connectedAccounts: [
      { bank: "Moniepoint", type: "Business", last4: "6612" },
      { bank: "Palmpay", type: "Wallet", last4: "0934" },
    ],
    story: "High refund rate flagged. Customers returning goods at 11.8% - 7x the merchant average.",
    scoreBreakdown: [
      { label: "Revenue Volume", score: 6, max: 25, detail: "₦988k/month - low" },
      { label: "Trading Consistency", score: 18, max: 25, detail: "22/30 days - 8 gaps" },
      { label: "Revenue Stability", score: 2, max: 10, detail: "20% weekly variance - irregular" },
      { label: "Refund Rate", score: 0, max: 20, detail: "11.8% - critical" },
      { label: "Settlement Speed", score: 0, max: 10, detail: "~40h avg - worst tier" },
      { label: "Account Coverage", score: 3, max: 10, detail: "2 banks - incomplete picture" },
    ],
    scoreReasons: [
      { label: "Refund rate 11.8% - critical", detail: "Out of every 100 transactions, 11.8 are reversed. 7x the merchant average of 1.7%", positive: false },
      { label: "Revenue too low for requested amount", detail: "₦988k monthly across only 2 connected accounts. Cashflow cannot service the loan reliably", positive: false },
      { label: "Settlement takes ~40 hours", detail: "Almost 2 days for funds to clear - the highest delay in this cohort, compounding cashflow stress", positive: false },
      { label: "Only 2 accounts connected", detail: "Limited financial visibility. We may not be seeing the full picture of your cashflow", positive: false },
    ],
    riskLevel: "High",
    growthPrediction: -18,
    aiRecommendations: [
      "Your refund rate of 11.8% is the strongest barrier to approval. Resolving customer disputes and reducing returns will be the fastest path to re-qualification.",
      "Connect your remaining bank accounts so we can see your complete cashflow. A fuller picture often changes the outcome.",
      "Once your refund rate drops below 5% for two consecutive months, your score will likely cross the 50 threshold for approval.",
    ],
    riskFlags: [
      "Refund rate 11.8% - 7x above the merchant average of 1.7%",
      "4 settlement delays detected in last 30 days",
      "Only 2 of possible accounts connected - incomplete financial picture",
    ],
    transactionCount: 660,
    scoreSimulator: {
      scenarios: [
        { label: "Fix refund rate below 5%", detail: "Refund score: 0 → 11 out of 20", action: "Address the quality issues causing returns", scoreGain: 11 },
        { label: "Trade all 30 days next month", detail: "Consistency: 18 → 25 out of 25", action: "Eliminate the 8 inactive days this month", scoreGain: 7 },
        { label: "Connect 2 more accounts", detail: "Coverage: 3 → 10 out of 10", action: "Add Opay and GTBank accounts", scoreGain: 7 },
      ],
    },
    plainEnglishSummary: "Tunde, we looked at 8 weeks of your transactions. ₦988,000 came through your accounts. But nearly 1 in 8 customers returned goods - that is the main reason we cannot approve a loan right now. It is not forever. Get that number down and come back. We will be watching.",
  },
];
