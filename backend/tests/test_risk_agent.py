import unittest
from unittest.mock import MagicMock, patch
from datetime import datetime
from uuid import uuid4
from backend.models import StartupContext, FinancialMetricsOutput, MarketOutput, CompetitionOutput
from backend.agents.risk_agent import RiskAssessmentAgent

class TestRiskAssessmentAgent(unittest.TestCase):
    
    def setUp(self):
        # Patch Groq Client
        self.patcher = patch('backend.agents.base_agent.get_groq_client')
        self.mock_get_client = self.patcher.start()
        
        self.mock_client = MagicMock()
        self.mock_get_client.return_value = self.mock_client
        
        self.agent = RiskAssessmentAgent()
        
        self.startup_id = uuid4()
        self.context = StartupContext(
            startup_id=self.startup_id,
            name="RiskyBiz",
            industry="VCR Repair",
            stage="Seed",
            description="Repairing VCRs in 2025.",
            founded_date=datetime.now()
        )
        
        # Mock Inputs from other agents
        self.financials = FinancialMetricsOutput(
            agent_name="financial", agent_version="1.0", model_name="gpt-4", confidence_score=0.9,
            ebitda=-50000.0, burn_rate=10000.0, runway_months=2.0, arr=0.0, 
            gross_margin=10.0, net_margin=-50.0, break_even_months=99.0, 
            financial_health_score=0.1, anomalies=["Runway Critical"], analysis_summary="Dire situation."
        )
        self.market = MarketOutput(
            agent_name="market", agent_version="1.0", model_name="gpt-4", confidence_score=0.8,
            tam_estimate=100000.0, sam_estimate=50000.0, som_estimate=10000.0, 
            market_growth_score=0.05
        )
        self.competition = CompetitionOutput(
            agent_name="competition", agent_version="1.0", model_name="gpt-4", confidence_score=0.9,
            competitor_risk_score=0.20, novelty_score=0.90, similar_companies=[]
        )

    def tearDown(self):
        self.patcher.stop()

    def test_risk_assessment_critical(self):
        # Test: Critical Risk Scenario (Low Runway, Small TAM)
        mock_completion = MagicMock()
        mock_completion.choices[0].message.content = '''
        {
            "agent_name": "risk_assessment_agent",
            "agent_version": "1.0.0",
            "model_name": "llama3",
            "top_risks": ["Critical Liquidity: Only 2 months runway", "Market Size: TAM is negligible"],
            "risk_severity_score": 0.95,
            "confidence_score": 0.95,
            "executive_risk_summary": "Immediate failure likely due to lack of funds and market."
        }
        '''
        self.mock_client.chat.completions.create.return_value = mock_completion
        
        result = self.agent.assess_risks(self.context, self.financials, self.market, self.competition)
        
        self.assertEqual(result.risk_severity_score, 0.95)
        self.assertIn("Critical Liquidity", result.top_risks[0])

if __name__ == '__main__':
    unittest.main()
