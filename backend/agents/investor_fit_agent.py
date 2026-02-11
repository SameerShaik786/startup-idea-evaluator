from typing import Dict, Any
from backend.agents.production_agent import GenericProductionAgent
from backend.models import InvestorFitOutput, StartupContext, FinancialMetricsOutput, RiskAssessmentOutput

class InvestorFitAgent(GenericProductionAgent):
    """
    Recommends investor type and funding stage.
    """
    def __init__(self):
        super().__init__(
            agent_name="investor_fit_agent", 
            agent_version="1.0.0", 
            system_prompt_path="investor_fit_system.txt"
        )

    def recommend_investors(self, 
                            startup_context: StartupContext,
                            financial_output: FinancialMetricsOutput,
                            risk_output: RiskAssessmentOutput) -> InvestorFitOutput:
        """
        Runs the investor fit analysis workflow.
        """
        # Prepare context for the LLM
        context = {
            "startup_context": startup_context.model_dump(mode='json'),
            "financial_metrics": financial_output.model_dump(mode='json'),
            "risk_profile": risk_output.model_dump(mode='json')
        }
        
        # execution with GenericProductionAgent logic
        return self.run_agent_logic(context, InvestorFitOutput)
