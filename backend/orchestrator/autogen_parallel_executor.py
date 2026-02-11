"""
Module 2: AutoGen Parallel Execution Helper
Runs multiple agent tasks concurrently using asyncio.gather.
"""
import asyncio
from typing import Any, Dict, List, Coroutine


async def run_autogen_parallel(
    agent_tasks: List[Coroutine]
) -> List[Dict[str, Any]]:
    """
    Run multiple agent execution coroutines in parallel.

    Args:
        agent_tasks: List of coroutines (e.g., execute_autogen_agent calls).

    Returns:
        Ordered list of agent outputs. Failed agents return error objects
        instead of crashing the entire batch.
    """
    # return_exceptions=True ensures partial failures don't kill the batch
    results = await asyncio.gather(*agent_tasks, return_exceptions=True)

    processed = []
    for result in results:
        if isinstance(result, Exception):
            # Convert exception to structured error object
            processed.append({
                "error": True,
                "agent": "unknown",
                "message": str(result),
            })
        else:
            processed.append(result)

    return processed
