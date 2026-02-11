import asyncio
import os
import json
from dotenv import load_dotenv
from supabase import create_client

# Load environment variables
load_dotenv()

async def debug_evaluations():
    url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    
    if not url or not key:
        print("❌ Missing Supabase credentials")
        return

    try:
        supabase = create_client(url, key)
        response = supabase.table("startup_evaluations").select("*").limit(1).execute()
        
        if response.data:
            print(f"Found {len(response.data)} evaluations.")
            item = response.data[0]
            print("Keys:", item.keys())
            print("report_json type:", type(item.get('report_json')))
            if item.get('report_json'):
                print("report_json content:", json.dumps(item.get('report_json'), indent=2))
        else:
            print("No evaluations found.")
            
    except Exception as e:
        print(f"Error checking evaluations: {e}")

if __name__ == "__main__":
    asyncio.run(debug_evaluations())
