import os
import zipfile
import io
from pathlib import Path

def create_project_zip(session_id: str, workspace_dir: str) -> io.BytesIO:
    session_path = Path(workspace_dir) / session_id
    if not session_path.exists():
        raise FileNotFoundError("Project not found")

    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "a", zipfile.ZIP_DEFLATED, False) as zip_file:
        for root, _, files in os.walk(session_path):
            if "state.json" in root: # Skip internal state
                continue
            for file in files:
                if file == "state.json":
                    continue
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, session_path)
                zip_file.write(file_path, arcname)
    
    zip_buffer.seek(0)
    return zip_buffer
