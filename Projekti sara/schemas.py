from pydantic import BaseModel, EmailStr, ConfigDict
from typing import List, Optional
import datetime

class UserSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    username: str
    email: EmailStr
    is_admin: bool
    created_at: datetime.datetime

class JobSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    description: str
    owner_id: Optional[int]
    created_at: datetime.datetime

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