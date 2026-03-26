"use client";

import { useState, Suspense } from "react";
import { ArrowLeft, CheckCircle, Clock, TrendingDown, Shield, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function formatNaira(amount: number) {
  return "₦" + amount.toLocaleString("en-NG");
}

// Per-merchant loan data — all numbers derived from CSV
const loanData: Record<string, {
  name: string;
  amount: number;
  fee: number;
  totalRepayment: number;
  estimatedDays: number;
  activeDays: number;
  monthlyRevenue: string;
  monthlyRevenueRaw: number;
  transactions: number;
  refundRate: string;
  qualifyReasons: { label: string; detail: string }[];
  schedule: { day: string; sales: number; deduction: number; remaining: number }[];
  creditLadder: { amount: number; label: string }[];
}> = {
  emeka: {
    name: "Emeka Nwosu",
    amount: 750000,
    fee: 75000,
    totalRepayment: 825000,
    estimatedDays: 61,
    activeDays: 30,
    monthlyRevenue: "₦4.03M",
    monthlyRevenueRaw: 4030000,
    transactions: 3155,
    refundRate: "4.1%",
    qualifyReasons: [
      { label: "Active every single day", detail: "30 out of 30 days trading this month — zero gaps" },
      { label: "₦4.03M processed this month", detail: "3,155 verified transactions across GTBank, Moniepoint & UBA" },
      { label: "Refund rate 4.1%", detail: "129 refunds out of 3,155 transactions — well within safe range" },
    ],
    creditLadder: [
      { amount: 750000, label: "This loan" },
      { amount: 1200000, label: "After repayment" },
      { amount: 2000000, label: "2nd loan repaid" },
    ],
    // First 5 days of real M002 CSV data × 10%
    schedule: [
      { day: "Day 1", sales: 170180, deduction: 17018, remaining: 807982 },
      { day: "Day 2", sales: 117469, deduction: 11747, remaining: 796235 },
      { day: "Day 3", sales: 155972, deduction: 15597, remaining: 780638 },
      { day: "Day 4", sales: 148536, deduction: 14854, remaining: 765784 },
      { day: "Day 5", sales: 141499, deduction: 14150, remaining: 751634 },
    ],
  },
  hajiya: {
    name: "Hajiya Ramatu",
    amount: 320000,
    fee: 32000,
    totalRepayment: 352000,
    estimatedDays: 53,
    activeDays: 30,
    monthlyRevenue: "₦2.01M",
    monthlyRevenueRaw: 2010000,
    transactions: 1506,
    refundRate: "4.6%",
    qualifyReasons: [
      { label: "Active all 30 days this month", detail: "30 out of 30 days trading — consistent farm operations" },
      { label: "₦2.01M processed this month", detail: "1,506 verified transactions across Zenith, Opay & Moniepoint" },
      { label: "Seasonal pattern recognised", detail: "Revenue dip in weeks 7–8 flagged as seasonal, not structural risk" },
    ],
    creditLadder: [
      { amount: 320000, label: "This loan" },
      { amount: 500000, label: "After repayment" },
      { amount: 800000, label: "2nd loan repaid" },
    ],
    // First 5 days of real M001 CSV data × 10%
    schedule: [
      { day: "Day 1", sales: 68861, deduction: 6886, remaining: 345114 },
      { day: "Day 2", sales: 63523, deduction: 6352, remaining: 338762 },
      { day: "Day 3", sales: 63263, deduction: 6326, remaining: 332436 },
      { day: "Day 4", sales: 60699, deduction: 6070, remaining: 326366 },
      { day: "Day 5", sales: 52347, deduction: 5235, remaining: 321131 },
    ],
  },
};

function LoanContent() {
  const [step, setStep] = useState<"review" | "confirm" | "success">("review");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const merchantId = searchParams.get("merchant") ?? "emeka";
  const offer = loanData[merchantId] ?? loanData.emeka;

  async function handleAcceptLoan() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/loans/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchantId, amount: offer.amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create loan");
      // Store loanId so repayment page can retrieve it
      sessionStorage.setItem(`loanId_${merchantId}`, data.loan.id);
      setStep("success");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (step === "success") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loan Approved!</h2>
          <p className="text-gray-500 text-sm mb-1">
            <span className="text-green-600 font-bold text-lg">{formatNaira(offer.amount)}</span> has been sent to your account
          </p>
          <p className="text-gray-400 text-xs mb-6">Repayment starts automatically from your next POS settlement</p>

          <div className="bg-green-50 rounded-xl p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Amount disbursed</span>
              <span className="font-semibold text-gray-900">{formatNaira(offer.amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Daily deduction</span>
              <span className="font-semibold text-gray-900">10% of daily sales</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Est. payoff</span>
              <span className="font-semibold text-gray-900">~{offer.estimatedDays} days</span>
            </div>
          </div>

          <Link
            href={`/repayment?merchant=${merchantId}`}
            className="block w-full bg-green-600 text-white font-semibold py-3 rounded-xl text-center hover:bg-green-700 transition-colors mb-3"
          >
            Track Repayment
          </Link>
          <Link href="/dashboard" className="block text-sm text-gray-400 hover:text-gray-600">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (step === "confirm") {
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        <nav className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
          <button onClick={() => setStep("review")} className="p-1.5 rounded-full hover:bg-gray-100">
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
          <span className="font-semibold text-gray-900 text-sm">Confirm Loan</span>
        </nav>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">You are accepting</p>
            <p className="text-4xl font-bold text-gray-900 mb-4">{formatNaira(offer.amount)}</p>

            <div className="space-y-3 border-t border-gray-50 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Loan amount</span>
                <span className="font-semibold text-gray-900">{formatNaira(offer.amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Service fee (10%)</span>
                <span className="font-semibold text-gray-900">{formatNaira(offer.fee)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-gray-50 pt-3">
                <span className="text-gray-700 font-medium">Total to repay</span>
                <span className="font-bold text-gray-900">{formatNaira(offer.totalRepayment)}</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
            <p className="text-sm font-semibold text-amber-800 mb-1">How repayment works</p>
            <p className="text-xs text-amber-700 leading-relaxed">
              10% of your daily POS sales will be automatically deducted before settlement reaches your account.
              On a {formatNaira(offer.schedule[0].sales)} day that is just {formatNaira(offer.schedule[0].deduction)} deducted.
              You still receive {formatNaira(offer.schedule[0].sales - offer.schedule[0].deduction)}.
            </p>
          </div>

          {error && (
            <p className="text-red-500 text-xs text-center">{error}</p>
          )}
          <button
            onClick={handleAcceptLoan}
            disabled={loading}
            className="w-full bg-green-600 text-white font-semibold py-4 rounded-xl hover:bg-green-700 transition-colors text-base flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Processing...</>
            ) : (
              <>Accept {formatNaira(offer.amount)} Loan</>
            )}
          </button>
          <button
            onClick={() => setStep("review")}
            className="w-full text-gray-400 text-sm py-2 hover:text-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <Link href="/dashboard" className="p-1.5 rounded-full hover:bg-gray-100">
          <ArrowLeft size={18} className="text-gray-600" />
        </Link>
        <span className="font-semibold text-gray-900 text-sm">Your Loan Offer</span>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Offer Card */}
        <div className="rounded-2xl bg-gradient-to-br from-green-600 to-green-700 p-5 text-white shadow-lg">
          <p className="text-green-100 text-sm mb-1">Approved for</p>
          <p className="text-5xl font-bold tracking-tight mb-1">{formatNaira(offer.amount)}</p>
          <p className="text-green-100 text-xs mb-3">Based on 90 days of verified POS activity — {offer.name}</p>
          <div className="bg-white/15 rounded-xl px-3 py-2 flex items-center justify-between">
            <span className="text-green-100 text-xs">Loan vs. your monthly revenue</span>
            <span className="text-white font-bold text-sm">
              {((offer.amount / offer.monthlyRevenueRaw) * 100).toFixed(1)}% of {offer.monthlyRevenue}
            </span>
          </div>
        </div>

        {/* Why you qualify */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm font-semibold text-gray-700 mb-3">Why you qualify</p>
          <div className="space-y-2.5">
            {offer.qualifyReasons.map((r, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                  {i === 0 ? <CheckCircle size={15} className="text-green-600" /> :
                   i === 1 ? <TrendingDown size={15} className="text-green-600" /> :
                   <Shield size={15} className="text-green-600" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{r.label}</p>
                  <p className="text-xs text-gray-400">{r.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Repayment Plan */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-4 pt-4 pb-3 border-b border-gray-50">
            <p className="text-sm font-semibold text-gray-900">Repayment Plan</p>
            <p className="text-xs text-gray-400 mt-0.5">10% deducted from each daily settlement</p>
          </div>
          <div className="px-4 py-3 grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-1">
                <Clock size={16} className="text-blue-600" />
              </div>
              <p className="text-base font-bold text-gray-900">~{offer.estimatedDays}</p>
              <p className="text-xs text-gray-400">Days to repay</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-1">
                <TrendingDown size={16} className="text-green-600" />
              </div>
              <p className="text-base font-bold text-gray-900">10%</p>
              <p className="text-xs text-gray-400">Daily deduction</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-1">
                <Shield size={16} className="text-purple-600" />
              </div>
              <p className="text-base font-bold text-gray-900">{formatNaira(offer.totalRepayment)}</p>
              <p className="text-xs text-gray-400">Total repayment</p>
            </div>
          </div>

          <div className="border-t border-gray-50">
            <p className="text-xs text-gray-400 px-4 py-2">Sample repayment schedule</p>
            <div className="divide-y divide-gray-50">
              {offer.schedule.map((row, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs text-gray-500 w-12">{row.day}</span>
                  <span className="text-xs text-gray-400">Sales {formatNaira(row.sales)}</span>
                  <span className="text-xs font-medium text-red-500">-{formatNaira(row.deduction)}</span>
                  <span className="text-xs font-semibold text-gray-700">{formatNaira(row.remaining)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Credit Ladder */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm font-semibold text-gray-900 mb-1">Your credit ladder</p>
          <p className="text-xs text-gray-400 mb-5">Repay on time — each loan unlocks the next</p>
          <div className="relative">
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-100" />
            <div className="relative flex justify-between">
              {offer.creditLadder.map((rung, i) => (
                <div key={i} className="flex flex-col items-center gap-2 z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0
                      ? "bg-green-600 text-white shadow-md shadow-green-200"
                      : "bg-gray-100 text-gray-400"
                  }`}>
                    {i === 0 ? "NOW" : `L${i + 1}`}
                  </div>
                  <div className="text-center">
                    <p className={`text-xs font-bold ${i === 0 ? "text-green-600" : "text-gray-400"}`}>
                      {formatNaira(rung.amount)}
                    </p>
                    <p className="text-[10px] text-gray-400">{rung.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Repayment model explainer */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
          <p className="text-sm font-semibold text-gray-900">How we collect repayment</p>
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle size={14} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Auto-deducted from your daily settlement</p>
              <p className="text-xs text-gray-400 leading-relaxed">10% is removed before funds reach your account. You never need to manually transfer anything.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle size={14} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">No guarantors. No contacts called. Ever.</p>
              <p className="text-xs text-gray-400 leading-relaxed">We collect from your sales data — not from your family or phone contacts. Your personal life stays out of it.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle size={14} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Slow month? You pay less</p>
              <p className="text-xs text-gray-400 leading-relaxed">Deductions are 10% of actual daily sales. If you sell less, you repay less that day. The loan adjusts to your business.</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setStep("confirm")}
          className="w-full bg-green-600 text-white font-semibold py-4 rounded-xl hover:bg-green-700 transition-colors text-base flex items-center justify-center gap-2"
        >
          Get This Loan <ChevronRight size={18} />
        </button>
        <Link href="/dashboard" className="block text-center text-sm text-gray-400 hover:text-gray-600 pb-6">
          Maybe later
        </Link>
      </div>
    </div>
  );
}

export default function LoanPage() {
  return <Suspense><LoanContent /></Suspense>;
}
