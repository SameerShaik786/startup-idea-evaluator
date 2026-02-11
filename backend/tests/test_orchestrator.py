"""
Unit tests for the Layer 5B Orchestration Pipeline.
Tests all 5 modules with mocked AutoGen agents.
"""
import unittest
import asyncio
import json
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime

from backend.orchestrator.autogen_execution_wrapper import execute_autogen_agent, _extract_json
from backend.orchestrator.autogen_parallel_executor import run_autogen_parallel
from backend.orchestrator.autogen_context_builder import build_autogen_context
from backend.orchestrator.autogen_result_aggregator import build_orchestration_result
from backend.orchestrator.autogen_orchestrator import AutoGenEvaluationOrchestrator


# ─── Helpers ──────────────────────────────────────────────

def _make_mock_agent(name: str, response: dict):
    """Create a mock agent that returns a JSON response."""
    agent = MagicMock()
    agent.name = name
    agent.a_generate_reply = AsyncMock(return_value=json.dumps(response))
    return agent


def _run(coro):
    """Helper to run async tests."""
    return asyncio.get_event_loop().run_until_complete(coro)


# ─── Module 1: Execution Wrapper ─────────────────────────

class TestExecutionWrapper(unittest.TestCase):

    def test_successful_execution(self):
        response = {"confidence_score": 0.9, "result": "ok"}
        agent = _make_mock_agent("test_agent", response)

        result = _run(execute_autogen_agent(agent, {"key": "value"}))

        self.assertEqual(result["confidence_score"], 0.9)
        self.assertEqual(result["result"], "ok")
        self.assertIn("_meta", result)
        self.assertEqual(result["_meta"]["agent"], "test_agent")

    def test_error_returns_structured_error(self):
        agent = MagicMock()
        agent.name = "broken_agent"
        agent.a_generate_reply = AsyncMock(side_effect=RuntimeError("LLM timeout"))

        result = _run(execute_autogen_agent(agent, {}))

        self.assertTrue(result["error"])
        self.assertEqual(result["agent"], "broken_agent")
        self.assertIn("LLM timeout", result["message"])

    def test_extract_json_from_markdown(self):
        text = '```json\n{"score": 0.5}\n```'
        parsed = _extract_json(text)
        self.assertEqual(parsed["score"], 0.5)

    def test_extract_json_from_mixed_text(self):
        text = 'Here is the result:\n{"score": 0.8, "status": "ok"}\nDone.'
        parsed = _extract_json(text)
        self.assertEqual(parsed["score"], 0.8)


# ─── Module 2: Parallel Executor ─────────────────────────

class TestParallelExecutor(unittest.TestCase):

    def test_parallel_all_succeed(self):
        async def task_a():
            return {"agent": "a", "score": 1}
        async def task_b():
            return {"agent": "b", "score": 2}

        results = _run(run_autogen_parallel([task_a(), task_b()]))

        self.assertEqual(len(results), 2)
        self.assertEqual(results[0]["score"], 1)
        self.assertEqual(results[1]["score"], 2)

    def test_parallel_partial_failure(self):
        async def task_ok():
            return {"agent": "ok", "score": 1}
        async def task_fail():
            raise RuntimeError("boom")

        results = _run(run_autogen_parallel([task_ok(), task_fail()]))

        self.assertEqual(len(results), 2)
        self.assertEqual(results[0]["score"], 1)
        self.assertTrue(results[1]["error"])
        self.assertIn("boom", results[1]["message"])


# ─── Module 3: Context Builder ───────────────────────────

class TestContextBuilder(unittest.TestCase):

    def test_merge_does_not_mutate_original(self):
        base = {"startup": "test"}
        additional = {"financial": {"score": 0.9}}

        merged = build_autogen_context(base, additional)

        self.assertIn("upstream_outputs", merged)
        self.assertNotIn("upstream_outputs", base)  # original not mutated

    def test_merge_includes_upstream(self):
        base = {"startup": "test"}
        additional = {"financial": {"score": 0.9}, "market": {"tam": 1000}}

        merged = build_autogen_context(base, additional)

        self.assertEqual(merged["upstream_outputs"]["financial"]["score"], 0.9)
        self.assertEqual(merged["upstream_outputs"]["market"]["tam"], 1000)

    def test_error_outputs_flagged(self):
        base = {"startup": "test"}
        additional = {"broken": {"error": True, "message": "failed"}}

        merged = build_autogen_context(base, additional)

        self.assertTrue(merged["upstream_outputs"]["broken"]["error"])


# ─── Module 4: Result Aggregator ─────────────────────────

class TestResultAggregator(unittest.TestCase):

    def test_aggregation_structure(self):
        outputs = {
            "validator": {"score": 0.9},
            "financial": {"error": True, "message": "timeout"},
        }

        result = build_orchestration_result(outputs, "2025-01-01T00:00:00Z")

        self.assertEqual(result["started_at"], "2025-01-01T00:00:00Z")
        self.assertIn("completed_at", result)
        self.assertEqual(result["summary"]["total_agents"], 2)
        self.assertEqual(result["summary"]["successful"], 1)
        self.assertEqual(result["summary"]["failed"], 1)


# ─── Module 5: Full Orchestrator ─────────────────────────

class TestOrchestrator(unittest.TestCase):

    def test_missing_agents_raises(self):
        with self.assertRaises(ValueError):
            AutoGenEvaluationOrchestrator({"only_one": MagicMock()})

    def test_full_pipeline_runs(self):
        # Create mock agents for all 7 roles
        mock_responses = {
            "evaluator_validator":    {"data_consistency_score": 0.95, "completeness_score": 1.0, "suspicion_flags": [], "requires_manual_review": False, "confidence_score": 0.9},
            "evaluator_financial":    {"financial_health_score": 0.8, "confidence_score": 0.9},
            "evaluator_market":       {"tam_estimate": 1e9, "market_growth_score": 0.7, "confidence_score": 0.85},
            "evaluator_competition":  {"competitor_risk_score": 0.4, "novelty_score": 0.8, "confidence_score": 0.9},
            "evaluator_risk":         {"risk_severity_score": 0.3, "top_risks": ["none critical"], "confidence_score": 0.85},
            "evaluator_longevity":    {"survival_probability_3yr": 0.8, "survival_probability_5yr": 0.6, "confidence_score": 0.8},
            "evaluator_investor_fit": {"recommended_investor_type": "Seed VC", "recommended_stage": "Seed", "ticket_size_range": "$500k-$2M", "confidence_score": 0.9},
        }

        agents = {}
        for name, resp in mock_responses.items():
            agents[name] = _make_mock_agent(name, resp)

        orchestrator = AutoGenEvaluationOrchestrator(agents)

        startup_context = {
            "name": "TestStartup",
            "industry": "AI",
            "stage": "Seed",
            "description": "AI for testing.",
        }

        result = _run(orchestrator.run_full_evaluation(startup_context))

        # Verify structure
        self.assertIn("started_at", result)
        self.assertIn("completed_at", result)
        self.assertIn("agents", result)
        self.assertIn("summary", result)

        # Verify all 7 agents produced output
        self.assertEqual(result["summary"]["total_agents"], 7)
        self.assertEqual(result["summary"]["successful"], 7)
        self.assertEqual(result["summary"]["failed"], 0)

        # Verify specific outputs passed through
        self.assertEqual(result["agents"]["financial"]["financial_health_score"], 0.8)
        self.assertEqual(result["agents"]["investor_fit"]["recommended_stage"], "Seed")

    def test_pipeline_survives_agent_failure(self):
        """Pipeline should not crash if one agent fails."""
        mock_responses = {
            "evaluator_validator":    {"confidence_score": 0.9},
            "evaluator_financial":    {"confidence_score": 0.9},
            "evaluator_market":       {"confidence_score": 0.85},
            "evaluator_competition":  {"confidence_score": 0.9},
            "evaluator_risk":         {"confidence_score": 0.85},
            "evaluator_longevity":    {"confidence_score": 0.8},
            "evaluator_investor_fit": {"confidence_score": 0.9},
        }

        agents = {}
        for name, resp in mock_responses.items():
            agents[name] = _make_mock_agent(name, resp)

        # Make financial agent crash
        agents["evaluator_financial"].a_generate_reply = AsyncMock(
            side_effect=RuntimeError("Groq rate limit")
        )

        orchestrator = AutoGenEvaluationOrchestrator(agents)
        result = _run(orchestrator.run_full_evaluation({"name": "CrashTest"}))

        # Pipeline completed
        self.assertIn("agents", result)
        # Financial failed but others succeeded
        self.assertTrue(result["agents"]["financial"]["error"])
        self.assertEqual(result["summary"]["failed"], 1)
        self.assertEqual(result["summary"]["successful"], 6)


if __name__ == "__main__":
    unittest.main()
