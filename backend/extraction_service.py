import json
import os
from typing import Dict, Any
from autogen_ext.models.openai import OpenAIChatCompletionClient
from autogen_core.models import SystemMessage, UserMessage

# Reuse the Groq client setup from autogen_utils
from backend.agents.autogen_utils import get_model_client

class ExtractionService:
    def __init__(self):
        self.client = get_model_client()

    async def extract_startup_info(self, text: str) -> Dict[str, Any]:
        """
        Extracts structured startup information from unstructured text/pitch deck.
        Returns a dictionary matching the frontend formData structure.
        """
        system_prompt = """
        You are a Venture Capital Analyst Assistant.
        Your job is to extract structured data from a startup pitch deck or description to fill out an evaluation form.
        
        RETURN JSON ONLY. NO MARKDOWN. NO EXPLANATION.
        
        The JSON structure must match this EXACT schema (all fields strings unless specified):
        {
            "startupName": "Name of startup",
            "tagline": "One liner description",
            "website": "URL if found",
            "industry": "Best fit from: AI / Machine Learning, B2B SaaS, Consumer Tech, E-commerce, EdTech, FinTech, HealthTech, Climate / CleanTech, Marketplace, Hardware / IoT, Other",
            "stage": "Best fit from: Pre-seed, Seed, Series A, Series B, Series C+, Pre-revenue, Revenue Generating",
            "foundedDate": "YYYY-MM-DD if found, else empty",
            "problemDescription": "Detailed problem statement (at least 2 sentences)",
            "targetCustomerPersona": "Who is the customer?",
            "currentAlternatives": "Who are they competing against?",
            "whyNow": "Why is this the right time?",
            "productDescription": "What is the solution?",
            "competitors": "List of competitors",
            "differentiation": "Why is this better?",
            "whyYouWin": "Unfair advantage",
            "founderBackground": "Founder details if present",
            "domainExperience": "Relevant experience if present"
        }
        
        If information is missing, try to INFER reasonable values based on context, or leave as empty string if impossible.
        For financial data (revenue, cogs, etc), DO NOT extract it as it requires precise numbers. Leave those for the user.
        """

        response = await self.client.create(
            messages=[
                SystemMessage(content=system_prompt, source="system"),
                UserMessage(content=f"Extract info from this text:\n\n{text}", source="user")
            ]
        )

        content = response.content
        if isinstance(content, str):
            # Clean md blocks if present
            content = content.replace("```json", "").replace("```", "").strip()
            try:
                return json.loads(content)
            except json.JSONDecodeError:
                return {"error": "Failed to parse JSON extraction"}
        
        return {"error": "Invalid response type"}
