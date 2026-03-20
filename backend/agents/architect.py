import json
import re
from typing import Callable, Awaitable
from core.ollama_client import manager
from models.schemas import ArchitectOutput, PlannerOutput

ARCHITECT_PROMPT = """You are the Architect Agent. 
Convert the planner's JSON output into a precise file tree with per-file responsibilities.
OUTPUT ONLY VALID JSON EXACTLY MATCHING THIS SCHEMA:
{
  "directory_tree": {"folder": {"subfolder": {}}},
  "files": [{"path": "...", "purpose": "...", "exports": "...", "dependencies_on": ["..."]}],
  "config_files": [{"path": "...", "content": "..."}],
  "readme_outline": ["..."]
}

Rules:
- Always include config files appropriate to the tech stack
- Always include a /tests directory with at least one test file
- Always include README.md
- Separate frontend/, backend/, tests/, and config files cleanly
- If Planner flagged conflicts, resolve them and note resolution
- Output ONLY valid JSON, no markdown fences
"""

async def run_architect(planner_output: PlannerOutput, stream_callback: Callable[[str], Awaitable[None]] = None) -> ArchitectOutput:
    input_str = planner_output.model_dump_json()
    output_str = ""
    
    async for chunk in manager.safe_generate_stream("deepseek-coder-v2:16b", input_str, ARCHITECT_PROMPT, {"temperature": 0.5}):
        output_str += chunk
        if stream_callback:
            await stream_callback(chunk)

    think_pattern = re.compile(r'<think>.*?</think>', re.DOTALL)
    json_str = re.sub(think_pattern, '', output_str).strip()
    
    if json_str.startswith("```json"):
        json_str = json_str[7:]
    if json_str.endswith("```"):
        json_str = json_str[:-3]

    try:
        data = json.loads(json_str.strip())
        return ArchitectOutput(**data)
    except json.JSONDecodeError as e:
        raise ValueError(f"Architect failed to produce valid JSON. Raw Output: {json_str}")
