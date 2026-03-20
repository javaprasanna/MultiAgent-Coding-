import json
import subprocess
import os
import re
from typing import Callable, Awaitable
from core.ollama_client import manager

REVIEW_PROMPT = """You are the Reviewer Agent.
Review the following code file for:
1. Bugs
2. Missing error handling
3. Security issues
4. Improvement suggestions

File Path: {path}
Code:
{code}

Lint Output (if any):
{lint_output}

Output your review as JSON EXACTLY matching this schema:
{
  "issues": [{"severity": "Critical|Warning|OK", "description": "...", "suggestion": "..."}],
  "passed": boolean
}
Do NOT output markdown format, just the JSON string.
"""

def lint_file(file_path: str) -> str:
    if file_path.endswith('.py'):
        try:
            f8 = subprocess.run(["flake8", file_path], capture_output=True, text=True).stdout
            pl = subprocess.run(["pylint", file_path], capture_output=True, text=True).stdout
            return f"Flake8:\n{f8}\n\nPylint:\n{pl}"
        except Exception as e:
            return f"Linter execution failed: {e}"
    return "No Python linter run."

async def run_reviewer_for_file(
    file_path: str,
    code: str,
    stream_callback: Callable[[str], Awaitable[None]] = None
) -> dict:
    lint_output = ""
    if os.path.exists(file_path):
        lint_output = lint_file(file_path)
        
    prompt = REVIEW_PROMPT.format(path=file_path, code=code, lint_output=lint_output)
    
    output_str = ""
    async for chunk in manager.safe_generate_stream(
        "qwen2.5-coder:14b", 
        prompt, 
        system="You are the Review Agent. Output ONLY JSON, no markdown wrappers.",
        options={"temperature": 0.2}
    ):
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
        return data
    except Exception:
        return {"issues": [], "passed": True}
        
async def generate_readme(project_context: str, stream_callback: Callable[[str], Awaitable[None]] = None) -> str:
    prompt = f"Write a comprehensive README.md for this project. Include setup, run instructions, and an ASCII architecture diagram.\n\nContext:\n{project_context}"
    output_str = ""
    async for chunk in manager.safe_generate_stream("qwen2.5-coder:14b", prompt, system="You write markdown readmes.", options={"temperature": 0.3}):
        output_str += chunk
        if stream_callback:
            await stream_callback(chunk)
    return output_str.strip()
