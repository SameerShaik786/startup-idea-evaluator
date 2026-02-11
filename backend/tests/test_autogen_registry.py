"""
Unit test for AutoGen agent initialization.
Verifies all 7 agents load with correct system prompts.
"""
import unittest
from unittest.mock import patch, MagicMock
from backend.agents.autogen_registry import initialize_agents, AGENT_SPECS


class TestAutoGenRegistry(unittest.TestCase):

    @patch('backend.agents.autogen_utils.os.environ.get')
    def test_initialize_agents_creates_all(self, mock_env):
        """All 7 agents + user_proxy should be created."""
        mock_env.return_value = "test_api_key"

        agents = initialize_agents()

        # 7 specialist agents + 1 user_proxy = 8
        self.assertEqual(len(agents), 8)

        expected_names = [s["name"] for s in AGENT_SPECS] + ["user_proxy"]
        for name in expected_names:
            self.assertIn(name, agents, f"Agent '{name}' missing from registry")

    @patch('backend.agents.autogen_utils.os.environ.get')
    def test_agents_have_correct_system_prompts(self, mock_env):
        """Each agent should load its specific system prompt file."""
        mock_env.return_value = "test_api_key"

        agents = initialize_agents()

        # Validator agent prompt should contain "ROLE" (from our refined prompts)
        validator = agents["evaluator_validator"]
        self.assertIn("ROLE", validator._system_messages[0].content)

        # Financial agent prompt should mention "Financial"
        financial = agents["evaluator_financial"]
        self.assertIn("Financial", financial._system_messages[0].content)

        # Risk agent should mention "Risk"
        risk = agents["evaluator_risk"]
        self.assertIn("Risk", risk._system_messages[0].content)

    @patch('backend.agents.autogen_utils.os.environ.get')
    def test_agents_have_descriptions(self, mock_env):
        """Each agent should have a non-empty description."""
        mock_env.return_value = "test_api_key"

        agents = initialize_agents()

        for spec in AGENT_SPECS:
            agent = agents[spec["name"]]
            self.assertTrue(
                len(agent.description) > 0,
                f"Agent '{spec['name']}' has empty description"
            )

    @patch('backend.agents.autogen_utils.os.environ.get')
    def test_missing_api_key_raises(self, mock_env):
        """Should raise ValueError when GROQ_API_KEY is not set."""
        mock_env.return_value = None
        with self.assertRaises(ValueError):
            initialize_agents()


if __name__ == '__main__':
    unittest.main()
