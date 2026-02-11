from typing import Dict, Any
from backend.agents.production_agent import GenericProductionAgent
from backend.models import LongevityOutput, StartupContext, RiskAssessmentOutput, FinancialMetricsOutput, MarketOutput

class LongevityAgent(GenericProductionAgent):
    """
    Predicts survival probability based on aggregated signals.
    """
    def __init__(self):
        super().__init__(
            agent_name="longevity_agent", 
            agent_version="1.0.0", 
            system_prompt_path="longevity_system.txt"
        )

    def predict_longevity(self, 
                          startup_context: StartupContext,
                          risk_output: RiskAssessmentOutput,
                          financial_output: FinancialMetricsOutput,
                          market_output: MarketOutput) -> LongevityOutput:
        """
        Runs the longevity prediction workflow.
        """
        # Prepare context for the LLM
        context = {
            "startup_context": startup_context.model_dump(mode='json'),
            "risk_assessment": risk_output.model_dump(mode='json'),
            "financial_metrics": financial_output.model_dump(mode='json'),
            "market_data": market_output.model_dump(mode='json')
        }
        
        # execution with GenericProductionAgent logic
        return self.run_agent_logic(context, LongevityOutput)
