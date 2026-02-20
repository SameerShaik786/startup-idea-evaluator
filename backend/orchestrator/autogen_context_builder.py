"""
Module 3: Context Packaging Helper
Merges startup context with upstream agent outputs without mutation.
"""
import copy
from typing import Any, Dict


def build_autogen_context(
    base_context: Dict[str, Any],
    additional_outputs: Dict[str, Any] | None = None
) -> Dict[str, Any]:
    """
    Merge startup context with upstream agent outputs.

    Args:
        base_context: The original startup context dict.
        additional_outputs: Dictionary of upstream agent outputs to merge.

    Returns:
        New merged dictionary. Never mutates the originals.
    """
    # Deep copy to prevent mutation of original context
    merged = copy.deepcopy(base_context)

    if additional_outputs:
        # Store upstream outputs under a dedicated key
        upstream = merged.get("upstream_outputs", {})

        for key, value in additional_outputs.items():
            # Skip error outputs — don't propagate broken data downstream
            if isinstance(value, dict) and value.get("error"):
                upstream[key] = {"error": True, "message": value.get("message", "upstream failure")}
            else:
                upstream[key] = copy.deepcopy(value)

        merged["upstream_outputs"] = upstream

    return merged