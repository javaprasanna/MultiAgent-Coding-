from fastapi import FastAPI, BackgroundTasks, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import os
import json

from core.session_manager import session_manager, WORKSPACE_DIR
from core.zip_builder import create_project_zip
from agents.planner import run_planner
from agents.architect import run_architect
from agents.coder import run_coder
from agents.reviewer import run_reviewer_for_file, generate_readme
from agents.executor import execute_project

app = FastAPI(title="Multi-Agent Coding Assistant API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerateRequest(BaseModel):
    prompt: str

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}

    async def connect(self, session_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[session_id] = websocket

    def disconnect(self, session_id: str):
        if session_id in self.active_connections:
            del self.active_connections[session_id]

    async def send_event(self, session_id: str, stage: str, status: str, message: str, data: dict = None):
        if session_id in self.active_connections:
            try:
                payload = {"stage": stage, "status": status, "message": message}
                if data:
                    payload["data"] = data
                await self.active_connections[session_id].send_json(payload)
            except WebSocketDisconnect:
                self.disconnect(session_id)

ws_manager = ConnectionManager()

async def pipeline_worker(session_id: str, prompt: str):
    state = session_manager.get_session(session_id)
    session_dir = os.path.join(WORKSPACE_DIR, session_id)
    
    from core.ollama_client import manager
    try:
        await manager.check_readiness("deepseek-r1:14b")
        await manager.check_readiness("deepseek-coder-v2:16b")
        await manager.check_readiness("qwen2.5-coder:14b")
    except Exception as e:
        await ws_manager.send_event(session_id, "planner", "error", str(e))
        return

    # 1. Planner
    await ws_manager.send_event(session_id, "planner", "started", "Analyzing prompt...")
    async def planner_cb(chunk):
        await ws_manager.send_event(session_id, "planner", "progress", chunk)
    
    try:
        planner_out = await run_planner(prompt, planner_cb)
        state.planner_output = planner_out
        state.status = "planner_done"
        session_manager.save_session(session_id, state)
        await ws_manager.send_event(session_id, "planner", "done", "Planning complete", data=planner_out.model_dump())
    except Exception as e:
        await ws_manager.send_event(session_id, "planner", "error", str(e))
        return

    # 2. Architect
    await ws_manager.send_event(session_id, "architect", "started", "Designing architecture...")
    async def architect_cb(chunk):
        await ws_manager.send_event(session_id, "architect", "progress", chunk)
        
    try:
        architect_out = await run_architect(planner_out, architect_cb)
        state.architect_output = architect_out
        state.status = "architect_done"
        session_manager.save_session(session_id, state)
        await ws_manager.send_event(session_id, "architect", "done", "Architecture complete", data=architect_out.model_dump())
    except Exception as e:
        await ws_manager.send_event(session_id, "architect", "error", str(e))
        return

    # 3. Coder 
    await ws_manager.send_event(session_id, "coder", "started", "Generating code...")
    all_exports = "\n".join([f"{f.path} exports: {f.exports}" for f in architect_out.files])
    
    for cfg in architect_out.config_files:
        cfg_path = os.path.join(session_dir, cfg.path)
        os.makedirs(os.path.dirname(cfg_path), exist_ok=True)
        with open(cfg_path, "w") as f:
            f.write(cfg.content)
        state.generated_files[cfg.path] = cfg.content

    for f_spec in architect_out.files:
        async def coder_cb(chunk):
             await ws_manager.send_event(session_id, "coder", "progress", chunk, data={"file": f_spec.path})
             
        try:
            code = await run_coder(f_spec, architect_out, all_exports, coder_cb)
            file_path = os.path.join(session_dir, f_spec.path)
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            with open(file_path, "w") as f:
                f.write(code)
            
            state.generated_files[f_spec.path] = code
            session_manager.save_session(session_id, state)
        except Exception as e:
            await ws_manager.send_event(session_id, "coder", "error", f"Error in {f_spec.path}: {e}")
            
    await ws_manager.send_event(session_id, "coder", "done", "Coding complete")

    # 4. Reviewer
    await ws_manager.send_event(session_id, "reviewer", "started", "Reviewing files...")
    issues = []
    
    for path, code in state.generated_files.items():
        async def reviewer_cb(chunk):
             await ws_manager.send_event(session_id, "reviewer", "progress", chunk, data={"file": path})
        try:
             abs_path = os.path.join(session_dir, path)
             review = await run_reviewer_for_file(abs_path, code, reviewer_cb)
             if review.get("issues"):
                 issues.extend(review["issues"])
        except Exception:
             pass
    
    if "README.md" not in state.generated_files:
        try:
            readme_code = await generate_readme(architect_out.model_dump_json(), None)
            readme_path = os.path.join(session_dir, "README.md")
            with open(readme_path, "w") as f:
                f.write(readme_code)
            state.generated_files["README.md"] = readme_code
        except Exception:
            pass
            
    try:
        from models.schemas import ReviewReport
        final_status = "Approved" if not issues else "Needs Fixes"
        report = ReviewReport(status=final_status, final_verdict="Completed", issues=issues)
        state.review_report = report
        state.status = "completed"
        session_manager.save_session(session_id, state)
        await ws_manager.send_event(session_id, "reviewer", "done", "Review complete", data=report.model_dump())
    except Exception as e:
        await ws_manager.send_event(session_id, "reviewer", "error", str(e))

@app.post("/api/generate")
async def generate(req: GenerateRequest, background_tasks: BackgroundTasks):
    session_id = session_manager.create_session(req.prompt)
    background_tasks.add_task(pipeline_worker, session_id, req.prompt)
    return {"session_id": session_id}

@app.get("/api/session/{session_id}")
async def get_session(session_id: str):
    return session_manager.get_session(session_id)

@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await ws_manager.connect(session_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(session_id)

@app.get("/api/download/{session_id}")
async def download_project(session_id: str):
    try:
         zip_io = create_project_zip(session_id, str(WORKSPACE_DIR))
         zip_path = os.path.join(WORKSPACE_DIR, f"{session_id}.zip")
         with open(zip_path, "wb") as f:
             f.write(zip_io.read())
         return FileResponse(zip_path, filename=f"{session_id}.zip", media_type="application/zip")
    except FileNotFoundError:
         return {"error": "Project not found"}

@app.post("/api/execute/{session_id}")
async def execute_project_endpoint(session_id: str):
    result = execute_project(session_id, str(WORKSPACE_DIR))
    return result
