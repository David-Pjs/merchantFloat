// ── In-memory loan store ──────────────────────────────────────────────────────
// Perfectly fine for hackathon demo. In production: Postgres + Redis.

export type LoanStatus = "active" | "repaying" | "completed" | "defaulted";

export type Repayment = {
  id: string;
  loanId: string;
  amountKobo: number;
  txnRef: string;
  status: "pending" | "success" | "failed";
  paymentReference?: string;
  createdAt: number;
  completedAt?: number;
};

export type Loan = {
  id: string;
  merchantId: string;
  merchantName: string;
  amountNaira: number;
  feeNaira: number;
  totalRepaymentNaira: number;
  status: LoanStatus;
  repaidNaira: number;
  createdAt: number;
  repayments: Repayment[];
};

const loans = new Map<string, Loan>();
const repaymentsByTxnRef = new Map<string, Repayment>();

// ── Loans ────────────────────────────────────────────────────────────────────

export function createLoan(data: Omit<Loan, "id" | "createdAt" | "repayments" | "repaidNaira" | "status">): Loan {
  const id = `loan_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const loan: Loan = {
    ...data,
    id,
    status: "active",
    repaidNaira: 0,
    createdAt: Date.now(),
    repayments: [],
  };
  loans.set(id, loan);
  return loan;
}

export function getLoan(id: string): Loan | undefined {
  return loans.get(id);
}

export function getAllLoans(): Loan[] {
  return Array.from(loans.values());
}

export function updateLoan(id: string, updates: Partial<Loan>): void {
  const loan = loans.get(id);
  if (loan) loans.set(id, { ...loan, ...updates });
}

// ── Repayments ───────────────────────────────────────────────────────────────

export function createRepayment(data: Omit<Repayment, "id" | "createdAt">): Repayment {
  const id = `rep_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const repayment: Repayment = { ...data, id, createdAt: Date.now() };

  repaymentsByTxnRef.set(data.txnRef, repayment);

  const loan = loans.get(data.loanId);
  if (loan) {
    loan.repayments.push(repayment);
    loans.set(loan.id, loan);
  }

  return repayment;
}

export function getRepaymentByTxnRef(txnRef: string): Repayment | undefined {
  return repaymentsByTxnRef.get(txnRef);
}

export function markRepaymentSuccess(
  txnRef: string,
  paymentReference: string
): { repayment: Repayment; loan: Loan } | null {
  const repayment = repaymentsByTxnRef.get(txnRef);
  if (!repayment) return null;

  const updated: Repayment = {
    ...repayment,
    status: "success",
    paymentReference,
    completedAt: Date.now(),
  };
  repaymentsByTxnRef.set(txnRef, updated);

  const loan = loans.get(repayment.loanId);
  if (!loan) return null;

  const newRepaid = loan.repaidNaira + Math.round(repayment.amountKobo / 100);
  const newStatus: LoanStatus =
    newRepaid >= loan.totalRepaymentNaira ? "completed" : "repaying";

  const updatedLoan: Loan = {
    ...loan,
    repaidNaira: newRepaid,
    status: newStatus,
    repayments: loan.repayments.map((r) => (r.txnRef === txnRef ? updated : r)),
  };
  loans.set(loan.id, updatedLoan);

  return { repayment: updated, loan: updatedLoan };
}

export function markRepaymentFailed(txnRef: string): void {
  const repayment = repaymentsByTxnRef.get(txnRef);
  if (!repayment) return;
  repaymentsByTxnRef.set(txnRef, { ...repayment, status: "failed" });
}
