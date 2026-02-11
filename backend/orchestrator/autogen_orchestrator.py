"""
Module 5: Main AutoGen Evaluation Orchestrator
Deterministic multi-agent pipeline using controlled single-agent calls.

Pipeline:
  Step 1: Validator
  Step 2: Financial + Market + Competition (parallel)
  Step 3: Risk (depends on Step 2)
  Step 4: Longevity (depends on Step 3)
  Step 5: Investor Fit (depends on Step 4)
"""
from datetime import datetime, timezone
from typing import Any, Dict

from backend.orchestrator.autogen_execution_wrapper import execute_autogen_agent
from backend.orchestrator.autogen_parallel_executor import run_autogen_parallel
from backend.orchestrator.autogen_context_builder import build_autogen_context
from backend.orchestrator.autogen_result_aggregator import build_orchestration_result


class AutoGenEvaluationOrchestrator:
    """
    Orchestrates the full startup evaluation pipeline.
    Uses controlled single-agent calls (no GroupChat).
    """

    def __init__(self, agents: Dict[str, Any]):
        """
        Args:
            agents: Dictionary from initialize_agents().
                    Must contain keys: evaluator_validator, evaluator_financial,
                    evaluator_market, evaluator_competition, evaluator_risk,
                    evaluator_longevity, evaluator_investor_fit.
        """
        self.agents = agents

        # Validate required agents exist
        required = [
            "evaluator_validator",
            "evaluator_financial",
            "evaluator_market",
            "evaluator_competition",
            "evaluator_risk",
            "evaluator_longevity",
            "evaluator_investor_fit",
        ]
        missing = [name for name in required if name not in agents]
        if missing:
            raise ValueError(f"Missing required agents: {missing}")

    async def run_full_evaluation(
        self, startup_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute the full evaluation pipeline.

        Args:
            startup_context: Dictionary containing startup data
                             (StartupContext + FinancialRawInput serialized).

        Returns:
            Final orchestration result with all agent outputs.
        """
        started_at = datetime.now(timezone.utc).isoformat()
        agent_outputs: Dict[str, Any] = {}

        # ── Step 1: Validator ─────────────────────────────────
        validator_output = await execute_autogen_agent(
            self.agents["evaluator_validator"],
            startup_context
        )
        agent_outputs["validator"] = validator_output

        # ── Step 2: Parallel Core Agents ──────────────────────
        parallel_results = await run_autogen_parallel([
            execute_autogen_agent(
                self.agents["evaluator_financial"],
                startup_context
            ),
            execute_autogen_agent(
                self.agents["evaluator_market"],
                startup_context
            ),
            execute_autogen_agent(
                self.agents["evaluator_competition"],
                startup_context
            ),
        ])

        financial_output = parallel_results[0]
        market_output = parallel_results[1]
        competition_output = parallel_results[2]

        agent_outputs["financial"] = financial_output
        agent_outputs["market"] = market_output
        agent_outputs["competition"] = competition_output

        # ── Step 3: Risk Agent (depends on Step 2) ────────────
        risk_context = build_autogen_context(startup_context, {
            "financial": financial_output,
            "market": market_output,
            "competition": competition_output,
        })
        risk_output = await execute_autogen_agent(
            self.agents["evaluator_risk"],
            risk_context
        )
        agent_outputs["risk"] = risk_output

        # ── Step 4: Longevity Agent (depends on Step 3) ───────
        longevity_context = build_autogen_context(startup_context, {
            "financial": financial_output,
            "market": market_output,
            "risk": risk_output,
        })
        longevity_output = await execute_autogen_agent(
            self.agents["evaluator_longevity"],
            longevity_context
        )
        agent_outputs["longevity"] = longevity_output

        # ── Step 5: Investor Fit Agent (depends on Step 4) ────
        investor_context = build_autogen_context(startup_context, {
            "financial": financial_output,
            "risk": risk_output,
            "longevity": longevity_output,
        })
        investor_output = await execute_autogen_agent(
            self.agents["evaluator_investor_fit"],
            investor_context
        )
        agent_outputs["investor_fit"] = investor_output

        # ── Aggregate ─────────────────────────────────────────
        return build_orchestration_result(agent_outputs, started_at)
