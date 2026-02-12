import os
import json
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv

# Load env vars
load_dotenv()

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not url or not key:
    print("Error: Supabase URL or Key not found in .env")
    exit(1)

supabase: Client = create_client(url, key)

# Define the "Perfect Evaluation" dataset
trial_report = {
    "startup_name": "Nebula Robotics",
    "final_score": 0.885,
    "risk_label": "LOW_RISK",
    "summary": "Nebula Robotics is a category-defining startup in the autonomous warehouse space. With a strong gross margin of 65% and a massive TAM of $50B, they exhibit exceptional investment potential. Data consistency is high, and the competitive moat is backed by 12 pending patents.",
    "component_scores": {
        "market": 0.92,
        "financial": 0.84,
        "risk": 0.89,
        "validator": 0.98,
        "competition": 0.85
    },
    "weights_used": {
        "market": 0.20,
        "financial": 0.30,
        "risk": 0.30,
        "validator": 0.20
    },
    "agent_results": {
        "market": {
            "tam": "50000",
            "sam": "12000",
            "som": "2500",
            "growth_rate": "24",
            "trends": [
                "Shift towards micro-fulfillment centers",
                "Increasing labor costs in logistics",
                "Rapid advancement in LiDAR cost-reduction"
            ],
            "reasoning": "The market is ripe for disruption as traditional players struggle with aging infrastructure. Nebula's focus on micro-fulfillment matches the 'Amazon-now' consumer trend."
        },
        "financial": {
            "score": 84,
            "metrics": {
                "burn_rate": "150000",
                "runway_months": "18",
                "ebitda": "-1200000",
                "gross_margin": "65",
                "revenue": "450000",
                "expenses": "600000"
            },
            "reasoning": "Strong unit economics offset the high initial R&D burn. 18 months of runway provide sufficient buffer for Series A milestones."
        },
        "risk": {
            "score": 89,
            "risks": [
                {"category": "Supply Chain", "description": "Reliance on specialized chipset from single vendor in Taiwan."},
                {"category": "Regulatory", "description": "New safety standards for human-robot collaboration in warehouses."},
                {"category": "Execution", "description": "Scaling manufacturing while maintaining 65% gross margins."}
            ],
            "reasoning": "Risk is primarily exogenous. Internal controls and engineering leadership are top-tier."
        },
        "validator": {
            "consistency_score": 98,
            "completeness_score": 95,
            "sentiment": "positive",
            "flags": [
                "Minor discrepancy between pitch deck revenue and bank statement (0.5% variance)."
            ]
        },
        "competition": {
            "innovation_score": 95,
            "market_share_score": 15,
            "brand_score": 40,
            "pricing_score": 80,
            "product_score": 90,
            "competitors": [
                {"name": "Locus Robotics", "threat_level": "High", "description": "Incumbent with high market share but legacy hardware."},
                {"name": "6 River Systems", "threat_level": "Medium", "description": "Acquired by Shopify, focus on e-commerce integration."},
                {"name": "Fetch Robotics", "threat_level": "Low", "description": "Broad focus, lack of specialization in Nebula's niche."}
            ],
            "reasoning": "Nebula maintains a 2-year technical lead in swarm coordination algorithms."
        },
        "longevity": {
            "survival_probability_3yr": 92,
            "survival_probability_5yr": 78,
            "reasoning": "High survival probability driven by low customer churn in the industrial automation sector and a strong balance sheet. The main threat in Year 5 is potential commoditization, which Nebula mitigates via their proprietary software layer."
        },
        "investor_fit": {
            "recommended_investor_type": "Institutional VC / Deep Tech Specialist",
            "recommended_stage": "Series A",
            "ticket_size_range": "$5M - $12M",
            "reasoning": "Nebula has escaped the 'Seed Trap' with proven micro-fulfillment deployments. They now require institutional capital to scale manufacturing and international sales.",
            "domain_analysis": [
                {"name": "Market", "insight": "Hyper-growth logistics niche."},
                {"name": "Financial", "insight": "High R&D cost but scalable Opex."},
                {"name": "Risk", "insight": "Supply chain is the only red flag."},
                {"name": "Validator", "insight": "Founders are highly transparent."},
                {"name": "Competition", "insight": "Patents provide a 24-month moat."},
                {"name": "Longevity", "insight": "High exit potential (M&A)."},
                {"name": "Product", "insight": "SOTA swarm intelligence."}
            ]
        }
    }
}

def seed_data():
    try:
        # Check if startup already exists to avoid duplicates
        existing = supabase.table("startup_evaluations").select("*").eq("startup_id", "nebula-robotics-trial").execute()
        
        if existing.data:
            print("Trial data already exists. Updating...")
            result = supabase.table("startup_evaluations").update({
                "report_json": trial_report,
                "final_score": 0.885,
                "risk_label": "LOW_RISK"
            }).eq("startup_id", "nebula-robotics-trial").execute()
        else:
            print("Inserting new trial data...")
            result = supabase.table("startup_evaluations").insert({
                "startup_id": "nebula-robotics-trial",
                "final_score": 0.885,
                "risk_label": "LOW_RISK",
                "report_json": trial_report,
                "created_at": datetime.utcnow().isoformat()
            }).execute()
        
        print(f"Successfully seeded/updated trial data for 'Nebula Robotics'!")
        print("You can view it at: http://localhost:3000/reports/nebula-robotics-trial")
        
    except Exception as e:
        print(f"Error seeding data: {e}")

if __name__ == "__main__":
    seed_data()
