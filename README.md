# Multi-Agent AI Coding Assistant

A powerful, full-stack application that transforms your natural language prompts into complete, runnable software projects. 

Specifically optimized to run on **Apple MacBook Air M4 (ARM64 architecture)** entirely using local models via Ollama. It relies on sequential orchestration and aggressive memory unloading to prevent memory pressure on M4's unified memory.

## Architecture

```text
User Prompt 
   │
   ▼
[Planner Agent] (deepseek-r1:14b) ──► JSON Project Plan
   │
   ▼
[Architect Agent] (deepseek-coder-v2:16b) ──► File Tree & Specification
   │
   ▼
[Coder Agent] (qwen2.5-coder:14b) ──► Iteratively generates raw code for each file
   │
   ▼
[Reviewer Agent] (qwen2.5-coder:14b) ──► Lints & statically validates code quality
   │
   ▼
[Executor Agent] ──► Auto-packages Docker container (ARM64) to preview app live!
```

## Prerequisites
- **Apple Silicon (M1/M2/M3/M4)** hardware highly recommended.
- **Docker Desktop**: Ensure Docker Engine is running and configured for ARM64 containers.
- **Node.js**: v20+
- **Python**: 3.11+
- **Ollama**: Installed natively via Homebrew (`brew install ollama`).

## Setup

1. **Pull Required LLM Models**
   This application relies strictly on local models. Open a terminal and run:
   ```bash
   ollama pull deepseek-r1:14b
   ollama pull deepseek-coder-v2:16b
   ollama pull qwen2.5-coder:14b
   ```
   *Note: This will take roughly 20-30 minutes and ~20GB of disk space depending on available unified memory.*

2. **Start Ollama**
   Keep Ollama running in the background natively (do NOT use Docker for Ollama to leverage direct Metal API acceleration).
   ```bash
   ollama serve
   ```

## How to Run
We use `docker-compose` to start both the Python backend API and the Vite React frontend.
```bash
cd multi-agent-coding-assistant
docker-compose up --build
```
Alternatively, for local development outside Docker:
- **Backend**: `cd backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt && uvicorn main:app --host 0.0.0.0 --port 8000`
- **Frontend**: `cd frontend && npm install && npm run dev`

## How To Use
1. **Submit a Request**: Navigate to `http://localhost:5173`. You will see the prompt entry box.
   *(Screenshot of Prompter here)*
2. **Watch the Process**: You are redirected to the Dashboard where you can monitor the live Agent Pipeline stream. Wait as the Planner, Architect, Coder, and Reviewer run sequentially.
3. **Review project**: Check tabs for "Project Plan", "Review Report", and the "Files & Code" editor.
4. **Export & Execute**: 
   - Click **Run in Docker** to start an ARM sandbox container. 
   - Click **Download ZIP** to save the source code directly to disk.

## Troubleshooting (M4 / ARM Issues)
- **Ollama crashing/OOM**: If Qwen or Deepseek fails, verify `ollama serve` logs. Decrease `num_ctx` in `backend/agents/coder.py` if your M4 has <= 16GB unified memory.
- **Docker "exec format error"**: Ensure your Docker Desktop is not restricting ARM virtualization. The executor implicitly adds `platform: linux/arm64` to all sandbox executions.
- **WebSocket Drops**: The LLM streams might timeout proxy configurations. Directly accessing `localhost:8000` might behave better than through custom proxies.
