from fastapi import APIRouter, Depends, HTTPException, status, Path, Request, Body
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func, desc

from database import get_db
from models import User, Job, Recommendation, CV
from schemas import UserSchema
from utils import get_password_hash, verify_password, create_access_token, get_current_user

# JWT settings
SECRET_KEY = "your-secret-key"  # Change this to a secure secret key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

# Pydantic models
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    is_admin: bool

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserUpdate(BaseModel):
    username: str
    email: EmailStr
    is_admin: bool
    bio: Optional[str] = None

# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def get_user(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def authenticate_user(db: Session, email: str, password: str):
    user = get_user(db, email)
    if not user or not verify_password(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[datetime.timedelta] = None):
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + (expires_delta if expires_delta else datetime.timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    user = get_user(db, email=token_data.email)
    if user is None:
        raise credentials_exception
    return user

# Router
router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    if get_user(db, user.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(user.password)
    db_user = User(username=user.username, email=user.email, hashed_password=hashed_password)
    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Username or email already exists")
    return db_user

@router.post("/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/users/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/users", response_model=List[UserSchema])
def get_all_users(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    users = db.query(User).all()
    return users

@router.put("/users/{user_id}", response_model=UserSchema)
def update_user(user_id: int = Path(...), user_update: UserUpdate = None, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.username = user_update.username
    user.email = user_update.email
    user.is_admin = user_update.is_admin
    db.commit()
    db.refresh(user)
    return user

@router.delete("/users/{user_id}")
def delete_user(user_id: int = Path(...), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"detail": "User deleted"}

@router.get("/admin/stats")
def get_admin_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    user_count = db.query(func.count(User.id)).scalar()
    cv_count = db.query(func.count(CV.id)).scalar()
    job_count = db.query(func.count(Job.id)).scalar()
    rec_count = db.query(func.count(Recommendation.id)).scalar()

    # Recent activities (last 10 users, CVs, jobs)
    recent_users = db.query(User).order_by(desc(User.created_at)).limit(5).all()
    recent_cvs = db.query(CV).order_by(desc(CV.created_at)).limit(5).all()
    recent_jobs = db.query(Job).order_by(desc(Job.created_at)).limit(5).all()
    recent = {
        "users": [{"id": u.id, "username": u.username, "created_at": u.created_at} for u in recent_users],
        "cvs": [{"id": c.id, "filename": c.filename, "created_at": c.created_at} for c in recent_cvs],
        "jobs": [{"id": j.id, "title": j.title, "created_at": j.created_at} for j in recent_jobs],
    }

    # Most popular skills (from CVs)
    skill_counts = {}
    for cv in db.query(CV).all():
        skills = (cv.parsed_data or {}).get("skills", [])
        for skill in skills:
            skill_counts[skill] = skill_counts.get(skill, 0) + 1
    top_skills = sorted(skill_counts.items(), key=lambda x: x[1], reverse=True)[:5]

    # Most popular locations (from jobs)
    location_counts = {}
    for job in db.query(Job).all():
        loc = getattr(job, "location_name", None)
        if loc:
            location_counts[loc] = location_counts.get(loc, 0) + 1
    top_locations = sorted(location_counts.items(), key=lambda x: x[1], reverse=True)[:5]

    return {
        "user_count": user_count,
        "cv_count": cv_count,
        "job_count": job_count,
        "recommendation_count": rec_count,
        "recent": recent,
        "top_skills": top_skills,
        "top_locations": top_locations,
    }

@router.put("/users/me", response_model=UserResponse)
def update_user_profile(
    user_update: UserUpdate = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user_update.username is not None:
        user.username = user_update.username
    if user_update.email is not None:
        user.email = user_update.email
    if user_update.is_admin is not None:
        user.is_admin = user_update.is_admin
    if user_update.bio is not None:
        user.bio = user_update.bio
    db.commit()
    db.refresh(user)
    return user
