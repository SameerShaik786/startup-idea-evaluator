from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any
import os
import json
import asyncio
from uuid import uuid4
from dotenv import load_dotenv

load_dotenv()  # Load .env file if present

# Import our backend services
from backend.scoring.evaluation_service import EvaluationService
from backend.orchestrator.autogen_orchestrator import AutoGenEvaluationOrchestrator
from backend.agents.autogen_registry import initialize_agents
from backend.models import StartupContext, FinancialRawInput  # Pydantic models

app = FastAPI(title="IdeaEvaluator API", version="1.0.0")

# Allow CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
# In a real app, you might want to inject dependencies
# For now, we instantiate them globally or per request
# Note: EvaluationService requires Supabase client.
# We'll initialize it inside the endpoint or dependency injection.
from supabase import create_client, Client

# Initialize Supabase
url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

supabase: Client = None
if url and key:
    try:
        supabase = create_client(url, key)
        print("✅ Supabase client initialized")
    except Exception as e:
        print(f"⚠️ Supabase init failed: {e}")
else:
    print("⚠️  Supabase credentials missing. Persistence will run in dry-run mode.")


class EvaluationRequest(BaseModel):
    startup_context: Dict[str, Any]
    financial_raw_input: Dict[str, Any]
    qualitative: Dict[str, Any]
    metadata: Dict[str, Any]
    user_id: str = None  # authenticated user's ID


@app.get("/")
async def root():
    return {"status": "ok", "service": "IdeaEvaluator Backend"}


from fastapi import FastAPI, HTTPException, Body, Request
from backend.extraction_service import ExtractionService

# ... imports ...

@app.post("/extract")
async def extract_info(payload: Dict[str, str] = Body(...)):
    """
    Extract structured startup info from unstructured text.
    Payload: { "text": "pitch deck text..." }
    """
    text = payload.get("text")
    if not text:
        raise HTTPException(status_code=400, detail="Text is required")
    
    try:
        service = ExtractionService()
        result = await service.extract_startup_info(text)
        return result
    except Exception as e:
        print(f"❌ Extraction service failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/evaluate")
async def evaluate_startup(request: EvaluationRequest, raw_request: Request):
    """
    Run the full evaluation pipeline:
    1. Orchestrate agents (Validator -> Parallel -> Risk -> Longevity -> InvestorFit)
    2. Score & Report (Layer 6-7)
    3. Persist (Layer 8)
    """
    try:
        # 0. Setup Authenticated Supabase Client
        # We need to forward the user's JWT to Supabase to pass RLS policies.
        auth_header = raw_request.headers.get("Authorization")
        token = auth_header.split(" ")[1] if auth_header and "Bearer" in auth_header else None
        
        request_supabase = supabase  # Default to global (anon)
        if token and supabase:
            # Create a shallow copy or just auth the existing one?
            # supabase-py doesn't support easy cloning with new auth.
            # We'll create a new client instance for this request context if possible,
            # OR we simply set the auth header on the postgrest client.
            
            # Using the client factory is safer
            request_supabase = create_client(url, key)
            request_supabase.postgrest.auth(token)
            print("🔐 Supabase client authenticated with user token")

        # 1. Initialize Orchestrator
        # ...
        
        # ... validation ...

        # Validate basics with Pydantic models (fails fast if invalid)
        try:
            startup_ctx = StartupContext(**request.startup_context)
            financial_input = FinancialRawInput(
                startup_id=startup_ctx.startup_id,
                **request.financial_raw_input
            )
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Input validation failed: {str(e)}")

        # ── Persist startup to `startups` table ──────────────────
        # So the startup appears on the Discover page
        if request_supabase:
            try:
                # ... (rest of logic uses request_supabase instead of supabase)
                qualitative = request.qualitative or {}
                startup_row = {
                    "id": str(startup_ctx.startup_id),
                    "name": startup_ctx.name,
                    "industry": startup_ctx.industry,
                    "stage": startup_ctx.stage,
                    "description": startup_ctx.description,
                    "website": startup_ctx.website,
                    # Map to Discover page columns
                    "tagline": startup_ctx.description,  # tagline = short description
                    "sector": startup_ctx.industry,       # sector mirrors industry
                    "about": qualitative.get("problem_description", startup_ctx.description),
                    "product": qualitative.get("product_description", ""),
                    "trending": False,
                }
                # Add founder_id if user_id provided
                if request.user_id:
                    startup_row["founder_id"] = request.user_id
                # Upsert: insert or update if name already exists
                request_supabase.table("startups").upsert(
                    startup_row, on_conflict="id"
                ).execute()
                print(f"✅ Startup '{startup_ctx.name}' saved to startups table")
            except Exception as e:
                print(f"⚠️ Failed to save startup to startups table: {e}")
                # Non-fatal: continue with evaluation even if this fails

        # Initialize agents and orchestrator
        agents = initialize_agents()
        orchestrator = AutoGenEvaluationOrchestrator(agents=agents)

        # Construct the full context dictionary expected by agents
        full_context = {
            "startup_context": startup_ctx.model_dump(mode="json"),
            "financial_input": financial_input.model_dump(mode="json"),
            "qualitative": request.qualitative,
            "metadata": request.metadata
        }

        # Run Orchestration (Layer 5)
        print(f"🚀 Starting evaluation for: {startup_ctx.name}")
        orchestration_result = await orchestrator.run_full_evaluation(
            startup_context=full_context
        )

        if "error" in orchestration_result:
             raise HTTPException(status_code=500, detail=orchestration_result["error"])

        # Run Post-Processing Pipeline (Layers 6, 7, 8)
        # Use the authenticated client
        evaluation_service = EvaluationService(supabase_client=request_supabase)

        final_report = await evaluation_service.evaluate(
            startup_id=str(startup_ctx.startup_id),
            orchestration_output=orchestration_result,
            startup_name=startup_ctx.name,
            user_id=request.user_id
        )

        return final_report

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
