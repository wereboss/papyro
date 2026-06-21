from pydantic import BaseModel
from typing import Dict, Any, List

class WorksheetCreate(BaseModel):
    title: str
    template_id: str
    custom_config: Dict[str, Any]
    generated_state: Dict[str, Any]

class WorksheetResponse(BaseModel):
    id: int
    title: str
    template_id: str
    template_name: str
    custom_config: Dict[str, Any]
    generated_state: Dict[str, Any]
    created_at: str

class TemplateResponse(BaseModel):
    id: str
    name: str
    description: str
    base_config: Dict[str, Any]
