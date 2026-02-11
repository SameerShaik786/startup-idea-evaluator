"""
Unit tests for Layers 6, 7, 8 and EvaluationService.
"""
import unittest
import asyncio
import json
from unittest.mock import AsyncMock, MagicMock

from backend.scoring.scoring_engine import ScoringEngine
from backend.scoring.report_builder import ReportBuilder
from backend.scoring.evaluation_repository import EvaluationRepository
from backend.scoring.evaluation_service import EvaluationService


def _run(coro):
    return asyncio.get_event_loop().run_until_complete(coro)


# ── Sample agent outputs (simulates orchestration result) ──
SAMPLE_AGENTS = {
    "validator": {
        "data_consistency_score": 0.9,
        "completeness_score": 1.0,
        "confidence_score": 0.95,
    },
    "financial": {
        "financial_health_score": 0.8,
        "confidence_score": 0.9,
    },
    "market": {
        "tam_estimate": 1e9,
        "market_growth_score": 0.7,
        "confidence_score": 0.85,
    },
    "competition": {
        "competitor_risk_score": 0.4,
        "novelty_score": 0.8,
        "confidence_score": 0.9,
    },
    "risk": {
        "risk_severity_score": 0.3,
        "top_risks": ["market timing"],
        "confidence_score": 0.85,
    },
    "longevity": {
        "survival_probability_3yr": 0.8,
        "survival_probability_5yr": 0.6,
        "confidence_score": 0.8,
    },
    "investor_fit": {
        "recommended_investor_type": "Seed VC",
        "recommended_stage": "Seed",
        "ticket_size_range": "$500k-$2M",
        "confidence_score": 0.9,
    },
}


# ─── Layer 6: Scoring Engine ─────────────────────────────

class TestScoringEngine(unittest.TestCase):

    def test_basic_scoring(self):
        engine = ScoringEngine()
        result = engine.calculate_final_score(SAMPLE_AGENTS)

        self.assertIn("final_score", result)
        self.assertIn("component_scores", result)
        self.assertGreater(result["final_score"], 0)
        self.assertLessEqual(result["final_score"], 1.0)

    def test_component_scores_correct(self):
        engine = ScoringEngine()
        result = engine.calculate_final_score(SAMPLE_AGENTS)
        cs = result["component_scores"]

        self.assertAlmostEqual(cs["financial"], 0.8, places=2)
        self.assertAlmostEqual(cs["market"], 0.7, places=2)
        self.assertAlmostEqual(cs["risk"], 0.7, places=2)  # 1 - 0.3
        self.assertAlmostEqual(cs["validator"], 0.95, places=2)  # (0.9+1.0)/2

    def test_weighted_score_calculation(self):
        engine = ScoringEngine()
        result = engine.calculate_final_score(SAMPLE_AGENTS)
        # 0.8*0.3 + 0.7*0.2 + 0.7*0.3 + 0.95*0.2  = 0.24+0.14+0.21+0.19 = 0.78
        self.assertAlmostEqual(result["final_score"], 0.78, places=2)

    def test_handles_missing_agent(self):
        partial = {"financial": {"financial_health_score": 0.8}}
        engine = ScoringEngine()
        result = engine.calculate_final_score(partial)
        # Should not crash, uses defaults for missing
        self.assertIn("final_score", result)
        self.assertGreater(result["final_score"], 0)

    def test_handles_errored_agent(self):
        with_error = {
            **SAMPLE_AGENTS,
            "financial": {"error": True, "message": "timeout"},
        }
        engine = ScoringEngine()
        result = engine.calculate_final_score(with_error)
        # Financial falls back to 0.5 default
        self.assertAlmostEqual(result["component_scores"]["financial"], 0.5, places=2)

    def test_clamps_to_0_1(self):
        extreme = {
            "financial": {"financial_health_score": 999},
            "market": {"market_growth_score": 999},
            "risk": {"risk_severity_score": -5},  # 1 - (-5) = 6, clamped to 1
            "validator": {"data_consistency_score": 999, "completeness_score": 999},
        }
        engine = ScoringEngine()
        result = engine.calculate_final_score(extreme)
        self.assertLessEqual(result["final_score"], 1.0)
        self.assertGreaterEqual(result["final_score"], 0.0)


# ─── Layer 7: Report Builder ─────────────────────────────

class TestReportBuilder(unittest.TestCase):

    def test_report_structure(self):
        scoring = {"final_score": 0.78, "component_scores": {}, "weights_used": {}}
        report = ReportBuilder.build_final_report("startup_123", SAMPLE_AGENTS, scoring)

        self.assertEqual(report["startup_id"], "startup_123")
        self.assertEqual(report["final_score"], 0.78)
        self.assertIn("risk_label", report)
        self.assertIn("evaluation_timestamp", report)
        self.assertIn("agent_results", report)

    def test_risk_label_low(self):
        scoring = {"final_score": 0.85}
        report = ReportBuilder.build_final_report("s1", {}, scoring)
        self.assertEqual(report["risk_label"], "LOW_RISK")

    def test_risk_label_medium(self):
        scoring = {"final_score": 0.60}
        report = ReportBuilder.build_final_report("s2", {}, scoring)
        self.assertEqual(report["risk_label"], "MEDIUM_RISK")

    def test_risk_label_high(self):
        scoring = {"final_score": 0.30}
        report = ReportBuilder.build_final_report("s3", {}, scoring)
        self.assertEqual(report["risk_label"], "HIGH_RISK")

    def test_summary_counts_errors(self):
        agents = {
            "ok_agent": {"score": 0.9},
            "bad_agent": {"error": True, "message": "fail"},
        }
        scoring = {"final_score": 0.5}
        report = ReportBuilder.build_final_report("s4", agents, scoring)
        self.assertEqual(report["summary"]["agents_succeeded"], 1)
        self.assertEqual(report["summary"]["agents_failed"], 1)


# ─── Layer 8: Persistence ────────────────────────────────

class TestEvaluationRepository(unittest.TestCase):

    def test_dry_run_save(self):
        repo = EvaluationRepository(supabase_client=None)
        report = {"startup_id": "test", "final_score": 0.8, "risk_label": "LOW_RISK"}
        result = _run(repo.save_evaluation(report))
        self.assertTrue(result["_dry_run"])
        self.assertEqual(result["startup_id"], "test")

    def test_dry_run_get_returns_none(self):
        repo = EvaluationRepository(supabase_client=None)
        result = _run(repo.get_evaluation("nonexistent"))
        self.assertIsNone(result)


# ─── Service Integration ─────────────────────────────────

class TestEvaluationService(unittest.TestCase):

    def test_full_service_flow(self):
        service = EvaluationService(supabase_client=None)

        orchestration_output = {
            "started_at": "2025-01-01T00:00:00Z",
            "completed_at": "2025-01-01T00:01:00Z",
            "agents": SAMPLE_AGENTS,
        }

        report = _run(service.evaluate("startup_xyz", orchestration_output))

        # Verify report structure
        self.assertEqual(report["startup_id"], "startup_xyz")
        self.assertIn("final_score", report)
        self.assertIn("risk_label", report)
        self.assertIn("agent_results", report)
        self.assertIn("_persistence", report)

        # Verify dry-run persistence
        self.assertTrue(report["_persistence"]["dry_run"])

        # Score should be ~0.78 based on sample data
        self.assertAlmostEqual(report["final_score"], 0.78, places=2)
        self.assertEqual(report["risk_label"], "LOW_RISK")

    def test_service_with_failed_agent(self):
        service = EvaluationService(supabase_client=None)

        agents_with_error = {**SAMPLE_AGENTS}
        agents_with_error["financial"] = {"error": True, "message": "boom"}

        orchestration_output = {"agents": agents_with_error}
        report = _run(service.evaluate("startup_fail", orchestration_output))

        # Should not crash
        self.assertIn("final_score", report)
        self.assertIn("risk_label", report)


if __name__ == "__main__":
    unittest.main()
