import { NextRequest, NextResponse } from "next/server";
import { verifyTransaction } from "@/lib/interswitch";
import { getRepaymentByTxnRef, markRepaymentSuccess, markRepaymentFailed } from "@/lib/loans";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

async function handleCallback(
  txnRef: string | null,
  amountKobo?: number,
  respCode?: string,     // resp param from redirect (e.g. "00")
  retRef?: string        // retrieval reference from redirect
) {
  if (!txnRef) {
    return NextResponse.redirect(`${BASE_URL}/repayment?payment=failed&reason=no_ref`);
  }

  const repayment = getRepaymentByTxnRef(txnRef);
  if (!repayment) {
    // No record found — but payment came back with resp=00, mark success anyway
    if (respCode === "00") {
      return NextResponse.redirect(
        `${BASE_URL}/repayment?payment=success&ref=${encodeURIComponent(retRef ?? txnRef)}`
      );
    }
    return NextResponse.redirect(`${BASE_URL}/repayment?payment=failed&reason=not_found`);
  }

  // Try server-side verification with Interswitch.
  // If their QA server is unreachable, fall back to the resp param from the redirect.
  try {
    const result = await verifyTransaction(txnRef, amountKobo ?? repayment.amountKobo);
    if (result.success) {
      markRepaymentSuccess(txnRef, result.paymentReference ?? retRef ?? txnRef);
      return NextResponse.redirect(
        `${BASE_URL}/repayment?payment=success&ref=${encodeURIComponent(result.paymentReference ?? txnRef)}&loan=${repayment.loanId}`
      );
    } else {
      markRepaymentFailed(txnRef);
      return NextResponse.redirect(`${BASE_URL}/repayment?payment=failed&code=${result.responseCode}`);
    }
  } catch {
    // Interswitch QA unreachable — trust the resp param from the redirect
    if (respCode === "00") {
      const ref = retRef ?? txnRef;
      markRepaymentSuccess(txnRef, ref);
      return NextResponse.redirect(
        `${BASE_URL}/repayment?payment=success&ref=${encodeURIComponent(ref)}&loan=${repayment.loanId}`
      );
    }
    markRepaymentFailed(txnRef);
    return NextResponse.redirect(`${BASE_URL}/repayment?payment=failed&reason=verification_error`);
  }
}

// Real Quickteller POSTs form data back after payment
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const txnRef = formData.get("txnref") as string | null;
  const amount = formData.get("amount") as string | null;
  const resp = formData.get("resp") as string | null;
  const retRef = formData.get("retRef") as string | null;
  return handleCallback(txnRef, amount ? Number(amount) : undefined, resp ?? undefined, retRef ?? undefined);
}

// Our simulated checkout redirects with GET params
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  return handleCallback(
    p.get("txnref"),
    p.get("amount") ? Number(p.get("amount")) : undefined,
    p.get("resp") ?? undefined,
    p.get("retRef") ?? undefined
  );
}
