import unittest
from unittest.mock import MagicMock, patch
from datetime import datetime
from uuid import uuid4
from backend.models import StartupContext, FinancialMetricsOutput, RiskAssessmentOutput
from backend.agents.investor_fit_agent import InvestorFitAgent

class TestInvestorFitAgent(unittest.TestCase):
    
    def setUp(self):
        # Patch Groq Client
        self.patcher = patch('backend.agents.base_agent.get_groq_client')
        self.mock_get_client = self.patcher.start()
        
        self.mock_client = MagicMock()
        self.mock_get_client.return_value = self.mock_client
        
        self.agent = InvestorFitAgent()
        
        self.startup_id = uuid4()
        self.context = StartupContext(
            startup_id=self.startup_id,
            name="NewIdea",
            industry="Social Media",
            stage="Pre-Seed",
            description="Tinder for pets.",
            founded_date=datetime.now()
        )
        
        # Mock Inputs
        self.financials = FinancialMetricsOutput(
            agent_name="financial", agent_version="1.0", model_name="gpt-4", confidence_score=0.9,
            ebitda=-1000.0, burn_rate=2000.0, runway_months=6.0, arr=0.0, 
            gross_margin=0.0, net_margin=0.0, break_even_months=99.0, 
            financial_health_score=0.4, anomalies=[], analysis_summary="Early stage."
        )
        self.risk = RiskAssessmentOutput(
            agent_name="risk", agent_version="1.0", model_name="gpt-4", confidence_score=0.9,
            top_risks=["Product Market Fit"], risk_severity_score=0.6, executive_risk_summary="Typical early stage risks."
        )

    def tearDown(self):
        self.patcher.stop()

    def test_investor_recommendation(self):
        # Test: Pre-Seed Scenario
        mock_completion = MagicMock()
        mock_completion.choices[0].message.content = '''
        {
            "agent_name": "investor_fit_agent",
            "agent_version": "1.0.0",
            "model_name": "llama3",
            "recommended_investor_type": "Angel Investor",
            "recommended_stage": "Pre-Seed",
            "ticket_size_range": "$50k - $250k",
            "reasoning": "Pre-revenue with high risk is best suited for Angels.",
            "confidence_score": 0.95
        }
        '''
        self.mock_client.chat.completions.create.return_value = mock_completion
        
        result = self.agent.recommend_investors(self.context, self.financials, self.risk)
        
        self.assertEqual(result.recommended_investor_type, "Angel Investor")
        self.assertEqual(result.recommended_stage, "Pre-Seed")

if __name__ == '__main__':
    unittest.main()
