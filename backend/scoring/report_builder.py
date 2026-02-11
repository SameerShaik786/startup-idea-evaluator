"""
Layer 7: Report Builder
Converts agent outputs + final score into a structured evaluation report.
NO LLM — pure data transformation.
"""
from datetime import datetime, timezone
from typing import Any, Dict


# Risk label thresholds
RISK_THRESHOLDS = {
    "LOW_RISK": 0.75,
    "MEDIUM_RISK": 0.50,
}


class ReportBuilder:
    """
    Builds the final evaluation report from agent outputs and scoring.
    Does NOT modify agent outputs.
    """

    @staticmethod
    def build_final_report(
        startup_id: str,
        agent_outputs: Dict[str, Dict[str, Any]],
        scoring_result: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Build the final evaluation report.

        Args:
            startup_id: Unique identifier for the startup.
            agent_outputs: The "agents" dict from orchestration.
            scoring_result: Output from ScoringEngine.calculate_final_score().

        Returns:
            Structured evaluation report dictionary.
        """
        final_score = scoring_result.get("final_score", 0.0)

        return {
            "startup_id": startup_id,
            "final_score": final_score,
            "risk_label": ReportBuilder._get_risk_label(final_score),
            "evaluation_timestamp": datetime.now(timezone.utc).isoformat(),
            "component_scores": scoring_result.get("component_scores", {}),
            "weights_used": scoring_result.get("weights_used", {}),
            "agent_results": agent_outputs,
            "summary": ReportBuilder._build_summary(final_score, agent_outputs),
        }

    @staticmethod
    def _get_risk_label(score: float) -> str:
        """Map final score to risk category."""
        if score > RISK_THRESHOLDS["LOW_RISK"]:
            return "LOW_RISK"
        elif score > RISK_THRESHOLDS["MEDIUM_RISK"]:
            return "MEDIUM_RISK"
        else:
            return "HIGH_RISK"

    @staticmethod
    def _build_summary(
        final_score: float, agent_outputs: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Build a quick summary from key agent outputs."""
        error_agents = [
            name for name, data in agent_outputs.items()
            if isinstance(data, dict) and data.get("error")
        ]

        return {
            "agents_succeeded": len(agent_outputs) - len(error_agents),
            "agents_failed": len(error_agents),
            "failed_agents": error_agents,
            "final_score": final_score,
        }
