import unittest
from unittest.mock import MagicMock, patch
from datetime import datetime
from uuid import uuid4
from backend.models import StartupContext, FinancialMetricsOutput, MarketOutput, RiskAssessmentOutput
from backend.agents.longevity_agent import LongevityAgent

class TestLongevityAgent(unittest.TestCase):
    
    def setUp(self):
        # Patch Groq Client
        self.patcher = patch('backend.agents.base_agent.get_groq_client')
        self.mock_get_client = self.patcher.start()
        
        self.mock_client = MagicMock()
        self.mock_get_client.return_value = self.mock_client
        
        self.agent = LongevityAgent()
        
        self.startup_id = uuid4()
        self.context = StartupContext(
            startup_id=self.startup_id,
            name="ForeverInc",
            industry="Healthcare",
            stage="Series A",
            description="Curing aging.",
            founded_date=datetime.now()
        )
        
        # Mock Inputs
        self.financials = FinancialMetricsOutput(
            agent_name="financial", agent_version="1.0", model_name="gpt-4", confidence_score=0.9,
            ebitda=1000.0, burn_rate=50000.0, runway_months=24.0, arr=1000000.0, 
            gross_margin=80.0, net_margin=10.0, break_even_months=12.0, 
            financial_health_score=0.9, anomalies=[], analysis_summary="Healthy financials."
        )
        self.market = MarketOutput(
            agent_name="market", agent_version="1.0", model_name="gpt-4", confidence_score=0.8,
            tam_estimate=10000000000.0, sam_estimate=100000000.0, som_estimate=10000000.0, 
            market_growth_score=0.85
        )
        self.risk = RiskAssessmentOutput(
            agent_name="risk", agent_version="1.0", model_name="gpt-4", confidence_score=0.9,
            top_risks=["Regulatory hurdles"], risk_severity_score=0.3, executive_risk_summary="Manageable risks."
        )

    def tearDown(self):
        self.patcher.stop()

    def test_longevity_prediction(self):
        # Test: High Survival Scenario
        mock_completion = MagicMock()
        mock_completion.choices[0].message.content = '''
        {
            "agent_name": "longevity_agent",
            "agent_version": "1.0.0",
            "model_name": "llama3",
            "survival_probability_3yr": 0.85,
            "survival_probability_5yr": 0.60,
            "reasoning": "Strong financials and massive TAM offset regulatory risks.",
            "confidence_score": 0.9
        }
        '''
        self.mock_client.chat.completions.create.return_value = mock_completion
        
        result = self.agent.predict_longevity(self.context, self.risk, self.financials, self.market)
        
        self.assertEqual(result.survival_probability_3yr, 0.85)
        self.assertTrue(result.survival_probability_5yr < result.survival_probability_3yr)

if __name__ == '__main__':
    unittest.main()
