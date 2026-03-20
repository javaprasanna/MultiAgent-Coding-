import docker
import os
import shutil
from typing import Dict, Any

def get_docker_client():
    alt_sock = os.path.expanduser("~/.docker/run/docker.sock")
    if not os.path.exists("/var/run/docker.sock") and os.path.exists(alt_sock):
        return docker.DockerClient(base_url=f"unix://{alt_sock}")
    return docker.from_env()

def execute_project(session_id: str, workspace_dir: str) -> Dict[str, Any]:
    session_path = os.path.join(workspace_dir, session_id)
    if not os.path.exists(session_path):
        return {"success": False, "container_id": None, "logs": ["Project not found"]}
        
    try:
        client = get_docker_client()
    except Exception as e:
        return {"success": False, "container_id": None, "logs": [f"Docker client error: {e}"]}

    project_type = "python"
    if os.path.exists(os.path.join(session_path, "package.json")):
        project_type = "node"
    
    template_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "docker", "templates"))
    template_file = "node.Dockerfile" if project_type == "node" else "python.Dockerfile"
        
    try:
        shutil.copy(os.path.join(template_dir, template_file), os.path.join(session_path, "Dockerfile"))
    except Exception as e:
        return {"success": False, "container_id": None, "logs": [f"Failed to copy template: {e}"]}

    try:
        image, build_logs = client.images.build(path=session_path, tag=f"project-{session_id}", platform="linux/arm64")
        
        ports = {'5173/tcp': 5173, '3000/tcp': 3000} if project_type == "node" else {'8000/tcp': 8000}
        container = client.containers.run(
            image.id,
            detach=True,
            ports=ports,
            platform="linux/arm64"
        )
        return {"success": True, "container_id": container.id, "logs": []}
    except Exception as e:
        return {"success": False, "container_id": None, "logs": [str(e)]}

def stream_container_logs(container_id: str):
    try:
        client = get_docker_client()
        container = client.containers.get(container_id)
        for log in container.logs(stream=True, tail=100):
            yield log.decode('utf-8')
    except Exception as e:
        yield f"Error fetching logs: {e}\n"
