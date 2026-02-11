import unittest
import os
from unittest.mock import MagicMock, patch
from pydantic import Field
from backend.agents.production_agent import GenericProductionAgent
from backend.models import AgentOutputBase

# Dummy Output Model
class TestOutput(AgentOutputBase):
    result_data: str

class TestProductionAgent(unittest.TestCase):
    
    def setUp(self):
        # Patch get_groq_client to avoid needing API KEY
        self.patcher = patch('backend.agents.base_agent.get_groq_client')
        self.mock_get_client = self.patcher.start()
        
        # Create a dummy system prompt file
        self.test_prompt_path = os.path.abspath("test_system_prompt.txt")
        with open(self.test_prompt_path, "w") as f:
            f.write("You are a test agent.")
            
    def tearDown(self):
        self.patcher.stop()
        if os.path.exists(self.test_prompt_path):
            os.remove(self.test_prompt_path)

    def test_load_system_prompt(self):
        # We can instantiate now without error
        agent = GenericProductionAgent("TestAgent", "1.0", self.test_prompt_path)
        self.assertEqual(agent.system_prompt, "You are a test agent.")

    def test_run_agent_logic_success(self):
        # Mock LLM Response
        mock_client = MagicMock()
        mock_completion = MagicMock()
        # Valid JSON with confidence score
        mock_completion.choices[0].message.content = '{"result_data": "Success", "agent_name": "", "agent_version": "", "model_name": "", "confidence_score": 0.95}'
        mock_client.chat.completions.create.return_value = mock_completion
        self.mock_get_client.return_value = mock_client
        
        agent = GenericProductionAgent("TestAgent", "1.0", self.test_prompt_path)
        
        context = {"input_key": "input_value"}
        result = agent.run_agent_logic(context, TestOutput)
        
        self.assertEqual(result.result_data, "Success")
        self.assertEqual(result.confidence_score, 0.95)
        self.assertEqual(result.agent_name, "TestAgent")

    def test_confidence_clamping(self):
        # Mock LLM Response with invalid confidence > 1.0
        mock_client = MagicMock()
        mock_completion = MagicMock()
        mock_completion.choices[0].message.content = '{"result_data": "High", "agent_name": "", "agent_version": "", "model_name": "", "confidence_score": 1.5}'
        mock_client.chat.completions.create.return_value = mock_completion
        self.mock_get_client.return_value = mock_client
        
        agent = GenericProductionAgent("TestAgent", "1.0", self.test_prompt_path)
        
        result = agent.run_agent_logic({}, TestOutput)
        
        # specific agent logic clamps it
        self.assertEqual(result.confidence_score, 1.0) 

if __name__ == '__main__':
    unittest.main()
