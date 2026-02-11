import os
from typing import Optional
from groq import Groq

class GroqConfig:
    """Centralized configuration for Groq LLM usage."""
    MODEL_NAME = "llama-3.3-70b-versatile"
    TEMPERATURE = 0.2
    MAX_TOKENS = 4096
    
    @staticmethod
    def get_api_key() -> str:
        key = os.environ.get("GROQ_API_KEY")
        if not key:
            raise ValueError("GROQ_API_KEY environment variable is not set.")
        return key

def get_groq_client() -> Groq:
    """Returns an authenticated Groq client."""
    return Groq(api_key=GroqConfig.get_api_key())
