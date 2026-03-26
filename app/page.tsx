import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fafaf9] font-sans">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#fafaf9]/80 backdrop-blur-xl border-b border-stone-200/60">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-700 flex items-center justify-center shadow-sm">
              <span className="text-white text-xs font-black">M</span>
            </div>
            <span className="font-bold text-stone-900 text-sm tracking-tight">MerchantFloat</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="text-xs text-stone-500 hover:text-stone-800 font-medium px-3 py-1.5 rounded-lg hover:bg-stone-100 transition-colors">
              Live Demo
            </Link>
            <Link href="/onboarding"
              className="bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-emerald-800 transition-colors shadow-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-24 px-6">
        <div className="max-w-2xl mx-auto">

          <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-full mb-8">
            <Zap size={10} fill="currentColor" />
            Built on Interswitch infrastructure
          </div>

          <h1 className="text-5xl sm:text-6xl font-black text-stone-900 leading-[1.05] tracking-tight mb-6">
            Your POS machine<br />
            <span className="text-emerald-700">is your credit score.</span>
          </h1>

          <p className="text-stone-500 text-base leading-relaxed mb-9 max-w-xl">
            We read 90 days of your Interswitch POS history, generate a credit score in seconds, and offer working capital with zero collateral. Repayment auto-deducts from your daily settlement.
          </p>

          <div className="flex items-center gap-3 mb-14">
            <Link href="/onboarding"
              className="bg-stone-900 text-white font-bold px-6 py-3 rounded-lg hover:bg-stone-800 transition-colors flex items-center gap-2 text-sm shadow-sm">
              Check My Score <ArrowRight size={14} />
            </Link>
            <Link href="/dashboard"
              className="text-stone-600 font-semibold px-6 py-3 rounded-lg border border-stone-200 hover:border-stone-300 hover:bg-white transition-all text-sm">
              View Demo
            </Link>
          </div>

          <div className="flex items-center gap-8 pt-6 border-t border-stone-200">
            {[
              { value: "60 sec", label: "Loan decision" },
              { value: "₦0", label: "Collateral" },
              { value: "41M+", label: "Eligible merchants" },
            ].map((s, i) => (
              <div key={i}>
                <p className="text-xl font-black text-stone-900">{s.value}</p>
                <p className="text-xs text-stone-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-stone-200 mx-6" />

      {/* How it works */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-2">How it works</p>
            <h2 className="text-2xl font-black text-stone-900 tracking-tight">From BVN to cash in 60 seconds.</h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                step: "01",
                title: "Enter your BVN",
                desc: "Interswitch Passport verifies your identity and links all your bank accounts in one tap."
              },
              {
                step: "02",
                title: "We score your POS data",
                desc: "Our engine reads 90 days of Quickteller transactions across all accounts and wallets."
              },
              {
                step: "03",
                title: "Receive your offer",
                desc: "Accept your loan and funds arrive same day. 10% auto-deducted from each daily settlement."
              },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-stone-200 shadow-sm">
                <p className="text-xs font-black text-stone-200 mb-4">{s.step}</p>
                <p className="text-sm font-bold text-stone-900 mb-2">{s.title}</p>
                <p className="text-xs text-stone-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Score visualiser callout */}
      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-stone-900 rounded-2xl p-8 sm:p-10 overflow-hidden relative">
            {/* Background grid */}
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "32px 32px"
            }} />

            <div className="relative sm:flex items-center justify-between gap-8">
              <div className="mb-6 sm:mb-0 max-w-sm">
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3">Credit Score Engine</p>
                <h3 className="text-xl sm:text-2xl font-black text-white mb-3 leading-tight">
                  Six signals. One transparent score.
                </h3>
                <p className="text-stone-400 text-sm leading-relaxed">
                  No black box. Every point is explainable. Merchants can see exactly what to improve to qualify next cycle.
                </p>
              </div>

              <div className="flex-shrink-0 space-y-2 w-full sm:w-64">
                {[
                  { label: "Revenue Volume", pts: 25, fill: 88 },
                  { label: "Trading Consistency", pts: 25, fill: 72 },
                  { label: "Refund Rate", pts: 20, fill: 90 },
                  { label: "Settlement Speed", pts: 10, fill: 70 },
                  { label: "Revenue Stability", pts: 10, fill: 60 },
                  { label: "Account Coverage", pts: 10, fill: 50 },
                ].map((sig, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-xs text-stone-400 truncate">{sig.label}</p>
                        <p className="text-xs text-stone-500 ml-2 flex-shrink-0">{sig.pts}pts</p>
                      </div>
                      <div className="h-1 bg-stone-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${sig.fill}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Merchant stories */}
      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-2">Real outcomes</p>
            <h2 className="text-2xl font-black text-stone-900 tracking-tight">Three merchants. Three stories.</h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                initials: "EN",
                name: "Emeka Nwosu",
                biz: "Cold Room, Mile 12 Market",
                score: 85,
                color: "#059669",
                bg: "#ecfdf5",
                result: "₦750,000 approved",
                tag: "Approved",
                desc: "Processes ₦4M per month. 30 active trading days. Rock solid settlement speed."
              },
              {
                initials: "HR",
                name: "Hajiya Ramatu",
                biz: "Farm Produce, Kaduna",
                score: 62,
                color: "#d97706",
                bg: "#fffbeb",
                result: "₦320,000 approved",
                tag: "Approved",
                desc: "30 years of trading. Seasonal dip before planting season. Approved on consistency, not just volume."
              },
              {
                initials: "TA",
                name: "Tunde Adeyemi",
                biz: "Electronics, Oshodi",
                score: 29,
                color: "#dc2626",
                bg: "#fef2f2",
                result: "Not approved yet",
                tag: "Declined",
                desc: "High refund rate flagged. Score simulator shows exactly what to fix to qualify next cycle."
              },
            ].map((m, i) => (
              <div key={i} className="bg-white rounded-xl p-5 border border-stone-200 shadow-sm flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: m.color }}>
                    {m.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-stone-900 truncate">{m.name}</p>
                    <p className="text-xs text-stone-400 truncate">{m.biz}</p>
                  </div>
                </div>

                <p className="text-xs text-stone-500 leading-relaxed mb-4 flex-1">{m.desc}</p>

                <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full" style={{ background: m.color }} />
                    <span className="text-xs font-bold" style={{ color: m.color }}>Score {m.score}</span>
                  </div>
                  <span className="text-xs font-semibold text-stone-500">{m.result}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why it works */}
      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="sm:flex gap-12 items-start">
            <div className="sm:w-1/3 mb-8 sm:mb-0">
              <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-2">The edge</p>
              <h2 className="text-2xl font-black text-stone-900 tracking-tight leading-tight">
                Built for how merchants actually operate.
              </h2>
            </div>
            <div className="sm:w-2/3 grid grid-cols-1 gap-2">
              {[
                "Reads transactions from GTBank, Moniepoint, Opay, Palmpay and 20+ more",
                "Zero collateral or guarantors required",
                "Repayment auto-deducted from daily settlement — no phone calls",
                "Credit score grows with every repayment cycle",
                "Loan decision in under 60 seconds",
                "Built on Interswitch payment infrastructure",
              ].map((point, i) => (
                <div key={i} className="flex items-start gap-3 py-3 border-b border-stone-100 last:border-0">
                  <span className="text-emerald-600 text-xs font-black flex-shrink-0 mt-0.5">✓</span>
                  <p className="text-sm text-stone-600">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Market scale */}
      <section className="mx-6 mb-20 rounded-2xl bg-emerald-700 px-8 py-12 sm:px-12">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold text-emerald-300 uppercase tracking-widest mb-4">The opportunity</p>
          <h2 className="text-xl sm:text-2xl font-black text-white mb-2 max-w-xl leading-snug">
            ₦18 trillion flows through Nigerian POS terminals every year.
          </h2>
          <p className="text-emerald-200/70 text-sm mb-10 max-w-md">
            Nobody is lending against this data. MerchantFloat is the first product to turn Interswitch settlement data into instant credit decisions.
          </p>
          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-emerald-600">
            {[
              { value: "41M+", label: "Informal merchants in Nigeria" },
              { value: "1%", label: "410,000 merchants we can serve in year one" },
              { value: "₦300B+", label: "Potential loan book at ₦750k average" },
            ].map((s, i) => (
              <div key={i}>
                <p className="text-2xl sm:text-3xl font-black text-white">{s.value}</p>
                <p className="text-xs text-emerald-300/70 mt-1 leading-relaxed">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mb-3 tracking-tight">
            Your POS machine has been building your credit score the whole time.
          </h2>
          <p className="text-stone-400 text-sm mb-8 leading-relaxed">
            We just started reading it. Takes less than 60 seconds. No collateral required.
          </p>
          <Link href="/onboarding"
            className="bg-stone-900 text-white font-bold px-7 py-3.5 rounded-xl hover:bg-stone-800 transition-colors inline-flex items-center gap-2 text-sm shadow-lg shadow-stone-200">
            Get Your Loan Offer <ArrowRight size={15} />
          </Link>
          <p className="text-xs text-stone-400 mt-4">Powered by Interswitch</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 py-6 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-700 flex items-center justify-center">
              <span className="text-white text-xs font-black">M</span>
            </div>
            <span className="text-sm font-bold text-stone-700">MerchantFloat</span>
          </div>
          <p className="text-xs text-stone-400">Powered by Interswitch</p>
        </div>
      </footer>

    </div>
  );
}
