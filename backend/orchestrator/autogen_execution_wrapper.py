"""
Module 1: AutoGen Agent Execution Wrapper
Single-agent async executor with error isolation and timestamp metadata.
"""
import json
import asyncio
from datetime import datetime, timezone
from typing import Any, Dict


from autogen_agentchat.messages import TextMessage
from autogen_core import CancellationToken

async def execute_autogen_agent(agent, context: Dict[str, Any]) -> Dict[str, Any]:
    """
    Execute a single AutoGen agent with the given context.
    
    Args:
        agent: AutoGen AssistantAgent instance.
        context: Dictionary of data to send to the agent.
        
    Returns:
        Parsed JSON output from the agent, or a structured error object.
    """
    agent_name = getattr(agent, "name", "unknown_agent")
    started_at = datetime.now(timezone.utc).isoformat()

    try:
        # Convert context dict to a JSON string message
        context_message = json.dumps(context, indent=2, default=str)

        # Build the message list for the agent (v0.7 API)
        messages = [
            TextMessage(content=context_message, source="user")
        ]

        # Call the agent asynchronously using on_messages (v0.7 API)
        response = await agent.on_messages(messages, CancellationToken())

        # Extract the text content from the response
        # response is a Response object containing chat_message
        if not response or not response.chat_message:
             raise ValueError("Agent returned empty response.")

        # Extract string content
        raw_text = response.chat_message.content
        if not isinstance(raw_text, str):
            raw_text = str(raw_text)

        # Parse JSON from the response
        parsed = _extract_json(raw_text)

        # Add execution metadata
        parsed["_meta"] = {
            "agent": agent_name,
            "started_at": started_at,
            "completed_at": datetime.now(timezone.utc).isoformat(),
        }

        return parsed

    except Exception as e:
        return {
            "error": True,
            "agent": agent_name,
            "message": str(e),
            "_meta": {
                "agent": agent_name,
                "started_at": started_at,
                "completed_at": datetime.now(timezone.utc).isoformat(),
            }
        }


def _extract_json(text: str) -> Dict[str, Any]:
    """
    Safely extract a JSON object from agent response text.
    Handles cases where the JSON is wrapped in markdown code blocks.
    """
    text = text.strip()

    # Strip markdown code fences if present
    if text.startswith("```"):
        lines = text.split("\n")
        # Remove first and last lines (``` markers)
        lines = [l for l in lines if not l.strip().startswith("```")]
        text = "\n".join(lines).strip()

    # Try direct parse
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Try to find JSON object within the text
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        try:
            return json.loads(text[start:end + 1])
        except json.JSONDecodeError:
            pass

    raise ValueError(f"Could not extract valid JSON from agent response: {text[:200]}...")
