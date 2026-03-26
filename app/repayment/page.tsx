"use client";

import { Suspense, useState, useEffect } from "react";
import { ArrowLeft, CheckCircle, Zap, Loader2, TrendingDown, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const merchantData: Record<string, {
  name: string;
  business: string;
  original: number;
  fee: number;
  totalRepayment: number;
  baseRepaid: number;
  avgDailyDeduction: number;
  estDaysLeft: number;
  deductions: { day: string; deducted: number; sales: number; auto: boolean }[];
}> = {
  emeka: {
    name: "Emeka Nwosu",
    business: "Emeka Cold Room & Storage",
    original: 750000,
    fee: 75000,
    totalRepayment: 825000,
    baseRepaid: 520000,
    avgDailyDeduction: 13430,
    estDaysLeft: 47,
    deductions: [
      { day: "Today",     deducted: 18119, sales: 181194, auto: true },
      { day: "Yesterday", deducted: 11476, sales: 114756, auto: true },
      { day: "Mar 12",    deducted: 13370, sales: 133702, auto: true },
      { day: "Mar 11",    deducted: 10266, sales: 102658, auto: true },
      { day: "Mar 10",    deducted: 13400, sales: 134001, auto: true },
      { day: "Mar 9",     deducted: 12021, sales: 120208, auto: true },
      { day: "Mar 8",     deducted: 18244, sales: 182443, auto: true },
    ],
  },
  hajiya: {
    name: "Hajiya Ramatu",
    business: "Ramatu Farms & Produce",
    original: 320000,
    fee: 32000,
    totalRepayment: 352000,
    baseRepaid: 86035,
    avgDailyDeduction: 6140,
    estDaysLeft: 39,
    deductions: [
      { day: "Today",     deducted: 5632, sales: 56315,  auto: true },
      { day: "Yesterday", deducted: 7755, sales: 77547,  auto: true },
      { day: "Mar 12",    deducted: 5993, sales: 59926,  auto: true },
      { day: "Mar 11",    deducted: 5961, sales: 59615,  auto: true },
      { day: "Mar 10",    deducted: 5436, sales: 54357,  auto: true },
      { day: "Mar 9",     deducted: 6249, sales: 62494,  auto: true },
      { day: "Mar 8",     deducted: 8067, sales: 80671,  auto: true },
    ],
  },
};

function fmt(n: number) {
  return "₦" + Math.round(n).toLocaleString("en-NG");
}

function RepaymentContent() {
  const searchParams = useSearchParams();
  const merchantId = searchParams.get("merchant") ?? "emeka";
  const paymentResult = searchParams.get("payment");
  const paymentRef  = searchParams.get("ref") ?? "";

  const d = merchantData[merchantId] ?? merchantData.emeka;

  const [extraRepaid, setExtraRepaid] = useState(0);
  const [loanId, setLoanId]           = useState<string | null>(null);
  const [payAmount, setPayAmount]     = useState(50000);
  const [loading, setLoading]         = useState(false);
  const [showAll, setShowAll]         = useState(false);
  const [payError, setPayError]       = useState("");

  useEffect(() => {
    setLoanId(sessionStorage.getItem(`loanId_${merchantId}`));
    if (paymentResult === "success") {
      const paid = Number(sessionStorage.getItem(`lastPayment_${merchantId}`) ?? 0);
      setExtraRepaid(paid);
    }
  }, [merchantId, paymentResult]);

  const totalRepaid  = d.baseRepaid + extraRepaid;
  const remaining    = Math.max(0, d.totalRepayment - totalRepaid);
  const pct          = Math.min(100, Math.round((totalRepaid / d.totalRepayment) * 100));
  const circumference = 2 * Math.PI * 52; // r=52

  // deductions list — prepend manual payment if just made
  const deductionRows = extraRepaid > 0
    ? [{ day: "Just now", deducted: extraRepaid, sales: 0, auto: false }, ...d.deductions]
    : d.deductions;
  const visibleRows = showAll ? deductionRows : deductionRows.slice(0, 4);

  async function handlePay() {
    setLoading(true);
    setPayError("");

    // Auto-create a loan for demo if none exists in session
    let activeLoanId = loanId;
    if (!activeLoanId) {
      try {
        const applyRes = await fetch("/api/loans/apply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ merchantId, amount: d.original }),
        });
        const applyData = await applyRes.json();
        if (applyRes.ok) {
          activeLoanId = applyData.loan.id;
          sessionStorage.setItem(`loanId_${merchantId}`, activeLoanId!);
          setLoanId(activeLoanId);
        }
      } catch {
        // continue — repay call will handle the error
      }
    }

    try {
      const res = await fetch(`/api/loans/${activeLoanId}/repay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountNaira: payAmount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      sessionStorage.setItem(`lastPayment_${merchantId}`, String(payAmount));
      const params = new URLSearchParams({
        merchant_code: data.merchantCode,
        pay_item_id:   data.payItemId,
        txn_ref:       data.txnRef,
        amount:        String(data.amountKobo),
        currency:      "566",
        site_redirect_url: `${window.location.origin}/api/payment/callback`,
        cust_name:     d.name,
        pay_item_name: "MerchantFloat Loan Repayment",
      });
      window.location.href = `/payment/checkout?${params.toString()}`;
    } catch (e) {
      setLoading(false);
      setPayError(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] font-sans">

      {/* ── Nav ── */}
      <nav className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <Link href="/dashboard" className="p-1.5 rounded-full hover:bg-gray-100">
          <ArrowLeft size={18} className="text-gray-600" />
        </Link>
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-900">Loan Repayment</p>
          <p className="text-xs text-gray-400">{d.business}</p>
        </div>
        <span className="text-xs font-bold text-green-700 bg-green-50 border border-green-100 px-3 py-1 rounded-full">
          On Track
        </span>
      </nav>

      <div className="max-w-md mx-auto px-4 pt-5 pb-10 space-y-3">

        {/* ── Payment confirmed banner ── */}
        {paymentResult === "success" && (
          <div className="bg-green-600 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Payment Confirmed</p>
              <p className="text-xs text-green-100 font-mono truncate max-w-[230px]">
                {paymentRef || "Verified via Interswitch"}
              </p>
            </div>
          </div>
        )}

        {/* ── Hero progress card ── */}
        <div className="rounded-2xl overflow-hidden shadow-lg"
          style={{ background: "linear-gradient(135deg, #166534 0%, #16a34a 60%, #22c55e 100%)" }}>

          {/* Top label */}
          <div className="px-5 pt-5 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-white/20 flex items-center justify-center">
                <span className="text-white text-xs font-black">M</span>
              </div>
              <span className="text-white/60 text-xs font-semibold tracking-wider uppercase">MerchantFloat</span>
            </div>
            <span className="text-xs text-green-300 font-semibold">{pct}% repaid</span>
          </div>

          {/* Circular progress + numbers */}
          <div className="flex items-center gap-5 px-5 py-4">
            {/* SVG ring */}
            <div className="relative flex-shrink-0">
              <svg width="120" height="120" viewBox="0 0 120 120">
                {/* Track */}
                <circle cx="60" cy="60" r="52"
                  fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="10" />
                {/* Progress */}
                <circle cx="60" cy="60" r="52"
                  fill="none" stroke="#4ade80" strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${(pct / 100) * circumference} ${circumference}`}
                  transform="rotate(-90 60 60)"
                  style={{ transition: "stroke-dasharray 1s ease" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-white">{pct}%</span>
                <span className="text-xs text-green-300">done</span>
              </div>
            </div>

            {/* Amounts */}
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-green-300 text-xs mb-0.5">Repaid</p>
                <p className="text-white text-2xl font-black leading-none">{fmt(totalRepaid)}</p>
              </div>
              <div className="h-px bg-white/10" />
              <div>
                <p className="text-green-300 text-xs mb-0.5">Remaining</p>
                <p className="text-white/80 text-xl font-bold leading-none">{fmt(remaining)}</p>
              </div>
            </div>
          </div>

          {/* Wide progress bar */}
          <div className="px-5 pb-2">
            <div className="w-full bg-white/10 rounded-full h-2">
              <div className="bg-green-400 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${pct}%` }} />
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 divide-x divide-white/10 border-t border-white/10 mt-3">
            {[
              { icon: <TrendingDown size={13} />, label: "Daily rate", value: "10%" },
              { icon: <Zap size={13} />,          label: "Avg daily",  value: fmt(d.avgDailyDeduction) },
              { icon: <Clock size={13} />,         label: "Est. days",  value: `~${d.estDaysLeft}` },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center py-3 gap-0.5">
                <span className="text-green-400">{s.icon}</span>
                <span className="text-white font-bold text-sm">{s.value}</span>
                <span className="text-green-300 text-xs">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Sandbox demo helper ── */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-3">
          <p className="text-xs font-bold text-blue-700">Sandbox Demo Tools</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {[
              ["Card", "5061 1203 1188 9893"],
              ["Expiry", "07/26"],
              ["CVV", "100"],
              ["PIN", "1111"],
              ["OTP", "123456"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-xs text-blue-500">{label}</span>
                <span className="text-xs font-mono font-bold text-blue-800">{value}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              const ref = `ISW-QT-${Date.now().toString(36).toUpperCase()}`;
              const prev = Number(sessionStorage.getItem(`lastPayment_${merchantId}`) ?? 0);
              sessionStorage.setItem(`lastPayment_${merchantId}`, String(prev + payAmount));
              window.location.href = `/repayment?merchant=${merchantId}&payment=success&ref=${ref}`;
            }}
            className="w-full bg-blue-600 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Simulate Payment Received (Demo)
          </button>
        </div>

        {/* ── Pay now card ── */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm font-bold text-gray-900 mb-1">Pay early, grow your limit</p>
          <p className="text-xs text-gray-400 mb-4">
            Every early payment boosts your credit score. Powered by Quickteller.
          </p>

          <div className="flex gap-2 mb-3">
            {[25000, 50000, 100000].map((amt) => (
              <button key={amt} onClick={() => setPayAmount(amt)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  payAmount === amt
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 text-gray-400 hover:bg-gray-50"
                }`}>
                {fmt(amt)}
              </button>
            ))}
          </div>

          <button onClick={handlePay} disabled={loading}
            className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Preparing...</>
              : <>Pay {fmt(payAmount)} Now <ChevronRight size={16} /></>
            }
          </button>

          {payError && (
            <p className="text-xs text-red-500 text-center mt-2">{payError}</p>
          )}
          {!loanId && !payError && (
            <p className="text-xs text-amber-500 text-center mt-2">
              Accept a loan on the dashboard to unlock payments
            </p>
          )}
        </div>

        {/* ── Deductions list ── */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <div className="px-4 pt-4 pb-3 border-b border-gray-50 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-900">Deductions</p>
              <p className="text-xs text-gray-400">Auto-deducted from your POS settlements</p>
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
              10% daily
            </span>
          </div>

          <div className="divide-y divide-gray-50">
            {visibleRows.map((row, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                    row.auto ? "bg-green-50" : "bg-blue-50"
                  }`}>
                    {row.auto
                      ? <TrendingDown size={14} className="text-green-500" />
                      : <Zap size={14} className="text-blue-500" />
                    }
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{row.day}</p>
                    <p className="text-xs text-gray-400">
                      {row.auto ? `Sales: ${fmt(row.sales)}` : "Manual payment"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-500">−{fmt(row.deducted)}</p>
                  {row.auto && (
                    <p className="text-xs text-gray-400">
                      {fmt(row.sales - row.deducted)} settled
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {deductionRows.length > 4 && (
            <button onClick={() => setShowAll(!showAll)}
              className="w-full py-3 text-xs font-semibold text-green-600 hover:bg-gray-50 transition-colors border-t border-gray-50">
              {showAll ? "Show less" : `View all ${deductionRows.length} deductions`}
            </button>
          )}
        </div>

        {/* ── Loan summary ── */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm font-bold text-gray-900 mb-3">Loan Summary</p>
          <div className="space-y-2.5">
            {[
              { label: "Loan amount",  value: fmt(d.original),        color: "text-gray-800" },
              { label: "Service fee",  value: fmt(d.fee),             color: "text-gray-800" },
              { label: "Total to pay", value: fmt(d.totalRepayment),  color: "text-gray-900 font-bold" },
              { label: "Repaid so far",value: fmt(totalRepaid),       color: "text-green-600 font-bold" },
            ].map((row, i) => (
              <div key={i} className={`flex justify-between text-sm ${i === 2 ? "pt-2 border-t border-gray-50" : ""}`}>
                <span className="text-gray-400">{row.label}</span>
                <span className={row.color}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default function RepaymentPage() {
  return <Suspense><RepaymentContent /></Suspense>;
}
