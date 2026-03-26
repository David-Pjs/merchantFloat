import crypto from "crypto";

const SANDBOX_BASE = "https://qa.interswitchng.com";
// Interswitch API Marketplace sandbox (identity/KYC APIs)
const MARKETPLACE_BASE = "https://sandbox.interswitchng.com";

// ── Token cache (reused for 24h per the docs) ────────────────────────────────
let cachedToken: { token: string; expiresAt: number } | null = null;

export async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const clientId = process.env.INTERSWITCH_CLIENT_ID!;
  const secretKey = process.env.INTERSWITCH_SECRET_KEY!;
  const credentials = Buffer.from(`${clientId}:${secretKey}`).toString("base64");

  const res = await fetch(
    `${SANDBOX_BASE}/passport/oauth/token?grant_type=client_credentials`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Interswitch token fetch failed [${res.status}]: ${text}`);
  }

  const data = await res.json();

  // Cache with 5-minute buffer before expiry
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 300) * 1000,
  };

  return cachedToken.token;
}

// ── Server-side transaction verification ────────────────────────────────────
export async function verifyTransaction(
  txnRef: string,
  amountKobo: number
): Promise<{
  success: boolean;
  responseCode: string;
  responseDescription: string;
  paymentReference?: string;
  amount?: number;
}> {
  const token = await getAccessToken();
  const merchantCode = process.env.INTERSWITCH_MERCHANT_CODE!;

  const url = new URL(`${SANDBOX_BASE}/collections/api/v1/gettransaction.json`);
  url.searchParams.set("merchantcode", merchantCode);
  url.searchParams.set("transactionreference", txnRef);
  url.searchParams.set("amount", String(amountKobo));

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    return {
      success: false,
      responseCode: String(res.status),
      responseDescription: "Transaction query failed",
    };
  }

  const data = await res.json();

  return {
    success: data.ResponseCode === "00",
    responseCode: data.ResponseCode,
    responseDescription: data.ResponseDescription,
    paymentReference: data.PaymentReference,
    amount: data.Amount,
  };
}

// ── Webhook signature verification (HmacSHA512) ──────────────────────────────
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secretKey = process.env.INTERSWITCH_SECRET_KEY!;
  const computed = crypto
    .createHmac("sha512", secretKey)
    .update(rawBody)
    .digest("hex");
  return computed === signature;
}

// ── BVN Full Details (Interswitch API Marketplace) ───────────────────────────
export async function verifyBVN(bvn: string): Promise<{
  success: boolean;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  message?: string;
}> {
  try {
    const token = await getAccessToken();
    const res = await fetch(`${MARKETPLACE_BASE}/api/v1/identity/bvn`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bvn }),
    });

    const data = await res.json();

    // Handle both camelCase and PascalCase response shapes
    const code = data.responseCode ?? data.ResponseCode ?? data.code;
    if (!res.ok || (code && code !== "00")) {
      return {
        success: false,
        message: data.responseDescription ?? data.ResponseDescription ?? data.message ?? "Verification failed",
      };
    }

    return {
      success: true,
      firstName: data.firstName ?? data.FirstName ?? data.first_name,
      lastName: data.lastName ?? data.LastName ?? data.last_name,
      middleName: data.middleName ?? data.MiddleName ?? data.middle_name,
      phoneNumber: data.phoneNumber ?? data.PhoneNumber ?? data.phone_number,
      dateOfBirth: data.dateOfBirth ?? data.DateOfBirth ?? data.date_of_birth,
      gender: data.gender ?? data.Gender,
      message: "BVN verified successfully",
    };
  } catch {
    return { success: false, message: "Verification service unavailable" };
  }
}

// ── Unique transaction reference generator ───────────────────────────────────
export function generateTxnRef(loanId: string): string {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `MF-${loanId.slice(-6)}-${rand}`;
}
