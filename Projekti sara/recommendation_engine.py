from sentence_transformers import SentenceTransformer
import numpy as np
from typing import List, Dict
from sqlalchemy.orm import Session
from models import Job, User, CV, Recommendation
import datetime

class JobRecommender:
    def __init__(self):
        self.model = SentenceTransformer('all-MiniLM-L6-v2')

    def get_embeddings(self, text: str) -> np.ndarray:
        return self.model.encode(text)

    def calculate_similarity(self, vec1: np.ndarray, vec2: np.ndarray) -> float:
        return float(np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2)))

    def get_user_profile(self, user: User, db: Session) -> str:
        latest_cv = db.query(CV).filter(CV.user_id == user.id).order_by(CV.created_at.desc()).first()
        if not latest_cv or not latest_cv.parsed_data:
            return ""

        # FIXED: parsed_data is already a dict, no need for json.loads
        cv_data = latest_cv.parsed_data  

        profile_parts = []

        if 'skills' in cv_data:
            profile_parts.append("Skills: " + ", ".join(cv_data['skills']))
        if 'experience' in cv_data:
            profile_parts.append("Experience: " + " ".join(cv_data['experience']))
        if 'education' in cv_data:
            profile_parts.append("Education: " + " ".join(cv_data['education']))

        return " ".join(profile_parts)

    def get_job_embedding(self, job: Job) -> np.ndarray:
        job_text = f"{job.title} {job.description}"
        return self.get_embeddings(job_text)

    def get_recommendations(self, user: User, db: Session, top_k: int = 5) -> List[Dict]:
        user_profile = self.get_user_profile(user, db)
        if not user_profile:
            return []

        user_embedding = self.get_embeddings(user_profile)
        jobs = db.query(Job).all()
        job_scores = []

        for job in jobs:
            job_embedding = self.get_job_embedding(job)
            similarity = self.calculate_similarity(user_embedding, job_embedding)
            job_scores.append({
                'job': job,
                'score': similarity
            })

        job_scores.sort(key=lambda x: x['score'], reverse=True)
        top_recommendations = job_scores[:top_k]

        for rec in top_recommendations:
            recommendation = Recommendation(
                user_id=user.id,
                job_id=rec['job'].id,
                score=rec['score'],
                created_at=datetime.datetime.utcnow()
            )
            db.add(recommendation)

        db.commit()

        return [{
            'job_id': rec['job'].id,
            'title': rec['job'].title,
            'description': rec['job'].description,
            'similarity_score': rec['score']
        } for rec in top_recommendations]

# Create an instance outside so you can reuse it
recommender = JobRecommender()
