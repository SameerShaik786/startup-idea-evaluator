"""
AutoGen v0.7 Agent Registry
Initializes all 7 specialist evaluation agents + a user proxy.
"""
from typing import Dict
from autogen_agentchat.agents import AssistantAgent, UserProxyAgent
from backend.agents.autogen_utils import get_model_client, load_system_prompt


# Agent specification: logical name -> prompt file prefix
AGENT_SPECS = [
    {"name": "evaluator_validator",     "prompt": "validator",     "desc": "Validates submission consistency and completeness."},
    {"name": "evaluator_financial",     "prompt": "financial",     "desc": "Analyzes financial health using pre-calculated metrics."},
    {"name": "evaluator_market",        "prompt": "market",        "desc": "Estimates TAM/SAM/SOM using Fermi logic."},
    {"name": "evaluator_competition",   "prompt": "competition",   "desc": "Assesses competitive landscape and novelty."},
    {"name": "evaluator_risk",          "prompt": "risk",          "desc": "Identifies and scores critical startup risks."},
    {"name": "evaluator_longevity",     "prompt": "longevity",     "desc": "Predicts 3-year and 5-year survival probability."},
    {"name": "evaluator_investor_fit",  "prompt": "investor_fit",  "desc": "Matches startups with investor types and stages."},
]


def initialize_agents(model_client=None) -> Dict[str, AssistantAgent]:
    """
    Factory function that creates all evaluation agents.

    Args:
        model_client: Optional pre-configured ChatCompletionClient.
                      If None, creates one from GROQ_API_KEY env var.

    Returns:
        Dict mapping agent name -> AssistantAgent instance.
        Also includes a 'user_proxy' key.
    """
    if model_client is None:
        model_client = get_model_client()

    agents: Dict[str, AssistantAgent] = {}

    for spec in AGENT_SPECS:
        system_message = load_system_prompt(spec["prompt"])

        agent = AssistantAgent(
            name=spec["name"],
            model_client=model_client,
            system_message=system_message,
            description=spec["desc"],
        )
        agents[spec["name"]] = agent

    # User proxy — represents the orchestrator / end-user trigger
    agents["user_proxy"] = UserProxyAgent(
        name="user_proxy",
        description="Orchestrator interface that initiates evaluation workflows.",
    )

    return agents


def get_agent_registry() -> Dict[str, AssistantAgent]:
    """
    Convenience alias for initialize_agents().
    Returns the full registry dictionary.
    """
    return initialize_agents()
