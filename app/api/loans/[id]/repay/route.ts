import { NextRequest, NextResponse } from "next/server";
import { getLoan, createRepayment } from "@/lib/loans";
import { generateTxnRef } from "@/lib/interswitch";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const loan = getLoan(id);

  if (!loan) {
    return NextResponse.json({ error: "Loan not found" }, { status: 404 });
  }
  if (loan.status === "completed") {
    return NextResponse.json({ error: "Loan already fully repaid" }, { status: 400 });
  }

  const { amountNaira } = await req.json();
  if (!amountNaira || amountNaira <= 0) {
    return NextResponse.json({ error: "Invalid repayment amount" }, { status: 400 });
  }

  const amountKobo = Math.round(amountNaira * 100);
  const txnRef = generateTxnRef(id);

  const repayment = createRepayment({
    loanId: id,
    amountKobo,
    txnRef,
    status: "pending",
  });

  return NextResponse.json({
    txnRef,
    repaymentId: repayment.id,
    amountKobo,
    amountNaira,
    merchantCode: process.env.INTERSWITCH_MERCHANT_CODE,
    payItemId: process.env.INTERSWITCH_PAY_ITEM_ID,
  });
}
