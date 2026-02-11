import unittest
from unittest.mock import MagicMock, patch
from backend.agents.base_agent import BaseAgent
from backend.models import AgentOutputBase
from pydantic import Field

# Mock Output Model
class MockOutput(AgentOutputBase):
    result: str = Field(..., description="Test result")

# Mock Agent Implementation
class MockAgent(BaseAgent):
    def __init__(self):
        super().__init__(agent_name="MockAgent", agent_version="0.0.1")

    def _build_prompt(self, context):
        return "Test Prompt"
        
    def _call_llm(self, prompt):
        # Allow mocking the return value easily in tests
        return super()._call_llm(prompt)

class TestBaseAgent(unittest.TestCase):
    
    @patch('backend.agents.base_agent.get_groq_client')
    def test_run_success(self, mock_get_client):
        # Setup Mock API Response
        mock_client = MagicMock()
        mock_completion = MagicMock()
        mock_completion.choices[0].message.content = '{"result": "success", "agent_name": "", "agent_version": "", "model_name": "", "confidence_score": 1.0}'
        mock_client.chat.completions.create.return_value = mock_completion
        mock_get_client.return_value = mock_client
        
        agent = MockAgent()
        # Override _call_llm to skip real API call logic if we wanted, 
        # but here we mock the client so we test the full flow.
        
        output = agent.run({}, MockOutput)
        
        self.assertEqual(output.result, "success")
        self.assertEqual(output.agent_name, "MockAgent")
        self.assertEqual(output.agent_version, "0.0.1")
        self.assertEqual(output.model_name, "llama-3.3-70b-versatile")

    @patch('backend.agents.base_agent.get_groq_client')
    def test_retry_logic(self, mock_get_client):
        # Setup Mock to fail twice then succeed
        mock_client = MagicMock()
        mock_completion_fail = MagicMock()
        mock_completion_fail.choices[0].message.content = 'INVALID JSON'
        
        mock_completion_success = MagicMock()
        mock_completion_success.choices[0].message.content = '{"result": "success", "agent_name": "", "agent_version": "", "model_name": "", "confidence_score": 1.0}'
        
        mock_client.chat.completions.create.side_effect = [
            mock_completion_fail, # Attempt 1
            mock_completion_fail, # Attempt 2
            mock_completion_success # Attempt 3
        ]
        mock_get_client.return_value = mock_client
        
        agent = MockAgent()
        output = agent.run({}, MockOutput)
        
        self.assertEqual(output.result, "success")
        # Ensure it called multiple times
        self.assertEqual(mock_client.chat.completions.create.call_count, 3)

if __name__ == '__main__':
    unittest.main()
