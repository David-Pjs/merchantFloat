import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/interswitch";
import { getRepaymentByTxnRef, markRepaymentSuccess, markRepaymentFailed } from "@/lib/loans";

// Interswitch fires this when a payment completes.
// We verify the signature, update the loan, and return 200 immediately.
// Retries: Interswitch will retry up to 5x on non-200. Always respond fast.
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-interswitch-signature") ?? "";

  // Reject tampered payloads
  if (!verifyWebhookSignature(rawBody, signature)) {
    console.warn("[webhook] Signature verification failed");
    return new NextResponse(null, { status: 401 });
  }

  let event: {
    event: string;
    uuid: string;
    timestamp: number;
    data: {
      responseCode: string;
      merchantReference: string;
      paymentReference: string;
      amount: number;
    };
  };

  try {
    event = JSON.parse(rawBody);
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  console.log(`[webhook] ${event.event} — ref: ${event.data?.merchantReference}`);

  if (
    event.event === "TRANSACTION.COMPLETED" &&
    event.data?.responseCode === "00"
  ) {
    const txnRef = event.data.merchantReference;
    const repayment = getRepaymentByTxnRef(txnRef);

    if (repayment) {
      markRepaymentSuccess(txnRef, event.data.paymentReference);
      console.log(`[webhook] Repayment confirmed for loan ${repayment.loanId}`);
    }
  } else if (
    event.event === "TRANSACTION.COMPLETED" &&
    event.data?.responseCode !== "00"
  ) {
    const txnRef = event.data.merchantReference;
    markRepaymentFailed(txnRef);
  }

  // Always 200 with no body — Interswitch requirement
  return new NextResponse(null, { status: 200 });
}
