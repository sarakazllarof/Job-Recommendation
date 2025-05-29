import requests
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from pydantic import BaseModel
import datetime
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
    currency: str
    expiration_date: datetime.datetime
    date_posted: datetime.datetime
    job_url: str
    applications: int
    job_type: str

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
    Search for jobs using the Reed API
    """
    try:
        # Build the search URL
        search_url = f"{REED_API_BASE_URL}/search"
        
        # Prepare query parameters
        params = {
            "keywords": keywords,
            "locationName": location,
            "distanceFromLocation": distance_from_location,
            "minimumSalary": minimum_salary,
            "maximumSalary": maximum_salary,
            "employerProfileId": employer_profile_id,
            "employerProfileName": employer_profile_name,
            "resultsToTake": 20  # Limit results to 20 jobs
        }
        
        # Remove None values
        params = {k: v for k, v in params.items() if v is not None}
        
        logger.info(f"Making request to Reed API with params: {params}")
        
        # Make the API request
        response = requests.get(
            search_url,
            params=params,
            auth=(REED_API_KEY, '')  # Reed API uses Basic Auth with API key as username
        )
        
        logger.info(f"Reed API response status: {response.status_code}")
        
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
        
        # Convert the response to our JobSearchResult model
        jobs = []
        for job in jobs_data:
            try:
                jobs.append(JobSearchResult(
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
                    expiration_date=datetime.datetime.fromisoformat(job.get("expirationDate")),
                    date_posted=datetime.datetime.fromisoformat(job.get("date")),
                    job_url=job.get("jobUrl"),
                    applications=job.get("applications"),
                    job_type=job.get("jobType")
                ))
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
    Get detailed information about a specific job
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
            expiration_date=datetime.datetime.fromisoformat(job_data.get("expirationDate")),
            date_posted=datetime.datetime.fromisoformat(job_data.get("date")),
            job_url=job_data.get("jobUrl"),
            applications=job_data.get("applications"),
            job_type=job_data.get("jobType")
        )
        
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