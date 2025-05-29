from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import datetime
from sqlalchemy import desc
from pydantic import BaseModel

from database import get_db
from models import Job, User, Recommendation
from auth import get_current_user
from schemas import JobSchema, RecommendationSchema

# If you have recommendation_engine.py, import recommender
try:
    from recommendation_engine import recommender
except ImportError:
    recommender = None

router = APIRouter(
    prefix="/jobs",


    tags=["jobs"]
)

class JobCreate(BaseModel):
    title: str
    description: str

# Create a new job posting (Admin only)
@router.post("/", response_model=JobSchema, status_code=status.HTTP_201_CREATED)
async def create_job(
    job: JobCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not getattr(current_user, 'is_admin', False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can create job postings"
        )
    new_job = Job(
        title=job.title,
        description=job.description,
        owner_id=current_user.id
    )
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return new_job

# Get all job postings
@router.get("/", response_model=List[JobSchema])
async def get_jobs(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    jobs = db.query(Job).offset(skip).limit(limit).all()
    return jobs

# Get a specific job posting
@router.get("/{job_id}", response_model=JobSchema)
async def get_job(
    job_id: int,
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    return job

# Update a job posting (Admin only)
@router.put("/{job_id}", response_model=JobSchema)
async def update_job(
    job_id: int,
    title: str = None,
    description: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not getattr(current_user, 'is_admin', False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can update job postings"
        )
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    if title:
        job.title = title
    if description:
        job.description = description
    db.commit()
    db.refresh(job)
    return job

# Delete a job posting (Admin only)
@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not getattr(current_user, 'is_admin', False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete job postings"
        )
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    db.delete(job)
    db.commit()
    return None

# Get job recommendations for the current user
@router.get("/recommendations/", response_model=List[dict])
async def get_job_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if recommender is None:
        raise HTTPException(status_code=500, detail="Recommendation engine not available.")
    recommendations = recommender.get_recommendations(current_user, db)
    if not recommendations:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No recommendations found. Please upload your CV first."
        )
    return recommendations

# Get recommendation history for the current user
@router.get("/recommendations/history/", response_model=List[dict])
async def get_recommendation_history(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    recommendations = (
        db.query(Recommendation)
        .filter(Recommendation.user_id == current_user.id)
        .order_by(desc(Recommendation.created_at))
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [{
        'id': rec.id,
        'job_id': rec.job_id,
        'job_title': rec.job.title,
        'similarity_score': rec.score,
        'viewed': rec.viewed,
        'applied': rec.applied,
        'created_at': rec.created_at
    } for rec in recommendations]

# Mark a recommendation as viewed
@router.put("/recommendations/{recommendation_id}/view/")
async def mark_recommendation_viewed(
    recommendation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    recommendation = (
        db.query(Recommendation)
        .filter(
            Recommendation.id == recommendation_id,
            Recommendation.user_id == current_user.id
        )
        .first()
    )
    if not recommendation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recommendation not found"
        )
    recommendation.viewed = True
    db.commit()
    return {"message": "Recommendation marked as viewed"}

# Mark a recommendation as applied
@router.put("/recommendations/{recommendation_id}/apply/")
async def mark_recommendation_applied(
    recommendation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    recommendation = (
        db.query(Recommendation)
        .filter(
            Recommendation.id == recommendation_id,
            Recommendation.user_id == current_user.id
        )
        .first()
    )
    if not recommendation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recommendation not found"
        )
    recommendation.applied = True
    db.commit()
    return {"message": "Recommendation marked as applied"}

# Get recommendation statistics
@router.get("/recommendations/stats/", response_model=dict)
async def get_recommendation_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total_recommendations = (
        db.query(Recommendation)
        .filter(Recommendation.user_id == current_user.id)
        .count()
    )
    viewed_recommendations = (
        db.query(Recommendation)
        .filter(
            Recommendation.user_id == current_user.id,
            Recommendation.viewed == True
        )
        .count()
    )
    applied_recommendations = (
        db.query(Recommendation)
        .filter(
            Recommendation.user_id == current_user.id,
            Recommendation.applied == True
        )
        .count()
    )
    return {
        "total_recommendations": total_recommendations,
        "viewed_recommendations": viewed_recommendations,
        "applied_recommendations": applied_recommendations,
        "view_rate": (viewed_recommendations / total_recommendations * 100) if total_recommendations > 0 else 0,
        "apply_rate": (applied_recommendations / total_recommendations * 100) if total_recommendations > 0 else 0
    } 