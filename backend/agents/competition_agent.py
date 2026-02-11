from typing import List, Dict, Any, Optional
from backend.agents.production_agent import GenericProductionAgent
from backend.models import CompetitionOutput, StartupContext

class CompetitionAgent(GenericProductionAgent):
    """
    Evaluates competitive landscape and novelty.
    Can consume vector search results (list of similar company descriptions) if available.
    """
    def __init__(self):
        super().__init__(
            agent_name="competition_agent", 
            agent_version="1.0.0", 
            system_prompt_path="competition_system.txt"
        )

    def analyze_competition(self, startup_context: StartupContext, vector_search_results: List[str] = None) -> CompetitionOutput:
        """
        Runs the competition analysis workflow.
        
        Args:
            startup_context: The startup data.
            vector_search_results: Optional list of similar company names/descriptions found by external vector search.
        """
        # Prepare context for the LLM
        context = {
            "startup_context": startup_context.model_dump(mode='json'),
            "vector_search_results": vector_search_results or "No external vector search results provided. Please brainstorm based on industry knowledge."
        }
        
        # execution with GenericProductionAgent logic
        return self.run_agent_logic(context, CompetitionOutput)
