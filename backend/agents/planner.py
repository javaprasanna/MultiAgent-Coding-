import json
import re
from typing import Callable, Awaitable
from core.ollama_client import manager
from models.schemas import PlannerOutput

PLANNER_PROMPT = """You are the Planner Agent for a Multi-Agent AI System.
Your job is to interpret the user's software project request, select an appropriate tech stack, and output a detailed plan.
OUTPUT ONLY VALID JSON EXACTLY MATCHING THIS SCHEMA:
{
  "project_name": "string",
  "description": "string",
  "tech_stack": {"language": "...", "framework": "...", "frontend": "...", "database": "..."},
  "features": ["..."],
  "dependencies": ["..."],
  "architecture_notes": "...",
  "potential_conflicts": ["..."]
}

Rules:
- Extract requirements even from vague inputs
- Infer sensible tech stack if not specified
- Flag conflicts (e.g., "user wants database" vs "flat files would suffice")
- Output ONLY valid JSON, no markdown fences
"""

async def run_planner(prompt: str, stream_callback: Callable[[str], Awaitable[None]] = None) -> PlannerOutput:
    output_str = ""
    # We yield the tokens sequentially
    async for chunk in manager.safe_generate_stream("deepseek-r1:14b", prompt, PLANNER_PROMPT, {"temperature": 0.7}):
        output_str += chunk
        if stream_callback:
            await stream_callback(chunk)
    
    # Clean think blocks used by reasoning models
    think_pattern = re.compile(r'<think>.*?</think>', re.DOTALL)
    json_str = re.sub(think_pattern, '', output_str).strip()
    
    if json_str.startswith("```json"):
        json_str = json_str[7:]
    if json_str.endswith("```"):
        json_str = json_str[:-3]

    try:
        data = json.loads(json_str.strip())
        return PlannerOutput(**data)
    except json.JSONDecodeError as e:
        raise ValueError(f"Planner failed to produce valid JSON. Raw Output: {json_str}")
