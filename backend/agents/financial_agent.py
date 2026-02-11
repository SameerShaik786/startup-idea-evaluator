from typing import Dict, Any, Type
from backend.agents.production_agent import GenericProductionAgent
from backend.models import FinancialMetricsOutput, StartupContext, FinancialRawInput
from backend.finance_engine import FinancialEngine

class FinancialAgent(GenericProductionAgent):
    """
    Analyzes financial health using deterministic math + LLM scoring.
    """
    def __init__(self):
        super().__init__(
            agent_name="financial_agent", 
            agent_version="1.0.0", 
            system_prompt_path="financial_system.txt"
        )
        
    def analyze_financials(self, startup_context: StartupContext, financial_input: FinancialRawInput) -> FinancialMetricsOutput:
        """
        Runs the financial analysis workflow.
        1. Calculate deterministic metrics using FinancialEngine.
        2. Analyze metrics using LLM.
        3. Merge results (Deterministic overrides LLM).
        """
        # 1. Deterministic Calculation
        engine = FinancialEngine(financial_input)
        calculated_stats = engine.run_analysis()
        
        # 2. Prepare Context for LLM
        context = {
            "startup_context": startup_context.model_dump(mode='json'),
            "financial_input": financial_input.model_dump(mode='json'),
            "calculated_metrics": calculated_stats.model_dump(mode='json')
        }
        
        # 3. LLM Execution
        # We use a temporary model that matches FinancialMetricsOutput 
        # but we will overwrite the math fields to ensure accuracy.
        llm_output = self.run_agent_logic(context, FinancialMetricsOutput)
        
        # 4. Merge / Hard Overwrite
        # Enforce that the output metrics match the Engine's calculations
        llm_output.ebitda = calculated_stats.ebitda
        llm_output.burn_rate = calculated_stats.burn_rate_monthly
        llm_output.runway_months = calculated_stats.runway_months
        llm_output.arr = calculated_stats.arr
        llm_output.gross_margin = calculated_stats.gross_margin_percent
        llm_output.net_margin = calculated_stats.net_margin_percent
        llm_output.break_even_months = calculated_stats.break_even_months
        
        return llm_output
