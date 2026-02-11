"""
Layer 6: Scoring Engine
Deterministic weighted scoring — NO LLM.
Converts agent outputs into a final 0–1 investment score.
"""
from typing import Any, Dict, Optional


# Default weights — must sum to 1.0
DEFAULT_WEIGHTS = {
    "financial": 0.30,
    "market": 0.20,
    "risk": 0.30,
    "validator": 0.20,
}


class ScoringEngine:
    """
    Deterministic scoring engine.
    Extracts scores from agent outputs, applies weights, returns clamped 0–1 score.
    """

    def __init__(self, weights: Optional[Dict[str, float]] = None):
        self.weights = weights or DEFAULT_WEIGHTS

    def calculate_final_score(
        self, agent_outputs: Dict[str, Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Calculate the final investment score from agent outputs.

        Args:
            agent_outputs: The "agents" dict from orchestration result.

        Returns:
            {
              "final_score": float,
              "component_scores": { name: score },
              "weights_used": { name: weight }
            }
        """
        component_scores = {}

        # Financial: direct score
        component_scores["financial"] = self._safe_get(
            agent_outputs, "financial", "financial_health_score"
        )

        # Market: direct score
        component_scores["market"] = self._safe_get(
            agent_outputs, "market", "market_growth_score"
        )

        # Risk: INVERSE (low risk = high score)
        raw_risk = self._safe_get(
            agent_outputs, "risk", "risk_severity_score"
        )
        component_scores["risk"] = 1.0 - raw_risk

        # Validator: average of consistency + completeness
        consistency = self._safe_get(
            agent_outputs, "validator", "data_consistency_score"
        )
        completeness = self._safe_get(
            agent_outputs, "validator", "completeness_score"
        )
        component_scores["validator"] = (consistency + completeness) / 2.0

        # Weighted sum
        weighted_sum = sum(
            component_scores[k] * self.weights[k]
            for k in self.weights
        )

        # Clamp to 0–1
        final_score = max(0.0, min(1.0, weighted_sum))

        return {
            "final_score": round(final_score, 4),
            "component_scores": {k: round(v, 4) for k, v in component_scores.items()},
            "weights_used": self.weights,
        }

    @staticmethod
    def _safe_get(
        agent_outputs: Dict[str, Any],
        agent_name: str,
        field: str,
        default: float = 0.5
    ) -> float:
        """
        Safely extract a numeric score from agent output.
        Returns default if agent failed or field is missing.
        """
        agent_data = agent_outputs.get(agent_name, {})

        # If agent errored, return default
        if not isinstance(agent_data, dict) or agent_data.get("error"):
            return default

        value = agent_data.get(field, default)

        # Ensure numeric
        try:
            value = float(value)
        except (TypeError, ValueError):
            return default

        # Clamp individual score
        return max(0.0, min(1.0, value))
