from pydantic import BaseModel
from typing import List, Dict, Optional, Any

class TechStack(BaseModel):
    language: str
    framework: str
    frontend: Optional[str] = None
    database: Optional[str] = None

class PlannerOutput(BaseModel):
    project_name: str
    description: str
    tech_stack: TechStack
    features: List[str]
    dependencies: List[str]
    architecture_notes: str
    potential_conflicts: List[str]

class FileSpec(BaseModel):
    path: str
    purpose: str
    exports: str
    dependencies_on: List[str]

class ConfigFile(BaseModel):
    path: str
    content: str

class ArchitectOutput(BaseModel):
    directory_tree: Dict[str, Any]
    files: List[FileSpec]
    config_files: List[ConfigFile]
    readme_outline: List[str]

class ReviewReport(BaseModel):
    status: str
    final_verdict: str
    issues: List[Dict[str, Any]]

class SessionState(BaseModel):
    session_id: str
    prompt: str
    planner_output: Optional[PlannerOutput] = None
    architect_output: Optional[ArchitectOutput] = None
    generated_files: Dict[str, str] = {}
    review_report: Optional[ReviewReport] = None
    status: str = "initialized"
