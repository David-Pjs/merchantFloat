import { NextRequest, NextResponse } from "next/server";
import { createLoan } from "@/lib/loans";
import { merchants } from "@/lib/merchants";

export async function POST(req: NextRequest) {
  const { merchantId, amount } = await req.json();

  const merchant = merchants.find((m) => m.id === merchantId);
  if (!merchant) {
    return NextResponse.json({ error: "Merchant not found" }, { status: 404 });
  }
  if (!merchant.loanEligible) {
    return NextResponse.json(
      { error: "Merchant credit score below minimum threshold" },
      { status: 400 }
    );
  }

  const loanAmount = amount ?? merchant.qualifiedAmount;
  const fee = Math.round(loanAmount * 0.1);

  const loan = createLoan({
    merchantId,
    merchantName: merchant.name,
    amountNaira: loanAmount,
    feeNaira: fee,
    totalRepaymentNaira: loanAmount + fee,
  });

  return NextResponse.json({ loan }, { status: 201 });
}
