from typing import Dict, Any
from backend.agents.production_agent import GenericProductionAgent
from backend.models import ValidatorOutput, StartupContext, FinancialRawInput

class ValidatorAgent(GenericProductionAgent):
    """
    Validates startup submissions for internal consistency and completeness.
    """
    def __init__(self):
        super().__init__(
            agent_name="validator_agent", 
            agent_version="1.0.0", 
            system_prompt_path="validator_system.txt"
        )

    def validate_submission(self, startup_context: StartupContext, financial_input: FinancialRawInput) -> ValidatorOutput:
        """
        Runs the validation logic on the provided context.
        """
        # Prepare context for the LLM
        context = {
            "startup_context": startup_context.model_dump(mode='json'),
            "financial_input": financial_input.model_dump(mode='json')
        }
        
        # execution with GenericProductionAgent logic
        return self.run_agent_logic(context, ValidatorOutput)
