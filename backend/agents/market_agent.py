from typing import Dict, Any
from backend.agents.production_agent import GenericProductionAgent
from backend.models import MarketOutput, StartupContext

class MarketAgent(GenericProductionAgent):
    """
    Estimates market size and growth potential using reasoning chains.
    """
    def __init__(self):
        super().__init__(
            agent_name="market_agent", 
            agent_version="1.0.0", 
            system_prompt_path="market_system.txt"
        )

    def analyze_market(self, startup_context: StartupContext) -> MarketOutput:
        """
        Runs the market analysis workflow.
        """
        # Prepare context for the LLM
        context = {
            "startup_context": startup_context.model_dump(mode='json')
        }
        
        # execution with GenericProductionAgent logic
        return self.run_agent_logic(context, MarketOutput)
