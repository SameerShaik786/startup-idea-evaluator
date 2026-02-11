import json
import logging
from abc import ABC, abstractmethod
from typing import Any, Dict, Type, TypeVar, Optional
from pydantic import BaseModel, ValidationError
from backend.llm_config import GroqConfig, get_groq_client
from backend.models import AgentOutputBase

T = TypeVar('T', bound=BaseModel)

logger = logging.getLogger(__name__)

class BaseAgent(ABC):
    def __init__(self, agent_name: str, agent_version: str = "1.0.0"):
        self.agent_name = agent_name
        self.agent_version = agent_version
        self.client = get_groq_client()
        self.model = GroqConfig.MODEL_NAME

    def run(self, context: Dict[str, Any], output_model: Type[T]) -> T:
        """
        Template method to execute the agent workflow.
        1. Build Prompt
        2. Call LLM
        3. Validate Output
        4. Attach Metadata
        """
        prompt = self._build_prompt(context)
        
        def execution_step():
            raw_response = self._call_llm(prompt)
            return self.validate_output(raw_response, output_model)

        # Simple retry logic for malformed JSON
        try:
            result = self.retry_if_invalid(execution_step)
            return self.attach_metadata(result)
        except Exception as e:
            logger.error(f"Agent {self.agent_name} failed: {str(e)}")
            raise e

    @abstractmethod
    def _build_prompt(self, context: Dict[str, Any]) -> str:
        """Construct the prompt from context."""
        pass

    def _call_llm(self, prompt: str) -> str:
        """Execute the call to Groq."""
        completion = self.client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a helpful AI assistant. Output JSON only."},
                {"role": "user", "content": prompt}
            ],
            model=self.model,
            temperature=GroqConfig.TEMPERATURE,
            max_tokens=GroqConfig.MAX_TOKENS,
            response_format={"type": "json_object"}
        )
        return completion.choices[0].message.content

    def validate_output(self, raw_output: str, model: Type[T]) -> T:
        """Validate JSON string against Pydantic model."""
        try:
            data = json.loads(raw_output)
            return model(**data)
        except (json.JSONDecodeError, ValidationError) as e:
            logger.warning(f"Validation failed for {self.agent_name}: {e}")
            raise e

    def retry_if_invalid(self, func, retries=3):
        """Retry wrapper for robustness."""
        last_exception = None
        for attempt in range(retries):
            try:
                return func()
            except Exception as e:
                last_exception = e
                logger.warning(f"Attempt {attempt + 1} failed for {self.agent_name}")
        raise last_exception

    def attach_metadata(self, output: T) -> T:
        """Inject agent identity into the output model."""
        if isinstance(output, AgentOutputBase):
            output.agent_name = self.agent_name
            output.agent_version = self.agent_version
            output.model_name = self.model
        return output
