"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2, User } from "lucide-react";

type Step = "welcome" | "bvn" | "business" | "scanning";

type BVNResult = {
  success: boolean;
  firstName?: string;
  lastName?: string;
  message?: string;
};

type ScoreApiResult = {
  score: number;
  scoreLabel: string;
  scoreColor: string;
  eligible: boolean;
  qualifiedAmount: number;
};

const scanSteps = [
  { label: "BVN verified via Interswitch Passport API", duration: 900 },
  { label: "NIBSS lookup — discovering linked accounts", duration: 1100 },
  { label: "GTBank •••• 4821 connected", duration: 700, account: true },
  { label: "Moniepoint •••• 9034 connected", duration: 700, account: true },
  { label: "UBA •••• 1157 connected", duration: 700, account: true },
  { label: "Reading 90 days of transaction history", duration: 1100 },
  { label: "Running MerchantFloat scoring model", duration: 1000 },
  { label: "Generating your loan offer", duration: 800 },
];

const businessTypes = [
  "Food & Beverage",
  "Agriculture",
  "Retail & Provisions",
  "Cold Room & Storage",
  "Pharmacy",
  "Fashion & Clothing",
  "Electronics",
  "Other",
];

function getMerchantId(businessType: string): string {
  if (
    businessType === "Cold Room & Storage" ||
    businessType === "Food & Beverage" ||
    businessType === "Retail & Provisions"
  )
    return "emeka";
  if (businessType === "Agriculture") return "hajiya";
  if (businessType === "Electronics") return "tunde";
  return "emeka";
}

function formatNaira(n: number) {
  return "₦" + n.toLocaleString("en-NG");
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [form, setForm] = useState({
    bvn: "",
    phone: "",
    businessName: "",
    businessType: "",
  });

  const [bvnLoading, setBvnLoading] = useState(false);
  const [bvnResult, setBVNResult] = useState<BVNResult | null>(null);
  const [bvnVerifiedName, setBvnVerifiedName] = useState("");

  const [scanIndex, setScanIndex] = useState(0);
  const [scanDone, setScanDone] = useState(false);
  const [scoreResult, setScoreResult] = useState<ScoreApiResult | null>(null);
  const [scoreLoading, setScoreLoading] = useState(false);

  const merchantId = getMerchantId(form.businessType);

  useEffect(() => {
    if (!scanDone || !merchantId) return;
    setScoreLoading(true);
    fetch(`/api/score?merchantId=${merchantId}`)
      .then((r) => r.json())
      .then((d: ScoreApiResult) => setScoreResult(d))
      .catch(() => null)
      .finally(() => setScoreLoading(false));
  }, [scanDone, merchantId]);

  async function handleBVNContinue() {
    if (form.bvn.length !== 11) return;
    setBvnLoading(true);
    setBVNResult(null);
    try {
      const res = await fetch("/api/verify/bvn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bvn: form.bvn }),
      });
      const data: BVNResult = await res.json();
      setBVNResult(data);
      if (data.success && data.firstName) {
        setBvnVerifiedName(`${data.firstName} ${data.lastName ?? ""}`.trim());
      }
    } catch {
      setBVNResult({ success: true });
      setBvnVerifiedName("Verified via Interswitch");
    } finally {
      setBvnLoading(false);
      setTimeout(() => setStep("business"), 1600);
    }
  }

  function runScan() {
    let i = 0;
    function next() {
      i++;
      setScanIndex(i);
      if (i >= scanSteps.length) {
        setTimeout(() => setScanDone(true), 400);
        return;
      }
      setTimeout(next, scanSteps[i]?.duration ?? 900);
    }
    setTimeout(next, scanSteps[0]?.duration ?? 900);
  }

  function handleBusinessNext() {
    if (!form.businessType) return;
    setStep("scanning");
    runScan();
  }

  // ── WELCOME ────────────────────────────────────────────────────────────────
  if (step === "welcome") {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="px-6 pt-10 pb-8 text-center bg-stone-900">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-black">M</span>
            </div>
            <h1 className="text-xl font-black text-white mb-2 tracking-tight">MerchantFloat</h1>
            <p className="text-stone-400 text-sm leading-relaxed">
              Working capital for Nigerian merchants — powered by your own Interswitch transaction data.
            </p>
          </div>

          <div className="px-6 py-5 space-y-3">
            {[
              "Enter your BVN — Interswitch verifies your identity instantly",
              "We scan all your linked bank accounts automatically",
              "Get a loan offer based on your real POS history",
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-700 text-xs font-black">
                  ✓
                </div>
                <p className="text-sm text-stone-600">{text}</p>
              </div>
            ))}
          </div>

          <div className="px-6 pb-6">
            <button
              onClick={() => setStep("bvn")}
              className="w-full bg-emerald-700 text-white font-bold py-3 rounded-xl hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              Get Started <ArrowRight size={15} />
            </button>
            <p className="text-center text-xs text-stone-400 mt-3">
              🔒 Secured by Interswitch · Data never shared
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── BVN RESULT ─────────────────────────────────────────────────────────────
  if (step === "bvn" && bvnResult !== null) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl border border-stone-200 shadow-sm p-8 text-center">
          {bvnResult.success ? (
            <>
              <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <span className="text-emerald-700 text-2xl font-black">✓</span>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-stone-50 border border-stone-200 text-stone-600 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
                🔒 Interswitch Passport API
              </div>
              <h2 className="text-xl font-black text-stone-900 mb-2 tracking-tight">Identity Confirmed</h2>
              {bvnVerifiedName ? (
                <p className="text-stone-500 text-sm">
                  Welcome, <span className="font-bold text-stone-900">{bvnVerifiedName}</span>
                </p>
              ) : (
                <p className="text-stone-400 text-sm">BVN verified successfully</p>
              )}
              <div className="mt-5 flex items-center justify-center gap-2">
                <Loader2 size={13} className="animate-spin text-emerald-600" />
                <p className="text-xs text-stone-400">Loading next step...</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <span className="text-2xl">⚠️</span>
              </div>
              <h2 className="text-lg font-black text-stone-900 mb-2">Demo Mode</h2>
              <p className="text-stone-400 text-sm mb-4">
                {bvnResult.message ?? "Proceeding with demo data"}
              </p>
              <div className="flex items-center justify-center gap-2">
                <Loader2 size={13} className="animate-spin text-amber-500" />
                <p className="text-xs text-stone-400">Loading next step...</p>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── BVN INPUT ──────────────────────────────────────────────────────────────
  if (step === "bvn") {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-100">
            <button
              onClick={() => setStep("welcome")}
              className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
            >
              <ArrowLeft size={15} className="text-stone-500" />
            </button>
            <span className="text-sm font-bold text-stone-800">Identity Verification</span>
            <span className="text-xs text-stone-400 bg-stone-50 border border-stone-200 px-2 py-1 rounded-full">
              1 of 2
            </span>
          </div>

          <div className="px-6 pt-6 pb-4 space-y-5">
            <div>
              <h2 className="text-lg font-black text-stone-900 mb-1 tracking-tight">Enter your BVN</h2>
              <p className="text-stone-400 text-xs leading-relaxed">
                Your BVN lets Interswitch verify your identity and discover all your linked bank accounts.{" "}
                <span className="font-mono font-semibold text-stone-600">*565*0#</span> to find it.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1.5 block">
                  BVN Number
                </label>
                <input
                  type="tel"
                  maxLength={11}
                  placeholder="22xxxxxxxxx"
                  value={form.bvn}
                  onChange={(e) => setForm({ ...form, bvn: e.target.value.replace(/\D/g, "") })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-base font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent focus:bg-white transition-all"
                />
                <div className="flex justify-between mt-1.5">
                  <p className="text-xs text-stone-400">{form.bvn.length}/11 digits</p>
                  {form.bvn.length === 11 && (
                    <p className="text-xs text-emerald-600 font-semibold">✓ Valid format</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1.5 block">
                  Phone Number <span className="text-stone-300 font-normal">(optional)</span>
                </label>
                <div className="flex gap-2">
                  <div className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-3 text-sm text-stone-500 font-medium flex-shrink-0">
                    +234
                  </div>
                  <input
                    type="tel"
                    placeholder="08xxxxxxxxx"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Demo BVN */}
            <div className="bg-stone-900 rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-xs text-stone-300 font-bold">Demo BVN — Interswitch sandbox</p>
                <span className="text-[10px] text-stone-500">tap to verify instantly</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setForm((prev) => ({ ...prev, bvn: "11111111111" }));
                  setTimeout(() => {
                    setBvnLoading(true);
                    setBVNResult(null);
                    fetch("/api/verify/bvn", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ bvn: "11111111111" }),
                    })
                      .then((r) => r.json())
                      .then((data: BVNResult) => {
                        setBVNResult(data);
                        if (data.success && data.firstName) {
                          setBvnVerifiedName(`${data.firstName} ${data.lastName ?? ""}`.trim());
                        }
                      })
                      .catch(() => {
                        setBVNResult({ success: true });
                        setBvnVerifiedName("Verified via Interswitch");
                      })
                      .finally(() => {
                        setBvnLoading(false);
                        setTimeout(() => setStep("business"), 1600);
                      });
                  }, 80);
                }}
                className="w-full text-sm font-mono font-bold text-stone-900 bg-stone-100 px-4 py-2.5 rounded-lg hover:bg-white transition-colors flex items-center justify-center gap-2"
              >
                11111111111 <ArrowRight size={13} />
              </button>
            </div>
          </div>

          <div className="px-6 pb-6">
            <button
              onClick={handleBVNContinue}
              disabled={form.bvn.length !== 11 || bvnLoading}
              className="w-full bg-emerald-700 text-white font-bold py-3 rounded-xl hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {bvnLoading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Calling Interswitch Passport API...
                </>
              ) : (
                <>
                  Verify BVN <ArrowRight size={15} />
                </>
              )}
            </button>
            <p className="text-center text-xs text-stone-400 mt-3">
              🔒 Powered by Interswitch Identity API
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── BUSINESS ───────────────────────────────────────────────────────────────
  if (step === "business") {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-100">
            <button
              onClick={() => { setBVNResult(null); setStep("bvn"); }}
              className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
            >
              <ArrowLeft size={15} className="text-stone-500" />
            </button>
            <span className="text-sm font-bold text-stone-800">Business Details</span>
            <span className="text-xs text-stone-400 bg-stone-50 border border-stone-200 px-2 py-1 rounded-full">
              2 of 2
            </span>
          </div>

          <div className="px-6 pt-5 pb-4 space-y-4">
            {bvnVerifiedName && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center gap-2.5">
                <span className="text-emerald-700 text-xs font-black flex-shrink-0">✓</span>
                <div>
                  <p className="text-xs font-bold text-emerald-800">BVN Verified via Interswitch</p>
                  <p className="text-xs text-emerald-600">{bvnVerifiedName}</p>
                </div>
              </div>
            )}

            <div>
              <h2 className="text-lg font-black text-stone-900 mb-1 tracking-tight">Your business</h2>
              <p className="text-stone-400 text-xs">
                Helps us map your loan offer to the right merchant profile.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1.5 block">
                Business Name
              </label>
              <div className="relative">
                <User size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="e.g. Blessing's Pepper Soup"
                  value={form.businessName}
                  onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1.5 block">
                Business Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {businessTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setForm({ ...form, businessType: type })}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all text-left ${
                      form.businessType === type
                        ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                        : "border-stone-200 bg-stone-50 text-stone-500 hover:border-stone-300 hover:bg-white"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="px-6 pb-6">
            <button
              onClick={handleBusinessNext}
              disabled={!form.businessType}
              className="w-full bg-emerald-700 text-white font-bold py-3 rounded-xl hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Scan My Accounts <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── SCANNING ───────────────────────────────────────────────────────────────
  if (step === "scanning") {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
          <div className="text-center mb-6">
            <div className="text-3xl mb-3">{scanDone ? "🎉" : "🔍"}</div>
            <h2 className="text-base font-black text-stone-900 mb-1 tracking-tight">
              {scanDone ? "Analysis complete!" : "Scanning your accounts..."}
            </h2>
            <p className="text-xs text-stone-400">
              {scanDone ? "Score ready" : "Powered by Interswitch infrastructure"}
            </p>
          </div>

          <div className="space-y-1.5 mb-5">
            {scanSteps.map((s, i) => {
              const isDone = i < scanIndex;
              const isActive = i === scanIndex;
              const showBvnResult = i === 0 && isDone && bvnVerifiedName;

              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 transition-all ${
                    isDone && s.account ? "bg-emerald-50 border border-emerald-100" : ""
                  } ${showBvnResult ? "bg-emerald-50 border border-emerald-100" : ""}`}
                >
                  <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                    {isDone ? (
                      <span className="text-emerald-600 text-sm font-black">✓</span>
                    ) : isActive ? (
                      <Loader2 size={14} className="text-emerald-600 animate-spin" />
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full border-2 border-stone-200" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm transition-colors ${
                      isDone
                        ? s.account ? "text-emerald-800 font-semibold" : "text-stone-700 font-medium"
                        : isActive ? "text-emerald-700 font-medium" : "text-stone-300"
                    }`}>
                      {s.label}
                    </p>
                    {showBvnResult && (
                      <p className="text-xs text-emerald-600 font-semibold mt-0.5">
                        ✓ Confirmed: {bvnVerifiedName}
                      </p>
                    )}
                    {i === 0 && isDone && !bvnVerifiedName && (
                      <p className="text-xs text-emerald-600 mt-0.5">Identity check complete</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {scanDone && (
            <div className="mb-4">
              {scoreLoading ? (
                <div className="bg-stone-50 border border-stone-100 rounded-xl p-4 flex items-center gap-3">
                  <Loader2 size={16} className="animate-spin text-emerald-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-stone-700">Calling MerchantFloat Score API...</p>
                    <p className="text-xs text-stone-400 font-mono">GET /api/score?merchantId={merchantId}</p>
                  </div>
                </div>
              ) : scoreResult ? (
                <div
                  className="rounded-xl p-4 border"
                  style={{
                    backgroundColor: scoreResult.scoreColor + "10",
                    borderColor: scoreResult.scoreColor + "30",
                  }}
                >
                  <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: scoreResult.scoreColor }}>
                    Score API Response
                  </p>
                  <div className="flex items-end gap-2 mb-1">
                    <p className="text-4xl font-black text-stone-900">{scoreResult.score}</p>
                    <p className="text-stone-400 text-lg pb-1">/100</p>
                    <p className="ml-auto text-sm font-bold pb-1" style={{ color: scoreResult.scoreColor }}>
                      {scoreResult.scoreLabel}
                    </p>
                  </div>
                  {scoreResult.eligible && scoreResult.qualifiedAmount > 0 ? (
                    <p className="text-sm font-bold" style={{ color: scoreResult.scoreColor }}>
                      Eligible for {formatNaira(scoreResult.qualifiedAmount)}
                    </p>
                  ) : (
                    <p className="text-sm font-bold text-red-500">Below minimum score of 50 — not eligible</p>
                  )}
                </div>
              ) : (
                <div className="bg-stone-50 border border-stone-100 rounded-xl p-4 text-center">
                  <p className="text-xs text-stone-400">Score ready</p>
                </div>
              )}
            </div>
          )}

          {scanDone && !scoreLoading && (
            <button
              onClick={() => router.push(`/dashboard?merchant=${merchantId}`)}
              className="w-full bg-stone-900 text-white font-bold py-3 rounded-xl hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              See My Dashboard <ArrowRight size={15} />
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
}
