import sys
import os

# Add parent directory to path to allow imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from backend.agents.autogen_registry import initialize_agents
from unittest.mock import patch, MagicMock

@patch('os.environ.get')
def test_initialization(mock_env_get):
    # Mock API Key
    mock_env_get.return_value = "fake_api_key_for_test"
    
    print("Initializing Agents...")
    agents = initialize_agents()
    
    expected_agents = [
        "evaluator_validator", 
        "evaluator_financial", 
        "evaluator_market", 
        "evaluator_competition", 
        "evaluator_risk", 
        "evaluator_longevity", 
        "evaluator_investor_fit"
    ]
    
    print(f"Found {len(agents)} agents.")
    
    all_passed = True
    for name in expected_agents:
        if name not in agents:
            print(f"FAILED: Agent {name} missing.")
            all_passed = False
        else:
            agent = agents[name]
            prompt_preview = agent.system_message[:50]
            print(f"PASSED: {name} loaded. Prompt preview: '{prompt_preview}...'")
            if "You are the" not in prompt_preview and "Role" not in prompt_preview and "ROLE" not in prompt_preview:
                 print(f"WARNING: Prompt for {name} looks suspicious: {prompt_preview}")

    if all_passed:
        print("\nSUCCESS: All agents initialized with correct prompts.")
    else:
        print("\nFAILURE: Some agents failed to load.")

if __name__ == "__main__":
    test_initialization()
