import unittest
from unittest.mock import MagicMock, patch
from datetime import datetime, timedelta
from uuid import uuid4
from backend.models import StartupContext, FinancialRawInput
from backend.agents.financial_agent import FinancialAgent

class TestFinancialAgent(unittest.TestCase):
    
    def setUp(self):
        # Patch Groq Client
        self.patcher = patch('backend.agents.base_agent.get_groq_client')
        self.mock_get_client = self.patcher.start()
        
        # Create a shared mock client
        self.mock_client = MagicMock()
        self.mock_get_client.return_value = self.mock_client
        
        self.agent = FinancialAgent()
        
        self.startup_id = uuid4()
        self.context = StartupContext(
            startup_id=self.startup_id,
            name="FinTechStartup",
            industry="Fintech",
            stage="Seed",
            description="A valid Fintech startup.",
            founded_date=datetime.now()
        )
        self.financials = FinancialRawInput(
            startup_id=self.startup_id,
            period_start=datetime.now() - timedelta(days=30),
            period_end=datetime.now(),
            revenue=10000.0,
            cogs=2000.0,
            operating_expenses=5000.0,
            cash_balance=50000.0,
            monthly_burn_rate=3000.0
        )

    def tearDown(self):
        self.patcher.stop()

    def test_financial_analysis(self):
        # Specific Mock Response:
        # We intentionally return WRONG math from the LLM to prove it gets overwritten
        mock_completion = MagicMock()
        mock_completion.choices[0].message.content = '''
        {
            "agent_name": "financial_agent",
            "agent_version": "1.0.0",
            "model_name": "llama3",
            "ebitda": 999999.0, 
            "burn_rate": 0.0,
            "runway_months": 1000.0,
            "arr": 0.0,
            "gross_margin": 0.0,
            "net_margin": 0.0,
            "break_even_months": 0.0,
            "financial_health_score": 0.85,
            "confidence_score": 0.95,
            "anomalies": [],
            "analysis_summary": "Test summary."
        }
        '''
        self.mock_client.chat.completions.create.return_value = mock_completion
        
        result = self.agent.analyze_financials(self.context, self.financials)
        
        # Verify Score came from LLM
        self.assertEqual(result.financial_health_score, 0.85)
        
        # Verify Math came from Engine (Not the 999999 from LLM)
        # EBITDA = Revenue (10000) - COGS (2000) - OpEx (5000) = 3000
        self.assertEqual(result.ebitda, 3000.0)
        
        # Burn Rate = 3000 (from input, if calculated by engine it might differ based on logic but here engine trusts input or recalc)
        # Wait, FinancialEngine calculates:
        # ebitda = revenue - cogs - op_expenses = 10k - 2k - 5k = 3k
        # burn_rate = (cogs + op_expenses) - revenue ... wait.
        # Let's check logic in FinancialEngine.
        # If EBITDA is positive (3k), burn rate should be 0 or negative (net income).
        # Actually FinancialEngine definition:
        # burn_rate = (operating_expenses + cogs) - revenue (if positive).
        # Here: (5000+2000) - 10000 = -3000. So burn is -3000 (generating cash).
        # Hence burn_rate should be -3000.0.
        
        self.assertEqual(result.ebitda, 3000.0)
        self.assertNotEqual(result.ebitda, 999999.0)

if __name__ == '__main__':
    unittest.main()
