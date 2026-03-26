# MerchantFloat

**Working capital loans for Nigerian merchants — scored from Interswitch POS transaction data.**

Live demo: https://merchantfloat.vercel.app
GitHub: https://github.com/David-Pjs/merchantFloat

---

## The Problem

41 million informal merchants in Nigeria process ₦18 trillion annually through POS terminals — yet 84% have zero credit bureau profile. Banks want to lend but have no risk data. The data exists inside Interswitch. Nobody was reading it.

## The Solution

MerchantFloat turns Interswitch POS transaction history into a credit score. Merchants enter their BVN, we scan 90 days of Quickteller transaction data, generate a score across 6 signals, and return a loan offer in under 60 seconds. Repayment auto-deducts 10% from each daily Quickteller settlement — no phone calls, no guarantors, no collateral.

## Interswitch APIs Used

- **Quickteller Payment API** — virtual account generation, card payment processing, transaction verification
- **Interswitch Passport API** — BVN identity verification

## Credit Scoring Model (6 signals, 100 pts)

| Signal | Max | What it measures |
|---|---|---|
| Revenue Volume | 25 | Monthly naira processed |
| Trading Consistency | 25 | Days active out of 30 |
| Revenue Stability | 10 | Weekly variance (coefficient of variation) |
| Refund Rate | 20 | Returns as % of total transactions |
| Settlement Speed | 10 | Avg hours for Quickteller to clear funds |
| Account Coverage | 10 | Number of linked bank accounts |

Score ≥ 50 = eligible. Loan = 15–20% of monthly revenue, scaled by score.

## Key Features

- BVN verification via Interswitch Passport API (one-tap demo flow)
- Live Quickteller payment with real Wema Bank virtual account
- Score simulator — merchants see exactly what to fix to qualify
- Credit ladder — shows loan limits after each repayment cycle
- Plain English score explanation per merchant
- Auto-deduction repayment model (no contacts called, ever)
- Loan-to-revenue ratio displayed on offer card

## Demo Merchants

| Merchant | Score | Outcome |
|---|---|---|
| Emeka Nwosu (Cold Room) | 85/100 | ₦750,000 approved |
| Hajiya Ramatu (Agriculture) | 62/100 | ₦320,000 approved |
| Tunde Adeyemi (Electronics) | 29/100 | Declined — high refund rate |

## Tech Stack

- Next.js 16 + TypeScript
- Tailwind CSS v4
- Recharts (score visualisation)
- Vercel (deployment)
- Interswitch Quickteller + Passport APIs

## Team Contributions

### David Uhumagho — Team Lead / Full-Stack Developer
- Product concept, research, and market validation
- Full frontend implementation (all pages: onboarding, dashboard, loan flow, repayment)
- Backend API routes (score engine, Quickteller integration, BVN verification, webhooks)
- Credit scoring model design and calibration
- Merchant data research and synthetic dataset creation from real POS transaction patterns
- Deployment to Vercel with production environment configuration
- Demo story and pitch narrative

## How to Run Locally

```bash
git clone https://github.com/David-Pjs/merchantFloat.git
cd merchantFloat
npm install
cp .env.local.example .env.local  # add your Interswitch credentials
npm run dev
```

Open http://localhost:3000

## Environment Variables

```
INTERSWITCH_CLIENT_ID=
INTERSWITCH_SECRET_KEY=
INTERSWITCH_MERCHANT_CODE=
INTERSWITCH_PAY_ITEM_ID=
NEXT_PUBLIC_INTERSWITCH_MERCHANT_CODE=
NEXT_PUBLIC_INTERSWITCH_PAY_ITEM_ID=
NEXT_PUBLIC_BASE_URL=
```
