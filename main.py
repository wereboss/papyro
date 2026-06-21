from fastapi import FastAPI, HTTPException, status
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from typing import List
import os

from database import (
    init_db,
    get_all_templates,
    get_template_by_id,
    get_all_worksheets,
    get_worksheet_by_id,
    create_worksheet,
    delete_worksheet_by_id
)
from schemas import (
    WorksheetCreate,
    WorksheetResponse,
    TemplateResponse
)

app = FastAPI(title="Papyro API", description="Backend for Kids Worksheet Generator SPA")

# Initialize database on startup
@app.on_event("startup")
def startup_event():
    init_db()

# API Endpoints
@app.get("/api/templates", response_model=List[TemplateResponse])
def get_templates():
    return get_all_templates()

@app.get("/api/templates/{template_id}", response_model=TemplateResponse)
def get_template(template_id: str):
    template = get_template_by_id(template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template

@app.get("/api/worksheets", response_model=List[WorksheetResponse])
def get_worksheets():
    return get_all_worksheets()

@app.get("/api/worksheets/{worksheet_id}", response_model=WorksheetResponse)
def get_worksheet(worksheet_id: int):
    worksheet = get_worksheet_by_id(worksheet_id)
    if not worksheet:
        raise HTTPException(status_code=404, detail="Worksheet not found")
    return worksheet

@app.post("/api/worksheets", response_model=WorksheetResponse, status_code=status.HTTP_201_CREATED)
def save_worksheet(ws: WorksheetCreate):
    # Verify template exists
    template = get_template_by_id(ws.template_id)
    if not template:
        raise HTTPException(status_code=400, detail="Invalid template ID")
    
    return create_worksheet(
        title=ws.title,
        template_id=ws.template_id,
        custom_config=ws.custom_config,
        generated_state=ws.generated_state
    )

@app.delete("/api/worksheets/{worksheet_id}")
def delete_worksheet(worksheet_id: int):
    success = delete_worksheet_by_id(worksheet_id)
    if not success:
        raise HTTPException(status_code=404, detail="Worksheet not found")
    return {"status": "success", "message": "Worksheet deleted successfully"}

# Serve static files
# Ensure static directory exists
os.makedirs("static", exist_ok=True)

@app.get("/")
def read_index():
    index_path = os.path.join("static", "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "Papyro API is running. Please create static/index.html to view the frontend."}

app.mount("/static", StaticFiles(directory="static"), name="static")
