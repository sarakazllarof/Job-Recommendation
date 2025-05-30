from sqlalchemy import Column, Integer, String, Text, ForeignKey, Float, DateTime, JSON, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    bio = Column(Text, nullable=True)
    jobs = relationship('Job', back_populates='owner')
    recommendations = relationship('Recommendation', back_populates='user')
    cvs = relationship('CV', back_populates='user')

class Job(Base):
    __tablename__ = 'jobs'
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    employer_name = Column(String(100))
    employer_profile_url = Column(String(255))
    employer_profile_website = Column(String(255))
    employer_profile_logo = Column(String(255))
    location_name = Column(String(100))
    minimum_salary = Column(Float)
    maximum_salary = Column(Float)
    currency = Column(String(10))
    job_url = Column(String(255))
    applications = Column(Integer)
    job_type = Column(String(50))
    reed_job_id = Column(Integer, unique=True)  # Store the Reed API job ID
    owner_id = Column(Integer, ForeignKey('users.id'))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    expiration_date = Column(DateTime)
    owner = relationship('User', back_populates='jobs')
    recommendations = relationship('Recommendation', back_populates='job')

class Recommendation(Base):
    __tablename__ = 'recommendations'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    job_id = Column(Integer, ForeignKey('jobs.id'))
    score = Column(Integer, nullable=False)
    viewed = Column(Boolean, default=False)
    applied = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    user = relationship('User', back_populates='recommendations')
    job = relationship('Job', back_populates='recommendations')

class CV(Base):
    __tablename__ = 'cvs'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    filename = Column(String(255), nullable=False)
    file_type = Column(String(10), nullable=False)
    parsed_data = Column(JSON, nullable=False)  # Store as JSON
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    file_path = Column(String(255), nullable=False)
    user = relationship('User', back_populates='cvs') 