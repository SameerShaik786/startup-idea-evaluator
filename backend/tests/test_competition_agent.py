import unittest
from unittest.mock import MagicMock, patch
from datetime import datetime
from uuid import uuid4
from backend.models import StartupContext
from backend.agents.competition_agent import CompetitionAgent

class TestCompetitionAgent(unittest.TestCase):
    
    def setUp(self):
        # Patch Groq Client
        self.patcher = patch('backend.agents.base_agent.get_groq_client')
        self.mock_get_client = self.patcher.start()
        
        # Create a shared mock client
        self.mock_client = MagicMock()
        self.mock_get_client.return_value = self.mock_client
        
        self.agent = CompetitionAgent()
        
        self.startup_id = uuid4()
        self.context = StartupContext(
            startup_id=self.startup_id,
            name="AI Toaster",
            industry="Consumer Electronics",
            stage="Seed",
            description="Toaster that uses AI to predict perfect browning.",
            founded_date=datetime.now()
        )

    def tearDown(self):
        self.patcher.stop()

    def test_competition_analysis_no_context(self):
        # Test 1: No external vector results (Brainstorming)
        mock_completion = MagicMock()
        mock_completion.choices[0].message.content = '''
        {
            "agent_name": "competition_agent",
            "agent_version": "1.0.0",
            "model_name": "llama3",
            "competitor_risk_score": 0.40,
            "novelty_score": 0.80,
            "similar_companies": ["Revolution Cooking", "Balmuda"],
            "confidence_score": 0.85
        }
        '''
        self.mock_client.chat.completions.create.return_value = mock_completion
        
        result = self.agent.analyze_competition(self.context)
        
        self.assertEqual(result.competitor_risk_score, 0.40)
        self.assertIn("Balmuda", result.similar_companies)

    def test_competition_analysis_with_context(self):
        # Test 2: With external vector results
        mock_completion = MagicMock()
        mock_completion.choices[0].message.content = '''
        {
            "agent_name": "competition_agent",
            "agent_version": "1.0.0",
            "model_name": "llama3",
            "competitor_risk_score": 0.90,
            "novelty_score": 0.20,
            "similar_companies": ["SmartToast Inc", "ToastAI"],
            "confidence_score": 0.95
        }
        '''
        self.mock_client.chat.completions.create.return_value = mock_completion
        
        vector_results = ["Company A: Makes AI toasters", "Company B: Smart heating elements"]
        result = self.agent.analyze_competition(self.context, vector_results)
        
        self.assertEqual(result.competitor_risk_score, 0.90)
        # We can't easily verify the PROMPT contained the context without inspecting the mock call args
        # But we can verify the Agent didn't crash and returned the LLM output.
        call_args = self.mock_client.chat.completions.create.call_args
        # Convert call args to string to check for presence of vector results
        self.assertIn("Company A", str(call_args))

if __name__ == '__main__':
    unittest.main()
