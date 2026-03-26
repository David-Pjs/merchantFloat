import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// POST /api/payment/hash
// Generates the SHA512 hash required by the Interswitch Inline Checkout widget.
// This MUST be server-side — the secret key must never reach the browser.
//
// Interswitch hash formula:
// SHA512(merchant_code + pay_item_id + txn_ref + amount + currency + site_redirect_url + hash_key)
//
// Docs: https://docs.interswitchgroup.com/docs/web-checkout

export async function POST(req: NextRequest) {
  const { merchantCode, payItemId, txnRef, amount, currency, siteRedirectUrl } =
    await req.json();

  const secretKey = process.env.INTERSWITCH_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: "INTERSWITCH_SECRET_KEY not configured" }, { status: 500 });
  }

  // Concatenate exactly as Interswitch expects — all values as strings
  const hashStr = `${merchantCode}${payItemId}${txnRef}${amount}${currency}${siteRedirectUrl}${secretKey}`;
  const hash = crypto.createHash("sha512").update(hashStr).digest("hex");

  return NextResponse.json({ hash });
}
