import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import os


# CORE ENGINE (USED BY BOTH CSV + API)

def process_dataframe(df):

    try:
        df['transaction_date'] = pd.to_datetime(df['transaction_date'])

        # FEATURE ENGINEERING
        merchant_profiles = df.groupby('merchant_id').agg({
            'daily_revenue': ['mean', 'std'],
            'returning_customer_ratio': 'mean',
            'avg_settlement_delay_hours': 'mean',
            'transaction_count': 'mean',
            'refund_count': 'sum'
        })

        merchant_profiles.columns = [
            'avg_rev',
            'rev_volatility',
            'avg_loyalty',
            'avg_delay',
            'avg_trans_count',
            'total_refunds'
        ]

        merchant_profiles = merchant_profiles.fillna(0)

        # CLUSTERING
        scaler = StandardScaler()
        scaled_features = scaler.fit_transform(merchant_profiles)

        kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)
        merchant_profiles['cluster'] = kmeans.fit_predict(scaled_features)

        # SEGMENT
        def map_segment(row):
            if row['avg_rev'] > merchant_profiles['avg_rev'].median() and row['avg_loyalty'] > 0.5:
                return "Elite (High Growth)"
            elif row['avg_delay'] > 30:
                return "At Risk (Settlement Delay)"
            elif row['rev_volatility'] > merchant_profiles['rev_volatility'].mean() * 1.5:
                return "Volatile (Unstable)"
            else:
                return "Steady (Reliable)"

        merchant_profiles['segment_name'] = merchant_profiles.apply(map_segment, axis=1)

        # SCORING
        final_output = []

        for merchant_id, row in merchant_profiles.iterrows():

            consistency_score = max(0, 100 - (row['rev_volatility'] / (row['avg_rev'] + 1) * 100))
            loyalty_score = row['avg_loyalty'] * 100
            transaction_score = (min(row['avg_trans_count'], 20) / 20) * 100
            revenue_score = min(row['avg_rev'] / 80000, 1.2) * 100

            base_score = (
                0.25 * loyalty_score +
                0.25 * consistency_score +
                0.15 * transaction_score +
                0.35 * revenue_score
            )

            delay_penalty = min(row['avg_delay'] * 0.3, 15)

            cluster_penalty_map = {0: 0, 1: 3, 2: 6, 3: 10}
            cluster_penalty = cluster_penalty_map.get(row['cluster'], 5)

            norm_score = base_score - delay_penalty - cluster_penalty
            norm_score = min(max(norm_score, 0), 100)

            credit_score = int(300 + (norm_score * 5.5))

            # RISK
            if credit_score >= 700:
                risk_level = "Low"
                max_loan = round(row['avg_rev'] * 15, -3)
            elif credit_score >= 520:
                risk_level = "Medium"
                max_loan = round(row['avg_rev'] * 7, -3)
            else:
                risk_level = "High"
                max_loan = 0

            # INSIGHTS
            m_raw = df[df['merchant_id'] == merchant_id]
            peak_hr = int(m_raw['peak_sales_hour'].mode()[0])

            insights = []

            if row['avg_loyalty'] < 0.4:
                insights.append("Low repeat customers")

            if row['avg_delay'] > 30:
                insights.append("Settlement delays affecting cash flow")

            if row['rev_volatility'] > merchant_profiles['rev_volatility'].mean() * 1.5:
                insights.append("Revenue is inconsistent")

            if row['avg_rev'] > merchant_profiles['avg_rev'].median():
                insights.append("Strong revenue performance")

            insights.append(f"Peak sales at {peak_hr}:00")

            final_output.append({
                "merchant_id": merchant_id,
                "segment": row['segment_name'],
                "credit_score": credit_score,
                "risk_level": risk_level,
                "loan_offer": int(max_loan),
                "cluster": int(row['cluster']),
                "insights": insights
            })

        return final_output

    except Exception as e:
        import traceback
        traceback.print_exc()
        return None


# CSV VERSION (FOR TESTING / DEMO)

def run_merchant_float_ai(csv_path):

    try:
        if not os.path.exists(csv_path):
            raise FileNotFoundError(f"{csv_path} not found")

        df = pd.read_csv(csv_path)
        print(f"✅ Data loaded: {len(df)} rows")

        return process_dataframe(df)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return None


# API VERSION (FOR INTERSWITCH / LIVE DATA)

def run_merchant_float_ai_from_df(df):
    return process_dataframe(df)


# TEST RUN

if __name__ == "__main__":
    print("🚀 Running MerchantFloat AI Engine...")

    path = "merchantfloat_dataset.csv"

    print(" Current Directory:", os.getcwd())

    results = run_merchant_float_ai(path)

    if results:
        print("\n--- MERCHANTFLOAT AI REPORT ---\n")

        for m in results:
            print(f"Merchant: {m['merchant_id']}")
            print(f"Score: {m['credit_score']} | Risk: {m['risk_level']}")
            print(f"Segment: {m['segment']}")
            print(f"Loan Offer: {m['loan_offer']}")
            print(f"Insights: {', '.join(m['insights'])}")
            print("-" * 40)