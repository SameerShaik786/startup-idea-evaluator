"""
Module 4: Result Aggregator
Packages all agent outputs into a final orchestration result object.
"""
from datetime import datetime, timezone
from typing import Any, Dict


def build_orchestration_result(
    agent_outputs: Dict[str, Dict[str, Any]],
    started_at: str
) -> Dict[str, Any]:
    """
    Aggregate all agent outputs into a final result object.

    Args:
        agent_outputs: Dictionary mapping agent_name -> agent output dict.
        started_at: ISO timestamp of when the orchestration started.

    Returns:
        Final orchestration result dictionary.
    """
    completed_at = datetime.now(timezone.utc).isoformat()

    # Count errors
    error_count = sum(
        1 for v in agent_outputs.values()
        if isinstance(v, dict) and v.get("error")
    )

    return {
        "started_at": started_at,
        "completed_at": completed_at,
        "agents": agent_outputs,
        "summary": {
            "total_agents": len(agent_outputs),
            "successful": len(agent_outputs) - error_count,
            "failed": error_count,
        }
    }
