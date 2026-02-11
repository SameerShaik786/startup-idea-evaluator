import unittest
from unittest.mock import MagicMock, patch
from datetime import datetime
from uuid import uuid4
from backend.models import StartupContext
from backend.agents.market_agent import MarketAgent

class TestMarketAgent(unittest.TestCase):
    
    def setUp(self):
        # Patch Groq Client
        self.patcher = patch('backend.agents.base_agent.get_groq_client')
        self.mock_get_client = self.patcher.start()
        
        # Create a shared mock client
        self.mock_client = MagicMock()
        self.mock_get_client.return_value = self.mock_client
        
        self.agent = MarketAgent()
        
        self.startup_id = uuid4()
        self.context = StartupContext(
            startup_id=self.startup_id,
            name="SaaS for Dog Walkers",
            industry="Pet Services",
            stage="Seed",
            description="Software to manage dog walking schedules.",
            founded_date=datetime.now()
        )

    def tearDown(self):
        self.patcher.stop()

    def test_market_analysis(self):
        # Mock Response
        mock_completion = MagicMock()
        mock_completion.choices[0].message.content = '''
        {
            "agent_name": "market_agent",
            "agent_version": "1.0.0",
            "model_name": "llama3",
            "tam_estimate": 1000000000.0,
            "sam_estimate": 200000000.0,
            "som_estimate": 5000000.0,
            "market_growth_score": 0.75,
            "confidence_score": 0.85,
            "competitors": [{"name": "Rover", "strength": "Large network", "weakness": "High fees", "market_share_est": "20%"}],
            "market_trends": ["Increasing pet ownership"]
        }
        '''
        self.mock_client.chat.completions.create.return_value = mock_completion
        
        result = self.agent.analyze_market(self.context)
        
        self.assertEqual(result.tam_estimate, 1000000000.0)
        self.assertTrue(result.market_growth_score > 0.5)
        self.assertEqual(len(result.competitors), 1)

if __name__ == '__main__':
    unittest.main()
