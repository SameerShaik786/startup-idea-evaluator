"""
Service Integration Layer
Connects Scoring Engine, Report Builder, and Persistence.
Single entry point for post-orchestration processing.
"""
from typing import Any, Dict

from backend.scoring.scoring_engine import ScoringEngine
from backend.scoring.report_builder import ReportBuilder
from backend.scoring.evaluation_repository import EvaluationRepository


class EvaluationService:
    """
    Connects Layers 6–8 into a single flow.
    Receives orchestration output → scores → builds report → persists.
    """

    def __init__(self, supabase_client=None):
        self.scoring_engine = ScoringEngine()
        self.report_builder = ReportBuilder()
        self.repository = EvaluationRepository(supabase_client)

    async def evaluate(
        self,
        startup_id: str,
        orchestration_output: Dict[str, Any],
        startup_name: str = "Unknown Startup",
    ) -> Dict[str, Any]:
        """
        Full post-orchestration pipeline.

        Args:
            startup_id: Unique startup identifier.
            orchestration_output: Output from AutoGenEvaluationOrchestrator.run_full_evaluation().
            startup_name: Name of the startup (for report context).

        Returns:
            The final evaluation report (also persisted to DB).
        """
        agent_outputs = orchestration_output.get("agents", {})

        # Layer 6: Score
        scoring_result = self.scoring_engine.calculate_final_score(agent_outputs)

        # Layer 7: Report
        report = self.report_builder.build_final_report(
            startup_id, agent_outputs, scoring_result
        )
        report["startup_name"] = startup_name  # Inject name

        # Layer 8: Persist
        print(f"DEBUG: Attempting to save report for {startup_id}...")
        save_result = await self.repository.save_evaluation(report)
        print(f"DEBUG: Save result: {save_result}")

        # Attach persistence status to report
        report["_persistence"] = {
            "saved": not save_result.get("error", False),
            "dry_run": save_result.get("_dry_run", False),
        }
        
        return report
