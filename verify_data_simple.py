import os
import json
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

supabase: Client = create_client(url, key)

def verify():
    print(f"Checking for 'nebula-robotics-trial'...")
    res = supabase.table("startup_evaluations").select("*").eq("startup_id", "nebula-robotics-trial").execute()
    
    if res.data:
        record = res.data[0]
        print("Record found!")
        print(f"Final Score: {record['final_score']}")
        
        report = record['report_json']
        if isinstance(report, str):
            report = json.loads(report)
            
        agent_results = report.get('agent_results', {})
        print(f"Agent keys present: {list(agent_results.keys())}")
        
        if 'longevity' in agent_results:
            print(f"Longevity data: {agent_results['longevity']}")
        else:
            print("MISSING LONGEVITY")
            
        if 'investor_fit' in agent_results:
            print(f"Investor Fit data keys: {list(agent_results['investor_fit'].keys())}")
        else:
            print("MISSING INVESTOR FIT")
    else:
        print("Record NOT found!")

if __name__ == "__main__":
    verify()
