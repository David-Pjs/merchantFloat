from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from merchant_float_engine import run_merchant_float_ai, run_merchant_float_ai_from_df
from pydantic import BaseModel
from typing import List
import pandas as pd



app = FastAPI(
    title="MerchantFloat AI API",
    description="AI-powered credit scoring and loan recommendation system",
    version="1.0"
)

# CORS (VERY IMPORTANT for Bun.js/frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# DATA MODEL (for POST request)

class Transaction(BaseModel):
    merchant_id: str
    transaction_date: str
    daily_revenue: float
    transaction_count: int
    refund_count: int
    avg_settlement_delay_hours: float
    returning_customer_ratio: float
    peak_sales_hour: int
    business_category: str


class InputData(BaseModel):
    transactions: List[Transaction]

#  ROOT ENDPOINT

@app.get("/")
def home():
    return {
        "message": "MerchantFloat AI is running",
        "endpoints": {
            "get_all": "/analyze",
            "get_one": "/analyze/{merchant_id}",
            "post_live_data": "/analyze (POST)"
        }
    }

# GET ALL (CSV - fallback/demo)

@app.get("/analyze")
def analyze_all():
    results = run_merchant_float_ai("merchantfloat_dataset.csv")
    return {
        "status": "success",
        "count": len(results),
        "data": results
    }

# GET SINGLE MERCHANT

@app.get("/analyze/{merchant_id}")
def analyze_merchant(merchant_id: str):
    results = run_merchant_float_ai("merchantfloat_dataset.csv")

    for merchant in results:
        if merchant["merchant_id"] == merchant_id:
            return {
                "status": "success",
                "data": merchant
            }

    return {
        "status": "error",
        "message": f"Merchant {merchant_id} not found"
    }


# POST ENDPOINT (LIVE DATA)

@app.post("/analyze")
def analyze_live(data: InputData):
    try:
        # Convert incoming JSON → DataFrame
        df = pd.DataFrame([t.dict() for t in data.transactions])

        # reuse your AI logic (we adapt it slightly here)
        results = run_merchant_float_ai_from_df(df)

        return {
            "status": "success",
            "data": results
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }