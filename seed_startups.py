"""
Run the Supabase seed data for startups table.
Uses the supabase-py client with the anon key.

PREREQUISITE: Run supabase_migration.sql in Supabase SQL Editor first!
"""
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not url or not key:
    print("Error: Supabase URL or Key not found in .env")
    exit(1)

supabase: Client = create_client(url, key)

def seed_startups():
    """Insert seed startups using the Python client directly."""
    # These entries include both the original schema columns (name, industry, stage, description, website)
    # AND the new columns added by supabase_migration.sql (tagline, sector, raise_amount, about, product, trending)
    startups = [
        {
            "name": "Nebula AI",
            "industry": "HealthTech",
            "stage": "Series A",
            "description": "Generative AI for pharmaceutical drug discovery",
            "website": "https://nebula-ai.com",
            "tagline": "Generative AI for pharmaceutical drug discovery",
            "sector": "HealthTech",
            "raise_amount": "$5M",
            "about": "Nebula AI is revolutionizing pharmaceutical drug discovery using cutting-edge generative AI models. Founded in 2024 by a team of MIT researchers and pharma veterans, the company has developed proprietary transformer architectures that can predict molecular binding affinity with 94% accuracy — a 3x improvement over traditional computational methods. The platform has already identified 12 novel drug candidates for rare diseases, with 3 entering pre-clinical trials.",
            "product": "Nebula's core product is MoleculeForge — an AI-powered drug discovery platform that combines deep learning with quantum chemistry simulations. Researchers upload target protein structures and the platform generates optimized molecular candidates in hours instead of months. The platform includes real-time ADMET prediction, interactive 3D molecular visualization, and automated patent landscape analysis.",
            "trending": True,
        },
        {
            "name": "GreenGrid",
            "industry": "CleanTech",
            "stage": "Seed",
            "description": "Decentralized energy trading platform for solar households",
            "website": "https://greengrid.energy",
            "tagline": "Decentralized energy trading platform for solar households",
            "sector": "CleanTech",
            "raise_amount": "$1.2M",
            "about": "GreenGrid enables homeowners with solar panels to sell excess energy directly to their neighbors through a blockchain-based peer-to-peer marketplace. The platform eliminates the middleman, allowing prosumers to earn 40% more per kWh compared to selling back to the grid. Currently operating in 3 pilot cities across California with 2,500 households onboarded.",
            "product": "The GreenGrid platform consists of a smart meter IoT device that connects to home solar systems and a mobile app for managing energy trades. The proprietary matching algorithm optimizes energy distribution based on real-time demand, weather forecasts, and grid capacity. Smart contracts handle automated settlements with sub-cent transaction fees.",
            "trending": True,
        },
        {
            "name": "SecureChain",
            "industry": "FinTech",
            "stage": "Series B",
            "description": "Enterprise blockchain security for supply chain logistics",
            "website": "https://securechain.io",
            "tagline": "Enterprise blockchain security for supply chain logistics",
            "sector": "FinTech",
            "raise_amount": "$12M",
            "about": "SecureChain provides enterprise-grade blockchain infrastructure specifically designed for global supply chain operations. The platform enables end-to-end traceability of goods from raw material sourcing to final delivery, reducing fraud by 78% and disputes by 60%. Currently serves 45 enterprise clients processing over 2 million transactions daily.",
            "product": "SecureChain's product suite includes ChainVerify (real-time product authentication using NFC tags), ChainTrace (end-to-end shipment tracking with IoT sensor integration), and ChainComply (automated regulatory compliance reporting for cross-border trade). An intuitive no-code dashboard allows supply chain managers to configure workflows and generate audit reports.",
            "trending": False,
        },
        {
            "name": "MindBridge",
            "industry": "HealthTech",
            "stage": "Seed",
            "description": "AI-powered mental health companion for corporate wellness",
            "website": "https://mindbridge.health",
            "tagline": "AI-powered mental health companion for corporate wellness",
            "sector": "HealthTech",
            "raise_amount": "$2M",
            "about": "MindBridge is building the next generation of corporate mental health support using conversational AI trained on evidence-based therapeutic frameworks (CBT, DBT, ACT). Early pilots with Fortune 500 companies show a 35% reduction in reported burnout and 22% improvement in employee retention. MindBridge is HIPAA-compliant and SOC 2 Type II certified.",
            "product": "The MindBridge platform offers an AI companion accessible via Slack, Teams, or a standalone mobile app. Employees can engage in structured therapeutic conversations, mood tracking, guided meditations, and crisis intervention pathways. The HR admin dashboard provides anonymized workforce wellbeing analytics and ROI reporting.",
            "trending": True,
        },
        {
            "name": "AgroSense",
            "industry": "AgriTech",
            "stage": "Series A",
            "description": "Precision agriculture using satellite imagery and edge AI",
            "website": "https://agrosense.ag",
            "tagline": "Precision agriculture using satellite imagery and edge AI",
            "sector": "AgriTech",
            "raise_amount": "$4.5M",
            "about": "AgroSense combines satellite imagery, drone data, and edge AI to give farmers actionable insights that increase crop yields by 25% while reducing water usage by 30%. The platform currently monitors over 500,000 acres across India, Brazil, and the US Midwest with partnerships with John Deere and Bayer Crop Science.",
            "product": "AgroSense deploys lightweight ML models on solar-powered edge devices installed across farmland. These devices process multispectral drone imagery and soil sensor data locally, providing real-time alerts for pest detection, nutrient deficiency, and irrigation optimization. The farmer-facing mobile app supports 12 regional languages.",
            "trending": False,
        },
        {
            "name": "QuantumLeap Finance",
            "industry": "FinTech",
            "stage": "Pre-Seed",
            "description": "Quantum computing algorithms for portfolio optimization",
            "website": "https://quantumleap.finance",
            "tagline": "Quantum computing algorithms for portfolio optimization",
            "sector": "FinTech",
            "raise_amount": "$800K",
            "about": "QuantumLeap Finance is developing quantum-classical hybrid algorithms that solve portfolio optimization problems 100x faster than traditional methods. The founding team includes a former Goldman Sachs quant and a quantum computing PhD from Caltech. The company has secured partnerships with two mid-tier hedge funds for beta testing.",
            "product": "The QuantumLeap platform provides an API-first solution that integrates with existing portfolio management systems. Fund managers define optimization constraints and the platform returns optimal allocations computed on quantum hardware. The dashboard visualizes the efficient frontier, stress test scenarios, and factor exposure analysis.",
            "trending": False,
        },
    ]
    
    try:
        # Check if seed data already exists
        existing = supabase.table("startups").select("id, name").execute()
        existing_names = [s["name"] for s in (existing.data or [])]
        
        # Filter out already-existing startups
        new_startups = [s for s in startups if s["name"] not in existing_names]
        
        if not new_startups:
            print(f"All {len(startups)} startups already exist. Nothing to insert.")
            return
        
        result = supabase.table("startups").insert(new_startups).execute()
        print(f"Successfully inserted {len(result.data)} new startups!")
        for s in result.data:
            print(f"  - {s['name']} (id: {s['id']})")
    except Exception as e:
        print(f"Error inserting startups: {e}")
        print()
        print("Make sure you've run supabase_migration.sql in Supabase SQL Editor first!")
        print("The migration adds the required columns (sector, tagline, about, product, etc.) to the startups table.")

if __name__ == "__main__":
    print("=" * 60)
    print("  Startup Seed Data Script")
    print("  PREREQUISITE: Run supabase_migration.sql first!")
    print("=" * 60)
    print()
    seed_startups()
