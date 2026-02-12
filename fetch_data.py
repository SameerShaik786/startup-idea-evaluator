import os
import json
from supabase import create_client
from dotenv import load_dotenv

load_dotenv('.env.local')

def get_json():
    url = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
    key = os.environ.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    if not url or not key:
        print("Missing credentials")
        return
        
    supabase = create_client(url, key)
    # Correct execute call
    result = supabase.table('startup_evaluations').select('report_json').eq('startup_id', 'e64afaa3-a0b1-4a49-be8d-c7b28cf57260').single().execute()
    
    if result.data:
        print(json.dumps(result.data['report_json'], indent=2))
    else:
        print("No data found")

if __name__ == "__main__":
    get_json()
