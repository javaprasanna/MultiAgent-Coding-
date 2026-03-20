import os
import json
import uuid
from pathlib import Path
from models.schemas import SessionState

WORKSPACE_DIR = Path(os.getenv("WORKSPACE_DIR", "../workspace")).resolve()

class SessionManager:
    def __init__(self):
        WORKSPACE_DIR.mkdir(parents=True, exist_ok=True)
    
    def create_session(self, prompt: str) -> str:
        session_id = str(uuid.uuid4())
        session_dir = WORKSPACE_DIR / session_id
        session_dir.mkdir(exist_ok=True)
        
        state = SessionState(session_id=session_id, prompt=prompt)
        self.save_session(session_id, state)
        return session_id

    def get_session(self, session_id: str) -> SessionState:
        session_file = WORKSPACE_DIR / session_id / "state.json"
        if not session_file.exists():
            raise FileNotFoundError(f"Session {session_id} not found")
        with open(session_file, "r") as f:
            data = json.load(f)
        return SessionState(**data)

    def save_session(self, session_id: str, state: SessionState):
        session_file = WORKSPACE_DIR / session_id / "state.json"
        with open(session_file, "w") as f:
            f.write(state.model_dump_json(indent=2))

session_manager = SessionManager()
