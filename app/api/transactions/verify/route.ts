import { NextRequest, NextResponse } from "next/server";
import { verifyTransaction } from "@/lib/interswitch";
import { getRepaymentByTxnRef, markRepaymentSuccess, markRepaymentFailed } from "@/lib/loans";

export async function POST(req: NextRequest) {
  const { txnRef, amountKobo } = await req.json();

  if (!txnRef || !amountKobo) {
    return NextResponse.json({ error: "txnRef and amountKobo required" }, { status: 400 });
  }

  const repayment = getRepaymentByTxnRef(txnRef);
  if (!repayment) {
    return NextResponse.json({ error: "Repayment record not found" }, { status: 404 });
  }

  // Always verify server-side — never trust the browser callback alone
  const result = await verifyTransaction(txnRef, amountKobo);

  if (result.success) {
    const updated = markRepaymentSuccess(txnRef, result.paymentReference ?? "");
    return NextResponse.json({
      success: true,
      responseCode: result.responseCode,
      responseDescription: result.responseDescription,
      paymentReference: result.paymentReference,
      loan: updated?.loan,
    });
  } else {
    markRepaymentFailed(txnRef);
    return NextResponse.json({
      success: false,
      responseCode: result.responseCode,
      responseDescription: result.responseDescription,
    });
  }
}
