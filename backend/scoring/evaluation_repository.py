"""
Layer 8: Persistence Layer
Stores evaluation results into database (Supabase/Postgres).
Supports async DB calls.
"""
import json
from datetime import datetime, timezone
from typing import Any, Dict, Optional


class EvaluationRepository:
    """
    Async repository for storing evaluation results.
    Uses Supabase client for persistence.
    """

    def __init__(self, supabase_client=None):
        """
        Args:
            supabase_client: Initialized Supabase client.
                             If None, operates in dry-run mode (returns data without saving).
        """
        self.client = supabase_client
        self.table_name = "startup_evaluations"

    async def save_evaluation(
        self, report: Dict[str, Any], user_id: str = None
    ) -> Dict[str, Any]:
        """
        Save a complete evaluation report to the database.

        Args:
            report: Output from ReportBuilder.build_final_report().
            user_id: The authenticated user's ID (optional).

        Returns:
            The saved record dict (with id if available).
        """
        record = {
            "startup_id": report.get("startup_id", "unknown"),
            "user_id": user_id,
            "final_score": report.get("final_score", 0.0),
            "risk_label": report.get("risk_label", "HIGH_RISK"),
            "report_json": json.dumps(report, default=str),
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

        if self.client is None:
            # Dry-run mode — return the record without DB call
            record["_dry_run"] = True
            return record

        try:
            result = self.client.table(self.table_name).insert(record).execute()
            saved = result.data[0] if result.data else record
            return saved
        except Exception as e:
            return {
                "error": True,
                "message": f"Database save failed: {str(e)}",
                "record": record,
            }

    async def get_evaluation(
        self, startup_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Retrieve an evaluation by startup_id.

        Args:
            startup_id: The unique startup identifier.

        Returns:
            The evaluation record or None.
        """
        if self.client is None:
            return None

        try:
            result = (
                self.client.table(self.table_name)
                .select("*")
                .eq("startup_id", startup_id)
                .order("created_at", desc=True)
                .limit(1)
                .execute()
            )
            return result.data[0] if result.data else None
        except Exception:
            return None
