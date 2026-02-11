from typing import Any, Dict, Type, TypeVar, Optional
import os
import logging
from backend.agents.base_agent import BaseAgent
from backend.models import AgentOutputBase

T = TypeVar('T', bound=AgentOutputBase)

logger = logging.getLogger(__name__)

class GenericProductionAgent(BaseAgent):
    """
    Reusable production agent template.
    Enforces strict JSON output, confidence scores, and external prompt loading.
    """
    def __init__(self, agent_name: str, agent_version: str, system_prompt_path: str):
        super().__init__(agent_name, agent_version)
        self.system_prompt = self.load_system_prompt(system_prompt_path)

    def load_system_prompt(self, path: str) -> str:
        """Loads and returns the system prompt from a file."""
        try:
            # Resolve path relative to backend/prompts if not absolute
            if not os.path.isabs(path):
                base_dir = os.path.dirname(os.path.dirname(__file__))
                path = os.path.join(base_dir, 'prompts', path)
            
            with open(path, 'r', encoding='utf-8') as f:
                return f.read().strip()
        except FileNotFoundError:
            logger.error(f"System prompt not found at {path}")
            raise

    def _build_prompt(self, context: Dict[str, Any]) -> str:
        """
        Combines system prompt and variable context.
        Expects context to have keys that match placeholders in the system prompt if any.
        However, for this generic agent, we append the context as a strictly formatted block.
        """
        # 1. Start with System Prompt
        full_prompt = f"{self.system_prompt}\n\n"
        
        # 2. Add Context Section
        full_prompt += "### Context Data\n"
        for key, value in context.items():
            # Pretty print Pydantic models or Dicts
            if hasattr(value, 'model_dump_json'):
                val_str = value.model_dump_json(indent=2)
            else:
                val_str = str(value)
            
            full_prompt += f"{key.upper()}:\n{val_str}\n\n"
            
        # 3. Add Output Instruction
        full_prompt += "\n### Output Instruction\n"
        full_prompt += "You must return valid JSON only, matching the specified schema. No markdown, no commentary."
        
        return full_prompt

    def validate_output(self, raw_output: str, model: Type[T]) -> T:
        """
        Overrides BaseAgent.validate_output to perform pre-validation clamping.
        """
        import json
        from pydantic import ValidationError
        
        try:
            data = json.loads(raw_output)
            
            # Pre-validation enforcement
            if 'confidence_score' in data:
                score = data['confidence_score']
                if isinstance(score, (int, float)):
                    if score < 0.0 or score > 1.0:
                        logger.warning(f"Clamping invalid confidence score: {score}")
                        data['confidence_score'] = max(0.0, min(1.0, score))
            
            return model(**data)
        except (json.JSONDecodeError, ValidationError) as e:
            logger.warning(f"Validation failed for {self.agent_name}: {e}")
            raise e

    def run_agent_logic(self, context: Dict[str, Any], output_model: Type[T]) -> T:
        """
        Wrapper around BaseAgent.run().
        """
        return self.run(context, output_model)
