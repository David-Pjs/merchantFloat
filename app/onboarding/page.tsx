"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle, Loader2, User, Shield, Zap } from "lucide-react";

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

  // BVN verification state
  const [bvnLoading, setBvnLoading] = useState(false);
  const [bvnResult, setBVNResult] = useState<BVNResult | null>(null);
  const [bvnVerifiedName, setBvnVerifiedName] = useState("");

  // Scanning state
  const [scanIndex, setScanIndex] = useState(0);
  const [scanDone, setScanDone] = useState(false);
  const [scoreResult, setScoreResult] = useState<ScoreApiResult | null>(null);
  const [scoreLoading, setScoreLoading] = useState(false);

  const merchantId = getMerchantId(form.businessType);

  // After scan animation finishes, call the real score API
  useEffect(() => {
    if (!scanDone || !merchantId) return;
    setScoreLoading(true);
    fetch(`/api/score?merchantId=${merchantId}`)
      .then((r) => r.json())
      .then((d: ScoreApiResult) => setScoreResult(d))
      .catch(() => null)
      .finally(() => setScoreLoading(false));
  }, [scanDone, merchantId]);

  // ── Verify BVN via Interswitch Passport API ────────────────────────────────
  // This is called when user clicks "Verify BVN" on the BVN step.
  // We call the real Interswitch API FIRST, show the result, then advance.
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
      // API unavailable — treat as verified for demo continuity
      setBVNResult({ success: true });
      setBvnVerifiedName("Verified via Interswitch");
    } finally {
      setBvnLoading(false);
      // Auto-advance to business step after showing result
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
    if (!form.businessName || !form.businessType) return;
    setStep("scanning");
    runScan();
  }

  // ── WELCOME ────────────────────────────────────────────────────────────────
  if (step === "welcome") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div
            className="px-6 pt-10 pb-8 text-center"
            style={{ background: "linear-gradient(135deg, #14532d 0%, #166534 100%)" }}
          >
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-3xl font-black">M</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">MerchantFloat</h1>
            <p className="text-green-100 text-sm leading-relaxed">
              Working capital for Nigerian merchants — powered by your own Interswitch transaction data.
            </p>
          </div>

          <div className="px-6 py-5 space-y-3.5">
            {[
              "Enter your BVN — Interswitch verifies your identity instantly",
              "We scan all your linked bank accounts automatically",
              "Get a loan offer based on your real POS history",
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 text-green-600 text-sm font-bold">
                  ✓
                </div>
                <p className="text-sm text-gray-600">{text}</p>
              </div>
            ))}
          </div>

          <div className="px-6 pb-6">
            <button
              onClick={() => setStep("bvn")}
              className="w-full bg-green-600 text-white font-semibold py-3.5 rounded-2xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              Get Started <ArrowRight size={16} />
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">
              🔒 Secured by Interswitch · Data never shared
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── BVN ────────────────────────────────────────────────────────────────────
  if (step === "bvn") {
    // Show Interswitch API result while auto-advancing
    if (bvnResult !== null) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
            {bvnResult.success ? (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
                <div className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
                  <Shield size={11} />
                  Interswitch Passport API
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Identity Confirmed</h2>
                {bvnVerifiedName ? (
                  <p className="text-gray-500 text-base">
                    Welcome,{" "}
                    <span className="font-bold text-gray-900">{bvnVerifiedName}</span>
                  </p>
                ) : (
                  <p className="text-gray-400 text-sm">BVN verified successfully</p>
                )}
                <div className="mt-5 flex items-center justify-center gap-2">
                  <Loader2 size={14} className="animate-spin text-green-500" />
                  <p className="text-xs text-gray-400">Loading next step...</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <span className="text-3xl">⚠️</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Demo Mode</h2>
                <p className="text-gray-400 text-sm mb-2">
                  {bvnResult.message ?? "Proceeding with demo data"}
                </p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <Loader2 size={14} className="animate-spin text-amber-500" />
                  <p className="text-xs text-gray-400">Loading next step...</p>
                </div>
              </>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <button
              onClick={() => setStep("welcome")}
              className="p-1.5 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft size={16} className="text-gray-500" />
            </button>
            <div className="flex items-center gap-1.5">
              <span className="text-green-600 text-xs">🔒</span>
              <span className="text-sm font-semibold text-gray-700">Identity Verification</span>
            </div>
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
              1 of 2
            </span>
          </div>

          <div className="px-6 pt-6 pb-4">
            <div className="text-4xl mb-4">🪪</div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Enter your BVN</h2>
            <p className="text-gray-400 text-xs mb-5 leading-relaxed">
              Your BVN lets Interswitch verify your identity and discover all your linked bank
              accounts.{" "}
              <span className="font-mono font-semibold text-gray-600">*565*0#</span> to find it.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
                  BVN Number
                </label>
                <input
                  type="tel"
                  maxLength={11}
                  placeholder="22xxxxxxxxx"
                  value={form.bvn}
                  onChange={(e) =>
                    setForm({ ...form, bvn: e.target.value.replace(/\D/g, "") })
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white transition-all"
                />
                <div className="flex justify-between mt-1.5">
                  <p className="text-xs text-gray-400">{form.bvn.length}/11 digits</p>
                  {form.bvn.length === 11 && (
                    <p className="text-xs text-green-500 font-medium">✓ Valid format</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
                  Phone Number <span className="text-gray-300 font-normal">(optional)</span>
                </label>
                <div className="flex gap-2">
                  <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-500 font-medium flex-shrink-0">
                    +234
                  </div>
                  <input
                    type="tel"
                    placeholder="08xxxxxxxxx"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Sandbox hint */}
            <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-blue-600 font-medium">Demo BVN (Interswitch sandbox)</p>
                <span className="text-[10px] text-blue-400">tap to verify instantly</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setForm((prev) => ({ ...prev, bvn: "11111111111" }));
                  // slight delay so state updates before the verify call reads it
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
                className="w-full text-sm font-mono font-bold text-white bg-blue-600 px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                11111111111 <ArrowRight size={14} />
              </button>
            </div>
          </div>

          <div className="px-6 pb-6">
            <button
              onClick={handleBVNContinue}
              disabled={form.bvn.length !== 11 || bvnLoading}
              className="w-full bg-green-600 text-white font-semibold py-3.5 rounded-2xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {bvnLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Calling Interswitch Passport API...
                </>
              ) : (
                <>
                  Verify BVN <ArrowRight size={16} />
                </>
              )}
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <button
              onClick={() => {
                setBVNResult(null);
                setStep("bvn");
              }}
              className="p-1.5 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft size={16} className="text-gray-500" />
            </button>
            <span className="text-sm font-semibold text-gray-700">Business Details</span>
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
              2 of 2
            </span>
          </div>

          <div className="px-6 pt-5 pb-4">
            {/* Show BVN verified name if we got it */}
            {bvnVerifiedName && (
              <div className="mb-4 bg-green-50 border border-green-100 rounded-xl p-3 flex items-center gap-2">
                <span className="text-green-600 text-sm font-bold flex-shrink-0">✓</span>
                <div>
                  <p className="text-xs font-bold text-green-700">BVN Verified via Interswitch</p>
                  <p className="text-xs text-green-600">{bvnVerifiedName}</p>
                </div>
              </div>
            )}

            <div className="text-4xl mb-4">🏪</div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Your business</h2>
            <p className="text-gray-400 text-xs mb-5">
              Helps us map your loan offer to the right merchant profile.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
                  Business Name
                </label>
                <div className="relative">
                  <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="e.g. Blessing's Pepper Soup"
                    value={form.businessName}
                    onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
                  Business Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {businessTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setForm({ ...form, businessType: type })}
                      className={`py-2.5 px-3 rounded-xl text-xs font-medium border transition-all text-left ${
                        form.businessType === type
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300 hover:bg-white"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 pb-6">
            <button
              onClick={handleBusinessNext}
              disabled={!form.businessName || !form.businessType}
              className="w-full bg-green-600 text-white font-semibold py-3.5 rounded-2xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Scan My Accounts <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── SCANNING ───────────────────────────────────────────────────────────────
  if (step === "scanning") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">{scanDone ? "🎉" : "🔍"}</div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              {scanDone ? "Analysis complete!" : "Scanning your accounts..."}
            </h2>
            <div className="flex items-center justify-center gap-1.5">
              <Zap size={11} className="text-green-600" />
              <p className="text-xs text-gray-400">
                {scanDone ? "Score ready" : "Powered by Interswitch infrastructure"}
              </p>
            </div>
          </div>

          {/* Scan steps */}
          <div className="space-y-2 mb-5">
            {scanSteps.map((s, i) => {
              const isDone = i < scanIndex;
              const isActive = i === scanIndex;
              // First step: show the real BVN API result
              const showBvnResult = i === 0 && isDone && bvnVerifiedName;

              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 transition-all ${
                    isDone && s.account ? "bg-green-50 border border-green-100" : ""
                  } ${showBvnResult ? "bg-green-50 border border-green-100" : ""}`}
                >
                  <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                    {isDone ? (
                      <CheckCircle size={15} className="text-green-500" />
                    ) : isActive ? (
                      <Loader2 size={15} className="text-green-400 animate-spin" />
                    ) : (
                      <div className="w-3 h-3 rounded-full border-2 border-gray-200" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm transition-colors ${
                        isDone
                          ? s.account
                            ? "text-green-700 font-semibold"
                            : "text-gray-700 font-medium"
                          : isActive
                          ? "text-green-600 font-medium"
                          : "text-gray-300"
                      }`}
                    >
                      {s.label}
                    </p>
                    {showBvnResult && (
                      <p className="text-xs text-green-600 font-semibold mt-0.5">
                        ✓ Confirmed: {bvnVerifiedName}
                      </p>
                    )}
                    {i === 0 && isDone && !bvnVerifiedName && (
                      <p className="text-xs text-green-600 mt-0.5">Identity check complete</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Score result from API — shown after scan + API call */}
          {scanDone && (
            <div className="mb-4">
              {scoreLoading ? (
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-center gap-3">
                  <Loader2 size={18} className="animate-spin text-green-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      Calling MerchantFloat Score API...
                    </p>
                    <p className="text-xs text-gray-400">GET /api/score?merchantId={merchantId}</p>
                  </div>
                </div>
              ) : scoreResult ? (
                <div
                  className="rounded-2xl p-4 border"
                  style={{
                    backgroundColor: scoreResult.scoreColor + "10",
                    borderColor: scoreResult.scoreColor + "30",
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={14} style={{ color: scoreResult.scoreColor }} />
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: scoreResult.scoreColor }}>
                      Score API Response
                    </p>
                  </div>
                  <div className="flex items-end gap-2 mb-1">
                    <p className="text-4xl font-black text-gray-900">{scoreResult.score}</p>
                    <p className="text-gray-400 text-lg font-normal pb-1">/100</p>
                    <p
                      className="ml-auto text-sm font-bold pb-1"
                      style={{ color: scoreResult.scoreColor }}
                    >
                      {scoreResult.scoreLabel}
                    </p>
                  </div>
                  {scoreResult.eligible && scoreResult.qualifiedAmount > 0 ? (
                    <p className="text-sm font-semibold" style={{ color: scoreResult.scoreColor }}>
                      Eligible for {formatNaira(scoreResult.qualifiedAmount)}
                    </p>
                  ) : (
                    <p className="text-sm font-semibold text-red-500">
                      Below minimum score of 50 — not eligible
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center">
                  <p className="text-xs text-gray-400">Score ready</p>
                </div>
              )}
            </div>
          )}

          {/* CTA — only show after score is loaded */}
          {scanDone && !scoreLoading && (
            <button
              onClick={() => router.push(`/dashboard?merchant=${merchantId}`)}
              className="w-full bg-green-600 text-white font-semibold py-3.5 rounded-2xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              See My Dashboard <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
}
