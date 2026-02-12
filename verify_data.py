import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

supabase: Client = create_client(url, key)

def verify():
    print(f"Checking for 'nebula-robotics-trial' in {url}...")
    res = supabase.table("startup_evaluations").select("*").eq("startup_id", "nebula-robotics-trial").execute()
    
    if res.data:
        record = res.data[0]
        print("✅ Record found!")
        print(f"Startup ID: {record['startup_id']}")
        print(f"Final Score: {record['final_score']}")
        print(f"Risk Label: {record['risk_label']}")
        
        report = record['report_json']
        print("\nChecking report_json keys:")
        keys = report.keys()
        agent_keys = report.get('agent_results', {}).keys()
        
        print(f"Main keys: {list(keys)}")
        print(f"Agent keys: {list(agent_keys)}")
        
        # Verify specific keys we fixed in frontend
        required_agents = ['market', 'financial', 'risk', 'validator', 'competition']
        missing = [a for a in required_agents if a not in agent_keys]
        
        if not missing:
            print("✅ All required agent keys are present and mapped correctly!")
        else:
            print(f"❌ Missing agent keys: {missing}")
            
    else:
        print("❌ Record NOT found!")

if __name__ == "__main__":
    verify()
