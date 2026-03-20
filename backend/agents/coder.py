import json
import re
from typing import Callable, Awaitable
from core.ollama_client import manager
from models.schemas import FileSpec, ArchitectOutput

CODER_PROMPT = """You are the Coder Agent.
Your job is to generate the complete, working code for a specific file based on the Architect's plan.
Apply appropriate style guides (PEP8/ESLint).
Do not truncate code or write "# ... rest of implementation".
Respond ONLY with the actual source code. NO Markdown formatted wrappers (DO NOT wrap in ```python ... ```), NO greetings, NO chat. Just raw code.

Project Context (Architect output):
{project_context}

Other Files' Exports:
{other_exports}

File Purpose:
{purpose}

Write the COMPLETE raw code for: {path}
"""

async def run_coder(
    file_spec: FileSpec,
    architect_output: ArchitectOutput,
    all_exports: str,
    stream_callback: Callable[[str], Awaitable[None]] = None
) -> str:
    
    prompt = CODER_PROMPT.format(
        project_context=architect_output.model_dump_json(include={'directory_tree'}),
        other_exports=all_exports,
        purpose=file_spec.purpose + "\nDependencies: " + ", ".join(file_spec.dependencies_on),
        path=file_spec.path
    )
    
    output_str = ""
    async for chunk in manager.safe_generate_stream(
        "qwen2.5-coder:14b", 
        prompt, 
        system="You are an expert coder. Write only the raw code as specified. NO markdown wrappers. NO explanation.",
        options={"temperature": 0.2, "num_ctx": 8192}
    ):
        output_str += chunk
        if stream_callback:
            await stream_callback(chunk)
            
    content = output_str.strip()
    # Strip potential markdown code fences from model output nonetheless
    if content.startswith("```"):
        lines = content.split('\n')
        if len(lines) > 1 and lines[0].startswith("```"):
            lines = lines[1:]
        if len(lines) > 0 and lines[-1].strip() == "```":
            lines = lines[:-1]
        content = "\n".join(lines).strip()
        
    return content
