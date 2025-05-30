from pydantic import BaseModel, EmailStr, ConfigDict
from typing import List, Optional
import datetime

class UserBase(BaseModel):
    username: str
    email: EmailStr
    bio: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_admin: bool
    created_at: str
    bio: Optional[str] = None

    class Config:
        orm_mode = True

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    bio: Optional[str] = None

class UserSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    username: str
    email: EmailStr
    is_admin: bool
    created_at: Optional[datetime.datetime] = None

class JobSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    description: str
    employer_name: Optional[str]
    employer_profile_url: Optional[str]
    employer_profile_website: Optional[str]
    employer_profile_logo: Optional[str]
    location_name: Optional[str]
    minimum_salary: Optional[float]
    maximum_salary: Optional[float]
    currency: Optional[str]
    job_url: Optional[str]
    applications: Optional[int]
    job_type: Optional[str]
    reed_job_id: Optional[int]
    owner_id: Optional[int]
    created_at: datetime.datetime
    expiration_date: Optional[datetime.datetime]

class RecommendationSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    job_id: int
    score: int
    viewed: bool
    applied: bool
    created_at: datetime.datetime

class CVSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    filename: str
    file_type: str
    parsed_data: Optional[dict]
    created_at: datetime.datetime
    file_path: str 