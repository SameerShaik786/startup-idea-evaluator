"""
AutoGen v0.7 Utility Functions
Bridges Groq API to AutoGen's ChatCompletionClient interface.
"""
import os
from autogen_ext.models.openai import OpenAIChatCompletionClient


def get_model_client() -> OpenAIChatCompletionClient:
    """
    Returns an OpenAI-compatible ChatCompletionClient configured for Groq.
    AutoGen v0.7 requires a model_client (not llm_config dict).
    """
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY environment variable is not set.")

    client = OpenAIChatCompletionClient(
        model="llama-3.3-70b-versatile",
        api_key=api_key,
        base_url="https://api.groq.com/openai/v1",
        temperature=0.2,     # Low temp for factual analysis
        model_info={
            "vision": False,
            "function_calling": True,
            "json_output": True,
            "structured_output": False,
            "family": "unknown",
        },
    )
    return client


def load_system_prompt(agent_name: str) -> str:
    """
    Loads the system prompt from backend/prompts/{agent_name}_system.txt.
    Falls back to a generic prompt if the file doesn't exist.
    """
    # this file lives in backend/agents/
    # prompts live in backend/prompts/
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    prompt_path = os.path.join(base_dir, "prompts", f"{agent_name}_system.txt")

    if not os.path.exists(prompt_path):
        return f"You are the {agent_name} agent. Analyze the startup context provided."

    with open(prompt_path, "r", encoding="utf-8") as f:
        return f.read()
