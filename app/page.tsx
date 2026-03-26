import Link from "next/link";
import { ArrowRight, Zap, Shield, BarChart2, CheckCircle, ChevronRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-green-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">M</span>
            </div>
            <span className="font-bold text-gray-900">MerchantFloat</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-800 font-medium">
              Demo
            </Link>
            <Link
              href="/onboarding"
              className="bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-green-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-16 px-4" style={{ background: "linear-gradient(180deg, #f0faf4 0%, #ffffff 100%)" }}>
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-100 border border-green-200 text-green-700 text-xs font-bold px-4 py-2 rounded-full mb-8">
            <Zap size={11} className="text-green-600" />
            Extends Quickteller by Interswitch
          </div>
          <h1 className="text-5xl sm:text-7xl font-black text-gray-900 leading-[1.05] mb-6 tracking-tight">
            Your POS data
            <br />
            <span className="text-green-600">is your credit score</span>
          </h1>
          <p className="text-gray-500 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
            Emeka sells ₦4M of produce a month but waits 40 hours for his money. We give it to him early — and collect automatically from his next Quickteller settlement.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/onboarding"
              className="bg-green-600 text-white font-bold px-8 py-4 rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-200 flex items-center justify-center gap-2">
              Get Your Loan Offer <ArrowRight size={16} />
            </Link>
            <Link href="/dashboard"
              className="bg-white border-2 border-gray-200 text-gray-700 font-bold px-8 py-4 rounded-2xl hover:border-green-300 hover:text-green-700 transition-all flex items-center justify-center gap-2">
              View Demo <ChevronRight size={16} />
            </Link>
          </div>
          <p className="text-xs text-gray-400 mt-5">Takes less than 60 seconds · No collateral required</p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 bg-gray-50 border-y border-gray-100">
        <p className="text-xs font-semibold text-green-600 text-center uppercase tracking-widest mb-6">The opportunity</p>
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-4 text-center">
          {[
            { value: "< 60 sec", label: "Target approval time — no branch visits, no paperwork" },
            { value: "41M+", label: "Informal merchants in Nigeria with no access to credit" },
            { value: "₦2.4T", label: "Annual credit gap in Nigeria's merchant sector" },
          ].map((s, i) => (
            <div key={i}>
              <p className="text-2xl sm:text-4xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Merchant stories */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold text-green-600 text-center uppercase tracking-widest mb-2">Real merchants. Real problems.</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">
            The people this is built for
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { avatar: "EN", name: "Emeka Nwosu", biz: "Cold Room, Mile 12", story: "Processes ₦4M/month through Quickteller. Waits 10 hours for settlement. Needed ₦750k to fix his fridge — got it in 60 seconds.", score: 85, color: "#16a34a", result: "Approved ₦750,000" },
              { avatar: "HR", name: "Hajiya Ramatu", biz: "Farms & Produce, Kano", story: "30 years of farming. Consistent trader. Seasonal revenue dip before planting season left her short ₦320k. Approved based on 90 days of data.", score: 66, color: "#f59e0b", result: "Approved ₦320,000" },
              { avatar: "TO", name: "Tunde Ogundele", biz: "Electronics, Lagos", story: "11.8% refund rate — nearly 1 in 8 customers returning goods. Low score protects both Tunde and the system. Told exactly what to fix.", score: 29, color: "#ef4444", result: "Not approved — yet" },
            ].map((m, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: m.color }}>{m.avatar}</div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{m.name}</p>
                    <p className="text-xs text-gray-400">{m.biz}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed mb-4">{m.story}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: m.color + "15", color: m.color }}>Score {m.score}</span>
                  <span className="text-xs font-semibold text-gray-600">{m.result}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold text-green-600 text-center uppercase tracking-widest mb-2">How it works</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2">
            From sign up to cash in 60 seconds
          </h2>
          <p className="text-sm text-gray-400 text-center mb-12 max-w-md mx-auto">
            No paperwork, no branch visits, no waiting. Just your BVN and your transaction history.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                icon: <Shield size={20} className="text-green-600" />,
                title: "Verify with BVN",
                desc: "Enter your BVN. We verify your identity and discover all your linked bank accounts instantly.",
              },
              {
                step: "02",
                icon: <BarChart2 size={20} className="text-green-600" />,
                title: "AI analyses your data",
                desc: "Our engine reads your full cashflow across every bank and wallet. Moniepoint, GTBank, Opay and more.",
              },
              {
                step: "03",
                icon: <Zap size={20} className="text-green-600" />,
                title: "Get your offer",
                desc: "See your credit score, risk level, and loan offer in real time. Accept and receive funds instantly.",
              },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">{s.icon}</div>
                  <span className="text-xs font-bold text-gray-300">{s.step}</span>
                </div>
                <p className="text-sm font-bold text-gray-900 mb-2">{s.title}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why MerchantFloat */}
      <section className="py-20 px-4 bg-gray-50 border-y border-gray-100">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold text-green-600 text-center uppercase tracking-widest mb-2">The difference</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2">
            Built for how merchants actually get paid
          </h2>
          <p className="text-sm text-gray-400 text-center mb-12">
            Most lenders only see your POS data from one provider. We see your complete financial picture.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              "Reads transactions from GTBank, Moniepoint, Opay, Palmpay and more",
              "No collateral or guarantors required",
              "Repayment auto-deducted from daily settlements",
              "Credit score improves with every repayment",
              "Loan decision in under 60 seconds",
              "Powered by Interswitch payment infrastructure",
            ].map((point, i) => (
              <div key={i} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-gray-100">
                <CheckCircle size={15} className="text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scale */}
      <section className="py-16 px-4 bg-gray-900">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-semibold text-green-400 uppercase tracking-widest mb-4">The opportunity at scale</p>
          <h2 className="text-2xl sm:text-4xl font-black text-white mb-4">
            ₦18 trillion flows through Nigerian POS terminals every year.
          </h2>
          <p className="text-green-300 text-base mb-10 max-w-xl mx-auto">
            Nobody is lending against this data. MerchantFloat is the first product to turn Interswitch settlement data into instant credit decisions.
          </p>
          <div className="grid grid-cols-3 gap-6">
            {[
              { value: "41M+", label: "Informal merchants in Nigeria" },
              { value: "1%", label: "= 410,000 merchants we can serve in year one" },
              { value: "₦300B+", label: "Potential loan book at ₦750k average" },
            ].map((s, i) => (
              <div key={i}>
                <p className="text-2xl sm:text-3xl font-black text-green-400">{s.value}</p>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Business model */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold text-green-600 text-center uppercase tracking-widest mb-2">Business Model</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2">
            Good for merchants. Great for Interswitch.
          </h2>
          <p className="text-sm text-gray-400 text-center mb-12 max-w-md mx-auto">
            Every loan generates fee revenue for MerchantFloat and increases transaction volume through Interswitch rails.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: "Loan fee", value: "10% flat", sub: "₦750k loan = ₦75k fee. No hidden charges, no interest rate confusion." },
              { label: "Repayment via Quickteller", value: "Auto-deducted", sub: "10% of daily POS settlement goes to repayment — zero collection risk." },
              { label: "Interswitch upside", value: "More volume", sub: "Every loan increases merchant POS activity — more transactions through Interswitch rails." },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
                <p className="text-2xl font-black text-green-600 mb-1">{item.value}</p>
                <p className="text-sm font-bold text-gray-900 mb-2">{item.label}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Ready to get your offer?
          </h2>
          <p className="text-gray-400 text-sm mb-8 leading-relaxed">
            41 million Nigerian merchants have no access to credit. MerchantFloat changes that — using data Interswitch already holds.
          </p>
          <Link
            href="/onboarding"
            className="bg-green-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-green-700 transition-colors inline-flex items-center gap-2"
          >
            Get Started Free <ArrowRight size={18} />
          </Link>
          <p className="text-xs text-gray-400 mt-4">Takes less than 60 seconds</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-green-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">M</span>
            </div>
            <span className="text-sm font-bold text-gray-700">MerchantFloat</span>
          </div>
          <p className="text-xs text-gray-400">Powered by Interswitch</p>
        </div>
      </footer>
    </div>
  );
}
