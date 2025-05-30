from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from fastapi.responses import JSONResponse, FileResponse
import spacy
import os
import tempfile
from typing import Dict, Any, List
from auth import get_current_user, User
from database import SessionLocal
from models import CV
from sqlalchemy.orm import Session
import docx2txt
import PyPDF2
import json
from pydantic import BaseModel

# Load spaCy model
nlp = spacy.load("en_core_web_sm")

# Create router
router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class SkillsUpdate(BaseModel):
    skills: List[str]

@router.get("/list-cvs/")
async def list_cvs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cvs = db.query(CV).filter(CV.user_id == current_user.id).all()
    return cvs

@router.get("/get-cv/{cv_id}/")
async def get_cv(
    cv_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cv = db.query(CV).filter(CV.id == cv_id, CV.user_id == current_user.id).first()
    if not cv:
        raise HTTPException(status_code=404, detail="CV not found")
    return cv

@router.put("/update-cv/{cv_id}/")
async def update_cv(
    cv_id: int,
    skills_update: SkillsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cv = db.query(CV).filter(CV.id == cv_id, CV.user_id == current_user.id).first()
    if not cv:
        raise HTTPException(status_code=404, detail="CV not found")
    
    # Update the skills in the parsed_data
    parsed_data = cv.parsed_data
    parsed_data["skills"] = skills_update.skills
    cv.parsed_data = parsed_data
    
    db.commit()
    db.refresh(cv)
    return cv

@router.post("/upload-cv/")
async def upload_cv(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith((".pdf", ".docx", ".txt")):
        raise HTTPException(status_code=400, detail="File must be a PDF, DOCX, or TXT file.")

    # Save the uploaded file permanently
    save_path = os.path.join(UPLOAD_DIR, f"user{current_user.id}_{file.filename}")
    with open(save_path, "wb") as f:
        content = await file.read()
        f.write(content)

    # Parse the CV as before (use save_path)
    file_type = os.path.splitext(file.filename)[1][1:]
    cv_data = parse_cv(save_path, file_type)

    db_cv = CV(
        user_id=current_user.id,
        filename=file.filename,
        file_type=file_type,
        parsed_data=cv_data,
        file_path=save_path  # Save the file path
    )
    db.add(db_cv)
    db.commit()
    db.refresh(db_cv)

    return JSONResponse(content=cv_data)

def parse_cv(file_path: str, file_type: str) -> Dict[str, Any]:
    # Read the file content based on file type
    if file_type == 'txt':
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    elif file_type == 'docx':
        content = docx2txt.process(file_path)
    elif file_type == 'pdf':
        with open(file_path, 'rb') as f:
            pdf_reader = PyPDF2.PdfReader(f)
            content = ""
            for page in pdf_reader.pages:
                content += page.extract_text()
    else:
        raise ValueError(f"Unsupported file type: {file_type}")
    
    # Process the content with spaCy
    doc = nlp(content)
    
    # Extract entities (e.g., names, organizations, skills)
    entities = {ent.label_: ent.text for ent in doc.ents}
    
    # Extract sentences for further processing
    sentences = [sent.text for sent in doc.sents]
    
    # Extract skills (custom logic - you might want to enhance this)
    skills = extract_skills(doc)
    
    # Return parsed data
    return {
        "entities": entities,
        "sentences": sentences,
        "skills": skills
    }

def extract_skills(doc) -> list:
    # This is a simple example - you might want to enhance this with a proper skills database
    skill_keywords = ['python', 'java', 'javascript', 'react', 'node', 'sql', 'aws', 'docker']
    skills = []
    
    for token in doc:
        if token.text.lower() in skill_keywords:
            skills.append(token.text.lower())
    
    return list(set(skills))  # Remove duplicates

@router.delete("/delete-cv/{cv_id}/", status_code=status.HTTP_204_NO_CONTENT)
async def delete_cv(
    cv_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cv = db.query(CV).filter(CV.id == cv_id, CV.user_id == current_user.id).first()
    if not cv:
        raise HTTPException(status_code=404, detail="CV not found")
    db.delete(cv)
    db.commit()
    return

@router.get("/download-cv/{cv_id}/")
async def download_cv(
    cv_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cv = db.query(CV).filter(CV.id == cv_id, CV.user_id == current_user.id).first()
    print(f"Trying to download file at: {cv.file_path if cv else 'No CV found'}")
    if not cv or not os.path.exists(cv.file_path):
        print("File not found or path does not exist!")
        raise HTTPException(status_code=404, detail="File not found")
    print("File found, sending file.")
    return FileResponse(cv.file_path, filename=cv.filename)