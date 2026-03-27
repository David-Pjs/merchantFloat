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
- FastAPI (AI scoring engine)
- scikit-learn (K-Means clustering, credit model)
- Vercel (deployment)
- Interswitch Quickteller + Passport APIs

---

## Team Contributions

### David Uhumagho — Team Lead / Full-Stack Developer
- Product concept, research, and market validation
- Full frontend implementation (all pages: onboarding, dashboard, loan flow, repayment, checkout)
- Backend API routes: score engine, Quickteller integration, BVN verification, webhooks
- Interswitch OAuth2 token management and transaction verification
- Credit scoring model design and calibration
- Merchant data research and synthetic dataset creation from real POS transaction patterns
- Deployment to Vercel with production environment configuration
- Demo story and pitch narrative

### Onwukamuche Onyinyechi Lynda — Data Scientist / AI & ML Engineer
- Designed and generated a synthetic dataset simulating real POS transaction behavior over 180 days per merchant
- Engineered key features: daily revenue, transaction count, refund count, returning customer ratio, avg settlement delay, peak sales hour, business category
- Built diverse merchant profiles: high-performing, medium-performing, low-performing, and volatile merchants
- Implemented feature engineering pipeline aggregating transaction-level data into merchant behavioral profiles
- Applied K-Means clustering (n_clusters=4) with StandardScaler normalization for merchant segmentation
- Developed rule-enhanced segmentation: Elite (High Growth), At Risk (Settlement Delay), Volatile (Unstable), Steady (Reliable)
- Designed custom credit scoring system (300–850 scale): customer loyalty (25%), revenue consistency (25%), transaction activity (15%), revenue strength (35%)
- Implemented risk classification: Low Risk (≥700), Medium Risk (520–699), High Risk (<520)
- Built dynamic loan offer logic: low risk → up to 15 days revenue, medium risk → up to 7 days revenue
- Developed AI insights engine for actionable merchant recommendations
- Exposed AI model via FastAPI service (GET endpoints for dashboard, POST for real-time processing)
- Refactored model into reusable pipeline: `process_dataframe()`, `run_merchant_float_ai()`, `run_merchant_float_ai_from_df()`
- Contributed to system architecture: Transaction Data → Backend → AI Engine (FastAPI) → Scoring Output → Frontend Dashboard

### Selimat Akinwale — Product Manager
- Delivered the full Product Requirements Document (PRD) for MerchantFloat
- Defined the problem and validated the idea against market data
- Prioritised features against the 3-day buildathon deadline
- Wrote user journey maps and flow documentation
- Conducted competitor analysis across Nigerian and global fintech lending products
- Stakeholder mapping and business model definition
- Built the risk register and SMART goals framework
- Wrote the full pitch script for Demo Day presentation
