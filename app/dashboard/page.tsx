"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import {
  TrendingUp, TrendingDown, Wallet, Calendar,
  ChevronRight, Bell, Users, ShieldAlert, Sparkles, Building2, Shield
} from "lucide-react";
import Link from "next/link";
import { merchants, type Merchant } from "@/lib/merchants";

function formatNaira(amount: number) {
  return "₦" + amount.toLocaleString("en-NG");
}

function useCountUp(target: number, duration = 1400) {
  const [value, setValue] = useState(0);
  const prev = useRef(target);

  useEffect(() => {
    setValue(0);
    prev.current = target;
    const start = performance.now();
    const tick = (now: number) => {
      if (prev.current !== target) return;
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);

  return value;
}

function AnimatedScoreGauge({ score, color }: { score: number; color: string }) {
  const [animated, setAnimated] = useState(false);
  const animatedScore = useCountUp(animated ? score : 0, 1200);

  useEffect(() => {
    setAnimated(false);
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, [score]);

  const circumference = Math.PI * 54;
  const progress = (animatedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="140" height="80" viewBox="0 0 140 80">
        <path d="M 14 74 A 56 56 0 0 1 126 74" fill="none" stroke="#e7e5e4" strokeWidth="10" strokeLinecap="round" />
        <path
          d="M 14 74 A 56 56 0 0 1 126 74"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          style={{ transition: "stroke-dasharray 0.05s linear" }}
        />
        <text x="70" y="66" textAnchor="middle" fontSize="26" fontWeight="800" fill={color}>
          {animatedScore}
        </text>
      </svg>
      <span className="text-xs text-stone-400 -mt-2">Credit Score</span>
      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: color + "18", color }}>
        {score >= 70 ? "Good Standing" : score >= 50 ? "Fair" : "High Risk"}
      </span>
    </div>
  );
}

function PremiumLoanCard({ merchant, onDetails }: { merchant: Merchant; onDetails?: () => void }) {
  const animatedAmount = useCountUp(merchant.loanEligible ? merchant.qualifiedAmount : 0, 1600);

  if (!merchant.loanEligible) {
    return (
      <div className="rounded-2xl p-5 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1c0000 0%, #7f1d1d 100%)" }}>
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-white/20 flex items-center justify-center">
                <span className="text-white text-xs font-black">M</span>
              </div>
              <span className="text-white/50 text-xs font-bold tracking-wider uppercase">MerchantFloat</span>
            </div>
            <ShieldAlert size={16} className="text-red-300" />
          </div>
          <p className="text-red-200 text-xs mb-1">Loan Application</p>
          <p className="text-3xl font-black mb-3 tracking-tight">Not Approved</p>
          <p className="text-red-200/80 text-xs leading-relaxed mb-4">
            Score of {merchant.score} is below the minimum of 50. See Insights for how to improve.
          </p>
          <div className="bg-white/10 rounded-xl px-4 py-2.5 flex items-center justify-between">
            <p className="text-white/60 text-xs">Minimum needed</p>
            <p className="text-white font-bold text-sm">Score 50</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-5 text-white relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #052e16 0%, #14532d 60%, #166534 100%)" }}>
      <div className="absolute top-0 right-0 w-56 h-56 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #86efac 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
      <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #4ade80 0%, transparent 70%)", transform: "translate(-30%, 30%)" }} />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-white/20 flex items-center justify-center">
              <span className="text-white text-xs font-black">M</span>
            </div>
            <span className="text-white/50 text-xs font-bold tracking-wider uppercase">MerchantFloat</span>
          </div>
          <div className="w-8 h-6 rounded bg-gradient-to-br from-yellow-300 to-yellow-500 opacity-80" />
        </div>

        <p className="text-white/60 text-xs font-medium mb-1 uppercase tracking-wider">You qualify for</p>
        <p className="text-4xl font-black tracking-tight mb-1">{formatNaira(animatedAmount)}</p>
        <p className="text-emerald-300/80 text-xs mb-5">Based on 90 days of verified transaction activity</p>

        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-white/40 text-xs">Merchant</p>
            <p className="text-white text-sm font-bold">{merchant.name}</p>
          </div>
          <div className="text-right">
            <p className="text-white/40 text-xs">Score</p>
            <p className="text-white text-sm font-black">{merchant.score} / 100</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/loan?merchant=${merchant.id}`}
            className="flex-1 bg-white font-black text-sm py-3 rounded-xl text-center hover:opacity-90 transition-opacity"
            style={{ color: "#052e16" }}
          >
            Get This Loan
          </Link>
          <button onClick={onDetails} className="px-4 py-3 rounded-xl border border-white/20 text-white text-sm font-semibold hover:bg-white/10 transition-colors">
            Details
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: string; sub: string; color: string;
}) {
  return (
    <div className="bg-white rounded-xl p-3.5 border border-stone-200 shadow-sm">
      <div className="flex items-center gap-1.5 mb-2">
        <div className={`w-6 h-6 rounded-lg ${color} flex items-center justify-center`}>{icon}</div>
        <span className="text-xs text-stone-400">{label}</span>
      </div>
      <p className="text-sm font-black text-stone-900">{value}</p>
      <p className="text-xs text-stone-400 mt-0.5">{sub}</p>
    </div>
  );
}

function MerchantSwitcher({ current, onSelect, onClose }: {
  current: Merchant; onSelect: (m: Merchant) => void; onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl rounded-t-2xl p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
        <div className="w-8 h-1 bg-stone-200 rounded-full mx-auto mb-3" />
        <div className="flex items-center justify-between">
          <p className="text-sm font-black text-stone-900">Switch Merchant</p>
          <button onClick={onClose} className="text-xs text-stone-400 hover:text-stone-600">Close</button>
        </div>
        <p className="text-xs text-stone-400">Switch between merchant profiles to see how scoring works.</p>
        {merchants.map((m) => (
          <button
            key={m.id}
            onClick={() => { onSelect(m); onClose(); }}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
              current.id === m.id ? "border-emerald-500 bg-emerald-50" : "border-stone-100 bg-white hover:bg-stone-50"
            }`}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0"
              style={{ background: m.scoreColor }}>{m.avatar}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-stone-900">{m.name}</p>
              <p className="text-xs text-stone-400 truncate">{m.business} · {m.location}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-black" style={{ color: m.scoreColor }}>
                {m.loanEligible ? formatNaira(m.qualifiedAmount) : "Rejected"}
              </p>
              <p className="text-xs text-stone-400">Score {m.score}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

type Tab = "overview" | "insights" | "transactions";

function DashboardContent() {
  const searchParams = useSearchParams();
  const merchantParam = searchParams.get("merchant");
  const initialMerchant = merchants.find((m) => m.id === merchantParam) ?? merchants[0];

  const [merchant, setMerchant] = useState<Merchant>(initialMerchant);
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [simChecked, setSimChecked] = useState([false, false, false]);
  const activeDaysCount = useCountUp(merchant.activeDays, 1000);

  const simGain = merchant.scoreSimulator.scenarios.reduce(
    (acc, s, i) => acc + (simChecked[i] ? s.scoreGain : 0), 0
  );
  const projectedScore = Math.min(100, merchant.score + simGain);

  function projectedLoan(score: number) {
    if (score >= 80) return "₦750,000";
    if (score >= 70) return "₦500,000";
    if (score >= 60) return "₦320,000";
    if (score >= 50) return "₦150,000";
    return null;
  }

  const riskStyle: Record<string, string> = {
    Low: "bg-emerald-50 text-emerald-700 border-emerald-100",
    Medium: "bg-amber-50 text-amber-700 border-amber-100",
    High: "bg-red-50 text-red-600 border-red-100",
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] font-sans">

      {/* API Status Strip */}
      <div className="bg-stone-900 px-4 py-1.5 flex items-center justify-center gap-6 overflow-x-auto">
        {[
          "Quickteller Live",
          "Webhook Active",
          "Score API Ready",
        ].map((label) => (
          <div key={label} className="flex items-center gap-1.5 flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-stone-400 text-[10px] font-semibold">{label}</span>
            <span className="text-emerald-500 text-[10px]">✓</span>
          </div>
        ))}
        <span className="text-stone-600 text-[10px] font-mono flex-shrink-0 hidden sm:block">powered by Interswitch</span>
      </div>

      {/* Nav */}
      <nav className="bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-700 flex items-center justify-center">
            <span className="text-white text-xs font-black">M</span>
          </div>
          <span className="font-black text-stone-900 text-sm tracking-tight">MerchantFloat</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative p-1.5 rounded-lg hover:bg-stone-100 transition-colors">
            <Bell size={17} className="text-stone-500" />
            <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black cursor-pointer"
            style={{ background: merchant.scoreColor }}
            onClick={() => setShowSwitcher(true)}
          >
            {merchant.avatar}
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 pt-5 pb-2">
        {/* Greeting */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-xl font-black text-stone-900 tracking-tight">
              {(() => {
                const h = new Date().getHours();
                return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
              })()}, {merchant.name.split(" ")[0]} 👋
            </h1>
            <p className="text-sm text-stone-400 mt-0.5">{merchant.business} · {merchant.location}</p>
          </div>
          <button
            onClick={() => setShowSwitcher(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors"
          >
            <Users size={11} /> Switch
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-stone-100 rounded-xl p-1 mb-5">
          {(["overview", "insights", "transactions"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg capitalize transition-all ${
                tab === t ? "bg-white text-stone-900 shadow-sm" : "text-stone-400 hover:text-stone-600"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-10 space-y-3">

        {/* OVERVIEW */}
        {tab === "overview" && (
          <>
            <PremiumLoanCard merchant={merchant} onDetails={() => setTab("insights")} />

            {/* POS data insight */}
            <div className="rounded-xl p-4 border border-stone-200 bg-white shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-black text-stone-900">Your POS history is your credit score</p>
                  <p className="text-[10px] text-stone-400 mt-0.5">Score built from verified Interswitch transaction data</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0">
                  <Shield size={8} /> ISW verified
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-stone-50 rounded-xl p-2.5 text-center border border-stone-100">
                  <p className="text-lg font-black text-stone-900">{merchant.transactionCount.toLocaleString()}</p>
                  <p className="text-[10px] text-stone-400 leading-tight mt-0.5">Transactions<br />verified</p>
                </div>
                <div className={`rounded-xl p-2.5 text-center border ${merchant.activeDays === merchant.totalDays ? "bg-emerald-50 border-emerald-100" : "bg-amber-50 border-amber-100"}`}>
                  <p className="text-lg font-black text-stone-900">{merchant.activeDays}/{merchant.totalDays}</p>
                  <p className="text-[10px] text-stone-400 leading-tight mt-0.5">Days<br />active</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-2.5 text-center border border-blue-100">
                  <p className="text-lg font-black text-stone-900">{merchant.connectedAccounts.length}</p>
                  <p className="text-[10px] text-stone-400 leading-tight mt-0.5">Banks<br />connected</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <StatCard icon={<Wallet size={13} className="text-blue-600" />} color="bg-blue-50"
                label="This Month" value={`₦${merchant.monthlyRevenue}`} sub="Total Sales" />
              <StatCard icon={<TrendingUp size={13} className="text-emerald-700" />} color="bg-emerald-50"
                label="Daily Avg" value={`₦${merchant.avgDailySales}`} sub="Per Day" />
              <StatCard icon={<Calendar size={13} className="text-purple-600" />} color="bg-purple-50"
                label="Active Days" value={`${activeDaysCount}/${merchant.totalDays}`} sub="This Month" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm flex flex-col items-center justify-center gap-2">
                <AnimatedScoreGauge score={merchant.score} color={merchant.scoreColor} />
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${riskStyle[merchant.riskLevel]}`}>
                  {merchant.riskLevel} Risk
                </span>
              </div>
              <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm flex flex-col gap-3">
                <p className="text-xs font-bold text-stone-500">Weekly Sales</p>
                <ResponsiveContainer width="100%" height={80}>
                  <BarChart data={merchant.weeklyData} barSize={8}>
                    <XAxis dataKey="week" tick={{ fontSize: 8, fill: "#a8a29e" }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip formatter={(v) => [formatNaira(Number(v)), "Sales"]}
                      contentStyle={{ fontSize: 11, borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                    <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                      {merchant.weeklyData.map((_, i) => (
                        <Cell key={i} fill={i === merchant.weeklyData.length - 1 ? merchant.scoreColor : merchant.scoreColor + "40"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-1.5 bg-stone-50 rounded-xl px-3 py-2 border border-stone-100">
                  {merchant.growthPrediction >= 0
                    ? <TrendingUp size={12} className="text-emerald-700 flex-shrink-0" />
                    : <TrendingDown size={12} className="text-red-500 flex-shrink-0" />}
                  <p className="text-xs text-stone-500">
                    <span className="font-black" style={{ color: merchant.growthPrediction >= 0 ? "#059669" : "#dc2626" }}>
                      {merchant.growthPrediction >= 0 ? "+" : ""}{merchant.growthPrediction}%
                    </span>{" "}next month
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* INSIGHTS */}
        {tab === "insights" && (
          <>
            {/* Plain English summary */}
            <div className="rounded-xl p-5 border border-stone-200 bg-white shadow-sm">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                  style={{ background: merchant.scoreColor }}>
                  {merchant.avatar}
                </div>
                <div>
                  <p className="text-xs font-black text-stone-900">Here is what your data says</p>
                  <p className="text-[10px] text-stone-400">In plain English</p>
                </div>
                <span className="ml-auto text-xs font-black px-2 py-1 rounded-full flex-shrink-0"
                  style={{ background: merchant.scoreColor + "18", color: merchant.scoreColor }}>
                  {merchant.score}/100
                </span>
              </div>
              <p className="text-sm text-stone-700 leading-relaxed">
                {merchant.plainEnglishSummary}
              </p>
            </div>

            {/* Score breakdown */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="px-4 pt-4 pb-3 border-b border-stone-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-stone-900">Score Breakdown</p>
                  <p className="text-xs text-stone-400 mt-0.5">How your {merchant.score}/100 is calculated</p>
                </div>
                <span className="text-xs font-black px-2 py-1 rounded-full" style={{ background: merchant.scoreColor + "18", color: merchant.scoreColor }}>
                  {merchant.score} / 100
                </span>
              </div>
              <div className="px-4 py-3 space-y-3">
                {merchant.scoreBreakdown.map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-stone-700">{item.label}</span>
                      <span className="text-xs text-stone-400">{item.score}/{item.max} · {item.detail}</span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all duration-700"
                        style={{
                          width: `${(item.score / item.max) * 100}%`,
                          background: item.score / item.max >= 0.7 ? "#059669" : item.score / item.max >= 0.4 ? "#f59e0b" : "#ef4444"
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Score Simulator */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="px-4 pt-4 pb-3 border-b border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Sparkles size={13} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-stone-900">What would improve your score?</p>
                    <p className="text-xs text-stone-400">Tap each to simulate</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-stone-400">Projected</p>
                  <p className="text-xl font-black" style={{
                    color: projectedScore >= 70 ? "#059669" : projectedScore >= 50 ? "#d97706" : "#dc2626"
                  }}>
                    {projectedScore}
                  </p>
                </div>
              </div>
              <div className="px-4 py-3 space-y-2">
                {merchant.scoreSimulator.scenarios.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (s.scoreGain === 0) return;
                      const next = [...simChecked];
                      next[i] = !next[i];
                      setSimChecked(next);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      s.scoreGain === 0
                        ? "border-stone-100 bg-stone-50 opacity-50 cursor-default"
                        : simChecked[i]
                        ? "border-emerald-300 bg-emerald-50"
                        : "border-stone-100 bg-stone-50 hover:bg-stone-100"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      simChecked[i] ? "border-emerald-600 bg-emerald-600" : "border-stone-300 bg-white"
                    }`}>
                      {simChecked[i] && <span className="text-white text-[10px] font-black">✓</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-stone-800">{s.label}</p>
                      <p className="text-xs text-stone-400">{s.detail}</p>
                    </div>
                    {s.scoreGain > 0 && (
                      <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex-shrink-0">
                        +{s.scoreGain}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              {simGain > 0 && (
                <div className={`mx-4 mb-4 rounded-xl p-3 border ${
                  !merchant.loanEligible && projectedScore >= 50
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-blue-50 border-blue-100"
                }`}>
                  {!merchant.loanEligible && projectedScore >= 50 ? (
                    <p className="text-sm font-black text-emerald-800">
                      You would qualify. Score {projectedScore}/100 unlocks ₦150,000.
                    </p>
                  ) : (
                    <p className="text-sm font-bold text-blue-800">
                      Score {merchant.score} → {projectedScore} · Loan offer: {projectedLoan(projectedScore) ?? "not yet"}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Why approved/declined */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="px-4 pt-4 pb-3 border-b border-stone-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-stone-900">
                    {merchant.loanEligible ? "Why you qualify" : "Why you were declined"}
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">Score breakdown from your Interswitch transaction data</p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Shield size={9} /> ISW data
                </span>
              </div>
              {merchant.scoreReasons.map((r, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3 border-b border-stone-50 last:border-0">
                  <span className="text-base mt-0.5">{r.positive ? "✅" : "⚠️"}</span>
                  <div>
                    <p className="text-sm font-bold text-stone-800">{r.label}</p>
                    <p className="text-xs text-stone-400 mt-0.5">{r.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Recommendations */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="px-4 pt-4 pb-3 border-b border-stone-100 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Sparkles size={13} className="text-purple-500" />
                </div>
                <div>
                  <p className="text-sm font-black text-stone-900">AI Recommendations</p>
                  <p className="text-xs text-stone-400">Personalised insights from your data</p>
                </div>
              </div>
              {merchant.aiRecommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3 border-b border-stone-50 last:border-0">
                  <div className="w-5 h-5 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-600 text-xs font-black">{i + 1}</span>
                  </div>
                  <p className="text-sm text-stone-600 leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>

            {/* Risk flags */}
            {merchant.riskFlags.length > 0 ? (
              <div className="bg-red-50 border border-red-100 rounded-xl overflow-hidden">
                <div className="px-4 pt-4 pb-3 border-b border-red-100 flex items-center gap-2">
                  <ShieldAlert size={14} className="text-red-500" />
                  <p className="text-sm font-black text-red-800">Risk Flags Detected</p>
                </div>
                {merchant.riskFlags.map((flag, i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-3 border-b border-red-100 last:border-0">
                    <span className="text-red-400 mt-0.5">⚑</span>
                    <p className="text-sm text-red-700">{flag}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center gap-3">
                <span className="text-xl">✅</span>
                <div>
                  <p className="text-sm font-black text-emerald-800">No risk flags detected</p>
                  <p className="text-xs text-emerald-600 mt-0.5">Your transaction history looks clean</p>
                </div>
              </div>
            )}
          </>
        )}

        {/* TRANSACTIONS */}
        {tab === "transactions" && (
          <>
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="px-4 pt-4 pb-3 border-b border-stone-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-stone-900">Connected Accounts</p>
                  <p className="text-xs text-stone-400 mt-0.5">All inflows read via Open Banking</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                    ISW verified ✓
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                    {merchant.connectedAccounts.length} live
                  </span>
                </div>
              </div>
              {merchant.connectedAccounts.map((acc, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-stone-50 last:border-0">
                  <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0">
                    <Building2 size={14} className="text-stone-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-stone-800">{acc.bank}</p>
                    <p className="text-xs text-stone-400">{acc.type} · •••• {acc.last4}</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">Live</span>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-stone-100">
                <p className="text-sm font-black text-stone-900">Recent Transactions</p>
                <button className="text-xs text-emerald-700 font-bold flex items-center gap-0.5">
                  View all <ChevronRight size={13} />
                </button>
              </div>
              {merchant.recentTransactions.map((tx, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-stone-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <Wallet size={14} className="text-emerald-700" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-stone-800">{tx.description}</p>
                      <p className="text-xs text-stone-400">{tx.channel} · {tx.date}</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-emerald-700">+{formatNaira(tx.amount)}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {showSwitcher && (
        <MerchantSwitcher
          current={merchant}
          onSelect={(m) => { setMerchant(m); setTab("overview"); setSimChecked([false, false, false]); }}
          onClose={() => setShowSwitcher(false)}
        />
      )}
    </div>
  );
}

export default function Dashboard() {
  return <Suspense><DashboardContent /></Suspense>;
}
