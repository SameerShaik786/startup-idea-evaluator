from typing import Dict, Any, List
from backend.agents.production_agent import GenericProductionAgent
from backend.models import RiskAssessmentOutput, StartupContext, FinancialMetricsOutput, MarketOutput, CompetitionOutput

class RiskAssessmentAgent(GenericProductionAgent):
    """
    Aggregates insights from all other agents to build a comprehensive risk profile.
    """
    def __init__(self):
        super().__init__(
            agent_name="risk_assessment_agent", 
            agent_version="1.0.0", 
            system_prompt_path="risk_system.txt"
        )

    def assess_risks(self, 
                     startup_context: StartupContext, 
                     financial_output: FinancialMetricsOutput,
                     market_output: MarketOutput,
                     competition_output: CompetitionOutput) -> RiskAssessmentOutput:
        """
        Runs the risk assessment workflow by aggregating other agent outputs.
        """
        # Prepare context for the LLM
        context = {
            "startup_context": startup_context.model_dump(mode='json'),
            "financial_analysis": financial_output.model_dump(mode='json'),
            "market_analysis": market_output.model_dump(mode='json'),
            "competition_analysis": competition_output.model_dump(mode='json')
        }
        
        # execution with GenericProductionAgent logic
        return self.run_agent_logic(context, RiskAssessmentOutput)
