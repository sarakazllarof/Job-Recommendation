import requests
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from models import Job, User
from database import get_db
from sqlalchemy.orm import Session
from auth import get_current_user
import os
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(
    tags=["job_search"]
)

# Get API key from environment variable or use the provided key
REED_API_KEY = os.getenv("REED_API_KEY", "740a7e6d-6751-4584-a430-935f70c756ed")
REED_API_BASE_URL = "https://www.reed.co.uk/api/1.0"

class JobSearchResult(BaseModel):
    job_id: int
    employer_name: str
    employer_profile_url: Optional[str]
    employer_profile_website: Optional[str]
    employer_profile_logo: Optional[str]
    job_title: str
    job_description: str
    location_name: str
    minimum_salary: Optional[float]
    maximum_salary: Optional[float]
    currency: Optional[str]
    expiration_date: Optional[datetime]
    date_posted: Optional[datetime]
    job_url: str
    applications: int
    job_type: Optional[str]

def store_job_in_db(job_data: JobSearchResult, db: Session) -> Job:
    """Store a job from the Reed API in our database"""
    # Check if job already exists by Reed job ID
    existing_job = db.query(Job).filter(Job.reed_job_id == job_data.job_id).first()
    if existing_job:
        return existing_job

    # Create new job
    new_job = Job(
        title=job_data.job_title,
        description=job_data.job_description,
        employer_name=job_data.employer_name,
        employer_profile_url=job_data.employer_profile_url,
        employer_profile_website=job_data.employer_profile_website,
        employer_profile_logo=job_data.employer_profile_logo,
        location_name=job_data.location_name,
        minimum_salary=job_data.minimum_salary,
        maximum_salary=job_data.maximum_salary,
        currency=job_data.currency,
        job_url=job_data.job_url,
        applications=job_data.applications,
        job_type=job_data.job_type,
        reed_job_id=job_data.job_id,
        created_at=job_data.date_posted,
        expiration_date=job_data.expiration_date
    )
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return new_job

def parse_date(date_str):
    if not date_str:
        return None
    try:
        # Try ISO format first
        return datetime.fromisoformat(date_str)
    except ValueError:
        try:
            # Try DD/MM/YYYY
            return datetime.strptime(date_str, "%d/%m/%Y")
        except ValueError:
            return None

@router.get("/search", response_model=List[JobSearchResult])
async def search_jobs(
    keywords: Optional[str] = None,
    location: Optional[str] = None,
    distance_from_location: Optional[int] = None,
    minimum_salary: Optional[float] = None,
    maximum_salary: Optional[float] = None,
    employer_profile_id: Optional[int] = None,
    employer_profile_name: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Search for jobs using the Reed API and store them in our database
    """
    if REED_API_KEY == "YOUR_REED_API_KEY":
        raise HTTPException(
            status_code=500,
            detail="Reed API key not configured. Please set the REED_API_KEY environment variable."
        )

    try:
        # Build the search URL
        search_url = f"{REED_API_BASE_URL}/search"
        
        # Build the query parameters
        params = {}
        if keywords:
            params["keywords"] = keywords
        if location:
            params["locationName"] = location
        if distance_from_location:
            params["distanceFromLocation"] = distance_from_location
        if minimum_salary:
            params["minimumSalary"] = minimum_salary
        if maximum_salary:
            params["maximumSalary"] = maximum_salary
        if employer_profile_id:
            params["employerProfileId"] = employer_profile_id
        if employer_profile_name:
            params["employerProfileName"] = employer_profile_name
        
        # Make the API request
        response = requests.get(
            search_url,
            params=params,
            auth=(REED_API_KEY, '')
        )
        
        logger.info(f"Reed API raw response: {response.text}")
        
        if response.status_code != 200:
            error_detail = f"Reed API error: {response.status_code}"
            try:
                error_data = response.json()
                error_detail = error_data.get("message", error_detail)
                logger.error(f"Reed API error response: {error_data}")
            except:
                logger.error(f"Failed to parse Reed API error response: {response.text}")
            raise HTTPException(
                status_code=response.status_code,
                detail=error_detail
            )
        
        # Parse the response
        jobs_data = response.json().get("results", [])
        logger.info(f"Found {len(jobs_data)} jobs")
        
        # Convert the response to our JobSearchResult model and store in database
        jobs = []
        for job in jobs_data:
            try:
                job_result = JobSearchResult(
                    job_id=job.get("jobId"),
                    employer_name=job.get("employerName"),
                    employer_profile_url=job.get("employerProfileUrl"),
                    employer_profile_website=job.get("employerProfileWebsite"),
                    employer_profile_logo=job.get("employerProfileLogo"),
                    job_title=job.get("jobTitle"),
                    job_description=job.get("jobDescription"),
                    location_name=job.get("locationName"),
                    minimum_salary=job.get("minimumSalary"),
                    maximum_salary=job.get("maximumSalary"),
                    currency=job.get("currency"),
                    expiration_date=parse_date(job.get("expirationDate")),
                    date_posted=parse_date(job.get("date")),
                    job_url=job.get("jobUrl"),
                    applications=job.get("applications"),
                    job_type=job.get("jobType")
                )
                
                # Store the job in our database
                store_job_in_db(job_result, db)
                jobs.append(job_result)
                
            except Exception as e:
                logger.error(f"Error parsing job data: {str(e)}")
                logger.error(f"Job data: {job}")
                continue
        
        return jobs
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Request error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error connecting to Reed API: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error searching jobs: {str(e)}"
        )

@router.get("/job/{job_id}", response_model=JobSearchResult)
async def get_job_details(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get detailed information about a specific job and store it in our database
    """
    if REED_API_KEY == "YOUR_REED_API_KEY":
        raise HTTPException(
            status_code=500,
            detail="Reed API key not configured. Please set the REED_API_KEY environment variable."
        )

    try:
        # Build the job details URL
        job_url = f"{REED_API_BASE_URL}/jobs/{job_id}"
        
        # Make the API request
        response = requests.get(
            job_url,
            auth=(REED_API_KEY, '')
        )
        
        if response.status_code != 200:
            error_detail = f"Reed API error: {response.status_code}"
            try:
                error_data = response.json()
                error_detail = error_data.get("message", error_detail)
            except:
                pass
            raise HTTPException(
                status_code=response.status_code,
                detail=error_detail
            )
        
        # Parse the response
        job_data = response.json()
        
        # Convert the response to our JobSearchResult model
        job = JobSearchResult(
            job_id=job_data.get("jobId"),
            employer_name=job_data.get("employerName"),
            employer_profile_url=job_data.get("employerProfileUrl"),
            employer_profile_website=job_data.get("employerProfileWebsite"),
            employer_profile_logo=job_data.get("employerProfileLogo"),
            job_title=job_data.get("jobTitle"),
            job_description=job_data.get("jobDescription"),
            location_name=job_data.get("locationName"),
            minimum_salary=job_data.get("minimumSalary"),
            maximum_salary=job_data.get("maximumSalary"),
            currency=job_data.get("currency"),
            expiration_date=parse_date(job_data.get("expirationDate")),
            date_posted=parse_date(job_data.get("date")),
            job_url=job_data.get("jobUrl"),
            applications=job_data.get("applications"),
            job_type=job_data.get("jobType")
        )
        
        # Store the job in our database
        store_job_in_db(job, db)
        
        return job
        
    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error connecting to Reed API: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching job details: {str(e)}"
        ) 