import unittest
from unittest.mock import MagicMock, patch
from datetime import datetime
from uuid import uuid4
from backend.models import StartupContext, FinancialRawInput
from backend.agents.validator_agent import ValidatorAgent

class TestValidatorAgent(unittest.TestCase):
    
    def setUp(self):
        # Patch Groq Client
        self.patcher = patch('backend.agents.base_agent.get_groq_client')
        self.mock_get_client = self.patcher.start()
        
        # Create a shared mock client
        self.mock_client = MagicMock()
        self.mock_get_client.return_value = self.mock_client
        
        self.agent = ValidatorAgent()
        
        self.startup_id = uuid4()
        self.context = StartupContext(
            startup_id=self.startup_id,
            name="ValidStartup",
            industry="AI",
            stage="Seed",
            description="A valid AI startup.",
            founded_date=datetime.now()
        )
        self.financials = FinancialRawInput(
            startup_id=self.startup_id,
            period_start=datetime.now(),
            period_end=datetime.now(),
            revenue=10000.0,
            cogs=2000.0,
            operating_expenses=5000.0,
            cash_balance=50000.0,
            monthly_burn_rate=3000.0
        )

    def tearDown(self):
        self.patcher.stop()

    def test_valid_submission(self):
        # Mock Valid Response
        mock_completion = MagicMock()
        mock_completion.choices[0].message.content = '''
        {
            "agent_name": "validator_agent",
            "agent_version": "1.0.0",
            "model_name": "llama3",
            "confidence_score": 0.95,
            "data_consistency_score": 0.95,
            "completeness_score": 1.0,
            "suspicion_flags": [],
            "requires_manual_review": false
        }
        '''
        self.mock_client.chat.completions.create.return_value = mock_completion
        
        result = self.agent.validate_submission(self.context, self.financials)
        
        self.assertTrue(result.data_consistency_score > 0.9)
        self.assertFalse(result.requires_manual_review)

    def test_invalid_submission(self):
        # Mock Invalid Response (e.g., Pre-Seed with $10M revenue)
        mock_completion = MagicMock()
        mock_completion.choices[0].message.content = '''
        {
            "agent_name": "validator_agent",
            "agent_version": "1.0.0",
            "model_name": "llama3",
            "confidence_score": 0.8,
            "data_consistency_score": 0.40,
            "completeness_score": 0.80,
            "suspicion_flags": ["Reason mismatch: Revenue too high for Pre-Seed"],
            "requires_manual_review": true
        }
        '''
        self.mock_client.chat.completions.create.return_value = mock_completion
        
        result = self.agent.validate_submission(self.context, self.financials)
        
        self.assertTrue(result.requires_manual_review)
        self.assertIn("Revenue too high", result.suspicion_flags[0])

if __name__ == '__main__':
    unittest.main()
