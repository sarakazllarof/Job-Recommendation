from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from auth import router as auth_router
from cv_upload import router as cv_router
from jobs import router as jobs_router
from job_search import router as job_search_router
from database import engine
from models import Base
import auth

# Create FastAPI app
app = FastAPI(title="Job Recommendation API")

# Configure CORS
origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(cv_router, prefix="/cv", tags=["cv"])
app.include_router(jobs_router, tags=["jobs"])
app.include_router(job_search_router, prefix="/job-search", tags=["job_search"])
app.include_router(auth.router)

# Create database tables
Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

