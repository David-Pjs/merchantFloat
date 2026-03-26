"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, AlertCircle, ExternalLink } from "lucide-react";

// ── Interswitch inline checkout type declaration ──────────────────────────────
// Source-confirmed from https://newwebpay.qa.interswitchng.com/inline-checkout.js
declare global {
  interface Window {
    webpayCheckout: (config: {
      merchant_code: string;
      pay_item_id: string;
      txn_ref: string;
      amount: string | number;
      currency: string | number;
      site_redirect_url: string;
      hash?: string;
      onComplete: (response: Record<string, string>) => void;
      onClose?: () => void;
    }) => void;
  }
}

// Sandbox inline checkout script
const ISW_INLINE_SCRIPT = "https://newwebpay.qa.interswitchng.com/inline-checkout.js";

function CheckoutContent() {
  const searchParams = useSearchParams();

  // Params forwarded from /repayment → /api/loans/[id]/repay
  const merchantCode   = searchParams.get("merchant_code") ?? process.env.NEXT_PUBLIC_INTERSWITCH_MERCHANT_CODE ?? "";
  const payItemId      = searchParams.get("pay_item_id")   ?? process.env.NEXT_PUBLIC_INTERSWITCH_PAY_ITEM_ID  ?? "";
  const txnRef         = searchParams.get("txn_ref")         ?? "";
  const amount         = searchParams.get("amount")          ?? "0";   // kobo
  const currency       = searchParams.get("currency")        ?? "566"; // NGN
  const siteRedirectUrl = searchParams.get("site_redirect_url") ?? "/repayment";
  const custName       = searchParams.get("cust_name")       ?? "Merchant";
  const payItemName    = searchParams.get("pay_item_name")   ?? "MerchantFloat Payment";

  const [status, setStatus] = useState<"hashing" | "loading" | "open" | "error">("hashing");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!txnRef || !merchantCode) {
      setStatus("error");
      setErrorMsg("Missing payment parameters");
      return;
    }

    let cancelled = false;

    async function boot() {
      try {
        // ── Step 1: Get SHA512 hash from our server ───────────────────────
        const hashRes = await fetch("/api/payment/hash", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ merchantCode, payItemId, txnRef, amount, currency, siteRedirectUrl }),
        });
        if (!hashRes.ok) throw new Error("Hash generation failed");
        const { hash } = await hashRes.json() as { hash: string };

        if (cancelled) return;
        setStatus("loading");

        // ── Step 2: Load Interswitch inline checkout script ───────────────
        await new Promise<void>((resolve, reject) => {
          // Avoid loading the script twice
          if (document.querySelector(`script[src="${ISW_INLINE_SCRIPT}"]`)) {
            resolve();
            return;
          }
          const script = document.createElement("script");
          script.src = ISW_INLINE_SCRIPT;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load Interswitch checkout script"));
          document.head.appendChild(script);
        });

        if (cancelled) return;
        setStatus("open");

        // ── Step 3: Open the real Interswitch payment modal ───────────────
        // API confirmed from source: window.webpayCheckout({ ... })
        window.webpayCheckout({
          merchant_code:     merchantCode,
          pay_item_id:       payItemId,
          txn_ref:           txnRef,
          amount:            amount,           // in kobo, as string
          currency:          Number(currency),
          site_redirect_url: siteRedirectUrl,
          hash:              hash,

          // Called when payment completes inside the modal (client-side)
          onComplete: (response: Record<string, string>) => {
            const params = new URLSearchParams({
              txnref:  txnRef,
              amount:  amount,
              resp:    response.ResponseCode ?? "00",
              retRef:  response.PaymentReference ?? txnRef,
              desc:    response.ResponseDescription ?? "Approved",
              apprAmt: amount,
            });
            const sep = siteRedirectUrl.includes("?") ? "&" : "?";
            window.location.href = `${siteRedirectUrl}${sep}${params.toString()}`;
          },
        });
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        setErrorMsg(err instanceof Error ? err.message : "Unknown error");
      }
    }

    boot();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const amountNaira = (Number(amount) / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 });

  return (
    <div className="min-h-screen bg-[#f0f5f0] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">

        {/* Brand bar */}
        <div className="bg-[#006633] px-5 py-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center">
            <span className="text-[#006633] font-black text-base">Q</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm">Quickteller</p>
            <p className="text-green-300 text-xs">by Interswitch</p>
          </div>
        </div>

        {/* Amount strip */}
        <div className="bg-[#f7fdf9] border-b border-gray-100 px-5 py-4">
          <p className="text-xs text-gray-400 mb-0.5 uppercase tracking-wide font-medium">{payItemName}</p>
          <p className="text-3xl font-black text-gray-900">₦{amountNaira}</p>
          <p className="text-xs text-gray-400 mt-1">
            Paying as <span className="font-semibold text-gray-600">{custName}</span>
          </p>
        </div>

        <div className="p-8 text-center">
          {(status === "hashing" || status === "loading") && (
            <>
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                <Loader2 size={28} className="text-[#006633] animate-spin" />
              </div>
              <p className="text-base font-bold text-gray-900 mb-1">
                {status === "hashing" ? "Preparing Secure Payment" : "Loading Interswitch Checkout"}
              </p>
              <p className="text-sm text-gray-400">
                {status === "hashing"
                  ? "Generating your payment signature..."
                  : "Connecting to Quickteller..."}
              </p>
              <p className="text-xs text-gray-300 font-mono mt-4 truncate">{txnRef}</p>
            </>
          )}

          {status === "open" && (
            <>
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                <ExternalLink size={24} className="text-[#006633]" />
              </div>
              <p className="text-base font-bold text-gray-900 mb-1">Interswitch Payment Open</p>
              <p className="text-sm text-gray-400 mb-3">
                Complete your payment in the Quickteller window.
              </p>

              {/* Sandbox test card — visible during demo */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-left mb-3">
                <p className="text-xs font-bold text-blue-700 mb-2">Sandbox Test Card</p>
                <div className="space-y-1">
                  {[
                    ["Card", "5061 1203 1188 9893"],
                    ["Expiry", "07/26"],
                    ["CVV", "100"],
                    ["PIN", "1111"],
                    ["OTP", "123456"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between items-center">
                      <span className="text-xs text-blue-500">{label}</span>
                      <span className="text-xs font-mono font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs text-gray-300 font-mono truncate">{txnRef}</p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={28} className="text-orange-500" />
              </div>
              <p className="text-base font-bold text-gray-900 mb-1">Sandbox Unavailable</p>
              <p className="text-sm text-gray-400 mb-1">
                Interswitch QA environment is not reachable.
              </p>
              <p className="text-xs text-gray-300 mb-5">{errorMsg}</p>
              <button
                onClick={() => window.history.back()}
                className="text-sm text-[#006633] font-semibold hover:underline"
              >
                ← Go back
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-center gap-4">
          <span className="text-xs text-gray-500 font-semibold">Interswitch</span>
          <div className="w-px h-3 bg-gray-200" />
          <span className="text-xs text-gray-400">256-bit SSL</span>
          <div className="w-px h-3 bg-gray-200" />
          <span className="text-[8px] font-black text-[#1a1f71] border border-[#1a1f71] px-1 rounded">VISA</span>
          <span className="text-[8px] font-black text-[#e31837] border border-[#e31837] px-1 rounded">VERVE</span>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return <Suspense><CheckoutContent /></Suspense>;
}
