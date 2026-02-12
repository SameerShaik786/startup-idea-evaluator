
import asyncio
import os
from dotenv import load_dotenv
from supabase import create_client

# Load environment variables
load_dotenv()

async def check_evaluations():
    url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    
    if not url or not key:
        print("❌ Missing Supabase credentials")
        return

    try:
        supabase = create_client(url, key)
        response = supabase.table("startup_evaluations").select("*").execute()
        
        if response.data:
            print(f"Found {len(response.data)} evaluations in the database.")
            for eval in response.data[:3]:
                report_json = eval.get('report_json')
                report_snippet = str(report_json)[:100] + "..." if report_json else "None"
                print(f"   - ID: {eval.get('startup_id')}, Score: {eval.get('final_score')}, JSON: {report_snippet}")
        else:
            print("No evaluations found in the database yet.")
            
    except Exception as e:
        print(f"Error checking evaluations: {e}")

if __name__ == "__main__":
    asyncio.run(check_evaluations())
